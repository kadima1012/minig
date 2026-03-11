import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { socketAuth } from "./socketAuth";
import { RpsSocketHandler } from "../../presentation/socket/RpsSocketHandler";
import { InMemoryRpsRoomRepository } from "../repositories/InMemoryRpsRoomRepository";
import { IScoreRepository } from "../../domain/interfaces/IScoreRepository";
import { userRepo } from "../../presentation/controllers/AuthController";

const roomRepo = new InMemoryRpsRoomRepository();

export function setupSocket(httpServer: HttpServer, scoreRepo: IScoreRepository) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.data.username} (${socket.data.userId})`);
    const handler = new RpsSocketHandler(io, socket, roomRepo, scoreRepo, userRepo);
    handler.register();
  });

  return io;
}
