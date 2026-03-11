import { RpsRoom } from "../entities/RpsRoom";

export interface IRpsRoomRepository {
  save(room: RpsRoom): void;
  findByCode(code: string): RpsRoom | undefined;
  findByPlayerId(userId: string): RpsRoom | undefined;
  remove(code: string): void;
}
