import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
}

export class JwtService {
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  }
}
