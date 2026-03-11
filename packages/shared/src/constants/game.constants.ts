import { GameId } from "../enums/game.enums";
import { BaseGame } from "../types/game.types";

export const GAMES: BaseGame[] = [
  {
    id: GameId.Quiz,
    title: "Quick Quiz",
    description: "Answer 10 questions before time runs out!",
    maxScore: 1000,
  },
  {
    id: GameId.FindDifference,
    title: "Find the Difference",
    description: "Spot all differences between two images.",
    maxScore: 500,
  },
  {
    id: GameId.RockPaperScissors,
    title: "Rock Paper Scissors",
    description: "Beat the CPU in 5 rounds.",
    maxScore: 500,
  },
  {
    id: GameId.PriceCompare,
    title: "Which is More Expensive?",
    description: "Guess which product costs more!",
    maxScore: 1000,
  },
];

export const QUIZ_QUESTION_TIMEOUT_MS = 15000;
export const FIND_DIFFERENCE_TIME_LIMIT_MS = 60000;
export const RPS_TOTAL_ROUNDS = 5;
export const PRICE_COMPARE_TOTAL_ROUNDS = 10;
export const RPS_ROOM_CODE_LENGTH = 6;
export const RPS_CHOICE_TIMEOUT_MS = 30000;
export const BACKEND_PORT = 3001;
export const FRONTEND_PORT = 5173;
