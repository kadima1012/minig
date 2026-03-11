import { RpsChoice } from "@minigames/shared";
import { RpsRoom } from "../../../domain/entities/RpsRoom";
import { IRpsRoomRepository } from "../../../domain/interfaces/IRpsRoomRepository";

interface SubmitResult {
  room: RpsRoom;
  roundResolved: boolean;
  roundRecord?: {
    p1Choice: RpsChoice;
    p2Choice: RpsChoice;
  };
}

export class SubmitMultiplayerChoiceUseCase {
  constructor(private roomRepo: IRpsRoomRepository) {}

  execute(userId: string, choice: RpsChoice): SubmitResult {
    const room = this.roomRepo.findByPlayerId(userId);
    if (!room) throw new Error("Not in a room");
    if (room.status !== "playing") throw new Error("Game is not in progress");

    room.submitChoice(userId, choice);

    if (room.bothChosen()) {
      const record = room.resolveRound();
      return {
        room,
        roundResolved: true,
        roundRecord: { p1Choice: record.p1Choice, p2Choice: record.p2Choice },
      };
    }

    return { room, roundResolved: false };
  }
}
