import { IPuzzleRepository } from "../../domain/interfaces/IPuzzleRepository";
import { DifferencePuzzleEntity } from "../../domain/entities/DifferencePuzzle";
import { puzzlesData } from "../data/puzzles.data";

export class InMemoryPuzzleRepository implements IPuzzleRepository {
  private readonly puzzles: DifferencePuzzleEntity[] = puzzlesData;

  async findRandom(): Promise<DifferencePuzzleEntity> {
    const index = Math.floor(Math.random() * this.puzzles.length);
    return this.puzzles[index];
  }

  async findById(id: string): Promise<DifferencePuzzleEntity | undefined> {
    return this.puzzles.find((p) => p.id === id);
  }
}
