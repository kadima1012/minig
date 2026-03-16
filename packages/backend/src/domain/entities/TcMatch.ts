import {
  TcCategory,
  TcMatchStatus,
  TcHexData,
  TcPlayerData,
  TcLeaderboardEntry,
  TC_PLAYER_COLORS,
  TC_WIN_THRESHOLD,
  TC_MATCH_POINT_ATTACK_WIN,
  TC_MATCH_POINT_DEFENSE_WIN,
  TC_REVENGE_COOLDOWN_MS,
} from "@minigames/shared";
import { TcHexagon } from "./TcHexagon";
import { TcMatchPlayer } from "./TcMatchPlayer";
import { TcDuel } from "./TcDuel";
import {
  generateHexCoords,
  coordKey,
  getNeighborCoords,
  axialDistance,
  AxialCoord,
} from "../value-objects/HexCoord";

const CATEGORIES = Object.values(TcCategory);

export class TcMatch {
  public status: TcMatchStatus = TcMatchStatus.Lobby;
  public hexagons = new Map<string, TcHexagon>();
  public players = new Map<string, TcMatchPlayer>();
  public activeDuels = new Map<string, TcDuel>();
  public startedAt: Date | null = null;
  public endsAt: Date | null = null;
  public winnerId: string | null = null;
  public creatorId: string;

  private colorIndex = 0;

  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly maxPlayers: number,
    public readonly matchDurationMs: number,
    public readonly hexGridRadius: number,
    public readonly createdAt: Date
  ) {
    this.creatorId = "";
    this.generateMap();
  }

  // ── Map Generation ─────────────────────────────────────────────

  private generateMap(): void {
    const coords = generateHexCoords(this.hexGridRadius);
    const coordToId = new Map<string, string>();

    // Assign IDs
    coords.forEach((c, i) => {
      coordToId.set(coordKey(c), `hex-${i}`);
    });

    // Assign categories with clustering
    const categoryMap = this.assignCategories(coords);

    // Create hexagons with neighbor lists
    coords.forEach((c, i) => {
      const id = `hex-${i}`;
      const neighbors = getNeighborCoords(c)
        .map((nc) => coordToId.get(coordKey(nc)))
        .filter((nId): nId is string => nId !== undefined);

      const hex = new TcHexagon(id, c.q, c.r, categoryMap.get(coordKey(c))!, neighbors);
      this.hexagons.set(id, hex);
    });
  }

  private assignCategories(coords: AxialCoord[]): Map<string, TcCategory> {
    const categoryMap = new Map<string, TcCategory>();

    // Random initial assignment
    for (const c of coords) {
      categoryMap.set(coordKey(c), CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
    }

    // Smoothing passes for clustering
    for (let pass = 0; pass < 2; pass++) {
      for (const c of coords) {
        const neighbors = getNeighborCoords(c).filter((nc) => categoryMap.has(coordKey(nc)));
        if (neighbors.length === 0) continue;

        const counts = new Map<TcCategory, number>();
        for (const nc of neighbors) {
          const cat = categoryMap.get(coordKey(nc))!;
          counts.set(cat, (counts.get(cat) || 0) + 1);
        }

        // 60% chance to adopt most common neighbor category
        if (Math.random() < 0.6) {
          let maxCat = categoryMap.get(coordKey(c))!;
          let maxCount = 0;
          for (const [cat, count] of counts) {
            if (count > maxCount) {
              maxCount = count;
              maxCat = cat;
            }
          }
          categoryMap.set(coordKey(c), maxCat);
        }
      }
    }

    return categoryMap;
  }

  // ── Player Management ──────────────────────────────────────────

  addPlayer(userId: string, username: string): TcMatchPlayer {
    if (this.status !== TcMatchStatus.Lobby) throw new Error("Match is not in lobby");
    if (this.players.size >= this.maxPlayers) throw new Error("Match is full");
    if (this.players.has(userId)) throw new Error("Already in this match");

    const color = TC_PLAYER_COLORS[this.colorIndex % TC_PLAYER_COLORS.length];
    this.colorIndex++;

    const player = new TcMatchPlayer(userId, username, color);
    this.players.set(userId, player);

    if (this.players.size === 1) {
      this.creatorId = userId;
    }

    return player;
  }

  removePlayer(userId: string): void {
    this.players.delete(userId);

    // Release territories
    for (const hex of this.hexagons.values()) {
      if (hex.ownerId === userId) {
        hex.setOwner(null, null, null);
      }
    }
  }

  getPlayer(userId: string): TcMatchPlayer | undefined {
    return this.players.get(userId);
  }

  hasPlayer(userId: string): boolean {
    return this.players.has(userId);
  }

  // ── Match Lifecycle ────────────────────────────────────────────

  canStart(minPlayers: number): boolean {
    return this.status === TcMatchStatus.Lobby && this.players.size >= minPlayers;
  }

  start(): void {
    if (this.status !== TcMatchStatus.Lobby && this.status !== TcMatchStatus.Starting) {
      throw new Error("Match cannot be started");
    }

    this.status = TcMatchStatus.Playing;
    this.startedAt = new Date();
    this.endsAt = new Date(Date.now() + this.matchDurationMs);

    this.assignStartingTerritories();
  }

  private assignStartingTerritories(): void {
    const playerIds = Array.from(this.players.keys());
    const allHexIds = Array.from(this.hexagons.keys());
    const assigned: string[] = [];

    for (const playerId of playerIds) {
      const player = this.players.get(playerId)!;
      let bestHexId: string | null = null;
      let bestMinDist = -1;

      for (const hexId of allHexIds) {
        const hex = this.hexagons.get(hexId)!;
        if (!hex.isNeutral()) continue;

        // Farthest-first: maximize minimum distance to any already-assigned hex
        let minDist = Infinity;
        for (const assignedId of assigned) {
          const assignedHex = this.hexagons.get(assignedId)!;
          const dist = axialDistance(hex.coord, assignedHex.coord);
          minDist = Math.min(minDist, dist);
        }

        if (assigned.length === 0) minDist = 0;

        if (minDist > bestMinDist || (assigned.length === 0 && bestHexId === null)) {
          bestMinDist = minDist;
          bestHexId = hexId;
        }
      }

      if (bestHexId) {
        const hex = this.hexagons.get(bestHexId)!;
        hex.setOwner(playerId, player.username, player.color);
        assigned.push(bestHexId);
      }
    }
  }

  // ── Attack Validation ──────────────────────────────────────────

  canAttack(
    attackerId: string,
    hexId: string
  ): { ok: boolean; reason?: string } {
    const player = this.players.get(attackerId);
    if (!player) return { ok: false, reason: "Not in this match" };
    if (this.status !== TcMatchStatus.Playing) return { ok: false, reason: "Match not in progress" };
    if (player.isInDuel) return { ok: false, reason: "Already in a duel" };
    if (player.isOnCooldown()) return { ok: false, reason: "On cooldown" };

    const targetHex = this.hexagons.get(hexId);
    if (!targetHex) return { ok: false, reason: "Hex not found" };
    if (targetHex.isOwnedBy(attackerId)) return { ok: false, reason: "You already own this territory" };

    // Check if attacker has any territory adjacent to target
    const hasAdjacentTerritory = this.getPlayerTerritoryIds(attackerId).some((ownedId) => {
      return targetHex.isNeighbor(ownedId);
    });

    // Players with no territory (eliminated) can attack via revenge
    if (!hasAdjacentTerritory) {
      if (player.hasRevenge() && player.revengeTargetHexId === hexId) {
        return { ok: true };
      }
      return { ok: false, reason: "No adjacent territory" };
    }

    return { ok: true };
  }

  getPlayerTerritoryIds(userId: string): string[] {
    const ids: string[] = [];
    for (const [id, hex] of this.hexagons) {
      if (hex.ownerId === userId) ids.push(id);
    }
    return ids;
  }

  getPlayerTerritoryCount(userId: string): number {
    let count = 0;
    for (const hex of this.hexagons.values()) {
      if (hex.ownerId === userId) count++;
    }
    return count;
  }

  // ── Duel Management ────────────────────────────────────────────

  findActiveDuelByPlayer(userId: string): TcDuel | null {
    for (const duel of this.activeDuels.values()) {
      if (duel.attackerId === userId || duel.defenderId === userId) {
        if (!duel.isResolved()) return duel;
      }
    }
    return null;
  }

  registerDuel(duel: TcDuel): void {
    this.activeDuels.set(duel.id, duel);
    const attacker = this.players.get(duel.attackerId);
    if (attacker) attacker.isInDuel = true;
    if (duel.defenderId) {
      const defender = this.players.get(duel.defenderId);
      if (defender) defender.isInDuel = true;
    }
  }

  resolveDuel(duel: TcDuel): {
    hexChanged: boolean;
    attackerEliminated: boolean;
    defenderEliminated: boolean;
    winnerId: string | null;
  } {
    const result = {
      hexChanged: false,
      attackerEliminated: false,
      defenderEliminated: false,
      winnerId: duel.winnerId,
    };

    const attacker = this.players.get(duel.attackerId);
    if (attacker) attacker.isInDuel = false;
    if (duel.defenderId) {
      const defender = this.players.get(duel.defenderId);
      if (defender) defender.isInDuel = false;
    }

    const targetHex = this.hexagons.get(duel.hexId);
    if (!targetHex) {
      this.activeDuels.delete(duel.id);
      return result;
    }

    if (duel.winnerId === duel.attackerId) {
      // Attacker wins
      const previousOwnerId = targetHex.ownerId;
      const attackerPlayer = this.players.get(duel.attackerId)!;
      targetHex.setOwner(duel.attackerId, attackerPlayer.username, attackerPlayer.color);
      attackerPlayer.matchPoints += TC_MATCH_POINT_ATTACK_WIN;
      attackerPlayer.duelsWon++;
      attackerPlayer.clearRevenge();
      result.hexChanged = true;

      // Check if defender lost their last territory
      if (previousOwnerId && previousOwnerId !== duel.attackerId) {
        const defenderPlayer = this.players.get(previousOwnerId);
        if (defenderPlayer) {
          defenderPlayer.duelsLost++;
          const defenderTerritories = this.getPlayerTerritoryCount(previousOwnerId);
          if (defenderTerritories === 0) {
            defenderPlayer.revengeTargetHexId = duel.hexId;
            defenderPlayer.revengeOpponentId = duel.attackerId;
            result.defenderEliminated = true;
          }
        }
      }
    } else if (duel.winnerId && duel.defenderId) {
      // Defender wins
      const defenderPlayer = this.players.get(duel.defenderId);
      if (defenderPlayer) {
        defenderPlayer.matchPoints += TC_MATCH_POINT_DEFENSE_WIN;
        defenderPlayer.duelsWon++;
      }
      const attackerPlayer = this.players.get(duel.attackerId);
      if (attackerPlayer) {
        attackerPlayer.duelsLost++;

        // If this was a revenge attempt and attacker lost
        if (attackerPlayer.hasRevenge()) {
          attackerPlayer.setCooldown(TC_REVENGE_COOLDOWN_MS);
          result.attackerEliminated = false; // not eliminated, just on cooldown
        }
      }
    } else {
      // Neutral attack lost (winnerId is null)
      const attackerPlayer = this.players.get(duel.attackerId);
      if (attackerPlayer) {
        attackerPlayer.duelsLost++;
      }
    }

    this.activeDuels.delete(duel.id);
    return result;
  }

  // ── Win Condition ──────────────────────────────────────────────

  checkWinCondition(): string | null {
    const totalHexes = this.hexagons.size;
    const threshold = Math.ceil(totalHexes * TC_WIN_THRESHOLD);

    for (const player of this.players.values()) {
      const count = this.getPlayerTerritoryCount(player.userId);
      if (count >= threshold) {
        this.winnerId = player.userId;
        this.status = TcMatchStatus.Finished;
        return player.userId;
      }
    }

    return null;
  }

  checkTimeExpired(): boolean {
    if (!this.endsAt) return false;
    if (new Date() >= this.endsAt) {
      this.status = TcMatchStatus.Finished;
      return true;
    }
    return false;
  }

  finish(): void {
    this.status = TcMatchStatus.Finished;

    // Clean up active duels
    for (const duel of this.activeDuels.values()) {
      const attacker = this.players.get(duel.attackerId);
      if (attacker) attacker.isInDuel = false;
      if (duel.defenderId) {
        const defender = this.players.get(duel.defenderId);
        if (defender) defender.isInDuel = false;
      }
    }
    this.activeDuels.clear();
  }

  // ── Serialization ──────────────────────────────────────────────

  getLeaderboard(): TcLeaderboardEntry[] {
    const entries: TcLeaderboardEntry[] = [];

    for (const player of this.players.values()) {
      entries.push({
        rank: 0,
        userId: player.userId,
        username: player.username,
        color: player.color,
        territoryCount: this.getPlayerTerritoryCount(player.userId),
        duelsWon: player.duelsWon,
        matchPoints: player.matchPoints,
      });
    }

    entries.sort((a, b) => {
      if (b.territoryCount !== a.territoryCount) return b.territoryCount - a.territoryCount;
      if (b.duelsWon !== a.duelsWon) return b.duelsWon - a.duelsWon;
      return b.matchPoints - a.matchPoints;
    });

    entries.forEach((e, i) => (e.rank = i + 1));
    return entries;
  }

  getHexesData(): TcHexData[] {
    return Array.from(this.hexagons.values()).map((h) => ({
      id: h.id,
      q: h.q,
      r: h.r,
      category: h.category,
      ownerId: h.ownerId,
      ownerUsername: h.ownerUsername,
      ownerColor: h.ownerColor,
    }));
  }

  getPlayersData(): TcPlayerData[] {
    return Array.from(this.players.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      color: p.color,
      territoryCount: this.getPlayerTerritoryCount(p.userId),
      matchPoints: p.matchPoints,
      duelsWon: p.duelsWon,
      duelsLost: p.duelsLost,
      connected: p.connected,
    }));
  }
}
