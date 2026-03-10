import { Question } from "../entities/Question";

export interface IQuestionRepository {
  findAll(): Promise<Question[]>;
  findById(id: string): Promise<Question | undefined>;
  findRandom(count: number): Promise<Question[]>;
}
