import Database from "better-sqlite3";
import { TcCategory, TC_QUESTION_TIMEOUT_MS, TC_TIEBREAKER_TIMEOUT_MS } from "@minigames/shared";
import { ITcQuestionRepository } from "../../domain/interfaces/ITcQuestionRepository";
import { TcTriviaQuestion, TcTiebreakerQuestion } from "../../domain/entities/TcTriviaQuestion";
import { allTriviaConquestQuestions } from "../data/trivia-conquest-questions.data";

interface QuestionRow {
  id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  category: string;
  is_tiebreaker: number;
  numeric_answer: number | null;
}

export class SqliteTcQuestionRepository implements ITcQuestionRepository {
  constructor(private db: Database.Database) {}

  seedQuestions(): void {
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO tc_questions (id, text, option_a, option_b, option_c, option_d, correct_index, category, is_tiebreaker, numeric_answer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction(() => {
      for (const q of allTriviaConquestQuestions) {
        if (q.isTiebreaker) {
          insert.run(q.id, q.text, "", "", "", "", 0, q.category, 1, q.numericAnswer);
        } else {
          insert.run(
            q.id, q.text,
            q.options[0], q.options[1], q.options[2], q.options[3],
            q.correctIndex, q.category, 0, null
          );
        }
      }
    });

    insertMany();
    console.log(`[SQLite] Seeded ${allTriviaConquestQuestions.length} trivia conquest questions`);
  }

  findRandomByCategory(category: TcCategory, count: number): TcTriviaQuestion[] {
    const rows = this.db.prepare(
      "SELECT * FROM tc_questions WHERE category = ? AND is_tiebreaker = 0 ORDER BY RANDOM() LIMIT ?"
    ).all(category, count) as QuestionRow[];

    return rows.map((r) => new TcTriviaQuestion(
      r.id,
      r.text,
      [r.option_a, r.option_b, r.option_c, r.option_d],
      r.correct_index,
      r.category as TcCategory,
      TC_QUESTION_TIMEOUT_MS
    ));
  }

  findRandomTiebreaker(category: TcCategory): TcTiebreakerQuestion {
    const row = this.db.prepare(
      "SELECT * FROM tc_questions WHERE category = ? AND is_tiebreaker = 1 ORDER BY RANDOM() LIMIT 1"
    ).get(category) as QuestionRow | undefined;

    if (!row) {
      // Fallback: any category tiebreaker
      const fallback = this.db.prepare(
        "SELECT * FROM tc_questions WHERE is_tiebreaker = 1 ORDER BY RANDOM() LIMIT 1"
      ).get() as QuestionRow;

      return new TcTiebreakerQuestion(
        fallback.id, fallback.text, fallback.numeric_answer!, fallback.category as TcCategory, TC_TIEBREAKER_TIMEOUT_MS
      );
    }

    return new TcTiebreakerQuestion(
      row.id, row.text, row.numeric_answer!, row.category as TcCategory, TC_TIEBREAKER_TIMEOUT_MS
    );
  }
}
