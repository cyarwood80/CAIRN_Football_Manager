// PitchEngine.js
// High-performance 2D 5v5 Football Simulation & Physics Engine

export class PitchEngine {
  constructor(homeTactics, awayTactics, options = {}) {
    this.width = 1000;
    this.height = 680;
    this.goalYMin = 280;
    this.goalYMax = 400;
    this.goalCenterY = 340;
    this.options = options;

    this.homeTeam = homeTactics;
    this.awayTeam = awayTactics;

    this.matchDuration = options.duration || 180; // 180 simulation seconds (2 seconds per sim minute)
    this.matchPace = options.pace || 1.0;
    this.elapsedSeconds = 0;
    this.tickRate = 30; // 30 ticks per second
    this.tickInterval = 1000 / this.tickRate;

    this.phase = "kickoff"; // 'kickoff' | 'live' | 'goal' | 'halftime' | 'fulltime'
    this.currentHalf = 1; // 1 | 2
    this.halfTimeTriggered = false;
    this.celebrationTimer = 0;
    this.kickoffTeam = "home";

    this.venue = options.venue || "home"; // "home" | "away"
    this.crowdAtmosphere = {
      decibels: 78,
      pressureLevel: "low",
      venue: this.venue,
      homeExpectationPenalty: false,
    };
    this.playerFeedback = [];
    this.fanFeedback = {
      sentiment: 65,
      status: "Optimistic",
      chant: "Come on boys, let's play our football!",
      moraleEffect: "Neutral crowd atmosphere",
    };
    this.chairpersonFeedback = {
      boardConfidence: 75,
      status: "Satisfied",
      message: "The Board expects tactical excellence and high discipline today.",
      influence: "Standard board backing",
    };

    this.score = { home: 0, away: 0 };
    this.subsRemaining = { home: 4, away: 4 };
    this.benchSubs = {
      home: JSON.parse(JSON.stringify(this.homeTeam.benchSubs || [])),
      away: JSON.parse(JSON.stringify(this.awayTeam.benchSubs || [])),
    };
    this.postMatchSummary = null;

    this.stats = {
      possession: { home: 50, away: 50 },
      possessionTicks: { home: 0, away: 0 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      shotAccuracy: { home: 0, away: 0 },
      saves: { home: 0, away: 0 },
      passes: { home: 0, away: 0 },
      passesAttempted: { home: 0, away: 0 },
      passesCompleted: { home: 0, away: 0 },
      passAccuracy: { home: 100, away: 100 },
      tackles: { home: 0, away: 0 },
      tacklesAttempted: { home: 0, away: 0 },
      tacklesWon: { home: 0, away: 0 },
      tackleSuccess: { home: 100, away: 100 },
      interceptions: { home: 0, away: 0 },
      xG: { home: 0.0, away: 0.0 },
    };

    this.events = [];
    this.activeThought = null;

    this.ball = {
      x: 500,
      y: 340,
      vx: 0,
      vy: 0,
      radius: 7,
      possessorId: null,
      lastPossessorId: null,
      lastPasserId: null,
      lastTeam: null,
      passSenderTeam: null,
      passTargetPlayerId: null,
      isShot: false,
      speed: 0,
    };

    this.players = [];
    this.initPlayers();
    this.resetToKickoff("home");
  }

  initPlayers() {
    this.players = [];

    // Home Team (attacks Left -> Right in 1st half)
    const homeConfig = this.homeTeam.players;
    homeConfig.forEach((p, idx) => {
      this.players.push({
        id: `home_${p.number || idx + 1}`,
        number: p.number || idx + 1,
        slotIndex: idx,
        team: "home",
        name: p.name || `Player #${p.number || idx + 1}`,
        role: p.role || "MID",
        roleKey: p.roleKey || "mid",
        transferValue: p.transferValue || 8.0,
        tier: p.tier || 2,
        promptCapability: p.promptCapability || "Solid Starter",
        isYouth: !!p.isYouth,
        tacticalMastery: p.tacticalMastery || 75,
        personalityTrait: p.personalityTrait || (idx === 0 ? "Leader" : idx % 4 === 0 ? "Creative" : idx % 4 === 1 ? "Methodical" : idx % 4 === 2 ? "Aggressive" : "Flair"),
        personalityIcon: p.personalityIcon || (idx === 0 ? "👑" : idx % 4 === 0 ? "🧠" : idx % 4 === 1 ? "🛡️" : idx % 4 === 2 ? "🔥" : "⚡"),
        personalityDescription: p.personalityDescription || "Focused on executing game plan",
        x: 200,
        y: 320,
        vx: 0,
        vy: 0,
        targetX: 200,
        targetY: 320,
        speed: 3.8,
        stamina: 100,
        health: 100,
        rating: 6.0,
        impact: "med",
        goals: 0,
        assists: 0,
        passes: 0,
        tackles: 0,
        shots: 0,
        saves: 0,
        dispossessions: 0,
        subbedOut: false,
        state: "idle",
        thought: "Ready for kickoff",
        tactic: p,
        cooldowns: { pass: 0, tackle: 0, shot: 0 },
      });
    });

    // Away Team (attacks Right -> Left in 1st half)
    const awayConfig = this.awayTeam.players;
    awayConfig.forEach((p, idx) => {
      this.players.push({
        id: `away_${p.number || idx + 1}`,
        number: p.number || idx + 1,
        slotIndex: idx,
        team: "away",
        name: p.name || `Player #${p.number || idx + 1}`,
        role: p.role || "MID",
        roleKey: p.roleKey || "mid",
        transferValue: p.transferValue || 8.0,
        tier: p.tier || 2,
        promptCapability: p.promptCapability || "Solid Starter",
        isYouth: !!p.isYouth,
        tacticalMastery: p.tacticalMastery || 75,
        personalityTrait: p.personalityTrait || (idx === 0 ? "Leader" : idx % 4 === 0 ? "Creative" : idx % 4 === 1 ? "Methodical" : idx % 4 === 2 ? "Aggressive" : "Flair"),
        personalityIcon: p.personalityIcon || (idx === 0 ? "👑" : idx % 4 === 0 ? "🧠" : idx % 4 === 1 ? "🛡️" : idx % 4 === 2 ? "🔥" : "⚡"),
        personalityDescription: p.personalityDescription || "Focused on executing game plan",
        x: 800,
        y: 320,
        vx: 0,
        vy: 0,
        targetX: 800,
        targetY: 320,
        speed: 3.8,
        stamina: 100,
        health: 100,
        rating: 6.0,
        impact: "med",
        goals: 0,
        assists: 0,
        passes: 0,
        tackles: 0,
        shots: 0,
        saves: 0,
        dispossessions: 0,
        subbedOut: false,
        state: "idle",
        thought: "Focused on game plan",
        tactic: p,
        cooldowns: { pass: 0, tackle: 0, shot: 0 },
      });
    });

  }

  getFormationAnchors(team, formation) {
    // Attack direction flips in second half (swapping ends)
    const isAttackingRight = (team === "home" && this.currentHalf === 1) || (team === "away" && this.currentHalf === 2);
    const xBase = (ratio) => (isAttackingRight ? ratio * this.width : (1 - ratio) * this.width);

    if (formation === "4-3-3") {
      // 1 GK, 4 DEF (RB, CB_L, CB_R, LB), 3 MID (CDM, CAM, CM), 3 FWD (RW, ST, LW)
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.22), y: 565 }, // 2: RB
        { x: xBase(0.18), y: 245 }, // 3: CB_L
        { x: xBase(0.18), y: 435 }, // 4: CB_R
        { x: xBase(0.22), y: 115 }, // 5: LB
        { x: xBase(0.38), y: 340 }, // 6: CDM
        { x: xBase(0.72), y: 565 }, // 7: RW
        { x: xBase(0.55), y: 435 }, // 8: CAM
        { x: xBase(0.78), y: 340 }, // 9: ST
        { x: xBase(0.55), y: 245 }, // 10: CM
        { x: xBase(0.72), y: 115 }, // 11: LW
      ];
    } else if (formation === "4-4-2") {
      // 1 GK, 4 DEF (RB, CB_L, CB_R, LB), 4 MID (RM, CM_R, CM_L, LM), 2 FWD (ST_R, ST_L)
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.22), y: 565 }, // 2: RB
        { x: xBase(0.18), y: 245 }, // 3: CB_L
        { x: xBase(0.18), y: 435 }, // 4: CB_R
        { x: xBase(0.22), y: 115 }, // 5: LB
        { x: xBase(0.52), y: 565 }, // 6: RM
        { x: xBase(0.48), y: 435 }, // 7: CM_R
        { x: xBase(0.48), y: 245 }, // 8: CM_L
        { x: xBase(0.76), y: 435 }, // 9: ST_R
        { x: xBase(0.76), y: 245 }, // 10: ST_L
        { x: xBase(0.52), y: 115 }, // 11: LM
      ];
    } else if (formation === "3-5-2") {
      // 1 GK, 3 DEF, 5 MID, 2 FWD
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.19), y: 475 }, // 2: CB_R
        { x: xBase(0.17), y: 340 }, // 3: CB_C
        { x: xBase(0.19), y: 205 }, // 4: CB_L
        { x: xBase(0.42), y: 585 }, // 5: RWB
        { x: xBase(0.36), y: 340 }, // 6: CDM
        { x: xBase(0.52), y: 435 }, // 7: CM_R
        { x: xBase(0.60), y: 340 }, // 8: CAM
        { x: xBase(0.77), y: 435 }, // 9: ST_R
        { x: xBase(0.77), y: 245 }, // 10: ST_L
        { x: xBase(0.42), y: 95 },  // 11: LWB
      ];
    } else if (formation === "5-3-2") {
      // 1 GK, 5 DEF, 3 MID, 2 FWD
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.25), y: 575 }, // 2: RWB
        { x: xBase(0.18), y: 460 }, // 3: CB_R
        { x: xBase(0.16), y: 340 }, // 4: CB_C
        { x: xBase(0.18), y: 220 }, // 5: CB_L
        { x: xBase(0.25), y: 105 }, // 6: LWB
        { x: xBase(0.38), y: 340 }, // 7: CDM
        { x: xBase(0.50), y: 435 }, // 8: CM_R
        { x: xBase(0.77), y: 435 }, // 9: ST_R
        { x: xBase(0.77), y: 245 }, // 10: ST_L
        { x: xBase(0.50), y: 245 }, // 11: CM_L
      ];
    } else if (formation === "4-2-3-1") {
      // 1 GK, 4 DEF (RB, CB_R, CB_L, LB), 2 CDM, 3 AM (RM, CAM, LM), 1 ST
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.22), y: 565 }, // 2: RB
        { x: xBase(0.18), y: 435 }, // 3: CB_R
        { x: xBase(0.18), y: 245 }, // 4: CB_L
        { x: xBase(0.22), y: 115 }, // 5: LB
        { x: xBase(0.36), y: 435 }, // 6: CDM_R
        { x: xBase(0.65), y: 565 }, // 7: RM
        { x: xBase(0.36), y: 245 }, // 8: CDM_L
        { x: xBase(0.80), y: 340 }, // 9: ST
        { x: xBase(0.60), y: 340 }, // 10: CAM
        { x: xBase(0.65), y: 115 }, // 11: LM
      ];
    } else if (formation === "3-4-3") {
      // 1 GK, 3 DEF (CB_R, CB_C, CB_L), 4 MID (RM, CM_R, CM_L, LM), 3 FWD (RW, ST, LW)
      return [
        { x: xBase(0.05), y: 340 }, // 1: GK
        { x: xBase(0.19), y: 475 }, // 2: CB_R
        { x: xBase(0.17), y: 340 }, // 3: CB_C
        { x: xBase(0.19), y: 205 }, // 4: CB_L
        { x: xBase(0.48), y: 570 }, // 5: RM
        { x: xBase(0.45), y: 420 }, // 6: CM_R
        { x: xBase(0.76), y: 555 }, // 7: RW
        { x: xBase(0.45), y: 260 }, // 8: CM_L
        { x: xBase(0.82), y: 340 }, // 9: ST
        { x: xBase(0.48), y: 110 }, // 10: LM
        { x: xBase(0.76), y: 125 }, // 11: LW
      ];
    } else {
      // Default 4-3-3 fallback
      return [
        { x: xBase(0.05), y: 340 },
        { x: xBase(0.22), y: 565 },
        { x: xBase(0.18), y: 245 },
        { x: xBase(0.18), y: 435 },
        { x: xBase(0.22), y: 115 },
        { x: xBase(0.38), y: 340 },
        { x: xBase(0.72), y: 565 },
        { x: xBase(0.55), y: 435 },
        { x: xBase(0.78), y: 340 },
        { x: xBase(0.55), y: 245 },
        { x: xBase(0.72), y: 115 },
      ];
    }
  }

  swapEnds() {
    this.currentHalf = 2;
    const homeAnchors = this.getFormationAnchors("home", this.homeTeam.formation);
    const awayAnchors = this.getFormationAnchors("away", this.awayTeam.formation);

    this.players.forEach((p, idx) => {
      const anchors = p.team === "home" ? homeAnchors : awayAnchors;
      const anchorIdx = (typeof p.slotIndex === "number" && p.slotIndex >= 0)
        ? (p.slotIndex % anchors.length)
        : (idx % anchors.length);
      const isAttackingRight = (p.team === "home" && this.currentHalf === 1) || (p.team === "away" && this.currentHalf === 2);
      const defaultX = isAttackingRight ? 200 : 800;
      const anchor = anchors[anchorIdx] || anchors[0] || { x: defaultX, y: 340 };
      p.x = anchor.x;
      p.y = anchor.y;
      p.targetX = anchor.x;
      p.targetY = anchor.y;
      p.vx = 0;
      p.vy = 0;
      p.state = "idle";
    });
  }

  resetToKickoff(teamTakingKickoff = "home") {
    this.phase = "kickoff";
    this.kickoffTeam = teamTakingKickoff;
    this.ball.x = 500;
    this.ball.y = 340;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.possessorId = null;
    this.ball.isShot = false;

    const homeAnchors = this.getFormationAnchors("home", this.homeTeam.formation);
    const awayAnchors = this.getFormationAnchors("away", this.awayTeam.formation);

    this.players.forEach((p, idx) => {
      const anchors = p.team === "home" ? homeAnchors : awayAnchors;
      const anchorIdx = (typeof p.slotIndex === "number" && p.slotIndex >= 0)
        ? (p.slotIndex % anchors.length)
        : (idx % anchors.length);
      const isAttackingRight = (p.team === "home" && this.currentHalf === 1) || (p.team === "away" && this.currentHalf === 2);
      const defaultX = isAttackingRight ? 200 : 800;
      const anchor = anchors[anchorIdx] || anchors[0] || { x: defaultX, y: 320 };
      p.x = anchor.x;
      p.y = anchor.y;
      p.targetX = anchor.x;
      p.targetY = anchor.y;
      p.vx = 0;
      p.vy = 0;
      p.state = "idle";
    });

    // Place kickoff taker on the center circle
    const taker = this.players.find(
      (p) => p.team === teamTakingKickoff && (p.role === "ST" || p.role === "FWD")
    ) || this.players.find((p) => p.team === teamTakingKickoff && p.number === 9) || this.players.find((p) => p.team === teamTakingKickoff && p.number === 5);

    if (taker) {
      const isTakerAttackingRight = (teamTakingKickoff === "home" && this.currentHalf === 1) || (teamTakingKickoff === "away" && this.currentHalf === 2);
      taker.x = isTakerAttackingRight ? 490 : 510;
      taker.y = 320;
      this.ball.possessorId = taker.id;
      this.ball.lastTeam = teamTakingKickoff;
    }

    setTimeout(() => {
      if (this.phase === "kickoff") {
        this.phase = "live";
        this.addEvent(`${this.currentHalf === 2 ? "Second half" : "Kick-off"}! Match is underway.`, "info");
      }
    }, 1200);
  }

  addEvent(text, type = "info", player = null) {
    const simMinute = Math.min(90, Math.floor((this.elapsedSeconds / this.matchDuration) * 90));
    const eventObj = {
      id: `${Date.now()}_${Math.random()}`,
      minute: simMinute,
      text,
      type,
      player,
    };
    this.events.unshift(eventObj);
    if (this.events.length > 25) this.events.pop();
  }

  setThought(player, text) {
    player.thought = text;
    this.activeThought = {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      personalityTrait: player.personalityTrait || "Methodical",
      personalityIcon: player.personalityIcon || "🛡️",
      text,
      x: player.x,
      y: player.y,
      timestamp: Date.now(),
    };
  }

  triggerAutonomousPlayerThought() {
    if (this.phase !== "live") return;
    const activeOutfield = this.players.filter((p) => !p.subbedOut && p.team === "home");
    if (activeOutfield.length === 0) return;

    // Pick possessor first, or a random home outfield player
    let chosen = null;
    if (this.ball.possessorId) {
      chosen = this.players.find((p) => p.id === this.ball.possessorId && p.team === "home");
    }
    if (!chosen) {
      chosen = activeOutfield[Math.floor(Math.random() * activeOutfield.length)];
    }
    if (!chosen) return;

    const trait = (chosen.personalityTrait || "Methodical").toLowerCase();
    const isCarrier = this.ball.possessorId === chosen.id;
    const isTrailing = this.score.home < this.score.away;
    const isLeading = this.score.home > this.score.away;
    const isTired = chosen.stamina < 55;

    let thought = "";
    if (trait.includes("creative")) {
      if (isCarrier) {
        thought = isTrailing
          ? "Looking to unlock their low block with an incisive disguised through-ball."
          : "Scanning for the third-man run. The passing lane is opening up.";
      } else {
        thought = "Drifting into the half-space pocket to receive between the lines on the half-turn.";
      }
    } else if (trait.includes("methodical")) {
      if (isCarrier) {
        thought = "Protecting possession. Recycling to the open pivot to maintain structural control.";
      } else {
        thought = isLeading
          ? "Holding our compact defensive distance. Denying them central penetration."
          : "Maintaining positional shape. Shifting across with the defensive block.";
      }
    } else if (trait.includes("flair")) {
      if (isCarrier) {
        thought = "Dropping the shoulder! Looking to beat my marker 1v1 and curl it towards the top corner!";
      } else {
        thought = "Anticipating the switch of play. Ready to isolate their fullback in a 1v1 duel.";
      }
    } else if (trait.includes("aggressive")) {
      if (isCarrier) {
        thought = "Driving forward with raw power! No hesitation, attacking the space with venom!";
      } else {
        thought = isTrailing
          ? "Closing down with ferocious intensity! We win the second ball or we foul high!"
          : "Suffocating their midfield. Putting in a crunching challenge to set the tone!";
      }
    } else if (trait.includes("leader")) {
      thought = isTrailing
        ? "Heads up! We stay disciplined, stick to the manager's tactical plan, and fight!"
        : isLeading
        ? "0-0 mentality everyone! Stay switched on, communicate, and close out the victory!"
        : "Keep talking, keep our shape! We dictate the tempo together.";
    } else if (trait.includes("sensitive")) {
      if (isTired) {
        thought = "Feeling the fatigue, but the manager's shouting encouragement keeps me running.";
      } else {
        thought = isLeading
          ? "Feeling sharp and confident! The boss's trust in me is paying off."
          : "Need to stay composed under this crowd pressure. Trust the fundamentals.";
      }
    } else if (trait.includes("tenacious")) {
      thought = isTired
        ? "Lungs burning, but I will not stop sprinting until the referee blows the final whistle!"
        : "Pressing every loose ball! Relentless work rate to win back possession!";
    } else {
      thought = "Executing the manager's tactical instructions with total focus.";
    }

    this.setThought(chosen, thought);
  }


  recalcAccuracies() {
    ["home", "away"].forEach((t) => {
      const pAtt = this.stats.passesAttempted[t] || 0;
      const pComp = this.stats.passesCompleted[t] || 0;
      this.stats.passAccuracy[t] = pAtt > 0 ? Math.round((pComp / pAtt) * 100) : 100;

      const tAtt = this.stats.tacklesAttempted[t] || 0;
      const tWon = this.stats.tacklesWon[t] || 0;
      this.stats.tackleSuccess[t] = tAtt > 0 ? Math.round((tWon / tAtt) * 100) : 100;

      const sTot = this.stats.shots[t] || 0;
      const sTgt = this.stats.shotsOnTarget[t] || 0;
      this.stats.shotAccuracy[t] = sTot > 0 ? Math.round((sTgt / sTot) * 100) : 0;
    });
  }

  updatePlayerRating(player, delta) {
    if (!player) return;
    player.rating = Math.max(1.0, Math.min(10.0, +(player.rating + delta).toFixed(1)));
    if (player.rating >= 7.8) player.impact = "high";
    else if (player.rating >= 5.8) player.impact = "med";
    else player.impact = "low";
  }

  setMatchPace(pace) {
    this.matchPace = Math.max(0.5, Math.min(2.5, Number(pace) || 1.0));
    this.addEvent(`⏱ Match pace tuned to ${this.matchPace}x`, "info");
    return { success: true, pace: this.matchPace };
  }

  executeSubstitution(team, subIndexOrId = null, targetPlayerId = null) {
    if (this.subsRemaining[team] <= 0) {
      return { success: false, reason: "No substitutions remaining (maximum 3 used)." };
    }

    let playerIdx = -1;
    if (targetPlayerId) {
      playerIdx = this.players.findIndex((p) => p.id === targetPlayerId && p.team === team);
    }
    if (playerIdx === -1) {
      // Find lowest stamina outfield player
      const teamOutfield = this.players
        .map((p, idx) => ({ ...p, originalIdx: idx }))
        .filter((p) => p.team === team && p.role !== "GK" && !p.subbedOut);
      teamOutfield.sort((a, b) => a.stamina - b.stamina);
      if (teamOutfield.length > 0) {
        playerIdx = teamOutfield[0].originalIdx;
      }
    }

    if (playerIdx === -1) {
      return { success: false, reason: "Target player not found on pitch." };
    }

    const outgoing = this.players[playerIdx];
    outgoing.subbedOut = true;

    // Find the bench substitute
    const bench = this.benchSubs[team] || [];
    let benchSub = null;
    if (typeof subIndexOrId === "number") {
      benchSub = bench[subIndexOrId];
    } else if (typeof subIndexOrId === "string") {
      benchSub = bench.find((b) => b.id === subIndexOrId);
    }
    // Fallback to first available unused bench sub
    if (!benchSub || benchSub.used) {
      benchSub = bench.find((b) => !b.used);
    }

    if (!benchSub) {
      return { success: false, reason: "All bench substitutes have already been deployed." };
    }

    benchSub.used = true;

    const subPlayer = {
      id: `${team}_sub_${benchSub.id || Date.now()}`,
      number: benchSub.number || outgoing.number,
      slotIndex: outgoing.slotIndex ?? playerIdx,
      team: team,
      name: benchSub.name || `Sub Agent #${outgoing.number}`,
      role: benchSub.role || outgoing.role,
      roleKey: benchSub.roleKey || outgoing.roleKey,
      transferValue: benchSub.transferValue || outgoing.transferValue || 6.0,
      tier: benchSub.tier || outgoing.tier || 2,
      promptCapability: benchSub.promptCapability || outgoing.promptCapability || "Sub Agent",
      isYouth: !!benchSub.isYouth,
      x: outgoing.x,
      y: outgoing.y,
      vx: 0,
      vy: 0,
      targetX: outgoing.x,
      targetY: outgoing.y,
      speed: 4.15, // fresh legs boost
      stamina: 100,
      health: 100,
      rating: 6.5,
      impact: "med",
      goals: 0,
      assists: 0,
      passes: 0,
      tackles: 0,
      shots: 0,
      saves: 0,
      dispossessions: 0,
      subbedOut: false,
      state: "running",
      thought: `Subbed on! Fresh legs ready to make an immediate impact!`,
      tactic: benchSub.tactic || {
        ...outgoing.tactic,
        prompt: benchSub.prompt || "Super sub with fresh explosive stamina. Press fiercely and shoot on sight!",
        workRate: 0.95,
        shotBias: 0.85,
        pressBias: 0.9,
      },
      cooldowns: { pass: 0, tackle: 0, shot: 0 }
    };

    this.players[playerIdx] = subPlayer;
    this.subsRemaining[team]--;

    this.setThought(subPlayer, `Taking the pitch for ${outgoing.name}! Maximum energy!`);
    this.addEvent(`🔄 TACTICAL SUB: [${subPlayer.name} (${subPlayer.role})] replaces [${outgoing.name} (Rating ${outgoing.rating})]!`, "sub", subPlayer);

    return { success: true, subPlayer, outgoingPlayer: outgoing, subsRemaining: this.subsRemaining[team] };
  }

  executePlayerChatDirective(playerId, message) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return { success: false, reason: "Player not found on pitch." };

    const trait = (player.personalityTrait || "Methodical").toLowerCase();
    const msg = (message || "").toLowerCase();
    let response = "";
    let actionTaken = "";

    if (msg.includes("press") || msg.includes("hunt") || msg.includes("close") || msg.includes("hound")) {
      player.tactic.pressBias = 0.95;
      player.tactic.workRate = 0.95;
      response = trait.includes("aggressive")
        ? `Locked on Boss! I'll put my body on the line and hunt down their playmaker mercilessly!`
        : `Understood Boss! Stepping up the press and hunting the ball immediately!`;
      actionTaken = "Maximized press aggression & work rate";
      this.updatePlayerRating(player, 0.1);
    } else if (msg.includes("shoot") || msg.includes("attack") || msg.includes("score") || msg.includes("strike") || msg.includes("forward")) {
      player.tactic.shotBias = 0.95;
      player.tactic.wingPlayBias = 0.7;
      response = trait.includes("flair")
        ? `Back me Boss! Time to drop the shoulder, beat my marker, and bend it into the top corner!`
        : `Got it Boss! I'll pull the trigger at the first sight of goal!`;
      actionTaken = "Set shot bias to 0.95 (Shoot on sight)";
      this.updatePlayerRating(player, 0.1);
    } else if (msg.includes("pass") || msg.includes("calm") || msg.includes("tempo") || msg.includes("keep") || msg.includes("possession")) {
      player.tactic.passBias = 0.15;
      player.tactic.positionalDiscipline = 0.9;
      response = trait.includes("creative")
        ? `Vision unlocked Coach! Controlling tempo and threading the killer through-ball!`
        : `On it Coach! Slowing it down, keeping possession and looking for open angles.`;
      actionTaken = "Optimized short passing & positional retention";
      this.updatePlayerRating(player, 0.1);
    } else if (msg.includes("tackle") || msg.includes("defend") || msg.includes("stay back") || msg.includes("hold") || msg.includes("shield")) {
      player.tactic.tackleBias = 0.92;
      player.tactic.positionalDiscipline = 0.95;
      response = trait.includes("methodical")
        ? `Understood! Locking down our sector and denying them central space with structured shape.`
        : `Understood! Putting in hard challenges and locking down my sector!`;
      actionTaken = "Bolstered tackle aggression & discipline";
      this.updatePlayerRating(player, 0.1);
    } else if (msg.includes("wake up") || msg.includes("poor") || msg.includes("improve") || msg.includes("bad") || msg.includes("sub")) {
      response = trait.includes("sensitive")
        ? `I hear you Coach... I know my rating is ${player.rating}. Give me 5 minutes, I'll run through brick walls to prove myself!`
        : `Heard you loud and clear Boss! I know my rating is ${player.rating}. Giving everything to turn it around!`;
      actionTaken = "Player motivated to fight back and raise match rating";
      this.updatePlayerRating(player, 0.2);
    } else {
      response = trait.includes("leader")
        ? `Copy that Boss! Relaying your orders: "${message.slice(0, 30)}..." to the rest of the squad!`
        : `Copy that Boss! Adjusting my tactics now: "${message.slice(0, 30)}...". Let's win this!`;
      actionTaken = "Tactical focus adjusted";
      this.updatePlayerRating(player, 0.1);
    }

    this.setThought(player, `Boss shouts: "${message.slice(0, 25)}..." -> ${response}`);
    this.addEvent(`💬 TOUCHLINE TALK: [${player.name} (${player.personalityTrait || "Player"})]: "${response}"`, "chat", player);


    return {
      success: true,
      player: { id: player.id, name: player.name, role: player.role, rating: player.rating },
      directive: message,
      response,
      actionTaken,
      timestamp: Date.now(),
    };
  }

  generatePostMatchSummary() {
    // Find Player of the Match
    const eligiblePlayers = [...this.players].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return (b.saves + b.tackles) - (a.saves + a.tackles);
    });

    const potm = eligiblePlayers[0] || null;

    // Turning points from match events
    const turningPoints = this.events
      .filter((e) => e.type === "goal" || e.type === "save" || e.type === "sub")
      .slice(-6)
      .reverse();

    // Pundit critique
    const homeWon = this.score.home > this.score.away;
    const awayWon = this.score.away > this.score.home;

    let verdict = "";
    if (homeWon) {
      verdict = `${this.homeTeam.teamName} dictated the rhythm with supreme tactical execution, converting key chances when it mattered most.`;
    } else if (awayWon) {
      verdict = `${this.awayTeam.teamName} mounted a devastating tactical masterclass on the break, ruthlessly exposing space.`;
    } else {
      verdict = `An enthralling tactical battle of wits that finishes level after 90 intense simulated minutes.`;
    }

    const critique = {
      home: `${this.homeTeam.teamName} achieved ${this.stats.possession.home}% possession and ${this.stats.shots.home} attempts (${this.stats.xG.home} xG). Their press was ${this.stats.tackleSuccess.home}% efficient.`,
      away: `${this.awayTeam.teamName} achieved ${this.stats.possession.away}% possession and ${this.stats.shots.away} attempts (${this.stats.xG.away} xG). Their passing accuracy closed at ${this.stats.passAccuracy.away}%.`,
    };

    this.postMatchSummary = {
      playerOfTheMatch: potm
        ? {
            id: potm.id,
            name: potm.name,
            team: potm.team,
            role: potm.role,
            rating: potm.rating,
            goals: potm.goals || 0,
            assists: potm.assists || 0,
            saves: potm.saves || 0,
            tackles: potm.tackles || 0,
            shots: potm.shots || 0,
          }
        : null,
      score: { ...this.score },
      stats: { ...this.stats },
      turningPoints,
      tacticalVerdict: verdict,
      managerCritique: critique,
    };

    return this.postMatchSummary;
  }

  applyLiveTacticalDirective(team, newPrompt, macroKey = null) {
    const teamConfig = team === "home" ? this.homeTeam : this.awayTeam;
    const prompt = newPrompt || (macroKey ? macroKey.replace(/_/g, " ") : "Tactical shift");

    this.players.forEach((p) => {
      if (p.team === team) {
        if (macroKey === "ALL_OUT_PRESS") {
          p.tactic.pressBias = 0.95;
          p.tactic.shotBias = Math.max(p.tactic.shotBias, 0.75);
          p.tactic.tackleBias = 0.85;
          p.tactic.workRate = 0.95;
        } else if (macroKey === "PARK_THE_BUS") {
          p.tactic.pressBias = 0.3;
          p.tactic.positionalDiscipline = 0.95;
          p.tactic.tackleBias = 0.8;
          p.tactic.passBias = 0.85;
        } else if (macroKey === "COUNTER_ATTACK") {
          p.tactic.passBias = 0.85;
          p.tactic.shotBias = 0.8;
        } else if (macroKey === "TIKI_TAKA_CONTROL") {
          p.tactic.passBias = 0.2;
          p.tactic.shotBias = 0.45;
        } else if (macroKey === "SHOOT_ON_SIGHT") {
          p.tactic.shotBias = 0.95;
        } else if (newPrompt) {
          const lower = newPrompt.toLowerCase();
          if (lower.includes("press") || lower.includes("hunt")) p.tactic.pressBias = 0.95;
          if (lower.includes("shoot") || lower.includes("attack")) p.tactic.shotBias = 0.9;
          if (lower.includes("pass") || lower.includes("tiki")) p.tactic.passBias = 0.25;
          if (lower.includes("defend") || lower.includes("park") || lower.includes("back")) {
            p.tactic.pressBias = 0.35;
            p.tactic.positionalDiscipline = 0.95;
          }
          if (lower.includes("tackle") || lower.includes("hard")) p.tactic.tackleBias = 0.9;
        }
      }
    });

    const teamName = teamConfig.teamName || (team === "home" ? "Home FC" : "Away FC");
    this.addEvent(`📢 TOUCHLINE SHOUT: ${teamName} coach orders: "${prompt}"!`, "tactic");

    const captain = this.players.find((p) => p.team === team && p.role !== "GK") || this.players[0];
    if (captain) {
      this.setThought(captain, `Manager ordered: "${prompt}" - executing now!`);
    }

    return { success: true };
  }

  resumeSecondHalf(updatedHomeTactics = null, updatedAwayTactics = null) {
    if (updatedHomeTactics) {
      if (updatedHomeTactics.formation) this.homeTeam.formation = updatedHomeTactics.formation;
      if (updatedHomeTactics.prompt) this.homeTeam.prompt = updatedHomeTactics.prompt;
    }
    if (updatedAwayTactics) {
      if (updatedAwayTactics.formation) this.awayTeam.formation = updatedAwayTactics.formation;
      if (updatedAwayTactics.prompt) this.awayTeam.prompt = updatedAwayTactics.prompt;
    }

    this.currentHalf = 2;
    this.swapEnds();
    this.phase = "kickoff";
    // Team that didn't start the match takes the second half kickoff
    const secondHalfKickoffTeam = this.kickoffTeam === "home" ? "away" : "home";
    this.resetToKickoff(secondHalfKickoffTeam);
    this.addEvent("▶️ Second Half underway! Teams have swapped ends for the final 45 minutes.", "whistle");
  }

  updateCrowdAtmosphere() {
    const homeGoals = this.score.home;
    const awayGoals = this.score.away;
    const isTrailingAtHome = this.venue === "home" && awayGoals > homeGoals;
    const isDominatingAtHome = this.venue === "home" && homeGoals > awayGoals;

    let baseDb = 78;
    if (this.ball.isShot) baseDb += 14;
    else if (this.ball.possessorId) baseDb += 4;

    if (isDominatingAtHome) {
      baseDb += 10;
      this.crowdAtmosphere.pressureLevel = "low";
      this.crowdAtmosphere.homeExpectationPenalty = false;
    } else if (isTrailingAtHome) {
      // Home crowd restless, high pressure
      baseDb = Math.max(68, baseDb - 4);
      this.crowdAtmosphere.pressureLevel = (awayGoals - homeGoals >= 2) ? "intense" : "high";
      this.crowdAtmosphere.homeExpectationPenalty = true;
    } else {
      this.crowdAtmosphere.pressureLevel = "medium";
      this.crowdAtmosphere.homeExpectationPenalty = false;
    }

    this.crowdAtmosphere.decibels = Math.min(98, Math.max(65, baseDb));

    // Dynamic Fan Feedback calculation
    let fanSent = 60;
    if (homeGoals > awayGoals) {
      fanSent = Math.min(100, 72 + (homeGoals - awayGoals) * 12 + Math.floor(this.stats.shots.home * 1.5));
    } else if (awayGoals > homeGoals) {
      fanSent = Math.max(10, 45 - (awayGoals - homeGoals) * 15);
    } else {
      fanSent = 55 + Math.floor(this.stats.shots.home * 0.8);
    }
    fanSent = Math.min(100, Math.max(0, fanSent));

    let fanStat = "Optimistic";
    let chant = "Come on boys, let's play our football!";
    let moraleEffect = "Neutral crowd atmosphere";

    if (fanSent >= 80) {
      fanStat = "Ecstatic";
      chant = `🎶 "We're top of the league! Pure world class, ${this.homeTeam.teamName || "team"}!"`;
      moraleEffect = "+5% Sprint Speed & Pressing Aggression from ecstatic roar";
      this.crowdAtmosphere.decibels = Math.min(98, this.crowdAtmosphere.decibels + 6);
    } else if (fanSent >= 60) {
      fanStat = "Optimistic";
      chant = `📢 "Keep the pressure on! Direct passes forward!"`;
      moraleEffect = "+3% pressing work rate";
    } else if (fanSent >= 45) {
      fanStat = "Nervous";
      chant = `⚠️ "Focus at the back! Don't give away cheap counters!"`;
      moraleEffect = "Restless crowd tension";
    } else if (fanSent >= 30) {
      fanStat = "Discontent";
      chant = `💢 "We want attacking football! Where is the urgency?!"`;
      moraleEffect = "-5% Composure under pressure & +15% stamina drain";
    } else {
      fanStat = "Hostile";
      chant = `😡 "Not good enough! You're not fit to wear the shirt!"`;
      moraleEffect = "Severe crowd anxiety & +25% rapid stamina depletion";
    }

    this.fanFeedback = {
      sentiment: fanSent,
      status: fanStat,
      chant,
      moraleEffect,
    };

    // Chairperson Feedback
    let boardConf = 70;
    if (homeGoals > awayGoals) {
      boardConf = Math.min(100, 80 + (homeGoals - awayGoals) * 6);
    } else if (awayGoals > homeGoals) {
      boardConf = Math.max(20, 52 - (awayGoals - homeGoals) * 12);
    } else {
      boardConf = 68;
    }

    let boardStat = "Satisfied";
    let message = "The Board expects tactical excellence and high discipline today.";
    let influence = "Standard board backing";

    if (boardConf >= 82) {
      boardStat = "Delighted";
      message = "The Chairperson is delighted with your tactical execution. +£1.5m Board transfer bonus unlocked!";
      influence = "High Board Backing: Bonus transfer allowance & squad mental stability (+2% TM)";
    } else if (boardConf >= 65) {
      boardStat = "Satisfied";
      message = "The Board is satisfied with overall match performance and team shape.";
      influence = "Steady board backing & full managerial confidence";
    } else if (boardConf >= 45) {
      boardStat = "Cautious";
      message = "The Board expects a competitive response. Falling behind is not acceptable.";
      influence = "Board pressure: Senior players feel tension";
    } else {
      boardStat = "Under Pressure";
      message = "The Chairperson issues an urgent warning: tactical results must turn around immediately.";
      influence = "High board scrutiny: Severe psychological pressure on squad";
    }

    this.chairpersonFeedback = {
      boardConfidence: boardConf,
      status: boardStat,
      message,
      influence,
    };
  }

  generatePlayerFeedback(isHalfTime = false) {
    const feedbackList = [];
    const homePlayers = this.players.filter((p) => p.team === "home" && !p.subbedOut);
    if (homePlayers.length === 0) return [];

    const striker = homePlayers.find((p) => p.role === "ST" || p.role === "FWD") || homePlayers[homePlayers.length - 1];
    const midfielder = homePlayers.find((p) => p.role.includes("M")) || homePlayers[5];
    const defender = homePlayers.find((p) => p.role.includes("B") || p.role === "CB") || homePlayers[1];

    // Striker Feedback
    if (striker) {
      if (striker.goals > 0 || striker.shots >= 2) {
        striker.tacticalMastery = Math.min(100, (striker.tacticalMastery || 75) + 1);
        feedbackList.push({
          playerId: striker.id,
          playerName: striker.name,
          playerRole: striker.role,
          type: "encourage",
          message: isHalfTime
            ? `Boss, the direct passes into the box are giving me great shooting angles! Let's keep feeding the channels in the 2nd half.`
            : `Tactics paid off! Finding space behind their center backs was key to our attacks (+1% Tactical Mastery).`,
          tacticalAdvice: "Maintain aggressive offensive runs.",
          rating: striker.rating,
        });
      } else {
        feedbackList.push({
          playerId: striker.id,
          playerName: striker.name,
          playerRole: striker.role,
          type: "challenge",
          message: isHalfTime
            ? `Coach, I'm feeling isolated up top against their defenders. Can our wingers or CAM push closer to link up?`
            : `We struggled to create clear chances against their low block. Next match, let's try more overlapping crosses.`,
          tacticalAdvice: "Adjust striker support & wing delivery.",
          rating: striker.rating,
        });
      }
    }

    // Midfielder Feedback
    if (midfielder) {
      const passAcc = this.stats.passAccuracy.home || 75;
      if (passAcc >= 80) {
        midfielder.tacticalMastery = Math.min(100, (midfielder.tacticalMastery || 75) + 1);
        feedbackList.push({
          playerId: midfielder.id,
          playerName: midfielder.name,
          playerRole: midfielder.role,
          type: "encourage",
          message: isHalfTime
            ? `Our midfield passing triangles are controlling the tempo nicely. We've got their midfield chasing shadows.`
            : `Great tactical structure! Our passing accuracy stayed high and we dictated possession (+1% Tactical Mastery).`,
          tacticalAdvice: "Keep dictating tempo with short crisp build-up.",
          rating: midfielder.rating,
        });
      } else {
        feedbackList.push({
          playerId: midfielder.id,
          playerName: midfielder.name,
          playerRole: midfielder.role,
          type: "challenge",
          message: isHalfTime
            ? `Boss, they are pressing our midfield aggressively. We're turning the ball over too easily in transition.`
            : `We got caught in the midfield press too often. We need quicker one-touch release to beat the counter-press.`,
          tacticalAdvice: "Increase pass support & lower turnover risk.",
          rating: midfielder.rating,
        });
      }
    }

    // Defender Feedback
    if (defender) {
      const goalsConceded = this.score.away;
      if (goalsConceded === 0) {
        defender.tacticalMastery = Math.min(100, (defender.tacticalMastery || 75) + 1);
        feedbackList.push({
          playerId: defender.id,
          playerName: defender.name,
          playerRole: defender.role,
          type: "encourage",
          message: isHalfTime
            ? `Rock solid backline so far! Our defensive line is holding strong and squeezing their forwards.`
            : `Clean sheet secured! The defensive discipline and slide tackles completely shut down their front line (+1% Tactical Mastery).`,
          tacticalAdvice: "Preserve compact defensive line.",
          rating: defender.rating,
        });
      } else {
        feedbackList.push({
          playerId: defender.id,
          playerName: defender.name,
          playerRole: defender.role,
          type: "challenge",
          message: isHalfTime
            ? `We got caught flat-footed on their counter-attack. When our fullbacks push high, we need the CDM to drop between center-backs!`
            : `Conceding those goals hurt. We must communicate better when runners break into the box.`,
          tacticalAdvice: "Ensure defensive pivot covers fullback overlaps.",
          rating: defender.rating,
        });
      }
    }

    this.playerFeedback = feedbackList;
    return feedbackList;
  }

  tick() {
    if (this.phase === "fulltime" || this.phase === "halftime") return;

    if (this.phase === "goal") {
      this.celebrationTimer--;
      if (this.celebrationTimer <= 0) {
        this.resetToKickoff(this.kickoffTeam);
      }
      return;
    }

    this.elapsedSeconds += (1 / this.tickRate) * this.matchPace;

    // Half-Time Pause at 45:00
    if (this.currentHalf === 1 && !this.halfTimeTriggered && this.elapsedSeconds >= this.matchDuration / 2) {
      this.phase = "halftime";
      this.halfTimeTriggered = true;
      this.elapsedSeconds = this.matchDuration / 2;
      this.generatePlayerFeedback(true);
      this.addEvent("⏸️ Half-Time Whistle! Teams head into the tunnel for dressing room team talks.", "whistle");
      return;
    }

    if (this.elapsedSeconds >= this.matchDuration) {
      this.phase = "fulltime";
      this.generatePostMatchSummary();
      this.generatePlayerFeedback(false);
      this.addEvent("Final Whistle! What an extraordinary match!", "whistle");
      return;
    }

    // Update dynamic crowd atmosphere
    this.updateCrowdAtmosphere();

    // Autonomous player cognition stream (triggers every 3-5 seconds)
    this.autonomousThoughtTimer = (this.autonomousThoughtTimer || 60) - 1;
    if (this.autonomousThoughtTimer <= 0) {
      this.autonomousThoughtTimer = Math.floor(75 + Math.random() * 60);
      this.triggerAutonomousPlayerThought();
    }

    // Update player cooldowns
    this.players.forEach((p) => {
      if (p.cooldowns.pass > 0) p.cooldowns.pass--;
      if (p.cooldowns.tackle > 0) p.cooldowns.tackle--;
      if (p.cooldowns.shot > 0) p.cooldowns.shot--;
    });

    // Update ball physics
    this.updateBall();

    // Update team possession stats
    if (this.ball.possessorId) {
      const possessor = this.players.find((p) => p.id === this.ball.possessorId);
      if (possessor) {
        this.stats.possessionTicks[possessor.team]++;
      }
    }
    const totalPoss = this.stats.possessionTicks.home + this.stats.possessionTicks.away;
    if (totalPoss > 0) {
      this.stats.possession.home = Math.round((this.stats.possessionTicks.home / totalPoss) * 100);
      this.stats.possession.away = 100 - this.stats.possession.home;
    }

    // Agent decision loop
    this.updateAgentDecisions();

    // Move players
    this.updatePlayerMovement();

    // Check goal condition
    this.checkGoalCollision();
  }

  updateBall() {
    const ball = this.ball;

    if (ball.possessorId) {
      const carrier = this.players.find((p) => p.id === ball.possessorId);
      if (carrier) {
        const offsetDist = 14;
        const isAttackingRight = (carrier.team === "home" && this.currentHalf === 1) || (carrier.team === "away" && this.currentHalf === 2);
        const attackDir = isAttackingRight ? 1 : -1;
        ball.x = carrier.x + (carrier.vx !== 0 ? Math.sign(carrier.vx) * offsetDist : attackDir * offsetDist);
        ball.y = carrier.y + (carrier.vy !== 0 ? Math.sign(carrier.vy) * 8 : 0);
        ball.vx = carrier.vx;
        ball.vy = carrier.vy;
        ball.speed = Math.hypot(ball.vx, ball.vy);
        return;
      } else {
        ball.possessorId = null;
      }
    }

    // Free ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Grass friction
    ball.vx *= 0.972;
    ball.vy *= 0.972;
    ball.speed = Math.hypot(ball.vx, ball.vy);

    if (ball.speed < 0.2) {
      ball.vx = 0;
      ball.vy = 0;
      ball.isShot = false;
    }

    // Out of bounds / bounce on top and bottom sidelines
    if (ball.y <= ball.radius) {
      ball.y = ball.radius;
      ball.vy *= -0.7;
    } else if (ball.y >= this.height - ball.radius) {
      ball.y = this.height - ball.radius;
      ball.vy *= -0.7;
    }

    // Goal line rebounds outside goalmouth
    if (ball.x <= ball.radius) {
      if (ball.y < this.goalYMin || ball.y > this.goalYMax) {
        ball.x = ball.radius;
        ball.vx *= -0.7;
      }
    } else if (ball.x >= this.width - ball.radius) {
      if (ball.y < this.goalYMin || ball.y > this.goalYMax) {
        ball.x = this.width - ball.radius;
        ball.vx *= -0.7;
      }
    }
  }

  updateAgentDecisions() {
    const ball = this.ball;
    const possessor = ball.possessorId ? this.players.find((p) => p.id === ball.possessorId) : null;

    this.players.forEach((player) => {
      const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
      const targetGoalX = isAttackingRight ? this.width : 0;
      const ownGoalX = isAttackingRight ? 0 : this.width;
      const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);

      // 1. Player is in possession of the ball
      if (player.id === ball.possessorId) {
        this.handlePossessorLogic(player, targetGoalX);
        return;
      }

      // 2. Loose ball pick up
      if (!ball.possessorId && distToBall < 18 && ball.speed < 12) {
        if (ball.passSenderTeam) {
          if (ball.passSenderTeam === player.team) {
            this.stats.passesCompleted[player.team]++;
            const passer = this.players.find((p) => p.id === ball.lastPasserId);
            if (passer) {
              passer.passes = (passer.passes || 0) + 1;
              this.updatePlayerRating(passer, 0.05);
            }
          } else {
            this.stats.interceptions[player.team]++;
            player.tackles = (player.tackles || 0) + 1;
            this.updatePlayerRating(player, 0.25);
          }
          ball.passSenderTeam = null;
          ball.passTargetPlayerId = null;
          this.recalcAccuracies();
        }
        ball.possessorId = player.id;
        ball.lastPossessorId = player.id;
        ball.lastTeam = player.team;
        ball.isShot = false;
        player.state = "dribble";
        this.setThought(player, "Secured the loose ball!");
        return;
      }

      // 3. Goalkeeper positioning logic
      if (player.role === "GK") {
        this.handleGoalkeeperLogic(player, ownGoalX, ball);
        return;
      }

      // 4. Outfield team-in-possession (Supporting run / spreading wide)
      if (possessor && possessor.team === player.team) {
        this.handleAttackingSupport(player, possessor);
        return;
      }

      // 5. Outfield defending / pressing logic
      this.handleDefendingLogic(player, ball, possessor);
    });
  }

  handlePossessorLogic(player, targetGoalX) {
    const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
    const distToGoal = Math.abs(targetGoalX - player.x);
    const distYToCenter = Math.abs(player.y - this.goalCenterY);
    const shotBias = player.tactic.shotBias;
    const shotGreedThreshold = 300 + (shotBias - 0.5) * 160;

    // A. SHOOTING TRIGGER
    if (distToGoal < shotGreedThreshold && player.cooldowns.shot === 0) {
      const shotProb = distToGoal < 180 ? 0.75 : 0.45 * shotBias;
      if (Math.random() < shotProb) {
        this.executeShot(player, targetGoalX);
        return;
      }
    }

    // B. PASSING TRIGGER
    if (player.cooldowns.pass === 0) {
      const bestTeammate = this.findBestPassOption(player, targetGoalX);
      if (bestTeammate && Math.random() < (0.35 + player.tactic.passBias * 0.45)) {
        this.executePass(player, bestTeammate);
        return;
      }
    }

    // C. DRIBBLE TOWARD GOAL
    player.state = "dribble";
    const flankBias = (player.tactic.roleKey === "mid1" ? -60 : player.tactic.roleKey === "mid2" ? 60 : 0) * (player.tactic.wingPlayBias || 0.5);
    player.targetX = player.x + (isAttackingRight ? 70 : -70);
    player.targetY = Math.max(80, Math.min(this.height - 80, player.y + flankBias + (Math.random() * 20 - 10)));
  }

  executeShot(player, targetGoalX) {
    const isHome = player.team === "home";
    const ball = this.ball;
    const distToGoal = Math.abs(targetGoalX - player.x);

    // Aim toward top corner or bottom corner
    const targetCornerY = Math.random() > 0.5 ? this.goalYMin + 20 : this.goalYMax - 20;
    const dx = targetGoalX - player.x;
    const dy = targetCornerY - player.y;
    const dist = Math.hypot(dx, dy);

    const shotSpeed = 22 + Math.random() * 6;
    ball.possessorId = null;
    ball.isShot = true;
    ball.lastTeam = player.team;
    ball.vx = (dx / dist) * shotSpeed;
    ball.vy = (dy / dist) * shotSpeed;

    player.state = "shoot";
    player.cooldowns.shot = 40;
    player.cooldowns.pass = 30;

    // Expected goals calculation
    const calcXg = Math.max(0.04, Math.min(0.85, (1 - distToGoal / 500) * 0.7));
    this.stats.shots[player.team]++;
    this.stats.shotsOnTarget[player.team]++;
    this.stats.xG[player.team] = +(this.stats.xG[player.team] + calcXg).toFixed(2);
    player.shots = (player.shots || 0) + 1;
    this.updatePlayerRating(player, 0.15);
    ball.passSenderTeam = null;
    ball.passTargetPlayerId = null;
    this.recalcAccuracies();

    const thoughts = [
      `Hammering shot toward corner! (xG ${calcXg.toFixed(2)})`,
      `Saw the opening, testing the keeper!`,
      `Shooting on sight!`,
    ];
    this.setThought(player, thoughts[Math.floor(Math.random() * thoughts.length)]);
    this.addEvent(`${player.name} unleashes a venomous shot!`, "shot", player);
  }

  findBestPassOption(player, targetGoalX) {
    const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
    const teammates = this.players.filter((p) => p.team === player.team && p.id !== player.id);

    let bestScore = -999;
    let bestTeammate = null;

    teammates.forEach((tm) => {
      const dist = Math.hypot(tm.x - player.x, tm.y - player.y);
      if (dist < 50 || dist > 420) return;

      const forwardProgress = isAttackingRight ? tm.x - player.x : player.x - tm.x;
      const goalProximity = 1000 - Math.abs(targetGoalX - tm.x);

      // Check for opposing interceptors along lane
      let interceptionDanger = 0;
      this.players
        .filter((opp) => opp.team !== player.team)
        .forEach((opp) => {
          const oppDist = Math.hypot(opp.x - (player.x + tm.x) / 2, opp.y - (player.y + tm.y) / 2);
          if (oppDist < 45) interceptionDanger += 200;
        });

      const score = forwardProgress * 2.2 + goalProximity * 0.4 - interceptionDanger - dist * 0.2;
      if (score > bestScore) {
        bestScore = score;
        bestTeammate = tm;
      }
    });

    return bestTeammate;
  }

  executePass(player, targetPlayer) {
    const ball = this.ball;
    const dx = targetPlayer.x - player.x;
    const dy = targetPlayer.y - player.y;
    const dist = Math.hypot(dx, dy);

    const passSpeed = Math.min(18, Math.max(12, dist * 0.065));
    ball.possessorId = null;
    ball.isShot = false;
    ball.lastTeam = player.team;
    ball.lastPasserId = player.id;
    ball.passSenderTeam = player.team;
    ball.passTargetPlayerId = targetPlayer.id;
    ball.vx = (dx / dist) * passSpeed;
    ball.vy = (dy / dist) * passSpeed;

    player.state = "pass";
    player.cooldowns.pass = 25;
    this.stats.passes[player.team]++;
    this.stats.passesAttempted[player.team]++;
    this.recalcAccuracies();

    this.setThought(player, `Threading pass to ${targetPlayer.name}`);
  }

  handleGoalkeeperLogic(player, ownGoalX, ball) {
    const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
    // GK defends their own goal
    const goalLineX = isAttackingRight ? 45 : 955;
    const inPenaltyBox = isAttackingRight ? ball.x < 180 : ball.x > 820;

    // Sweeper Keeper behavior: rushes out to clear loose ball in box
    if (player.tactic.sweeperKeeper && inPenaltyBox && !ball.possessorId) {
      player.targetX = ball.x;
      player.targetY = ball.y;
      this.setThought(player, "Sweeping out to smother loose ball!");
      return;
    }

    // Default positioning: guard goal mouth along arc
    player.targetX = goalLineX;
    // Track ball Y but clamp within goal posts with small padding
    player.targetY = Math.max(this.goalYMin - 15, Math.min(this.goalYMax + 15, ball.y));

    // Shot blocking
    const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
    if (ball.isShot && distToBall < 55) {
      const saveProb = player.stamina > 30 ? 0.72 : 0.5;
      if (Math.random() < saveProb) {
        ball.vx = (isAttackingRight ? 1 : -1) * (8 + Math.random() * 4);
        ball.vy = (Math.random() - 0.5) * 12;
        ball.isShot = false;
        player.state = "save";
        this.stats.saves[player.team]++;
        player.saves = (player.saves || 0) + 1;
        this.updatePlayerRating(player, 0.6);
        this.setThought(player, "Spectacular reflex save!");
        this.addEvent(`${player.name} pulls off a heroic save!`, "save", player);
      }
    }
  }

  handleAttackingSupport(player, possessor) {
    const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
    const anchors = this.getFormationAnchors(player.team, player.team === "home" ? this.homeTeam.formation : this.awayTeam.formation);
    const anchorIdx = (typeof player.slotIndex === "number" && player.slotIndex >= 0)
      ? (player.slotIndex % anchors.length)
      : (player.number >= 1 && player.number <= anchors.length ? player.number - 1 : 0);
    const defaultX = isAttackingRight ? 400 : 600;
    const anchor = anchors[anchorIdx] || anchors[0] || { x: defaultX, y: 320 };

    // Push upfield according to attack flow
    const attackDir = isAttackingRight ? 1 : -1;
    const pushOffset = (possessor.x - 500) * 0.45;

    player.targetX = Math.max(100, Math.min(900, anchor.x + pushOffset * attackDir));
    player.targetY = anchor.y + Math.sin(this.elapsedSeconds * 2 + (player.slotIndex ?? player.number)) * 25;
    player.state = "running";
  }

  handleDefendingLogic(player, ball, possessor) {
    const isAttackingRight = (player.team === "home" && this.currentHalf === 1) || (player.team === "away" && this.currentHalf === 2);
    const distToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
    const pressAggression = player.tactic.pressBias || 0.6;

    // Tackle attempt
    if (possessor && possessor.team !== player.team && distToBall < 24 && player.cooldowns.tackle === 0) {
      this.stats.tacklesAttempted[player.team]++;
      const tackleProb = 0.45 + (player.tactic.tackleBias || 0.5) * 0.35;
      if (Math.random() < tackleProb) {
        ball.possessorId = player.id;
        ball.lastTeam = player.team;
        ball.passSenderTeam = null;
        ball.passTargetPlayerId = null;
        player.cooldowns.tackle = 35;
        possessor.cooldowns.tackle = 25;
        this.stats.tackles[player.team]++;
        this.stats.tacklesWon[player.team]++;
        player.tackles = (player.tackles || 0) + 1;
        this.updatePlayerRating(player, 0.3);

        possessor.dispossessions = (possessor.dispossessions || 0) + 1;
        possessor.health = Math.max(45, possessor.health - 0.4);
        this.updatePlayerRating(possessor, -0.15);

        this.recalcAccuracies();
        this.setThought(player, "Crunching tackle! Won the ball back!");
        this.addEvent(`${player.name} dispossesses ${possessor.name} with a crisp tackle!`, "tackle", player);
        return;
      } else {
        this.recalcAccuracies();
      }
    }

    // Nearest outfield player actively presses the ball carrier
    const teammates = this.players.filter((p) => p.team === player.team && p.role !== "GK");
    const nearestTeammate = teammates.reduce((prev, curr) => {
      const d1 = Math.hypot(prev.x - ball.x, prev.y - ball.y);
      const d2 = Math.hypot(curr.x - ball.x, curr.y - ball.y);
      return d1 < d2 ? prev : curr;
    }, teammates[0]);

    if (player.id === nearestTeammate.id && (pressAggression > 0.4 || distToBall < 250)) {
      player.targetX = ball.x;
      player.targetY = ball.y;
      player.state = "press";
      if (Math.random() < 0.03) {
        this.setThought(player, "Pressing the ball carrier hard!");
      }
      return;
    }

    // Maintain defensive shape
    const anchors = this.getFormationAnchors(player.team, player.team === "home" ? this.homeTeam.formation : this.awayTeam.formation);
    const anchorIdx = (typeof player.slotIndex === "number" && player.slotIndex >= 0)
      ? (player.slotIndex % anchors.length)
      : (player.number >= 1 && player.number <= anchors.length ? player.number - 1 : 0);
    const defaultX = isAttackingRight ? 250 : 750;
    const anchor = anchors[anchorIdx] || anchors[0] || { x: defaultX, y: 320 };
    const defensiveLine = player.tactic.positionalDiscipline || 0.7;

    const pullBack = isAttackingRight ? (ball.x - 500) * 0.35 : (500 - ball.x) * 0.35;
    player.targetX = Math.max(80, Math.min(920, anchor.x + (pullBack * (1 - defensiveLine * 0.5))));
    player.targetY = anchor.y;
    player.state = "idle";
  }

  updatePlayerMovement() {
    const isHomeVenue = this.venue === "home";
    const playerCount = this.players.length;

    // 1. Calculate desired velocities with smooth steering
    this.players.forEach((player) => {
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        let maxSpeed = player.speed * (player.stamina / 100);

        // Home crowd boost & away grit
        if (isHomeVenue && player.team === "home" && !this.crowdAtmosphere.homeExpectationPenalty) {
          maxSpeed *= 1.05; // Home crowd roar boost (+5%)
        } else if (isHomeVenue && player.team === "away") {
          maxSpeed *= 1.02; // Underdog counter grit
        }

        const desiredVx = (dx / dist) * Math.min(maxSpeed, dist * 0.5);
        const desiredVy = (dy / dist) * Math.min(maxSpeed, dist * 0.5);

        // Smooth velocity transition (natural steering & inertia)
        player.vx = (player.vx || 0) * 0.65 + desiredVx * 0.35;
        player.vy = (player.vy || 0) * 0.65 + desiredVy * 0.35;

        // Stamina & health decay (affected by crowd pressure)
        if (player.state === "press" || player.state === "shoot") {
          const drain = (isHomeVenue && player.team === "home" && this.crowdAtmosphere.homeExpectationPenalty)
            ? 0.055
            : 0.04;
          player.stamina = Math.max(25, player.stamina - drain);
          player.health = Math.max(50, player.health - 0.008);
        } else {
          player.stamina = Math.min(100, player.stamina + 0.02);
        }
      } else {
        player.vx = (player.vx || 0) * 0.4;
        player.vy = (player.vy || 0) * 0.4;
      }
    });

    // 2. Soft Player-to-Player Repulsion (prevents overlapping/stacking)
    const minDistance = 32; // Minimum spacing between players
    for (let i = 0; i < playerCount; i++) {
      for (let j = i + 1; j < playerCount; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];
        const sepX = p1.x - p2.x;
        const sepY = p1.y - p2.y;
        const sepDist = Math.hypot(sepX, sepY);

        if (sepDist > 0 && sepDist < minDistance) {
          const overlap = (minDistance - sepDist) * 0.18;
          const nx = sepX / sepDist;
          const ny = sepY / sepDist;

          p1.x += nx * overlap;
          p1.y += ny * overlap;
          p2.x -= nx * overlap;
          p2.y -= ny * overlap;
        }
      }
    }

    // 3. Integrate position & clamp within pitch boundaries
    this.players.forEach((player) => {
      player.x += player.vx;
      player.y += player.vy;

      player.x = Math.max(30, Math.min(this.width - 30, player.x));
      player.y = Math.max(30, Math.min(this.height - 30, player.y));
    });
  }

  checkGoalCollision() {
    const ball = this.ball;
    if (this.phase === "goal") return;

    // Ends swap between 1st and 2nd half
    const leftGoalScorer = this.currentHalf === 1 ? "away" : "home";
    const rightGoalScorer = this.currentHalf === 1 ? "home" : "away";

    // Check Left Goal (x <= 10)
    if (ball.x <= 10 && ball.y >= this.goalYMin && ball.y <= this.goalYMax) {
      this.triggerGoal(leftGoalScorer);
      return;
    }

    // Check Right Goal (x >= width - 10)
    if (ball.x >= this.width - 10 && ball.y >= this.goalYMin && ball.y <= this.goalYMax) {
      this.triggerGoal(rightGoalScorer);
      return;
    }
  }

  triggerGoal(scoringTeam) {
    this.phase = "goal";
    this.celebrationTimer = 90; // 3 seconds at 30 ticks
    this.score[scoringTeam]++;

    const scoringTeamName = scoringTeam === "home" ? this.homeTeam.teamName : this.awayTeam.teamName;
    const scorer = this.players.find((p) => p.id === this.ball.lastPossessorId) || { name: "Striker" };
    if (scorer && scorer.id) {
      scorer.goals = (scorer.goals || 0) + 1;
      this.updatePlayerRating(scorer, 1.2);
    }

    // Check assist
    if (this.ball.lastPasserId && this.ball.lastPasserId !== (scorer && scorer.id)) {
      const assister = this.players.find((p) => p.id === this.ball.lastPasserId);
      if (assister && assister.team === scoringTeam) {
        assister.assists = (assister.assists || 0) + 1;
        this.updatePlayerRating(assister, 0.7);
        this.addEvent(`👟 Superb assist by ${assister.name}!`, "assist", assister);
      }
    }

    // Adjust ratings for conceding team
    const concedingTeam = scoringTeam === "home" ? "away" : "home";
    this.players.forEach((p) => {
      if (p.team === concedingTeam) {
        if (p.role === "GK") this.updatePlayerRating(p, -0.4);
        else if (p.role === "CB" || p.role === "RB" || p.role === "LB" || p.role === "RWB" || p.role === "LWB") {
          this.updatePlayerRating(p, -0.2);
        }
      }
    });

    this.addEvent(`GOOOAAALLL! ${scorer.name} strikes for ${scoringTeamName}! [${this.score.home} - ${this.score.away}]`, "goal", scorer);

    // Trigger celebration state for team
    this.players.forEach((p) => {
      if (p.team === scoringTeam) {
        p.state = "celebrating";
        this.setThought(p, "YESSSS! GOALLLL!");
      }
    });

    this.kickoffTeam = scoringTeam === "home" ? "away" : "home";
  }

  getStateSnapshot() {
    return {
      phase: this.phase,
      currentHalf: this.currentHalf,
      elapsedSeconds: Math.floor(this.elapsedSeconds),
      matchDuration: this.matchDuration,
      matchPace: this.matchPace,
      venue: this.venue,
      crowdAtmosphere: this.crowdAtmosphere,
      playerFeedback: this.playerFeedback,
      fanFeedback: this.fanFeedback,
      chairpersonFeedback: this.chairpersonFeedback,
      score: this.score,
      subsRemaining: this.subsRemaining,
      benchSubs: this.benchSubs,
      postMatchSummary: this.postMatchSummary,
      stats: { ...this.stats },
      ball: {
        x: Math.round(this.ball.x),
        y: Math.round(this.ball.y),
        vx: +this.ball.vx.toFixed(2),
        vy: +this.ball.vy.toFixed(2),
        speed: +this.ball.speed.toFixed(2),
        isShot: this.ball.isShot,
        possessorId: this.ball.possessorId,
      },
      players: this.players.map((p) => ({
        id: p.id,
        number: p.number,
        team: p.team,
        name: p.name,
        role: p.role,
        roleKey: p.roleKey,
        x: Math.round(p.x),
        y: Math.round(p.y),
        vx: +p.vx.toFixed(2),
        vy: +p.vy.toFixed(2),
        state: p.state,
        stamina: Math.round(p.stamina),
        health: Math.round(p.health || 100),
        rating: p.rating || 6.0,
        impact: p.impact || "med",
        transferValue: p.transferValue || 8.0,
        tier: p.tier || 2,
        promptCapability: p.promptCapability || "Solid Starter",
        isYouth: !!p.isYouth,
        tacticalMastery: p.tacticalMastery || 75,
        goals: p.goals || 0,
        assists: p.assists || 0,
        passes: p.passes || 0,
        tackles: p.tackles || 0,
        shots: p.shots || 0,
        saves: p.saves || 0,
        dispossessions: p.dispossessions || 0,
        subbedOut: p.subbedOut || false,
        thought: p.thought,
      })),
      activeThought: this.activeThought,
      latestEvent: this.events[0] || null,
      events: this.events.slice(0, 30),
      homeTeam: {
        name: this.homeTeam.teamName,
        color: this.homeTeam.color,
        secondaryColor: this.homeTeam.secondaryColor,
        formation: this.homeTeam.formation,
      },
      awayTeam: {
        name: this.awayTeam.teamName,
        color: this.awayTeam.color,
        secondaryColor: this.awayTeam.secondaryColor,
        formation: this.awayTeam.formation,
      },
    };
  }
}
