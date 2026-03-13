import type Database from "better-sqlite3";

export const name = "001_trivia_conquest";

export function up(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tc_questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      category TEXT NOT NULL,
      is_tiebreaker INTEGER NOT NULL DEFAULT 0,
      numeric_answer REAL
    );

    CREATE TABLE IF NOT EXISTS tc_matches (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      started_at TEXT,
      ended_at TEXT,
      winner_id TEXT,
      hex_count INTEGER NOT NULL,
      player_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tc_match_players (
      match_id TEXT NOT NULL REFERENCES tc_matches(id),
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      match_points INTEGER NOT NULL DEFAULT 0,
      duels_won INTEGER NOT NULL DEFAULT 0,
      duels_lost INTEGER NOT NULL DEFAULT 0,
      final_territory_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (match_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS tc_duels (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL REFERENCES tc_matches(id),
      hex_id TEXT NOT NULL,
      attacker_id TEXT NOT NULL,
      defender_id TEXT,
      category TEXT NOT NULL,
      attacker_score INTEGER NOT NULL DEFAULT 0,
      defender_score INTEGER NOT NULL DEFAULT 0,
      winner_id TEXT,
      is_tiebreaker_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tc_questions_category ON tc_questions(category);
    CREATE INDEX IF NOT EXISTS idx_tc_matches_status ON tc_matches(status);
    CREATE INDEX IF NOT EXISTS idx_tc_duels_match ON tc_duels(match_id);
  `);
}
