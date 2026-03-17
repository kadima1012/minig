import {
  TcCategory,
  TcMatchStatus,
  TcHexData,
  TcPlayerData,
  TcLeaderboardEntry,
  TcRoundOrderEntry,
  TcHexSelectedData,
  TC_PLAYER_COLORS,
  TC_WIN_THRESHOLD,
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

export type RoundPhase = "planning" | "resolution" | "between";

export class TcMatch {
  public status: TcMatchStatus = TcMatchStatus.Lobby;
  public hexagons = new Map<string, TcHexagon>();
  public players = new Map<string, TcMatchPlayer>();
  public activeDuels = new Map<string, TcDuel>();
  public startedAt: Date | null = null;
  public endsAt: Date | null = null;
  public winnerId: string | null = null;
  public creatorId: string;

  // ── Round management ──────────────────────────────────────────
  public currentRound = 0;
  public roundPhase: RoundPhase = "between";
  public planningEndsAt: Date | null = null;
  /** userId -> hexId selections during planning */
  public hexSelections = new Map<string, string>();
  /** hexId -> userId reverse lookup */
  public hexSelectionsByHex = new Map<string, string>();
  /** Resolution order for current round */
  public roundOrder: TcRoundOrderEntry[] = [];
  /** Current duel position in resolution (0-based) */
  public currentDuelPosition = 0;
  /** Temporary storage for elimination round data */
  public eliminationData: {
    tiebreakerQ: { numericAnswer: number; getDistance: (answer: number) => number; text: string; timeoutMs: number };
    activePlayers: string[];
    availableSlots: number;
  } | null = null;

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

  /** Surrender: release all territories (become neutral), keep player in match */
  surrenderPlayer(userId: string): string[] {
    const freedHexIds: string[] = [];
    for (const hex of this.hexagons.values()) {
      if (hex.ownerId === userId) {
        hex.setOwner(null, null, null);
        freedHexIds.push(hex.id);
      }
    }
    const player = this.players.get(userId);
    if (player) {
      player.clearRevenge();
      player.isInDuel = false;
    }
    return freedHexIds;
  }

  /** Count how many players still have at least one territory */
  getPlayersWithTerritoryCount(): number {
    const owners = new Set<string>();
    for (const hex of this.hexagons.values()) {
      if (hex.ownerId) owners.add(hex.ownerId);
    }
    return owners.size;
  }

  /** Get the single remaining player with territory (if only one left) */
  getLastPlayerWithTerritory(): string | null {
    const owners = new Set<string>();
    for (const hex of this.hexagons.values()) {
      if (hex.ownerId) owners.add(hex.ownerId);
    }
    if (owners.size === 1) return owners.values().next().value ?? null;
    return null;
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

  // ── Round / Planning Phase ────────────────────────────────────

  /** Get all hex IDs that a given player can attack (neighbor, not own).
   *  While neutral hexes exist, only neutral neighbors are returned. */
  getAttackableHexIds(userId: string): string[] {
    const ownIds = this.getPlayerTerritoryIds(userId);
    const ownSet = new Set(ownIds);
    const attackable = new Set<string>();
    const neutralsExist = this.hasNeutralHexes();

    for (const ownId of ownIds) {
      const hex = this.hexagons.get(ownId);
      if (!hex) continue;
      for (const nId of hex.neighborIds) {
        if (ownSet.has(nId)) continue;
        const neighbor = this.hexagons.get(nId);
        if (!neighbor) continue;
        // While neutrals exist, only allow attacking neutral hexes
        if (neutralsExist && !neighbor.isNeutral()) continue;
        attackable.add(nId);
      }
    }
    return Array.from(attackable);
  }

  /** Get all unique attackable hex IDs across all active players */
  getAllAttackableHexIds(): string[] {
    const all = new Set<string>();
    for (const player of this.players.values()) {
      if (!player.connected) continue;
      if (this.getPlayerTerritoryCount(player.userId) === 0 && !player.hasRevenge()) continue;
      for (const hexId of this.getAttackableHexIds(player.userId)) {
        all.add(hexId);
      }
    }
    return Array.from(all);
  }

  /** Get active players (connected, have territory or revenge) */
  getActivePlayers(): TcMatchPlayer[] {
    const active: TcMatchPlayer[] = [];
    for (const player of this.players.values()) {
      if (!player.connected) continue;
      const hasTerr = this.getPlayerTerritoryCount(player.userId) > 0;
      if (hasTerr || player.hasRevenge()) {
        active.push(player);
      }
    }
    return active;
  }

  /** Check if there are any neutral hexes remaining */
  hasNeutralHexes(): boolean {
    for (const hex of this.hexagons.values()) {
      if (hex.isNeutral()) return true;
    }
    return false;
  }

  /** Get all neutral hex IDs */
  getNeutralHexIds(): string[] {
    const neutrals: string[] = [];
    for (const hex of this.hexagons.values()) {
      if (hex.isNeutral()) neutrals.push(hex.id);
    }
    return neutrals;
  }

  /** Auto-assign a random attackable hex for players who haven't selected yet.
   *  Returns the auto-assigned selections as {userId, hexId}[]. */
  autoAssignUnselectedPlayers(): Array<{ userId: string; hexId: string }> {
    const activePlayers = this.getActivePlayers();
    const assigned: Array<{ userId: string; hexId: string }> = [];

    // Collect already-selected hex IDs
    const takenHexes = new Set(this.hexSelectionsByHex.keys());

    for (const player of activePlayers) {
      if (this.hexSelections.has(player.userId)) continue; // already selected

      // Get attackable hexes not already taken
      const attackable = this.getAttackableHexIds(player.userId)
        .filter(id => !takenHexes.has(id));

      if (attackable.length === 0) continue;

      // Pick random
      const hexId = attackable[Math.floor(Math.random() * attackable.length)];
      this.hexSelections.set(player.userId, hexId);
      this.hexSelectionsByHex.set(hexId, player.userId);
      takenHexes.add(hexId);
      assigned.push({ userId: player.userId, hexId });
    }

    return assigned;
  }

  /** Start a new planning phase */
  startPlanningPhase(durationMs: number): void {
    this.currentRound++;
    this.roundPhase = "planning";
    this.planningEndsAt = new Date(Date.now() + durationMs);
    this.hexSelections.clear();
    this.hexSelectionsByHex.clear();
    this.roundOrder = [];
    this.currentDuelPosition = 0;
  }

  /** Player selects a hex during planning */
  selectHex(userId: string, hexId: string): { ok: boolean; reason?: string } {
    if (this.roundPhase !== "planning") return { ok: false, reason: "Not in planning phase" };

    const player = this.players.get(userId);
    if (!player) return { ok: false, reason: "Not in match" };
    if (!player.connected) return { ok: false, reason: "Not connected" };

    // Check territory count
    const hasTerr = this.getPlayerTerritoryCount(userId) > 0;
    if (!hasTerr && !player.hasRevenge()) return { ok: false, reason: "No territory" };

    // Validate hex is attackable by this player
    const attackable = this.getAttackableHexIds(userId);
    // Also allow revenge hex
    const canAttack = attackable.includes(hexId) ||
      (player.hasRevenge() && player.revengeTargetHexId === hexId);
    if (!canAttack) return { ok: false, reason: "Cannot attack this hex" };

    // Check if hex already selected by another player
    const existingSelector = this.hexSelectionsByHex.get(hexId);
    if (existingSelector && existingSelector !== userId) {
      return { ok: false, reason: "Hex already selected by another player" };
    }

    // Deselect previous if any
    const prevHex = this.hexSelections.get(userId);
    if (prevHex) {
      this.hexSelectionsByHex.delete(prevHex);
    }

    // Select new hex
    this.hexSelections.set(userId, hexId);
    this.hexSelectionsByHex.set(hexId, userId);
    return { ok: true };
  }

  /** Player deselects their hex during planning */
  deselectHex(userId: string): string | null {
    const hexId = this.hexSelections.get(userId);
    if (!hexId) return null;
    this.hexSelections.delete(userId);
    this.hexSelectionsByHex.delete(hexId);
    return hexId;
  }

  /** End planning and build resolution order */
  buildResolutionOrder(): TcRoundOrderEntry[] {
    this.roundPhase = "resolution";
    this.planningEndsAt = null;

    // Build order from selections, randomize
    const entries: TcRoundOrderEntry[] = [];
    for (const [userId, hexId] of this.hexSelections) {
      const player = this.players.get(userId);
      if (!player) continue;
      const hex = this.hexagons.get(hexId);
      if (!hex) continue;

      entries.push({
        userId: player.userId,
        username: player.username,
        color: player.color,
        targetHexId: hexId,
        targetHexCategory: hex.category,
        isNeutral: hex.isNeutral(),
      });
    }

    // Shuffle randomly
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    this.roundOrder = entries;
    this.currentDuelPosition = 0;
    return entries;
  }

  /** Get current selections as data for clients */
  getSelectionsData(): TcHexSelectedData[] {
    const data: TcHexSelectedData[] = [];
    for (const [userId, hexId] of this.hexSelections) {
      const player = this.players.get(userId);
      if (!player) continue;
      data.push({
        hexId,
        userId: player.userId,
        username: player.username,
        color: player.color,
      });
    }
    return data;
  }

  /** Check if elimination round is needed (more players than available hexes) */
  needsEliminationRound(): { needed: boolean; activePlayers: TcMatchPlayer[]; availableHexCount: number } {
    const activePlayers = this.getActivePlayers();
    const allAttackable = this.getAllAttackableHexIds();
    return {
      needed: allAttackable.length > 0 && allAttackable.length < activePlayers.length,
      activePlayers,
      availableHexCount: allAttackable.length,
    };
  }

  /** End round and go to between state */
  endRound(): void {
    this.roundPhase = "between";
    this.hexSelections.clear();
    this.hexSelectionsByHex.clear();
    this.roundOrder = [];
    this.currentDuelPosition = 0;
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
      });
    }

    entries.sort((a, b) => {
      if (b.territoryCount !== a.territoryCount) return b.territoryCount - a.territoryCount;
      return b.duelsWon - a.duelsWon;
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
      duelsWon: p.duelsWon,
      duelsLost: p.duelsLost,
      connected: p.connected,
    }));
  }
}
