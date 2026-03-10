import { DifferencePuzzleEntity } from "../entities/DifferencePuzzle";

export interface IPuzzleRepository {
  findRandom(): Promise<DifferencePuzzleEntity>;
  findById(id: string): Promise<DifferencePuzzleEntity | undefined>;
}
