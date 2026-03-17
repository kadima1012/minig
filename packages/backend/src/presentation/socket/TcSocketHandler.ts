import { Server, Socket } from "socket.io";
import {
  TcEvents,
  TcMatchStatus,
  TcCategory,
  TC_QUESTION_TIMEOUT_MS,
  TC_TIEBREAKER_TIMEOUT_MS,
  TC_MIN_PLAYERS_DEV,
  TC_START_COUNTDOWN_S,
  TC_PLANNING_PHASE_MS,
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
const planningTimers = new Map<string, NodeJS.Timeout>();
// Track simultaneous duel completion callbacks: matchId → (duelId → callback)
const simultaneousCallbacks = new Map<string, Map<string, () => void>>();

// Cooldown after a match the player abandoned finishes (userId -> cooldownEndsAt)
const abandonCooldowns = new Map<string, Date>();
const ABANDON_COOLDOWN_MS = 30_000; // 30 seconds

export class TcSocketHandler {
  private createMatch: CreateMatchUseCase;
  private joinMatch: JoinMatchUseCase;
  private autoMatchmake: AutoMatchmakeUseCase;
  private attackTerritory: AttackTerritoryUseCase;
  private submitDuelAnswer: SubmitDuelAnswerUseCase;
  private submitTiebreaker: SubmitTiebreakerUseCase;
  private getMatchState: GetMatchStateUseCase;

  private questionRepo: ITcQuestionRepository;

  constructor(
    private io: Server,
    private socket: Socket,
    private matchRepo: ITcMatchRepository,
    questionRepo: ITcQuestionRepository
  ) {
    this.questionRepo = questionRepo;
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
    this.socket.on(TcEvents.SELECT_HEX, (data: { hexId: string }) => this.handleSelectHex(data.hexId));
    this.socket.on(TcEvents.DESELECT_HEX, () => this.handleDeselectHex());
    this.socket.on(TcEvents.SUBMIT_ELIMINATION_ANSWER, (data: { numericAnswer: number }) => {
      const matchId = this.socket.data.tcMatchId;
      if (matchId) this.handleSubmitEliminationAnswer(matchId, this.userId, data.numericAnswer);
    });
    this.socket.on(TcEvents.SUBMIT_ANSWER, (data: { duelId: string; questionIndex: number; selectedIndex: number }) =>
      this.handleSubmitAnswer(data.duelId, data.questionIndex, data.selectedIndex)
    );
    this.socket.on(TcEvents.SUBMIT_TIEBREAKER, (data: { duelId: string; numericAnswer: number }) =>
      this.handleSubmitTiebreaker(data.duelId, data.numericAnswer)
    );
    this.socket.on(TcEvents.SURRENDER, () => this.handleSurrender());
    this.socket.on(TcEvents.ACCEPT_REVENGE, () => this.handleAcceptRevenge());
    this.socket.on(TcEvents.DECLINE_REVENGE, () => this.handleDeclineRevenge());
    this.socket.on(TcEvents.RECONNECT, () => this.handleReconnect());
    this.socket.on(TcEvents.CHECK_ACTIVE, () => this.handleCheckActive());
    this.socket.on("disconnect", () => this.handleDisconnect());
  }

  // ── Lobby ────────────────────────────────────────────────────────

  private getJoinBlockReason(): string | null {
    const activeMatch = this.matchRepo.findActiveByPlayerId(this.userId);
    if (activeMatch && activeMatch.status === TcMatchStatus.Playing) {
      const player = activeMatch.getPlayer(this.userId);
      if (player && !player.connected) {
        return `You have an active match (${activeMatch.code}). Use Rejoin to return.`;
      }
    }

    const cooldownEnd = abandonCooldowns.get(this.userId);
    if (cooldownEnd && new Date() < cooldownEnd) {
      const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
      return `Cooldown active: ${remaining}s remaining after leaving a match.`;
    }

    if (cooldownEnd) {
      abandonCooldowns.delete(this.userId);
    }

    return null;
  }

  private handleCreateMatch(): void {
    try {
      const blockReason = this.getJoinBlockReason();
      if (blockReason) throw new Error(blockReason);
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
      const blockReason = this.getJoinBlockReason();
      if (blockReason) throw new Error(blockReason);
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
      const blockReason = this.getJoinBlockReason();
      if (blockReason) throw new Error(blockReason);
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

      // Start first planning phase after a short delay
      setTimeout(() => {
        this.startPlanningPhase(matchId);
      }, 1500);
    }, TC_START_COUNTDOWN_S * 1000);

    startCountdowns.set(matchId, timer);
  }

  private handleMatchTimeout(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status === TcMatchStatus.Finished) return;

    // Clean up planning timer
    const planTimer = planningTimers.get(matchId);
    if (planTimer) {
      clearTimeout(planTimer);
      planningTimers.delete(matchId);
    }

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

    this.setAbandonCooldowns(match);
  }

  private setAbandonCooldowns(match: { players: Map<string, { userId: string; connected: boolean }> }): void {
    for (const player of match.players.values()) {
      if (!player.connected) {
        abandonCooldowns.set(player.userId, new Date(Date.now() + ABANDON_COOLDOWN_MS));
      }
    }
  }

  // ── Elimination Round (too few hexes) ─────────────────────────────

  /** Track elimination answers: matchId -> Map<userId, numericAnswer> */
  private eliminationAnswers = new Map<string, Map<string, number>>();

  private startEliminationRound(matchId: string, activePlayers: string[], availableSlots: number): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;

    const roomName = `tc:${matchId}`;
    const categories = Object.values(TcCategory);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const tiebreakerQ = this.questionRepo.findRandomTiebreaker(randomCategory);

    // Store answers tracker
    this.eliminationAnswers.set(matchId, new Map());

    // Send elimination round to all active players
    for (const userId of activePlayers) {
      const playerSocket = this.findPlayerSocket(userId, matchId);
      if (playerSocket) {
        playerSocket.emit(TcEvents.ELIMINATION_ROUND, {
          roundNumber: match.currentRound + 1,
          text: tiebreakerQ.text,
          timeoutMs: TC_TIEBREAKER_TIMEOUT_MS,
          availableSlots,
          totalPlayers: activePlayers.length,
        });
      }
    }

    // Store elimination data on match entity
    match.eliminationData = { tiebreakerQ, activePlayers, availableSlots };

    // Timeout handler
    setTimeout(() => {
      this.resolveEliminationRound(matchId);
    }, TC_TIEBREAKER_TIMEOUT_MS + 1000);
  }

  private handleSubmitEliminationAnswer(matchId: string, userId: string, answer: number): void {
    const answers = this.eliminationAnswers.get(matchId);
    if (!answers) return;
    answers.set(userId, answer);

    const match = this.matchRepo.findById(matchId);
    if (!match?.eliminationData) return;

    // Check if all answered
    if (answers.size >= match.eliminationData.activePlayers.length) {
      this.resolveEliminationRound(matchId);
    }
  }

  private resolveEliminationRound(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing || !match.eliminationData) return;

    const answers = this.eliminationAnswers.get(matchId);
    if (!answers) return;

    const { tiebreakerQ, activePlayers, availableSlots } = match.eliminationData;

    // Fill missing answers with worst possible
    for (const userId of activePlayers) {
      if (!answers.has(userId)) {
        answers.set(userId, -999999);
      }
    }

    // Rank by distance to correct answer (closest = best)
    const ranked = activePlayers
      .map(userId => ({
        userId,
        distance: tiebreakerQ.getDistance(answers.get(userId) ?? -999999),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Take the top N (availableSlots)
    const qualified = ranked.slice(0, availableSlots).map(r => r.userId);
    const eliminated = ranked.slice(availableSlots).map(r => r.userId);

    const roomName = `tc:${matchId}`;
    this.io.to(roomName).emit(TcEvents.ELIMINATION_RESULT, {
      qualifiedUserIds: qualified,
      eliminatedUserIds: eliminated,
    });

    // Clean up
    this.eliminationAnswers.delete(matchId);
    match.eliminationData = null;

    // Start planning with only qualified players
    setTimeout(() => {
      this.startPlanningPhaseForPlayers(matchId, new Set(qualified));
    }, 2000);
  }

  // ── Planning Phase ────────────────────────────────────────────────

  private startPlanningPhase(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;

    // Check if there are neutral hexes remaining
    if (!match.hasNeutralHexes()) {
      // No neutral hexes → match ends
      match.finish();
      const leaderboard = match.getLeaderboard();
      const roomName = `tc:${matchId}`;

      const timer = matchTimers.get(matchId);
      if (timer) {
        clearTimeout(timer);
        matchTimers.delete(matchId);
      }

      match.winnerId = leaderboard.length > 0 ? leaderboard[0].userId : null;
      this.io.to(roomName).emit(TcEvents.MATCH_OVER, {
        winnerId: match.winnerId,
        reason: "domination",
        leaderboard,
      });

      this.matchRepo.persistToDb(match);
      this.setAbandonCooldowns(match);
      return;
    }

    // Check if elimination round is needed
    const elimCheck = match.needsEliminationRound();
    if (elimCheck.needed) {
      console.log(`[TC] Match ${match.code} - Elimination round: ${elimCheck.activePlayers.length} players, ${elimCheck.availableHexCount} hexes`);
      this.startEliminationRound(
        matchId,
        elimCheck.activePlayers.map(p => p.userId),
        elimCheck.availableHexCount
      );
      return;
    }

    this.startPlanningPhaseForPlayers(matchId, null);
  }

  private startPlanningPhaseForPlayers(matchId: string, qualifiedPlayers: Set<string> | null): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;

    match.startPlanningPhase(TC_PLANNING_PHASE_MS);
    const roomName = `tc:${matchId}`;

    // Send planning start with each player's attackable hexes
    const activePlayers = match.getActivePlayers();
    for (const player of activePlayers) {
      const isQualified = qualifiedPlayers === null || qualifiedPlayers.has(player.userId);
      const attackable = isQualified ? match.getAttackableHexIds(player.userId) : [];
      const playerSocket = this.findPlayerSocket(player.userId, matchId);
      if (playerSocket) {
        playerSocket.emit(TcEvents.PLANNING_START, {
          roundNumber: match.currentRound,
          durationMs: TC_PLANNING_PHASE_MS,
          attackableHexIds: attackable,
        });
      }
    }

    // Also notify spectating players (no territory, no revenge)
    for (const player of match.players.values()) {
      if (!activePlayers.some(ap => ap.userId === player.userId)) {
        const playerSocket = this.findPlayerSocket(player.userId, matchId);
        if (playerSocket) {
          playerSocket.emit(TcEvents.PLANNING_START, {
            roundNumber: match.currentRound,
            durationMs: TC_PLANNING_PHASE_MS,
            attackableHexIds: [],
          });
        }
      }
    }

    console.log(`[TC] Match ${match.code} Round ${match.currentRound} - Planning phase started`);

    // Set planning timer
    const planTimer = setTimeout(() => {
      planningTimers.delete(matchId);
      this.endPlanningPhase(matchId);
    }, TC_PLANNING_PHASE_MS + 500); // small grace

    planningTimers.set(matchId, planTimer);
  }

  private handleSelectHex(hexId: string): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const result = match.selectHex(this.userId, hexId);
      if (!result.ok) throw new Error(result.reason);

      const player = match.getPlayer(this.userId)!;
      const roomName = `tc:${matchId}`;

      // Broadcast selection to all players
      this.io.to(roomName).emit(TcEvents.HEX_SELECTED, {
        hexId,
        userId: this.userId,
        username: player.username,
        color: player.color,
      });

      // Check if all active players have selected → end planning early
      const activePlayers = match.getActivePlayers();
      const allSelected = activePlayers.every(p => match.hexSelections.has(p.userId));
      if (allSelected) {
        // Cancel planning timer and resolve immediately
        const planTimer = planningTimers.get(matchId);
        if (planTimer) {
          clearTimeout(planTimer);
          planningTimers.delete(matchId);
        }
        // Small delay so the last selection is visible
        setTimeout(() => this.endPlanningPhase(matchId), 500);
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private handleDeselectHex(): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const hexId = match.deselectHex(this.userId);
      if (hexId) {
        const roomName = `tc:${matchId}`;
        this.io.to(roomName).emit(TcEvents.HEX_DESELECTED, {
          hexId,
          userId: this.userId,
        });
      }
    } catch (error) {
      this.emitError(error);
    }
  }

  private endPlanningPhase(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;
    if (match.roundPhase !== "planning") return;

    const roomName = `tc:${matchId}`;

    // Auto-assign random hex for players who didn't select
    const autoAssigned = match.autoAssignUnselectedPlayers();
    for (const { userId, hexId } of autoAssigned) {
      const player = match.getPlayer(userId);
      if (player) {
        this.io.to(roomName).emit(TcEvents.HEX_SELECTED, {
          hexId,
          userId,
          username: player.username,
          color: player.color,
        });
      }
    }

    this.io.to(roomName).emit(TcEvents.PLANNING_END, {});

    // Build resolution order
    const order = match.buildResolutionOrder();

    if (order.length === 0) {
      // No one selected → skip resolution, start next planning
      match.endRound();
      setTimeout(() => this.startPlanningPhase(matchId), 2000);
      return;
    }

    console.log(`[TC] Match ${match.code} Round ${match.currentRound} - Resolution phase: ${order.length} attacks (${autoAssigned.length} auto-assigned)`);

    this.io.to(roomName).emit(TcEvents.RESOLUTION_START, {
      roundNumber: match.currentRound,
      order,
    });

    // All duels are against neutral hexes during this phase → resolve simultaneously
    this.resolveAllDuelsSimultaneously(matchId);
  }

  // ── Simultaneous Resolution (all duels at once for neutral hexes) ──

  private resolveAllDuelsSimultaneously(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;

    const order = match.roundOrder;
    if (order.length === 0) return;

    let duelsStarted = 0;
    let duelsResolved = 0;
    const totalDuels = order.length;

    // Track pending duels for this round to know when all are done
    const pendingDuelIds = new Set<string>();

    // Store the original resolveDuel callback so we can hook into it
    const onDuelDone = () => {
      duelsResolved++;
      if (duelsResolved >= totalDuels) {
        // All duels resolved → end round, check win, start next planning
        this.finishSimultaneousRound(matchId);
      }
    };

    // Store callback on match for this round
    if (!simultaneousCallbacks.has(matchId)) {
      simultaneousCallbacks.set(matchId, new Map());
    }

    for (let i = 0; i < order.length; i++) {
      const entry = order[i];
      const targetHex = match.hexagons.get(entry.targetHexId);

      if (!targetHex || targetHex.isOwnedBy(entry.userId)) {
        duelsResolved++;
        continue;
      }

      try {
        const duel = this.attackTerritory.execute(matchId, entry.userId, entry.targetHexId);
        pendingDuelIds.add(duel.id);
        simultaneousCallbacks.get(matchId)!.set(duel.id, onDuelDone);

        // Notify attacker
        const attackerSocket = this.findPlayerSocket(entry.userId, matchId);
        if (attackerSocket) {
          attackerSocket.emit(TcEvents.DUEL_STARTED, {
            duelId: duel.id,
            hexId: entry.targetHexId,
            category: duel.category,
            opponentUsername: null,
            isNeutral: true,
            isAttacker: true,
          });
        }

        // Send first question
        this.sendDuelQuestion(duel);
        duelsStarted++;
      } catch (error) {
        console.error(`[TC] Simultaneous duel failed for ${entry.username}:`, error);
        duelsResolved++;
      }
    }

    // If all duels were skipped/failed, finish immediately
    if (duelsResolved >= totalDuels) {
      this.finishSimultaneousRound(matchId);
    }
  }

  private finishSimultaneousRound(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;

    // Clean up callbacks
    simultaneousCallbacks.delete(matchId);

    match.endRound();
    const roomName = `tc:${matchId}`;

    // Send leaderboard
    this.io.to(roomName).emit(TcEvents.LEADERBOARD_UPDATE, match.getLeaderboard());

    // Check win condition
    const winner = match.checkWinCondition();
    if (winner) {
      const timer = matchTimers.get(matchId);
      if (timer) { clearTimeout(timer); matchTimers.delete(matchId); }
      match.finish();
      this.io.to(roomName).emit(TcEvents.MATCH_OVER, {
        winnerId: winner,
        reason: "domination",
        leaderboard: match.getLeaderboard(),
      });
      this.matchRepo.persistToDb(match);
      this.setAbandonCooldowns(match);
      return;
    }

    // Start next planning phase
    setTimeout(() => this.startPlanningPhase(matchId), 2000);
  }

  // ── Resolution Phase (Sequential Duels) ───────────────────────────

  private processNextDuel(matchId: string): void {
    const match = this.matchRepo.findById(matchId);
    if (!match || match.status !== TcMatchStatus.Playing) return;
    if (match.roundPhase !== "resolution") return;

    const pos = match.currentDuelPosition;
    if (pos >= match.roundOrder.length) {
      // All duels resolved → end round, start next planning
      match.endRound();

      // Send leaderboard
      const roomName = `tc:${matchId}`;
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
        this.setAbandonCooldowns(match);
        return;
      }

      // Start next planning phase
      setTimeout(() => this.startPlanningPhase(matchId), 2000);
      return;
    }

    const entry = match.roundOrder[pos];
    const roomName = `tc:${matchId}`;
    const targetHex = match.hexagons.get(entry.targetHexId);

    if (!targetHex) {
      // Invalid hex, skip
      match.currentDuelPosition++;
      this.processNextDuel(matchId);
      return;
    }

    // Check if the target hex is now owned by the attacker (from a previous duel this round)
    if (targetHex.isOwnedBy(entry.userId)) {
      match.currentDuelPosition++;
      this.processNextDuel(matchId);
      return;
    }

    // Determine if still neutral or has a new owner
    const isNeutral = targetHex.isNeutral();
    const defenderUsername = isNeutral ? null : (targetHex.ownerUsername ?? null);

    // Broadcast which duel is being processed
    this.io.to(roomName).emit(TcEvents.CURRENT_DUEL_INFO, {
      position: pos,
      total: match.roundOrder.length,
      attackerUserId: entry.userId,
      attackerUsername: entry.username,
      attackerColor: entry.color,
      targetHexId: entry.targetHexId,
      defenderUsername,
      isNeutral,
    });

    // Start the duel using existing attack machinery
    try {
      const duel = this.attackTerritory.execute(matchId, entry.userId, entry.targetHexId);

      // Notify attacker
      const attackerSocket = this.findPlayerSocket(entry.userId, matchId);
      if (attackerSocket) {
        attackerSocket.emit(TcEvents.DUEL_STARTED, {
          duelId: duel.id,
          hexId: entry.targetHexId,
          category: duel.category,
          opponentUsername: duel.defenderId
            ? match.getPlayer(duel.defenderId)?.username ?? null
            : null,
          isNeutral: duel.isNeutral,
          isAttacker: true,
        });
      }

      // Notify defender if PvP
      if (duel.defenderId) {
        const defender = match.getPlayer(duel.defenderId);
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);

        if (defender?.connected && defenderSocket) {
          defenderSocket.emit(TcEvents.DUEL_STARTED, {
            duelId: duel.id,
            hexId: entry.targetHexId,
            category: duel.category,
            opponentUsername: entry.username,
            isNeutral: false,
            isAttacker: false,
          });
        }
      }

      // Send first question
      this.sendDuelQuestion(duel);

      // If defender is disconnected, start CPU defense
      if (duel.defenderId) {
        const defender = match.getPlayer(duel.defenderId);
        if (defender && !defender.connected) {
          this.startCpuDefense(duel, matchId);
        }
      }
    } catch (error) {
      // Attack failed (e.g., not enough questions, attacker has no territory left)
      console.error(`[TC] Duel failed for round ${match.currentRound} pos ${pos}:`, error);
      match.currentDuelPosition++;
      setTimeout(() => this.processNextDuel(matchId), 500);
    }
  }

  // ── Duel Flow (unchanged core mechanics) ─────────────────────────

  private handleSubmitAnswer(duelId: string, questionIndex: number, selectedIndex: number): void {
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const duel = match.activeDuels.get(duelId);
      if (!duel) throw new Error("Duel not found");

      this.submitDuelAnswer.execute(duel, this.userId, questionIndex, selectedIndex);

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

    const next = duel.advanceQuestion();

    setTimeout(() => {
      if (next === "next") {
        this.sendDuelQuestion(duel);
      } else if (next === "tiebreaker") {
        this.sendTiebreaker(duel, matchId);
      } else {
        this.resolveDuel(duel, matchId);
      }
    }, 2000);
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
      const defender = this.matchRepo.findById(matchId)?.getPlayer(duel.defenderId);
      if (defender?.connected) {
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
        if (defenderSocket) defenderSocket.emit(TcEvents.DUEL_QUESTION, payload);
      } else {
        this.startCpuDefense(duel, matchId);
      }
    }

    // Auto-timeout
    const questionIdx = duel.currentQuestionIndex;
    setTimeout(() => {
      if (duel.currentQuestionIndex !== questionIdx) return;
      if (duel.bothAnsweredCurrentQuestion()) return;

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
    }, TC_QUESTION_TIMEOUT_MS + 1000);
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
      const defender = this.matchRepo.findById(matchId)?.getPlayer(duel.defenderId);
      if (defender?.connected) {
        const defenderSocket = this.findPlayerSocket(duel.defenderId, matchId);
        if (defenderSocket) defenderSocket.emit(TcEvents.DUEL_TIEBREAKER, payload);
      } else if (duel.tiebreakerQuestion) {
        const cpuDelay = 2000 + Math.floor(Math.random() * 3000);
        setTimeout(() => {
          if (duel.defenderTiebreakerAnswer !== null) return;
          const correct = duel.tiebreakerQuestion!.numericAnswer;
          const error = correct * (0.2 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1);
          duel.submitTiebreakerAnswer(duel.defenderId!, Math.round(correct + error));
          if (duel.bothAnsweredTiebreaker()) {
            duel.resolveTiebreaker();
            this.resolveDuel(duel, matchId);
          }
        }, cpuDelay);
      }
    }

    // Auto-timeout
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

    // Notify all players about duel result
    const resolvedPayload = {
      duelId: duel.id,
      winnerId: duel.winnerId,
      hexId: duel.hexId,
      newOwnerId: result.hexChanged ? duel.winnerId : match.hexagons.get(duel.hexId)?.ownerId ?? null,
      attackerScore: duel.attackerScore,
      defenderScore: duel.defenderScore,
    };

    this.io.to(roomName).emit(TcEvents.DUEL_RESOLVED, resolvedPayload);

    // If territory changed, send map update
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

    // Check win condition immediately
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
      this.setAbandonCooldowns(match);
      return;
    }

    // Check if this duel is part of a simultaneous round
    const simCallbacks = simultaneousCallbacks.get(matchId);
    if (simCallbacks && simCallbacks.has(duel.id)) {
      const cb = simCallbacks.get(duel.id)!;
      simCallbacks.delete(duel.id);
      cb();
      return;
    }

    // Move to next duel in resolution after a delay (sequential mode)
    match.currentDuelPosition++;
    setTimeout(() => this.processNextDuel(matchId), 3000);
  }

  // ── Revenge ──────────────────────────────────────────────────────

  private handleAcceptRevenge(): void {
    // In the new phase system, revenge is handled by selecting the revenge hex during planning
    // This handler is kept for compatibility but the main flow uses selectHex
    try {
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");

      const player = match.getPlayer(this.userId);
      if (!player) throw new Error("Not in this match");
      if (!player.hasRevenge()) throw new Error("No revenge available");

      // Auto-select the revenge hex during planning
      if (match.roundPhase === "planning") {
        this.handleSelectHex(player.revengeTargetHexId!);
      }
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

      player.setCooldown(360000);
      this.socket.emit(TcEvents.REVENGE_COOLDOWN, {
        cooldownEndsAt: player.revengeCooldownUntil?.toISOString() ?? "",
      });
    } catch (error) {
      this.emitError(error);
    }
  }

  // ── Surrender ──────────────────────────────────────────────────────

  private handleSurrender(): void {
    try {
      console.log(`[TC] ${this.username} attempting surrender`);
      const matchId = this.socket.data.tcMatchId;
      if (!matchId) throw new Error("Not in a match");

      const match = this.matchRepo.findById(matchId);
      if (!match) throw new Error("Match not found");
      if (match.status !== TcMatchStatus.Playing) throw new Error("Match not in progress");

      const player = match.getPlayer(this.userId);
      if (!player) throw new Error("Not in this match");

      // Forfeit any active duel first
      const activeDuel = match.findActiveDuelByPlayer(this.userId);
      if (activeDuel) {
        this.forfeitDuelForPlayer(activeDuel, this.userId, matchId);
      }

      // Deselect hex if in planning
      if (match.roundPhase === "planning") {
        const hexId = match.deselectHex(this.userId);
        if (hexId) {
          const roomName = `tc:${matchId}`;
          this.io.to(roomName).emit(TcEvents.HEX_DESELECTED, { hexId, userId: this.userId });
        }
      }

      // Surrender: release all territories
      const freedHexIds = match.surrenderPlayer(this.userId);
      console.log(`[TC] ${this.username} surrendered, freed ${freedHexIds.length} hexes`);
      const roomName = `tc:${matchId}`;

      // Notify everyone about surrender
      this.io.to(roomName).emit(TcEvents.PLAYER_SURRENDERED, {
        userId: this.userId,
        username: player.username,
        freedHexIds,
      });

      // Send map updates for all freed hexes
      if (freedHexIds.length > 0) {
        const updates = freedHexIds.map(hexId => {
          const hex = match.hexagons.get(hexId)!;
          return {
            hexId: hex.id,
            ownerId: hex.ownerId,
            ownerUsername: hex.ownerUsername,
            ownerColor: hex.ownerColor,
          };
        });
        this.io.to(roomName).emit(TcEvents.MAP_UPDATE, updates);
      }

      // Send updated leaderboard
      this.io.to(roomName).emit(TcEvents.LEADERBOARD_UPDATE, match.getLeaderboard());

      // Check if only one player with territory remains → they win
      const lastPlayer = match.getLastPlayerWithTerritory();
      if (lastPlayer) {
        const timer = matchTimers.get(matchId);
        if (timer) {
          clearTimeout(timer);
          matchTimers.delete(matchId);
        }
        const planTimer = planningTimers.get(matchId);
        if (planTimer) {
          clearTimeout(planTimer);
          planningTimers.delete(matchId);
        }

        match.winnerId = lastPlayer;
        match.finish();
        this.io.to(roomName).emit(TcEvents.MATCH_OVER, {
          winnerId: lastPlayer,
          reason: "domination",
          leaderboard: match.getLeaderboard(),
        });
        this.matchRepo.persistToDb(match);
        this.setAbandonCooldowns(match);
      }
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
        const player = match.getPlayer(this.userId);
        if (player) {
          player.connected = false;

          // Deselect hex if in planning
          if (match.roundPhase === "planning") {
            const hexId = match.deselectHex(this.userId);
            if (hexId) {
              this.io.to(roomName).emit(TcEvents.HEX_DESELECTED, {
                hexId,
                userId: this.userId,
              });
            }
          }

          // Forfeit any active duel
          const activeDuel = match.findActiveDuelByPlayer(this.userId);
          if (activeDuel) {
            this.forfeitDuelForPlayer(activeDuel, this.userId, match.id);
          }
        }
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
    if (!player) return;

    player.connected = false;
    const roomName = `tc:${matchId}`;

    // Deselect hex if in planning
    if (match.roundPhase === "planning") {
      const hexId = match.deselectHex(this.userId);
      if (hexId) {
        this.io.to(roomName).emit(TcEvents.HEX_DESELECTED, {
          hexId,
          userId: this.userId,
        });
      }
    }

    if (match.status === TcMatchStatus.Playing) {
      const activeDuel = match.findActiveDuelByPlayer(this.userId);
      if (activeDuel) {
        this.forfeitDuelForPlayer(activeDuel, this.userId, matchId);
      }
    }

    this.io.to(roomName).emit(TcEvents.PLAYER_LEFT, {
      userId: this.userId,
      playerCount: match.players.size,
    });
  }

  private forfeitDuelForPlayer(duel: TcDuel, disconnectedUserId: string, matchId: string): void {
    duel.forfeit(disconnectedUserId);
    const match = this.matchRepo.findById(matchId);
    if (!match) return;

    const disconnectedPlayer = match.getPlayer(disconnectedUserId);
    const opponentId = disconnectedUserId === duel.attackerId ? duel.defenderId : duel.attackerId;

    if (opponentId) {
      const opponentSocket = this.findPlayerSocket(opponentId, matchId);
      if (opponentSocket) {
        opponentSocket.emit(TcEvents.OPPONENT_DISCONNECTED, {
          duelId: duel.id,
          opponentUsername: disconnectedPlayer?.username ?? "Unknown",
          message: `${disconnectedPlayer?.username ?? "Opponent"} disconnected. You win the duel!`,
        });
      }
    }

    this.resolveDuel(duel, matchId);
  }

  // ── Check Active Match ─────────────────────────────────────────

  private handleCheckActive(): void {
    const activeMatch = this.matchRepo.findActiveByPlayerId(this.userId);
    let hasActive = !!(activeMatch && activeMatch.status === TcMatchStatus.Playing);

    // Don't show rejoin for surrendered players (0 territories, no revenge)
    if (hasActive && activeMatch) {
      const player = activeMatch.getPlayer(this.userId);
      const territories = activeMatch.getPlayerTerritoryCount(this.userId);
      if (territories === 0 && (!player || !player.hasRevenge())) {
        hasActive = false;
      }
    }

    const matchCode = hasActive ? activeMatch!.code : null;
    this.socket.emit(TcEvents.ACTIVE_MATCH_STATUS, { hasActiveMatch: hasActive, matchCode });
  }

  // ── Reconnect ──────────────────────────────────────────────────

  private handleReconnect(): void {
    try {
      const match = this.matchRepo.findActiveByPlayerId(this.userId);
      if (!match) throw new Error("No active match found");
      if (match.status === TcMatchStatus.Finished) throw new Error("Match already finished");

      const player = match.getPlayer(this.userId);
      if (!player) throw new Error("Not in this match");

      const territories = match.getPlayerTerritoryCount(this.userId);
      if (territories === 0 && !player.hasRevenge()) {
        throw new Error("No territories left. Cannot reconnect.");
      }

      player.connected = true;
      const roomName = `tc:${match.id}`;
      this.socket.join(roomName);
      this.socket.data.tcMatchId = match.id;

      console.log(`[TC] ${this.username} reconnected to match ${match.code}`);

      this.socket.emit(TcEvents.RECONNECTED, {
        matchId: match.id,
        matchCode: match.code,
        hexes: match.getHexesData(),
        players: match.getPlayersData(),
        matchTimerEndsAt: match.endsAt?.toISOString() ?? "",
        leaderboard: match.getLeaderboard(),
        roundNumber: match.currentRound,
        roundPhase: match.roundPhase,
        planningEndsAt: match.planningEndsAt?.toISOString() ?? null,
        selections: match.getSelectionsData(),
        roundOrder: match.roundOrder,
        currentDuelPosition: match.currentDuelPosition,
      });

      this.io.to(roomName).emit(TcEvents.PLAYER_JOINED, {
        userId: this.userId,
        username: this.username,
        color: player.color,
        playerCount: match.players.size,
        maxPlayers: match.maxPlayers,
      });
    } catch (error) {
      this.emitError(error);
    }
  }

  // ── CPU Defense for Disconnected Players ───────────────────────

  private startCpuDefense(duel: TcDuel, matchId: string): void {
    const answerForCpu = () => {
      const match = this.matchRepo.findById(matchId);
      if (!match || duel.isResolved()) return;

      const question = duel.getCurrentQuestion();
      if (!question || !duel.defenderId) return;

      const alreadyAnswered = duel.defenderAnswers.some(
        (a) => a.questionIndex === duel.currentQuestionIndex
      );
      if (alreadyAnswered) return;

      const defender = match.getPlayer(duel.defenderId);
      if (defender?.connected) return;

      const isCorrect = Math.random() < 0.4;
      const selectedIndex = isCorrect
        ? question.correctIndex
        : [0, 1, 2, 3].filter((i) => i !== question.correctIndex)[Math.floor(Math.random() * 3)];
      const timeMs = 3000 + Math.floor(Math.random() * 4000);

      try {
        duel.submitAnswer(duel.defenderId, selectedIndex, timeMs);

        const attackerSocket = this.findPlayerSocket(duel.attackerId, matchId);
        if (attackerSocket) {
          attackerSocket.emit(TcEvents.OPPONENT_ANSWERED, {
            duelId: duel.id,
            questionIndex: duel.currentQuestionIndex,
          });
        }

        if (duel.bothAnsweredCurrentQuestion()) {
          this.handleBothAnswered(duel, match);
        }
      } catch {
        // Answer already submitted or duel resolved
      }
    };

    const delay = 2000 + Math.floor(Math.random() * 3000);
    setTimeout(answerForCpu, delay);
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
