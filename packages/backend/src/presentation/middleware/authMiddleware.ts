import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../infrastructure/services/JwtService";

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwtService.verify(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
