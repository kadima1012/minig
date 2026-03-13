import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { socketAuth } from "./socketAuth";
import { RpsSocketHandler } from "../../presentation/socket/RpsSocketHandler";
import { TcSocketHandler } from "../../presentation/socket/TcSocketHandler";
import { InMemoryRpsRoomRepository } from "../repositories/InMemoryRpsRoomRepository";
import { SqliteTcMatchRepository } from "../repositories/SqliteTcMatchRepository";
import { SqliteTcQuestionRepository } from "../repositories/SqliteTcQuestionRepository";
import { IScoreRepository } from "../../domain/interfaces/IScoreRepository";
import { userRepo } from "../../presentation/controllers/AuthController";
import { getDatabase } from "../database/sqlite";

const roomRepo = new InMemoryRpsRoomRepository();

export function setupSocket(httpServer: HttpServer, scoreRepo: IScoreRepository) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const db = getDatabase();
  const tcMatchRepo = new SqliteTcMatchRepository(db);
  const tcQuestionRepo = new SqliteTcQuestionRepository(db);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.data.username} (${socket.data.userId})`);

    const rpsHandler = new RpsSocketHandler(io, socket, roomRepo, scoreRepo, userRepo);
    rpsHandler.register();

    const tcHandler = new TcSocketHandler(io, socket, tcMatchRepo, tcQuestionRepo);
    tcHandler.register();
  });

  return io;
}
