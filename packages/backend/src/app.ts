import express from "express";
import cors from "cors";
import { env } from "./infrastructure/config/env";
import { apiRouter } from "./presentation/routes/index";
import { errorHandler } from "./presentation/middleware/errorHandler";

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);
app.use(errorHandler);

export default app;
