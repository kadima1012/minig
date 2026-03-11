import { Socket } from "socket.io";
import { JwtService } from "../services/JwtService";
import { userRepo } from "../../presentation/controllers/AuthController";

const jwtService = new JwtService();

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = jwtService.verify(token);
    const user = await userRepo.findById(payload.userId);
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.data.userId = payload.userId;
    socket.data.username = user.username;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
