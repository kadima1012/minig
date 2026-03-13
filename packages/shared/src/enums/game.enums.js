"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundOutcome = exports.GameStatus = exports.GameId = void 0;
var GameId;
(function (GameId) {
    GameId["Quiz"] = "quiz";
    GameId["FindDifference"] = "find-difference";
    GameId["RockPaperScissors"] = "rock-paper-scissors";
    GameId["PriceCompare"] = "price-compare";
    GameId["TriviaConquest"] = "trivia-conquest";
})(GameId || (exports.GameId = GameId = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["Idle"] = "idle";
    GameStatus["Playing"] = "playing";
    GameStatus["Paused"] = "paused";
    GameStatus["Finished"] = "finished";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var RoundOutcome;
(function (RoundOutcome) {
    RoundOutcome["Win"] = "win";
    RoundOutcome["Lose"] = "lose";
    RoundOutcome["Draw"] = "draw";
})(RoundOutcome || (exports.RoundOutcome = RoundOutcome = {}));
//# sourceMappingURL=game.enums.js.map