export enum GameId {
  Quiz = "quiz",
  FindDifference = "find-difference",
  RockPaperScissors = "rock-paper-scissors",
  PriceCompare = "price-compare",
  TriviaConquest = "trivia-conquest",
}

export enum GameStatus {
  Idle = "idle",
  Playing = "playing",
  Paused = "paused",
  Finished = "finished",
}

export enum RoundOutcome {
  Win = "win",
  Lose = "lose",
  Draw = "draw",
}
