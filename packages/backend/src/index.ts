import { createServer } from "http";
import app from "./app";
import { env } from "./infrastructure/config/env";
import { seedTestData } from "./infrastructure/data/seed";
import { userRepo } from "./presentation/controllers/AuthController";
import { scoreRepo } from "./presentation/controllers/ScoreController";
import { setupSocket } from "./infrastructure/socket/setupSocket";

const httpServer = createServer(app);
setupSocket(httpServer, scoreRepo);

httpServer.listen(env.port, async () => {
  console.log(`[Backend] Running on http://localhost:${env.port}`);
  console.log(`[Backend] Environment: ${env.nodeEnv}`);
  console.log(`[Backend] Socket.io attached`);

  if (env.nodeEnv === "development") {
    await seedTestData(userRepo);
  }
});
