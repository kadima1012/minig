"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpsMultiplayerEvents = exports.RpsRoomStatus = void 0;
var RpsRoomStatus;
(function (RpsRoomStatus) {
    RpsRoomStatus["Waiting"] = "waiting";
    RpsRoomStatus["Playing"] = "playing";
    RpsRoomStatus["Finished"] = "finished";
})(RpsRoomStatus || (exports.RpsRoomStatus = RpsRoomStatus = {}));
exports.RpsMultiplayerEvents = {
    CREATE_ROOM: "rps:create-room",
    JOIN_ROOM: "rps:join-room",
    SUBMIT_CHOICE: "rps:submit-choice",
    LEAVE_ROOM: "rps:leave-room",
    ROOM_CREATED: "rps:room-created",
    OPPONENT_JOINED: "rps:opponent-joined",
    ROUND_START: "rps:round-start",
    OPPONENT_CHOSE: "rps:opponent-chose",
    ROUND_RESULT: "rps:round-result",
    GAME_OVER: "rps:game-over",
    OPPONENT_LEFT: "rps:opponent-left",
    ERROR: "rps:error",
};
//# sourceMappingURL=rps-multiplayer.types.js.map