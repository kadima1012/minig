import { TcMatch } from "../entities/TcMatch";

export interface ITcMatchRepository {
  save(match: TcMatch): void;
  findById(id: string): TcMatch | undefined;
  findByCode(code: string): TcMatch | undefined;
  findActiveByPlayerId(userId: string): TcMatch | undefined;
  findLobbyMatches(): TcMatch[];
  remove(id: string): void;
  persistToDb(match: TcMatch): void;
}
