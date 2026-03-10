import app from "./app";
import { env } from "./infrastructure/config/env";

app.listen(env.port, () => {
  console.log(`[Backend] Running on http://localhost:${env.port}`);
  console.log(`[Backend] Environment: ${env.nodeEnv}`);
});
