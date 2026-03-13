import type Database from "better-sqlite3";
import * as migration001 from "./001_trivia_conquest";

interface Migration {
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [migration001];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    db
      .prepare("SELECT name FROM migrations")
      .all()
      .map((row) => (row as { name: string }).name)
  );

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      migration.up(db);
      db.prepare("INSERT INTO migrations (name, applied_at) VALUES (?, ?)").run(
        migration.name,
        new Date().toISOString()
      );
      console.log(`[SQLite] Migration applied: ${migration.name}`);
    }
  }
}
