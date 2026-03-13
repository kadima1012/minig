"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_PORT = exports.BACKEND_PORT = exports.RPS_CHOICE_TIMEOUT_MS = exports.RPS_ROOM_CODE_LENGTH = exports.PRICE_COMPARE_TOTAL_ROUNDS = exports.RPS_TOTAL_ROUNDS = exports.FIND_DIFFERENCE_TIME_LIMIT_MS = exports.QUIZ_QUESTION_TIMEOUT_MS = exports.GAMES = void 0;
const game_enums_1 = require("../enums/game.enums");
exports.GAMES = [
    {
        id: game_enums_1.GameId.Quiz,
        title: "Quick Quiz",
        description: "Answer 10 questions before time runs out!",
        maxScore: 1000,
    },
    {
        id: game_enums_1.GameId.FindDifference,
        title: "Find the Difference",
        description: "Spot all differences between two images.",
        maxScore: 500,
    },
    {
        id: game_enums_1.GameId.RockPaperScissors,
        title: "Rock Paper Scissors",
        description: "Beat the CPU in 5 rounds.",
        maxScore: 500,
    },
    {
        id: game_enums_1.GameId.PriceCompare,
        title: "Which is More Expensive?",
        description: "Guess which product costs more!",
        maxScore: 1000,
    },
    {
        id: game_enums_1.GameId.TriviaConquest,
        title: "Trivia Conquest",
        description: "Conquer territories by winning trivia duels!",
        maxScore: 0,
    },
];
exports.QUIZ_QUESTION_TIMEOUT_MS = 15000;
exports.FIND_DIFFERENCE_TIME_LIMIT_MS = 60000;
exports.RPS_TOTAL_ROUNDS = 5;
exports.PRICE_COMPARE_TOTAL_ROUNDS = 10;
exports.RPS_ROOM_CODE_LENGTH = 6;
exports.RPS_CHOICE_TIMEOUT_MS = 30000;
exports.BACKEND_PORT = 3001;
exports.FRONTEND_PORT = 5173;
//# sourceMappingURL=game.constants.js.map