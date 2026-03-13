"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcDuelStatus = exports.TcMatchStatus = exports.TcCategory = void 0;
var TcCategory;
(function (TcCategory) {
    TcCategory["Science"] = "science";
    TcCategory["Movies"] = "movies";
    TcCategory["History"] = "history";
    TcCategory["Tech"] = "tech";
    TcCategory["Gaming"] = "gaming";
})(TcCategory || (exports.TcCategory = TcCategory = {}));
var TcMatchStatus;
(function (TcMatchStatus) {
    TcMatchStatus["Lobby"] = "lobby";
    TcMatchStatus["Starting"] = "starting";
    TcMatchStatus["Playing"] = "playing";
    TcMatchStatus["Finished"] = "finished";
})(TcMatchStatus || (exports.TcMatchStatus = TcMatchStatus = {}));
var TcDuelStatus;
(function (TcDuelStatus) {
    TcDuelStatus["InProgress"] = "in_progress";
    TcDuelStatus["Tiebreaker"] = "tiebreaker";
    TcDuelStatus["Resolved"] = "resolved";
})(TcDuelStatus || (exports.TcDuelStatus = TcDuelStatus = {}));
//# sourceMappingURL=trivia-conquest.enums.js.map