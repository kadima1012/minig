import {
  TcCategory,
  TcDuelStatus,
  TC_NEUTRAL_WIN_THRESHOLD,
} from "@minigames/shared";
import { TcTriviaQuestion, TcTiebreakerQuestion } from "./TcTriviaQuestion";

export interface DuelAnswer {
  questionIndex: number;
  selectedIndex: number;
  timeMs: number;
  correct: boolean;
  points: number;
}

export class TcDuel {
  public status: TcDuelStatus = TcDuelStatus.InProgress;
  public attackerAnswers: DuelAnswer[] = [];
  public defenderAnswers: DuelAnswer[] = [];
  public attackerScore = 0;
  public defenderScore = 0;
  public currentQuestionIndex = 0;
  public questionStartedAt: Date | null = null;
  public tiebreakerQuestion: TcTiebreakerQuestion | null = null;
  public attackerTiebreakerAnswer: number | null = null;
  public defenderTiebreakerAnswer: number | null = null;
  public winnerId: string | null = null;

  constructor(
    public readonly id: string,
    public readonly matchId: string,
    public readonly hexId: string,
    public readonly attackerId: string,
    public readonly defenderId: string | null,
    public readonly category: TcCategory,
    public readonly questions: TcTriviaQuestion[],
    public readonly tiebreaker: TcTiebreakerQuestion
  ) {
    this.tiebreakerQuestion = tiebreaker;
  }

  get isNeutral(): boolean {
    return this.defenderId === null;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  getCurrentQuestion(): TcTriviaQuestion | null {
    if (this.currentQuestionIndex >= this.questions.length) return null;
    return this.questions[this.currentQuestionIndex];
  }

  submitAnswer(userId: string, selectedIndex: number, timeMs: number): DuelAnswer {
    const question = this.questions[this.currentQuestionIndex];
    if (!question) throw new Error("No current question");

    const correct = question.isCorrect(selectedIndex);
    const points = correct ? 1 : 0;

    const answer: DuelAnswer = {
      questionIndex: this.currentQuestionIndex,
      selectedIndex,
      timeMs,
      correct,
      points,
    };

    if (userId === this.attackerId) {
      if (this.attackerAnswers.some((a) => a.questionIndex === this.currentQuestionIndex)) {
        throw new Error("Already answered this question");
      }
      this.attackerAnswers.push(answer);
      this.attackerScore += points;
    } else if (userId === this.defenderId) {
      if (this.defenderAnswers.some((a) => a.questionIndex === this.currentQuestionIndex)) {
        throw new Error("Already answered this question");
      }
      this.defenderAnswers.push(answer);
      this.defenderScore += points;
    } else {
      throw new Error("Not a participant in this duel");
    }

    return answer;
  }

  /** For neutral attacks: auto-record 0 for defender */
  autoAnswerDefender(): void {
    this.defenderAnswers.push({
      questionIndex: this.currentQuestionIndex,
      selectedIndex: -1,
      timeMs: 0,
      correct: false,
      points: 0,
    });
  }

  /** For timeouts: auto-record 0 for a player who didn't answer */
  autoTimeoutPlayer(userId: string): void {
    const answer: DuelAnswer = {
      questionIndex: this.currentQuestionIndex,
      selectedIndex: -1,
      timeMs: 0,
      correct: false,
      points: 0,
    };

    if (userId === this.attackerId) {
      if (!this.attackerAnswers.some((a) => a.questionIndex === this.currentQuestionIndex)) {
        this.attackerAnswers.push(answer);
      }
    } else if (userId === this.defenderId) {
      if (!this.defenderAnswers.some((a) => a.questionIndex === this.currentQuestionIndex)) {
        this.defenderAnswers.push(answer);
      }
    }
  }

  bothAnsweredCurrentQuestion(): boolean {
    const attackerAnswered = this.attackerAnswers.some(
      (a) => a.questionIndex === this.currentQuestionIndex
    );
    const defenderAnswered = this.isNeutral || this.defenderAnswers.some(
      (a) => a.questionIndex === this.currentQuestionIndex
    );
    return attackerAnswered && defenderAnswered;
  }

  advanceQuestion(): "next" | "tiebreaker" | "resolved" {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      if (this.isNeutral) {
        // Neutral attack: attacker needs threshold to win
        this.winnerId = this.attackerScore >= TC_NEUTRAL_WIN_THRESHOLD ? this.attackerId : null;
        this.status = TcDuelStatus.Resolved;
        return "resolved";
      }

      if (this.attackerScore === this.defenderScore) {
        this.status = TcDuelStatus.Tiebreaker;
        return "tiebreaker";
      }

      this.winnerId = this.attackerScore > this.defenderScore ? this.attackerId : this.defenderId;
      this.status = TcDuelStatus.Resolved;
      return "resolved";
    }

    return "next";
  }

  submitTiebreakerAnswer(userId: string, numericAnswer: number): void {
    if (this.status !== TcDuelStatus.Tiebreaker) {
      throw new Error("Not in tiebreaker phase");
    }

    if (userId === this.attackerId) {
      this.attackerTiebreakerAnswer = numericAnswer;
    } else if (userId === this.defenderId) {
      this.defenderTiebreakerAnswer = numericAnswer;
    } else {
      throw new Error("Not a participant in this duel");
    }
  }

  bothAnsweredTiebreaker(): boolean {
    return this.attackerTiebreakerAnswer !== null && this.defenderTiebreakerAnswer !== null;
  }

  resolveTiebreaker(): void {
    if (!this.tiebreakerQuestion) throw new Error("No tiebreaker question");
    if (this.attackerTiebreakerAnswer === null || this.defenderTiebreakerAnswer === null) {
      throw new Error("Both must answer tiebreaker");
    }

    const attackerDist = this.tiebreakerQuestion.getDistance(this.attackerTiebreakerAnswer);
    const defenderDist = this.tiebreakerQuestion.getDistance(this.defenderTiebreakerAnswer);

    // Attacker wins ties (advantage for attacking)
    this.winnerId = attackerDist <= defenderDist ? this.attackerId : this.defenderId;
    this.status = TcDuelStatus.Resolved;
  }

  /** Forfeit: the disconnected player loses instantly */
  forfeit(disconnectedUserId: string): void {
    if (disconnectedUserId === this.attackerId) {
      this.winnerId = this.defenderId;
    } else if (disconnectedUserId === this.defenderId) {
      this.winnerId = this.attackerId;
    }
    this.status = TcDuelStatus.Resolved;
  }

  isResolved(): boolean {
    return this.status === TcDuelStatus.Resolved;
  }
}
