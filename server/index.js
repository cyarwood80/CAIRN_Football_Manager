// server/index.js
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { compileTeamTactics, DEFAULT_TACTICAL_PROFILES } from "./engine/TacticsCompiler.js";
import { PitchEngine } from "./engine/PitchEngine.js";
import {
  getAllCmClubs,
  getClubsByTier,
  getTiersInfo,
  getRealClubRoster,
  getRandomDraftSquad,
  getTransferMarketListings,
  getFilteredTransferTargets,
  generateYouthPlayer,
  calculateSquadHarmony,
  updatePlayerValuationAfterMatch,
  evaluatePlayerEvolution,
} from "./engine/cmDatabase.js";
import {
  getCurrentCalendarState,
  advanceCalendarDay,
  advanceToNextMatchday,
  incrementGameweek,
  setCalendarActiveTier,
  getUpcomingSchedule,
} from "./engine/calendarEngine.js";
import { evaluateSeasonConclusion } from "./engine/promotionEngine.js";
import {
  getInstalledModels,
  setActiveModel,
  getActiveModel,
  getTelemetryLogs,
  generatePlayerChatReply,
  generateAssistantManagerBriefing,
  evaluatePromptTraitResonance,
} from "./services/llmService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend when built
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// In-memory Room State
const rooms = new Map();

// --- Championship 4-Tier Pyramid & Standings ---
let userActiveTier = "tier_4"; // Manager starts in lowest grassroots tier: National League
const tierStandings = {};
const tierFixtures = {};
let matchHistory = [];
let currentGameweek = 1;

function generateTierFixtures(clubs, tierKey) {
  const n = clubs.length;
  if (n < 2) return [];
  const fixtures = [];
  const teams = [...clubs];
  let fixtureId = 1;

  for (let round = 1; round < n; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      fixtures.push({
        id: `${tierKey}_fix_${fixtureId++}`,
        tier: tierKey,
        gameweek: round,
        homeTeam: i % 2 === 0 ? home.name : away.name,
        awayTeam: i % 2 === 0 ? away.name : home.name,
        homeColor: i % 2 === 0 ? home.color : away.color,
        awayColor: i % 2 === 0 ? away.color : home.color,
        played: false,
        homeScore: null,
        awayScore: null,
      });
    }
    teams.splice(1, 0, teams.pop());
  }
  return fixtures;
}

function initTierLeagues() {
  const tierKeys = ["tier_1", "tier_2", "tier_3", "tier_4"];
  tierKeys.forEach((tKey) => {
    const clubs = getClubsByTier(tKey);
    tierStandings[tKey] = clubs.map((c, idx) => ({
      id: c.id,
      name: c.name,
      shortName: c.shortName || c.name.slice(0, 3).toUpperCase(),
      color: c.color || "#00f2fe",
      secondaryColor: c.secondaryColor || "#0A192F",
      tier: tKey,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
      form: [],
      prevRank: idx + 1,
      currentRank: idx + 1,
    }));
    tierFixtures[tKey] = generateTierFixtures(tierStandings[tKey], tKey);
  });
}

initTierLeagues();

function sortStandings(tierKey) {
  const list = tierStandings[tierKey];
  if (!list) return;
  list.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
  list.forEach((team, index) => {
    team.prevRank = team.currentRank || index + 1;
    team.currentRank = index + 1;
  });
}

function findClubInTier(name, tierKey) {
  const list = tierStandings[tierKey] || [];
  return list.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

function recordLeagueMatch(homeName, awayName, homeGoals, awayGoals, targetTier = userActiveTier) {
  let home = findClubInTier(homeName, targetTier);
  let away = findClubInTier(awayName, targetTier);

  // If user played with custom club not in default tier list, add or adapt
  if (!home) {
    home = {
      id: homeName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: homeName,
      color: "#00E5FF",
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
      form: [], prevRank: (tierStandings[targetTier]?.length || 0) + 1, currentRank: (tierStandings[targetTier]?.length || 0) + 1,
    };
    if (tierStandings[targetTier]) tierStandings[targetTier].push(home);
  }
  if (!away) {
    away = {
      id: awayName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: awayName,
      color: "#FF3366",
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
      form: [], prevRank: (tierStandings[targetTier]?.length || 0) + 1, currentRank: (tierStandings[targetTier]?.length || 0) + 1,
    };
    if (tierStandings[targetTier]) tierStandings[targetTier].push(away);
  }

  home.played++;
  away.played++;
  home.gf += homeGoals;
  home.ga += awayGoals;
  home.gd = home.gf - home.ga;
  away.gf += awayGoals;
  away.ga += homeGoals;
  away.gd = away.gf - away.ga;

  if (homeGoals > awayGoals) {
    home.won++;
    home.pts += 3;
    home.form = ["W", ...home.form].slice(0, 5);
    away.lost++;
    away.form = ["L", ...away.form].slice(0, 5);
  } else if (homeGoals < awayGoals) {
    away.won++;
    away.pts += 3;
    away.form = ["W", ...away.form].slice(0, 5);
    home.lost++;
    home.form = ["L", ...home.form].slice(0, 5);
  } else {
    home.drawn++;
    home.pts += 1;
    home.form = ["D", ...home.form].slice(0, 5);
    away.drawn++;
    away.pts += 1;
    away.form = ["D", ...away.form].slice(0, 5);
  }

  // 1. Lock fixture in target tier
  const fixtures = tierFixtures[targetTier] || [];
  const gwFixtures = fixtures.filter((f) => f.gameweek === currentGameweek);
  let playedFix = gwFixtures.find(
    (f) =>
      (f.homeTeam.toLowerCase() === homeName.toLowerCase() && f.awayTeam.toLowerCase() === awayName.toLowerCase()) ||
      (f.homeTeam.toLowerCase() === awayName.toLowerCase() && f.awayTeam.toLowerCase() === homeName.toLowerCase())
  );
  if (playedFix) {
    playedFix.played = true;
    playedFix.homeScore = playedFix.homeTeam.toLowerCase() === homeName.toLowerCase() ? homeGoals : awayGoals;
    playedFix.awayScore = playedFix.homeTeam.toLowerCase() === homeName.toLowerCase() ? awayGoals : homeGoals;
  }

  // 2. Simulate remaining fixtures for all tiers in this gameweek
  Object.keys(tierFixtures).forEach((tKey) => {
    const tFixes = (tierFixtures[tKey] || []).filter((f) => f.gameweek === currentGameweek);
    tFixes.forEach((fix) => {
      if (!fix.played) {
        const g1 = Math.floor(Math.random() * 4);
        const g2 = Math.floor(Math.random() * 4);
        fix.played = true;
        fix.homeScore = g1;
        fix.awayScore = g2;

        const c1 = findClubInTier(fix.homeTeam, tKey);
        const c2 = findClubInTier(fix.awayTeam, tKey);
        if (c1 && c2) {
          c1.played++;
          c2.played++;
          c1.gf += g1;
          c1.ga += g2;
          c1.gd = c1.gf - c1.ga;
          c2.gf += g2;
          c2.ga += g1;
          c2.gd = c2.gf - c2.ga;

          if (g1 > g2) {
            c1.won++;
            c1.pts += 3;
            c1.form = ["W", ...c1.form].slice(0, 5);
            c2.lost++;
            c2.form = ["L", ...c2.form].slice(0, 5);
          } else if (g1 < g2) {
            c2.won++;
            c2.pts += 3;
            c2.form = ["W", ...c2.form].slice(0, 5);
            c1.lost++;
            c1.form = ["L", ...c1.form].slice(0, 5);
          } else {
            c1.drawn++;
            c1.pts += 1;
            c1.form = ["D", ...c1.form].slice(0, 5);
            c2.drawn++;
            c2.pts += 1;
            c2.form = ["D", ...c2.form].slice(0, 5);
          }
        }
      }
    });
    sortStandings(tKey);
  });

  matchHistory.unshift({
    id: `${Date.now()}`,
    gameweek: currentGameweek,
    home: homeName,
    away: awayName,
    score: `${homeGoals} - ${awayGoals}`,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  currentGameweek = incrementGameweek();
}

function resetAllTierLeagues() {
  initTierLeagues();
  matchHistory = [];
  currentGameweek = 1;
}

// Helper to generate room code
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CUP-${code}`;
}

// REST Endpoints
app.get("/api/presets", (req, res) => {
  res.json({ presets: Object.values(DEFAULT_TACTICAL_PROFILES) });
});

app.get("/api/cm/tiers", (req, res) => {
  res.json({ tiers: getTiersInfo(), activeTier: userActiveTier });
});

app.get("/api/cm/clubs", (req, res) => {
  const tier = req.query.tier || null;
  res.json({ clubs: getAllCmClubs(tier) });
});

app.get("/api/cm/market", (req, res) => {
  const tier = req.query.tier || null;
  const userTier = req.query.userTier || userActiveTier;
  const role = req.query.role || "ALL";
  const realisticOnly = req.query.realisticOnly === "true";
  const freeAgentsOnly = req.query.freeAgentsOnly === "true";
  const search = req.query.search || "";

  const market = getFilteredTransferTargets(userTier, {
    tier,
    role,
    realisticOnly,
    freeAgentsOnly,
    search,
  });
  res.json({ market, userActiveTier });
});

app.post("/api/cm/buy-player", (req, res) => {
  const { player, userTier } = req.body || {};
  if (!player) return res.status(400).json({ error: "Missing player" });

  const userT = userTier || userActiveTier;
  const targetTierNum = player.tier || 4;
  const userTierNum = userT === "tier_1" ? 1 : userT === "tier_2" ? 2 : userT === "tier_3" ? 3 : 4;

  if (!player.isFreeAgent && userTierNum - targetTierNum >= 2) {
    return res.status(403).json({
      success: false,
      reason: `Negotiations broken down: ${player.name} refuses to play in the ${userT === "tier_4" ? "National League" : "lower tiers"}.`,
    });
  }

  res.json({
    success: true,
    player,
    message: `Contract terms agreed! ${player.name} signs on!`,
  });
});

app.post("/api/staff/assistant-directive", async (req, res) => {
  const { directive, teamConfig, gameState, activeTier } = req.body || {};
  const briefing = await generateAssistantManagerBriefing(
    directive,
    teamConfig,
    gameState,
    activeTier || userActiveTier
  );
  res.json({ briefing });
});

app.post("/api/ai/analyze-prompt", (req, res) => {
  const { prompt, squad } = req.body || {};
  const analysis = evaluatePromptTraitResonance(prompt, squad || []);
  res.json(analysis);
});

app.get("/api/cm/draft", (req, res) => {
  const name = req.query.name || "Draft Grassroots FC";
  const tier = req.query.tier || "tier_4";
  const draft = getRandomDraftSquad(name, tier);
  res.json({
    squad: draft,
    starting11: draft.starting11,
    benchSubs: draft.benchSubs,
    squadHarmony: draft.squadHarmony,
    totalSquadValue: draft.totalSquadValue,
  });
});

app.get("/api/cm/draft-squad", (req, res) => {
  const name = req.query.name || "Draft Grassroots FC";
  const tier = req.query.tier || "tier_4";
  const draft = getRandomDraftSquad(name, tier);
  res.json({
    ...draft,
    squad: draft,
  });
});


app.get("/api/calendar", (req, res) => {
  res.json({
    calendar: getCurrentCalendarState(),
    schedule: getUpcomingSchedule(),
  });
});

app.post("/api/calendar/advance", (req, res) => {
  const { managerPrompt, squad } = req.body || {};
  const state = advanceCalendarDay(managerPrompt, squad);
  res.json({
    calendar: state,
    schedule: getUpcomingSchedule(),
  });
});

app.post("/api/calendar/advance-matchday", (req, res) => {
  const { managerPrompt, squad } = req.body || {};
  const state = advanceToNextMatchday(managerPrompt, squad);
  res.json({
    calendar: state,
    schedule: getUpcomingSchedule(),
  });
});

app.get("/api/fixtures", (req, res) => {
  const tier = req.query.tier || userActiveTier;
  res.json({
    gameweek: currentGameweek,
    fixtures: tierFixtures[tier] || [],
  });
});

app.get("/api/league", (req, res) => {
  const tier = req.query.tier || userActiveTier;
  res.json({
    tier,
    activeTier: userActiveTier,
    standings: tierStandings[tier] || [],
    gameweek: currentGameweek,
    recentMatches: matchHistory.slice(0, 15),
    fixtures: tierFixtures[tier] || [],
    tiers: getTiersInfo(),
  });
});

app.post("/api/season/advance", (req, res) => {
  const { tier, userTeamId } = req.body || {};
  const t = tier || userActiveTier;
  const outcome = evaluateSeasonConclusion(tierStandings[t] || [], t, userTeamId);
  if (outcome.userOutcome.isUserPromoted) {
    userActiveTier = outcome.userOutcome.nextTier;
    setCalendarActiveTier(userActiveTier);
  } else if (outcome.userOutcome.isUserRelegated) {
    userActiveTier = outcome.userOutcome.nextTier;
    setCalendarActiveTier(userActiveTier);
  }
  res.json(outcome);
});

app.post("/api/player/train", (req, res) => {
  const { player, prompt, matchRating } = req.body || {};
  if (!player) return res.status(400).json({ error: "Missing player" });
  const evolved = evaluatePlayerEvolution(player, prompt, matchRating || 7.0);
  res.json({ player: evolved });
});

app.get("/api/rooms", (req, res) => {
  const roomList = Array.from(rooms.values()).map((r) => ({
    code: r.code,
    hostTeam: r.homeTeam?.teamName || "Open",
    guestTeam: r.awayTeam?.teamName || "Open",
    phase: r.engine ? r.engine.phase : "lobby",
    spectators: r.clients.size,
  }));
  res.json({ rooms: roomList });
});

// LLM Endpoints
app.get("/api/llm/models", async (req, res) => {
  const result = await getInstalledModels();
  res.json(result);
});

app.post("/api/llm/select", (req, res) => {
  const { model } = req.body || {};
  if (!model) return res.status(400).json({ error: "Missing model name" });
  const result = setActiveModel(model);
  res.json(result);
});

app.get("/api/llm/telemetry", (req, res) => {
  res.json({
    activeModel: getActiveModel(),
    logs: getTelemetryLogs(),
  });
});

// Fallback to index.html for client routing (Express 5 compatible)
app.use((req, res) => {
  if (req.accepts("html")) {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) {
        res.send("Agentic Football Cup Server is running! Run frontend in dev mode or build dist.");
      }
    });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastToRoom(room, messageObj) {
  const data = JSON.stringify(messageObj);
  room.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function broadcastAll(messageObj) {
  const data = JSON.stringify(messageObj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function startMatchInRoom(room) {
  if (room.interval) clearInterval(room.interval);

  const homeCompiled = compileTeamTactics(room.homeTeam || { name: "Home FC", color: "#00E5FF" });
  const awayCompiled = compileTeamTactics(room.awayTeam || { name: "Away FC", color: "#FF3D71" });

  room.engine = new PitchEngine(homeCompiled, awayCompiled, {
    duration: 180,
    pace: room.matchPace || 1.0,
    venue: room.venue || "home",
  });

  broadcastToRoom(room, {
    type: "MATCH_STARTED",
    homeTeam: homeCompiled,
    awayTeam: awayCompiled,
  });

  room.interval = setInterval(() => {
    if (!room.engine) return;

    try {
      room.engine.tick();
      const snapshot = room.engine.getStateSnapshot();

      broadcastToRoom(room, {
        type: "TICK",
        state: snapshot,
      });

      if (snapshot.phase === "fulltime") {
        clearInterval(room.interval);
        room.interval = null;

        recordLeagueMatch(snapshot.homeTeam.name, snapshot.awayTeam.name, snapshot.score.home, snapshot.score.away);

        broadcastToRoom(room, {
          type: "MATCH_ENDED",
          finalState: snapshot,
          postMatchSummary: snapshot.postMatchSummary,
          leagueStandings: tierStandings[userActiveTier] || [],
          fixtures: tierFixtures[userActiveTier] || [],
          gameweek: currentGameweek,
          matchHistory: matchHistory.slice(0, 10),
          activeTier: userActiveTier,
          tiers: getTiersInfo(),
        });

        broadcastAll({
          type: "LEAGUE_UPDATE",
          leagueStandings: tierStandings[userActiveTier] || [],
          fixtures: tierFixtures[userActiveTier] || [],
          gameweek: currentGameweek,
          matchHistory: matchHistory.slice(0, 10),
          activeTier: userActiveTier,
          tiers: getTiersInfo(),
        });
      }
    } catch (err) {
      console.error("Error during match engine tick:", err);
    }
  }, 1000 / 30);
}

wss.on("connection", (ws) => {
  let currentRoom = null;
  let clientRole = "spectator"; // 'host' | 'guest' | 'spectator'

  // Send current league standings & fixtures immediately upon connection
  ws.send(
    JSON.stringify({
      type: "LEAGUE_UPDATE",
      leagueStandings: tierStandings[userActiveTier] || [],
      fixtures: tierFixtures[userActiveTier] || [],
      gameweek: currentGameweek,
      matchHistory: matchHistory.slice(0, 10),
      activeTier: userActiveTier,
      tiers: getTiersInfo(),
    })
  );

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      switch (data.type) {
        case "CREATE_ROOM": {
          const code = generateRoomCode();
          const room = {
            code,
            hostWs: ws,
            guestWs: null,
            clients: new Set([ws]),
            homeTeam: data.teamConfig || { name: "Blue Strikers", color: "#00E5FF" },
            awayTeam: null,
            engine: null,
            interval: null,
          };
          rooms.set(code, room);
          currentRoom = room;
          clientRole = "host";

          ws.send(
            JSON.stringify({
              type: "ROOM_CREATED",
              roomCode: code,
              role: "host",
              roomState: {
                homeTeam: room.homeTeam,
                awayTeam: room.awayTeam,
              },
            })
          );
          break;
        }

        case "JOIN_ROOM": {
          const room = rooms.get(data.roomCode);
          if (!room) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Room not found!" }));
            return;
          }

          currentRoom = room;
          room.clients.add(ws);

          if (!room.guestWs && ws !== room.hostWs) {
            room.guestWs = ws;
            clientRole = "guest";
            if (data.teamConfig) room.awayTeam = data.teamConfig;
          } else {
            clientRole = "spectator";
          }

          ws.send(
            JSON.stringify({
              type: "ROOM_JOINED",
              roomCode: room.code,
              role: clientRole,
              roomState: {
                homeTeam: room.homeTeam,
                awayTeam: room.awayTeam,
                isLive: !!room.engine,
              },
            })
          );

          broadcastToRoom(room, {
            type: "LOBBY_UPDATE",
            roomState: {
              homeTeam: room.homeTeam,
              awayTeam: room.awayTeam,
              spectatorCount: room.clients.size,
            },
          });
          break;
        }

        case "UPDATE_TEAM": {
          if (!currentRoom) return;
          if (clientRole === "host") {
            currentRoom.homeTeam = data.teamConfig;
          } else if (clientRole === "guest") {
            currentRoom.awayTeam = data.teamConfig;
          }
          broadcastToRoom(currentRoom, {
            type: "LOBBY_UPDATE",
            roomState: {
              homeTeam: currentRoom.homeTeam,
              awayTeam: currentRoom.awayTeam,
            },
          });
          break;
        }

        case "START_SCRIMMAGE": {
          // Solo match against bot preset or authentic CM club
          const code = `SCRIM-${Math.floor(1000 + Math.random() * 9000)}`;
          let awayTeamConfig = null;

          if (data.opponentName) {
            const authentic = getRealClubRoster(data.opponentName);
            if (authentic) {
              awayTeamConfig = {
                name: authentic.name,
                color: authentic.color,
                secondaryColor: authentic.secondaryColor,
                formation: authentic.formation || "4-3-3",
                prompt: authentic.prompt || "High tempo attacking football with pressing intensity.",
                starting11: authentic.starting11,
                benchSubs: authentic.benchSubs,
              };
            }
          }

          if (!awayTeamConfig) {
            const botPreset = DEFAULT_TACTICAL_PROFILES[data.botPresetKey] || DEFAULT_TACTICAL_PROFILES.GEGENPRESS;
            awayTeamConfig = {
              name: botPreset.name,
              color: "#FF3366",
              secondaryColor: "#1A0510",
              formation: botPreset.formation,
              prompt: botPreset.prompt,
            };
          }

          const room = {
            code,
            hostWs: ws,
            guestWs: null,
            clients: new Set([ws]),
            homeTeam: data.userTeam || { name: "Player Club", color: "#00E5FF" },
            awayTeam: awayTeamConfig,
            venue: data.venue || "home",
            engine: null,
            interval: null,
          };
          rooms.set(code, room);
          currentRoom = room;
          clientRole = "host";

          ws.send(
            JSON.stringify({
              type: "ROOM_CREATED",
              roomCode: code,
              role: "host",
              isScrimmage: true,
              roomState: {
                homeTeam: room.homeTeam,
                awayTeam: room.awayTeam,
              },
            })
          );

          startMatchInRoom(room);
          break;
        }

        case "START_MATCH": {
          if (!currentRoom) return;
          if (!currentRoom.awayTeam) {
            // Assign default sparring team if no guest yet
            currentRoom.awayTeam = {
              name: "AI All-Stars",
              color: "#FF5722",
              formation: "4-3-3",
              prompt: "Fast direct counter attacks and long range shots",
            };
          }
          startMatchInRoom(currentRoom);
          break;
        }

        case "RESUME_SECOND_HALF": {
          if (!currentRoom || !currentRoom.engine) return;
          currentRoom.engine.resumeSecondHalf(data.homeTactics, data.awayTactics);
          broadcastToRoom(currentRoom, {
            type: "TICK",
            state: currentRoom.engine.getStateSnapshot(),
          });
          break;
        }

        case "MAKE_SUBSTITUTION": {
          if (!currentRoom || !currentRoom.engine) return;
          const team = clientRole === "guest" ? "away" : "home";
          const res = currentRoom.engine.executeSubstitution(team, data.subIndexOrId || data.subConfig, data.targetPlayerId);
          if (res.success) {
            broadcastToRoom(currentRoom, {
              type: "TICK",
              state: currentRoom.engine.getStateSnapshot(),
            });
            ws.send(JSON.stringify({ type: "SUB_CONFIRMED", subPlayer: res.subPlayer, outgoingPlayer: res.outgoingPlayer }));
          } else {
            ws.send(JSON.stringify({ type: "ERROR", message: res.reason }));
          }
          break;
        }

        case "AGENT_CHAT": {
          if (!currentRoom || !currentRoom.engine) return;
          const targetPlayer = currentRoom.engine.players.find((p) => p.id === data.playerId);
          const res = currentRoom.engine.executePlayerChatDirective(data.playerId, data.message);
          if (res.success) {
            // Immediate broadcast with tactical adjustment
            broadcastToRoom(currentRoom, {
              type: "AGENT_CHAT_REPLY",
              chat: res,
            });
            broadcastToRoom(currentRoom, {
              type: "TICK",
              state: currentRoom.engine.getStateSnapshot(),
            });

            // Asynchronously generate LLM reply using active local model
            if (targetPlayer) {
              generatePlayerChatReply(targetPlayer, data.message, currentRoom.engine.getStateSnapshot())
                .then((aiResult) => {
                  if (aiResult && aiResult.response) {
                    res.response = aiResult.response;
                    res.modelUsed = aiResult.modelUsed;
                    res.latencyMs = aiResult.latencyMs;
                    res.reasoningTrace = aiResult.reasoningTrace;
                    currentRoom.engine.setThought(targetPlayer, `Boss: "${data.message.slice(0, 20)}..." -> "${res.response}"`);
                    broadcastToRoom(currentRoom, {
                      type: "AGENT_CHAT_REPLY",
                      chat: res,
                    });
                    broadcastToRoom(currentRoom, {
                      type: "TICK",
                      state: currentRoom.engine.getStateSnapshot(),
                    });
                  }
                })
                .catch((err) => {
                  console.warn("LLM chat generation error:", err.message);
                });
            }
          } else {
            ws.send(JSON.stringify({ type: "ERROR", message: res.reason }));
          }
          break;
        }

        case "SET_MATCH_PACE": {
          if (!currentRoom) return;
          currentRoom.matchPace = data.pace;
          if (currentRoom.engine) {
            currentRoom.engine.setMatchPace(data.pace);
            broadcastToRoom(currentRoom, {
              type: "TICK",
              state: currentRoom.engine.getStateSnapshot(),
            });
          }
          break;
        }

        case "UPDATE_TACTICS_LIVE": {
          if (!currentRoom || !currentRoom.engine) return;
          const team = clientRole === "guest" ? "away" : "home";
          currentRoom.engine.applyLiveTacticalDirective(team, data.prompt, data.macroKey);
          broadcastToRoom(currentRoom, {
            type: "TICK",
            state: currentRoom.engine.getStateSnapshot(),
          });
          break;
        }

        case "GET_LEAGUE": {
          const reqTier = data.tier || userActiveTier;
          ws.send(
            JSON.stringify({
              type: "LEAGUE_UPDATE",
              leagueStandings: tierStandings[reqTier] || [],
              fixtures: tierFixtures[reqTier] || [],
              gameweek: currentGameweek,
              matchHistory: matchHistory.slice(0, 10),
              activeTier: userActiveTier,
              tier: reqTier,
              tiers: getTiersInfo(),
            })
          );
          break;
        }

        case "RESET_LEAGUE": {
          resetAllTierLeagues();
          broadcastAll({
            type: "LEAGUE_UPDATE",
            leagueStandings: tierStandings[userActiveTier] || [],
            fixtures: tierFixtures[userActiveTier] || [],
            gameweek: currentGameweek,
            matchHistory: matchHistory.slice(0, 10),
            activeTier: userActiveTier,
            tiers: getTiersInfo(),
          });
          break;
        }
      }
    } catch (err) {
      console.error("WS error:", err);
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      currentRoom.clients.delete(ws);
      if (ws === currentRoom.hostWs) currentRoom.hostWs = null;
      if (ws === currentRoom.guestWs) currentRoom.guestWs = null;

      if (currentRoom.clients.size === 0) {
        if (currentRoom.interval) clearInterval(currentRoom.interval);
        rooms.delete(currentRoom.code);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`⚽ Agentic Football Cup server listening on http://localhost:${PORT}`);
});
