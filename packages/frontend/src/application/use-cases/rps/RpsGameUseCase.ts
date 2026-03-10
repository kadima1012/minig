import { RpsChoice, RpsRound } from "@minigames/shared";
import { rpsApi } from "../../../infrastructure/api/rps.api";

export class RpsGameUseCase {
  async play(choice: RpsChoice): Promise<RpsRound> {
    return rpsApi.playRound(choice);
  }
}
