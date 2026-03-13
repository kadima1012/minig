import { Server, Socket } from "socket.io";
import {
  TcEvents,
  TcMatchStatus,
  TC_QUESTION_TIMEOUT_MS,
  TC_TIEBREAKER_TIMEOUT_MS,
  TC_MIN_PLAYERS_DEV,
  TC_START_COUNTDOWN_S,
} from "@minigames/shared";
import { ITcMatchRepository } from "../../domain/interfaces/ITcMatchRepository";
import { ITcQuestionRepository } from "../../domain/interfaces/ITcQuestionRepository";
import { CreateMatchUseCase } from "../../application/use-cases/trivia-conquest/CreateMatch.usecase";
import { JoinMatchUseCase } from "../../application/use-cases/trivia-conquest/JoinMatch.usecase";
import { AutoMatchmakeUseCase } from "../../application/use-cases/trivia-conquest/AutoMatchmake.usecase";
import { AttackTerritoryUseCase } from "../../application/use-cases/trivia-conquest/AttackTerritory.usecase";
import { SubmitDuelAnswerUseCase } from "../../application/use-cases/trivia-conquest/SubmitDuelAnswer.usecase";
import { SubmitTiebreakerUseCase } from "../../application/use-cases/trivia-conquest/SubmitTiebreaker.usecase";
import { GetMatchStateUseCase } from "../../application/use-cases/trivia-conquest/GetMatchState.usecase";
import { TcDuel } from "../../domain/entities/TcDuel";

const MIN_PLAYERS = TC_MIN_PLAYERS_DEV;

// Track match timers so we can clean them up
const matchTimers = new Map<string, NodeJS.Timeout>();
const startCountdowns = new Map<string, NodeJS.Timeout>();

export class TcSocketHandler {
  private createMatch: CreateMatchUseCase;
  private joinMatch: JoinMatchUseCase;
  private autoMatchmake: AutoMatchmakeUseCase;
  private attackTerritory: AttackTerritoryUseCase;
  private submitDuelAnswer: SubmitDuelAnswerUseCase;
  private submitTiebreaker: SubmitTiebreakerUseCase;
  private getMatchState: GetMatchStateUseCase;

  constructor(
    private io: Server,
    private socket: Socket,
    private matchRepo: ITcMatchRepository,
    questionRepo: ITcQuestionRepository
  ) {
    this.createMatch = new CreateMatchUseCase(matchRepo);
    this.joinMatch = new JoinMatchUseCase(matchRepo);
    this.autoMatchmake = new AutoMatchmakeUseCase(matchRepo, this.createMatch);
    this.attackTerritory = new AttackTerritoryUseCase(matchRepo, questionRepo);
    this.submitDuelAnswer = new SubmitDuelAnswerUseCase();
    this.submitTiebreaker = new SubmitTiebreakerUseCase();
    this.getMatchState = new GetMatchStateUseCase(matchRepo);
  }

  private get userId(): string {
    return this.socket.data.userId;
  }

  private get username(): string {
    return this.socket.data.username;
  }

  register(): void {
    this.socket.on(TcEvents.CREATE_MATCH, () => this.handleCreateMatch());
    this.socket.on(TcEvents.JOIN_MATCH, (data: { matchCode: string }) => this.handleJoinMatch(data.matchCode));
    this.socket.on(TcEvents.JOIN_MATCHMAKING, () => this.handleJoinMatchmaking());
    this.socket.on(TcEvents.LEAVE_MATCH, () => this.handleLeaveMatch());
    this.socket.on(TcEvents.ATTACK, (data: { hexId: string }) => this.handleAttack(data.hexId));
    this.socket.on(TcEvents.SUBMIT_ANSWER, (data: { duelId: string; questionIndex: number; selectedIndex: number }) =>
      this.handleSubmitAnswer(data.duelId, data.questionIndex, data.selectedIndex)
    );
    this.socket.on(TcEvents.SUBMIT_TIEBREAKER, (data: { duelId: string; numericAnswer: number }) =>
      this.handleSubmitTiebreaker(data.duelId, data.numericAnswer)
    );
    this.socket.on(TcEvents.ACCEPT_REVENGE, () => this.handleAcceptRevenge());
    this.socket.on(TcEvents.DECLINE_REVENGE, () => this.handleDeclineRevenge());
    this.socket.on("disconnect", () => this.handleDisconnect());
  }

  // ── Lobby ────────────────────────────────────────────────────────

  private handleCreateMatch(): void {
    try {
      const match = this.createMatch.execute(this.userId, this.username);
      const roomName = `tc:${match.id}`;
      this.socket.join(roomName);
      this.socket.data.tcMatchId = match.id;
      console.log(`[TC] Match created: ${match.code} by ${this.username}`);
      this.socket.emit(TcEvents.MATCH_CREATED, { matchId: match.id, matchCode: match.code });
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleJoinMatch(matchCode: string): void {
    try {
      const { match, player } = this.joinMatch.execute(this.userId, this.username, matchCode);
      const roomName = `tc:${match.id}`;
      this.socket.join(roomName);
      this.socket.data.tcMatchId = match.id;
      console.log(`[TC] ${this.username} joined match ${match.code}`);

      this.io.to(roomName).emit(TcEvents.PLAYER_JOINED, {
        userId: player.userId,
        username: player.username,
        color: player.color,
        playerCount: match.players.size,
        maxPlayers: match.maxPlayers,
      });

      this.checkAutoStart(match.id);
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleJoinMatchmaking(): void {
    try {
      const { match, player, isNew } = this.autoMatchmake.execute(this.userId, this.username);
      const roomName = `tc:${match.id}`;
      this.socket.join(roomName);
      this.socket.data.tcMatchId = match.id;

      if (isNew) {
        console.log(`[TC] Matchmaking: new match ${match.code} by ${this.username}`);
        this.socket.emit(TcEvents.MATCH_CREATED, { matchId: match.id, matchCode: match.code });
      } else {
        console.log(`[TC] Matchmaking: ${this.username} joined ${match.code}`);
        this.socket.emit(TcEvents.MATCHMAKING_FOUND, { matchCode: match.code });
        this.io.to(roomName).emit(TcEvents.PLAYER_JOINED, {
          userId: player.userId,
          username: player.username,
          color: player.color,
          playerCount: match.players.size,
          maxPlayers: match.maxPlayers,
        });

        this.checkAutoStart(match.id);
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private checkAutoStart(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Lobby) return;
    if (!match.canStart(MIN_PLAYERS)) return;

    // Cancel any existing countdown
    if (startCountdowns.has(matchId)) return;

    const roomName = `tc:${matchId}`;
    match.status = TcMatchStatus.Starting;
    this.io.to(roomName).emit(TcEvents.MATCH_STARTING, { countdown: TC_START_COUNTDOWN_S });

    const timer = setTimeout(() => {
      startCountdowns.delete(matchId);
      const m = this.matchRepo.findById(matchId);
      if (!m || m.status !== TcMatchStatus.Starting) return;

      m.start();
      console.log(`[TC] Match ${m.code} started with ${m.players.size} players`);

      const state = this.getMatchState.execute(matchId);
      this.io.to(roomName).emit(TcEvents.MATCH_STARTED, state);

      // Set match timer
      const matchEndTimer = setTimeout(() => {
        this.handleMatchTimeout(matchId);
      }, m.matchDurationMs);
      matchTimers.set(matchId, matchEndTimer);
    }, TC_START_COUNTDOWN_S * 1000);

    startCountdowns.set(matchId, timer);
  }

  private handleMatchTimeout(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status === TcMatchStatus.Finished) return;

    match.finish();
    const leaderboard = match.getLeaderboard();
    const roomName = `tc:${matchId}`;

    this.io.to(roomName).emit(TcEvents.MATCH_OVER, {
      winnerId: leaderboard.length > 0 ? leaderboard[0].userId : null,
      reason: "timeout",
      leaderboard,
    });

    match.winnerId = leaderboard.length > 0 ? leaderboard[0].userId : null;
    this.matchRepo.persistToDb(match);
    matchTimers.delete(matchId);
  }

  // ── Attack & Duel ────────────────────────────────────────────────

  private handleAttack(hexId: string): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const duel = this.attackTerritory.execute(matchId, this.userId, hexId);
      const match = this.matchRepo.findById(matchId)!;
      const targetHex = match.hexagons.get(hexId)!;

      const roomName = `tc:${matchId}`;

      // Notify attacker
      this.socket.emit(TcEvents.DUEL_STARTED, {
        duelId: duel.id,
        hexId,
        category: duel.category,
        opponentUsername: duel.defenderId
          ? match.getPlayer(duel.defenderId)?.username ?? null
          : null,
        isNeutral: duel.isNeutral,
      });

      // Notify defender if PvP
      if (duel.defenderId) {
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
        if (defenderSocket) {
          defenderSocket.emit(TcEvents.DUEL_STARTED, {
            duelId: duel.id,
            hexId,
            category: duel.category,
            opponentUsername: this.username,
            isNeutral: false,
          });
        }
      }

      // Send first question
      this.sendDuelQuestion(duel);
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleSubmitAnswer(duelId: string, questionIndex: number, selectedIndex: number): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const duel = match.activeDuels.get(duelId);
      if (!duel) throw new Error("Duel not found");

      const { answer } = this.submitDuelAnswer.execute(duel, this.userId, questionIndex, selectedIndex);

      // Notify opponent that we answered
      if (duel.defenderId && this.userId === duel.attackerId) {
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
        if (defenderSocket) {
          defenderSocket.emit(TcEvents.OPPONENT_ANSWERED, { duelId, questionIndex });
        }
      } else if (duel.defenderId && this.userId === duel.defenderId) {
        const attackerSocket = this.findPlayerSocket(duel.attackerId, matchId);
        if (attackerSocket) {
          attackerSocket.emit(TcEvents.OPPONENT_ANSWERED, { duelId, questionIndex });
        }
      }

      // Check if both answered
      if (duel.bothAnsweredCurrentQuestion()) {
        this.handleBothAnswered(duel, match);
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleBothAnswered(duel: TcDuel, match: ReturnType<ITcMatchRepository["findById"]> & object): void {
    const matchId = match.id;
    const currentQ = duel.questions[duel.currentQuestionIndex];
    const attackerAnswer = duel.attackerAnswers.find((a) => a.questionIndex === duel.currentQuestionIndex);
    const defenderAnswer = duel.defenderAnswers.find((a) => a.questionIndex === duel.currentQuestionIndex);

    // Send question result to both players
    const attackerSocket = this.findPlayerSocket(duel.attackerId, matchId);
    const defenderSocket = duel.defenderId ? this.findPlayerSocket(duel.defenderId, matchId) : null;

    if (attackerSocket) {
      attackerSocket.emit(TcEvents.DUEL_QUESTION_RESULT, {
        duelId: duel.id,
        questionIndex: duel.currentQuestionIndex,
        yourCorrect: attackerAnswer?.correct ?? false,
        opponentCorrect: defenderAnswer?.correct ?? false,
        correctIndex: currentQ.correctIndex,
        scores: { you: duel.attackerScore, opponent: duel.defenderScore },
      });
    }

    if (defenderSocket) {
      defenderSocket.emit(TcEvents.DUEL_QUESTION_RESULT, {
        duelId: duel.id,
        questionIndex: duel.currentQuestionIndex,
        yourCorrect: defenderAnswer?.correct ?? false,
        opponentCorrect: attackerAnswer?.correct ?? false,
        correctIndex: currentQ.correctIndex,
        scores: { you: duel.defenderScore, opponent: duel.attackerScore },
      });
    }

    // Advance question
    const next = duel.advanceQuestion();

    setTimeout(() => {
      if (next === "next") {
        this.sendDuelQuestion(duel);
      } else if (next === "tiebreaker") {
        this.sendTiebreaker(duel, matchId);
      } else {
        this.resolveDuel(duel, matchId);
      }
    }, 2000); // 2s delay between questions
  }

  private sendDuelQuestion(duel: TcDuel): void {
    const question = duel.getCurrentQuestion();
    if (!question) return;

    duel.questionStartedAt = new Date();
    const matchId = duel.matchId;

    const payload = {
      duelId: duel.id,
      questionIndex: duel.currentQuestionIndex,
      totalQuestions: duel.totalQuestions,
      text: question.text,
      options: question.options,
      timeoutMs: question.timeoutMs,
      category: duel.category,
    };

    const attackerSocket = this.findPlayerSocket(duel.attackerId, matchId);
    if (attackerSocket) attackerSocket.emit(TcEvents.DUEL_QUESTION, payload);

    if (duel.defenderId) {
      const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
      if (defenderSocket) defenderSocket.emit(TcEvents.DUEL_QUESTION, payload);
    }

    // Auto-timeout after question timeout
    const questionIdx = duel.currentQuestionIndex;
    setTimeout(() => {
      if (duel.currentQuestionIndex !== questionIdx) return; // already advanced
      if (duel.bothAnsweredCurrentQuestion()) return;

      // Auto-timeout unanswered players
      if (!duel.attackerAnswers.some((a) => a.questionIndex === questionIdx)) {
        duel.autoTimeoutPlayer(duel.attackerId);
      }
      if (!duel.isNeutral && duel.defenderId && !duel.defenderAnswers.some((a) => a.questionIndex === questionIdx)) {
        duel.autoTimeoutPlayer(duel.defenderId);
      }
      if (duel.isNeutral) {
        duel.autoAnswerDefender();
      }

      const match = this.matchRepo.findById(matchId);
      if (match && duel.bothAnsweredCurrentQuestion()) {
        this.handleBothAnswered(duel, match);
      }
    }, TC_QUESTION_TIMEOUT_MS + 1000); // +1s grace
  }

  private sendTiebreaker(duel: TcDuel, matchId: string): void {
    if (!duel.tiebreakerQuestion) return;

    const payload = {
      duelId: duel.id,
      text: duel.tiebreakerQuestion.text,
      timeoutMs: duel.tiebreakerQuestion.timeoutMs,
    };

    const attackerSocket = this.findPlayerSocket(duel.attackerId, matchId);
    if (attackerSocket) attackerSocket.emit(TcEvents.DUEL_TIEBREAKER, payload);

    if (duel.defenderId) {
      const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
      if (defenderSocket) defenderSocket.emit(TcEvents.DUEL_TIEBREAKER, payload);
    }

    // Auto-timeout for tiebreaker
    setTimeout(() => {
      if (duel.bothAnsweredTiebreaker()) return;

      if (duel.attackerTiebreakerAnswer === null) {
        duel.submitTiebreakerAnswer(duel.attackerId, -999999);
      }
      if (duel.defenderId && duel.defenderTiebreakerAnswer === null) {
        duel.submitTiebreakerAnswer(duel.defenderId, -999999);
      }

      if (duel.bothAnsweredTiebreaker()) {
        duel.resolveTiebreaker();
        this.resolveDuel(duel, matchId);
      }
    }, TC_TIEBREAKER_TIMEOUT_MS + 1000);
  }

  private handleSubmitTiebreaker(duelId: string, numericAnswer: number): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const duel = match.activeDuels.get(duelId);
      if (!duel) throw new Error("Duel not found");

      this.submitTiebreaker.execute(duel, this.userId, numericAnswer);

      if (duel.bothAnsweredTiebreaker()) {
        duel.resolveTiebreaker();
        this.resolveDuel(duel, matchId);
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private resolveDuel(duel: TcDuel, matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match) return;

    const result = match.resolveDuel(duel);
    const roomName = `tc:${matchId}`;

    // Notify all players about territory change
    const resolvedPayload = {
      duelId: duel.id,
      winnerId: duel.winnerId,
      hexId: duel.hexId,
      newOwnerId: result.hexChanged ? duel.winnerId : match.hexagons.get(duel.hexId)?.ownerId ?? null,
      attackerScore: duel.attackerScore,
      defenderScore: duel.defenderScore,
      pointsAwarded: duel.winnerId === duel.attackerId
        ? 10
        : duel.winnerId === duel.defenderId
          ? 8
          : 0,
    };

    this.io.to(roomName).emit(TcEvents.DUEL_RESOLVED, resolvedPayload);

    // If territory changed, send map update to all
    if (result.hexChanged) {
      const hex = match.hexagons.get(duel.hexId);
      if (hex) {
        this.io.to(roomName).emit(TcEvents.MAP_UPDATE, [{
          hexId: hex.id,
          ownerId: hex.ownerId,
          ownerUsername: hex.ownerUsername,
          ownerColor: hex.ownerColor,
        }]);
      }
    }

    // Handle elimination / revenge
    if (result.defenderEliminated && duel.defenderId) {
      const defender = match.getPlayer(duel.defenderId);
      if (defender) {
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
        if (defenderSocket) {
          defenderSocket.emit(TcEvents.PLAYER_ELIMINATED, {
            userId: duel.defenderId,
            revengeHexId: defender.revengeTargetHexId,
            revengeOpponentId: defender.revengeOpponentId,
          });
        }
      }
    }

    // Send leaderboard update
    this.io.to(roomName).emit(TcEvents.LEADERBOARD_UPDATE, match.getLeaderboard());

    // Check win condition
    const winner = match.checkWinCondition();
    if (winner) {
      const timer = matchTimers.get(matchId);
      if (timer) {
        clearTimeout(timer);
        matchTimers.delete(matchId);
      }

      match.finish();
      this.io.to(roomName).emit(TcEvents.MATCH_OVER, {
        winnerId: winner,
        reason: "domination",
        leaderboard: match.getLeaderboard(),
      });

      this.matchRepo.persistToDb(match);
    }
  }

  // ── Revenge ──────────────────────────────────────────────────────

  private handleAcceptRevenge(): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const player = match.getPlayer(this.userId);
      if (!player) throw new Error("Not in this match");
      if (!player.hasRevenge()) throw new Error("No revenge available");

      // Attack the revenge target hex
      this.handleAttack(player.revengeTargetHexId!);
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleDeclineRevenge(): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const player = match.getPlayer(this.userId);
      if (!player) throw new Error("Not in this match");

      player.setCooldown(360000); // 6 min cooldown
      this.socket.emit(TcEvents.REVENGE_COOLDOWN, {
        cooldownEndsAt: player.revengeCooldownUntil?.toISOString() ?? "",
      });
    } catch (error) {
      this.emitError(error);
    }
  }

  // ── Leave / Disconnect ───────────────────────────────────────────

  private handleLeaveMatch(): void {
    const matchId = this.socket.data.tcMatchId;
    if (!matchId) return;

    const match = this.matchRepo.findById(matchId);
    if (match) {
      const roomName = `tc:${matchId}`;

      if (match.status === TcMatchStatus.Lobby || match.status === TcMatchStatus.Starting) {
        match.removePlayer(this.userId);
        this.io.to(roomName).emit(TcEvents.PLAYER_LEFT, {
          userId: this.userId,
          playerCount: match.players.size,
        });

        // Cancel start if below min
        if (match.status === TcMatchStatus.Starting && match.players.size < MIN_PLAYERS) {
          match.status = TcMatchStatus.Lobby;
          const countdown = startCountdowns.get(matchId);
          if (countdown) {
            clearTimeout(countdown);
            startCountdowns.delete(matchId);
          }
        }

        if (match.players.size === 0) {
          this.matchRepo.remove(matchId);
        }
      } else {
        // During play, mark as disconnected but don't remove
        const player = match.getPlayer(this.userId);
        if (player) player.connected = false;
        this.io.to(roomName).emit(TcEvents.PLAYER_LEFT, {
          userId: this.userId,
          playerCount: match.players.size,
        });
      }
    }

    this.socket.leave(`tc:${matchId}`);
    this.socket.data.tcMatchId = undefined;
  }

  private handleDisconnect(): void {
    const matchId = this.socket.data.tcMatchId;
    if (!matchId) return;

    const match = this.matchRepo.findById(matchId);
    if (!match) return;

    const player = match.getPlayer(this.userId);
    if (player) player.connected = false;

    const roomName = `tc:${matchId}`;
    this.io.to(roomName).emit(TcEvents.PLAYER_LEFT, {
      userId: this.userId,
      playerCount: match.players.size,
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private findPlayerSocket(userId: string, matchId: string): Socket | null {
    const roomName = `tc:${matchId}`;
    const sockets = this.io.sockets.adapter.rooms.get(roomName);
    if (!sockets) return null;

    for (const socketId of sockets) {
      const s = this.io.sockets.sockets.get(socketId);
      if (s && s.data.userId === userId) return s;
    }
    return null;
  }

  private emitError(error: unknown): void {
    const message = error instanceof Error ? error.message : "An error occurred";
    this.socket.emit(TcEvents.ERROR, { message });
  }
}
