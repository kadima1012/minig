import Database from "better-sqlite3";
import { TcMatchStatus } from "@minigames/shared";
import { ITcMatchRepository } from "../../domain/interfaces/ITcMatchRepository";
import { TcMatch } from "../../domain/entities/TcMatch";

export class SqliteTcMatchRepository implements ITcMatchRepository {
  private activeMatches = new Map<string, TcMatch>();
  private codeIndex = new Map<string, string>(); // code -> id

  constructor(private db: Database.Database) {}

  save(match: TcMatch): void {
    this.activeMatches.set(match.id, match);
    this.codeIndex.set(match.code, match.id);
  }

  findById(id: string): TcMatch | undefined {
    return this.activeMatches.get(id);
  }

  findByCode(code: string): TcMatch | undefined {
    const id = this.codeIndex.get(code);
    if (!id) return undefined;
    return this.activeMatches.get(id);
  }

  findActiveByPlayerId(userId: string): TcMatch | undefined {
    for (const match of this.activeMatches.values()) {
      if (match.status !== TcMatchStatus.Finished && match.hasPlayer(userId)) {
        return match;
      }
    }
    return undefined;
  }

  findLobbyMatches(): TcMatch[] {
    const lobbies: TcMatch[] = [];
    for (const match of this.activeMatches.values()) {
      if (match.status === TcMatchStatus.Lobby) {
        lobbies.push(match);
      }
    }
    return lobbies;
  }

  remove(id: string): void {
    const match = this.activeMatches.get(id);
    if (match) {
      this.codeIndex.delete(match.code);
      this.activeMatches.delete(id);
    }
  }

  persistToDb(match: TcMatch): void {
    const insertMatch = this.db.prepare(`
      INSERT OR REPLACE INTO tc_matches (id, code, status, created_at, started_at, ended_at, winner_id, hex_count, player_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPlayer = this.db.prepare(`
      INSERT OR REPLACE INTO tc_match_players (match_id, user_id, username, match_points, duels_won, duels_lost, final_territory_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const persist = this.db.transaction(() => {
      insertMatch.run(
        match.id,
        match.code,
        match.status,
        match.createdAt.toISOString(),
        match.startedAt?.toISOString() ?? null,
        match.status === TcMatchStatus.Finished ? new Date().toISOString() : null,
        match.winnerId,
        match.hexagons.size,
        match.players.size
      );

      for (const player of match.players.values()) {
        insertPlayer.run(
          match.id,
          player.userId,
          player.username,
          player.matchPoints,
          player.duelsWon,
          player.duelsLost,
          match.getPlayerTerritoryCount(player.userId)
        );
      }
    });

    persist();

    // Clean up in-memory if finished
    if (match.status === TcMatchStatus.Finished) {
      this.remove(match.id);
    }
  }
}
