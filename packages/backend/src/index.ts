import app from "./app";
import { env } from "./infrastructure/config/env";
import { seedTestData } from "./infrastructure/data/seed";
import { userRepo } from "./presentation/controllers/AuthController";

app.listen(env.port, async () => {
  console.log(`[Backend] Running on http://localhost:${env.port}`);
  console.log(`[Backend] Environment: ${env.nodeEnv}`);

  if (env.nodeEnv === "development") {
    await seedTestData(userRepo);
  }
});
