import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { Question } from "../../domain/entities/Question";
import { questionsData } from "../data/questions.data";

export class InMemoryQuestionRepository implements IQuestionRepository {
  private readonly questions: Question[] = questionsData;

  async findAll(): Promise<Question[]> {
    return [...this.questions];
  }

  async findById(id: string): Promise<Question | undefined> {
    return this.questions.find((q) => q.id === id);
  }

  async findRandom(count: number): Promise<Question[]> {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
