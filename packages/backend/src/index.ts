import { createServer } from "http";
import app from "./app";
import { env } from "./infrastructure/config/env";
import { seedTestData } from "./infrastructure/data/seed";
import { userRepo } from "./presentation/controllers/AuthController";
import { scoreRepo } from "./presentation/controllers/ScoreController";
import { setupSocket } from "./infrastructure/socket/setupSocket";
import { getDatabase } from "./infrastructure/database/sqlite";
import { runMigrations } from "./infrastructure/database/migrations/runner";
import { SqliteTcQuestionRepository } from "./infrastructure/repositories/SqliteTcQuestionRepository";

// Initialize SQLite and run migrations
const db = getDatabase();
runMigrations(db);

// Seed trivia conquest questions
const tcQuestionRepo = new SqliteTcQuestionRepository(db);
tcQuestionRepo.seedQuestions();

const httpServer = createServer(app);
setupSocket(httpServer, scoreRepo);

httpServer.listen(env.port, async () => {
  console.log(`[Backend] Running on http://localhost:${env.port}`);
  console.log(`[Backend] Environment: ${env.nodeEnv}`);
  console.log(`[Backend] Socket.io attached`);
  console.log(`[Backend] SQLite initialized`);

  if (env.nodeEnv === "development") {
    await seedTestData(userRepo);
  }
});
