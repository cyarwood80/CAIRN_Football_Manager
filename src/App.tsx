// src/App.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Trophy,
  Calendar,
  FastForward,
  Swords,
  X,
} from "lucide-react";
import { PitchCanvas } from "./components/PitchCanvas";
import { TeamBuilder } from "./components/TeamBuilder";
import { MatchHUD } from "./components/MatchHUD";
import { MatchLobby } from "./components/MatchLobby";
import { MatchCommentary } from "./components/MatchCommentary";
import { LiveTacticsDugout } from "./components/LiveTacticsDugout";
import { LeagueTable } from "./components/LeagueTable";
import { HostingModal } from "./components/HostingModal";
import { PlayerSquadCM } from "./components/PlayerSquadCM";
import { EmbeddedPlayerChat } from "./components/EmbeddedPlayerChat";
import { LLMStudioModal } from "./components/LLMStudioModal";
import { PostMatchSummaryModal } from "./components/PostMatchSummaryModal";
import { FirstTimeSetupWizard } from "./components/FirstTimeSetupWizard";
import { TransferMarket } from "./components/TransferMarket";
import { FixtureList } from "./components/FixtureList";
import { HalfTimeModal } from "./components/HalfTimeModal";
import { PreMatchModal } from "./components/PreMatchModal";
import { SeasonCalendar } from "./components/SeasonCalendar";
import { FriendlyExhibitionModal } from "./components/FriendlyExhibitionModal";
import { AssistantManagerDrawer } from "./components/AssistantManagerDrawer";
import { AIInferenceInspectorModal } from "./components/AIInferenceInspectorModal";
import { ScoutingHub } from "./components/ScoutingHub";
import { FinancesOverview } from "./components/FinancesOverview";
import { ClubInbox } from "./components/ClubInbox";
import type { ClubMessage } from "./components/ClubInbox";
import { LeftRailNav } from "./components/LeftRailNav";
import type { NavTabKey } from "./components/LeftRailNav";
import { CarbonHeader } from "./components/CarbonHeader";
import { DashboardOverview } from "./components/DashboardOverview";
import { TacticsBoardCarbon } from "./components/TacticsBoardCarbon";
import { PlayerDossierModal } from "./components/PlayerDossierModal";
import type {
  GameSnapshot,
  TeamConfig,
  PlayerState,
  LeagueClubStanding,
  LeagueMatchHistoryItem,
  LeagueFixture,
  Formation,
  ChatMessage,
  PostMatchSummary,
  SquadPlayerConfig,
  CalendarState,
  CalendarScheduleItem,
} from "./types";

const DEFAULT_HOME_TEAM: TeamConfig = {
  name: "Cairn Athletic FC",
  color: "#0F6B45",
  secondaryColor: "#085C3B",
  formation: "4-3-3",
  squadHarmony: 82,
  totalSquadValue: 3.5,
  transferBudget: 1.5,
  prompt: "Organised high-tempo tactical possession, compact defensive lines, energetic wing transitions.",
  playerPrompts: {
    gk: "Conservative shot stopper, distribute accurately.",
    rb: "Overlapping wingback, disciplined defensive recovery.",
    cb_l: "Dominant ball-winning center-back, step out with authority.",
    cb_r: "Stopper center-back, header clearances.",
    lb: "Hardworking left back, close down crosses.",
    cdm_r: "Deep-lying playmaker, retain possession simply.",
    cdm_l: "Holding anchor, disrupt counters.",
    rw: "Inside forward, cut inside and unleash venomous shots.",
    cam: "Playmaker CAM, thread through balls to striker.",
    lw: "Direct winger, beat defender down channel.",
    st: "Clinical number 9 striker, strike with power.",
  },
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabKey>("dashboard");
  const [selectedDossierPlayer, setSelectedDossierPlayer] = useState<SquadPlayerConfig | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Transfer budget & Harmony persistent state (Grassroots £1.5M default)
  const [transferBudget, setTransferBudget] = useState<number>(() => {
    const saved = localStorage.getItem("afc_transfer_budget");
    return saved ? parseFloat(saved) : 1.5;
  });

  const [squadHarmony, setSquadHarmony] = useState<number>(() => {
    const saved = localStorage.getItem("afc_squad_harmony");
    return saved ? parseInt(saved, 10) : 82;
  });

  const [showSetupModal, setShowSetupModal] = useState<boolean>(() => {
    return !localStorage.getItem("afc_club_setup_done");
  });

  const [teamConfig, setTeamConfig] = useState<TeamConfig>(() => {
    const saved = localStorage.getItem("afc_team_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not parse saved teamConfig:", e);
      }
    }
    return DEFAULT_HOME_TEAM;
  });

  const [gameState, setGameState] = useState<GameSnapshot | null>(null);

  // Championship Manager Season Calendar State
  const [calendarState, setCalendarState] = useState<CalendarState | null>(null);
  const [schedule, setSchedule] = useState<CalendarScheduleItem[]>([]);
  const [activeTier, setActiveTier] = useState<string>("tier_4");
  const [showFriendlyModal, setShowFriendlyModal] = useState<boolean>(false);
  const [isAdvancingCalendar, setIsAdvancingCalendar] = useState<boolean>(false);
  const [calendarToast, setCalendarToast] = useState<{
    message: string;
    subtext?: string;
    type: "info" | "matchday" | "success";
  } | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showCalendarToast = (msg: string, sub?: string, type: "info" | "matchday" | "success" = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setCalendarToast({ message: msg, subtext: sub, type });
    toastTimerRef.current = setTimeout(() => {
      setCalendarToast(null);
    }, 4500);
  };

  // League & Championship Standings State
  const [leagueStandings, setLeagueStandings] = useState<LeagueClubStanding[]>([]);
  const [leagueFixtures, setLeagueFixtures] = useState<LeagueFixture[]>([]);
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);
  const [recentMatches, setRecentMatches] = useState<LeagueMatchHistoryItem[]>([]);
  const [preMatchFixture, setPreMatchFixture] = useState<{
    opponent: string;
    isHome: boolean;
    gameweek: number;
  } | null>(null);

  // Multiplayer Room State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [clientRole, setClientRole] = useState<"host" | "guest" | "spectator" | null>(null);
  const [awayTeam, setAwayTeam] = useState<TeamConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showHostingModal, setShowHostingModal] = useState(false);

  // Championship Manager & Agent Touchline Chat State
  const [activeChatPlayer, setActiveChatPlayer] = useState<PlayerState | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [matchPace, setMatchPace] = useState<number>(1.0);
  const [postMatchSummary, setPostMatchSummary] = useState<PostMatchSummary | null>(null);
  const [showPostMatchModal, setShowPostMatchModal] = useState(false);
  const [activeLLMModel, setActiveLLMModel] = useState<string>("llama3.2:1b");
  const [showLLMStudioModal, setShowLLMStudioModal] = useState<boolean>(false);
  const [showAssistantManagerDrawer, setShowAssistantManagerDrawer] = useState<boolean>(false);
  const [showAIInferenceModal, setShowAIInferenceModal] = useState<boolean>(false);
  const [matchdayRightTab, setMatchdayRightTab] = useState<"squad" | "chat">("squad");

  const [inboxMessages, setInboxMessages] = useState<ClubMessage[]>([
    {
      id: "msg_01",
      sender: "Club Board of Directors",
      senderRole: "Executive Chairman Sir Arthur Sterling",
      senderAvatarEmoji: "🏛️",
      subject: "Official Season Objectives & National League Charter (2026/27)",
      date: "Today, 08:30",
      unread: true,
      category: "BOARD",
      body: [
        "Welcome to Cairn Athletic FC, Manager. The Board is pleased to formally ratify your appointment.",
        "Our core operational mandate for Tier 4 National League is straightforward: ensure competitive stability, maintain strict Financial Fair Play discipline with our £1.5M warchest, and target a top-half finish with realistic playoff aspirations.",
        "The Board guarantees 100% autonomy regarding starting formations and player prompt conditioning. We expect complete dedication to tactical excellence and squad harmony.",
      ],
      actionPrompt: "The Board requests your formal signature on the 2026/27 Club Charter.",
      actionButtonText: "Sign Season Charter & Confirm",
    },
    {
      id: "msg_02",
      sender: "Malcolm Davies",
      senderRole: "Chief Scout",
      senderAvatarEmoji: "🧭",
      subject: "Scout Alert: 19yo Striker Archie Vance Available for Trial",
      date: "Yesterday, 14:15",
      unread: false,
      category: "SCOUT",
      body: [
        "Boss, our regional scout Peter Rawson has uncovered a gem at Halifax Town Youth — 19yo Archie 'The Rocket' Vance.",
        "His raw sprint velocity (88) and direct hunter instinct fit our high-pressing transition philosophy like a glove. Halifax are willing to release his grassroots contract for under £180k.",
        "I recommend reviewing his full dossier in the Scouting Hub before rival National League clubs submit an inquiry.",
      ],
      actionPrompt: "Chief Scout has added Archie Vance to your Shortlist.",
      actionButtonText: "Open in Scouting Hub",
    },
    {
      id: "msg_03",
      sender: "Dr. Sarah Evans",
      senderRole: "Head of Sports Science & Physio",
      senderAvatarEmoji: "🩺",
      subject: "Squad Energy & Training Recovery Status Report",
      date: "Thursday, 11:00",
      unread: false,
      category: "PHYSIO",
      body: [
        "Good morning Boss. Squad medical checkups before the upcoming fixture are 100% clean with zero muscular strains reported.",
        "Overall squad energy is currently sitting at an optimal 94%. We recommend maintaining the active 1-touch Gegenpress training drills while keeping Monday rest sessions intact to avoid hamstring fatigue.",
      ],
      actionPrompt: "Physio team recommends light recovery after Matchday.",
      actionButtonText: "Acknowledge Medical Briefing",
    },
    {
      id: "msg_04",
      sender: "The Non-League Football Paper",
      senderRole: "Senior Football Correspondent",
      senderAvatarEmoji: "📰",
      subject: "Media Interview Request: Pre-Season Hopes for Cairn Athletic",
      date: "Wednesday, 16:45",
      unread: false,
      category: "PRESS",
      body: [
        "Hello Manager, with the National League opening round upon us, local supporters are buzzing with excitement about your tactical AI philosophy.",
        "Would you describe your managerial style as aggressive high-pressing rock-and-roll football, or methodical patient possession?",
      ],
      actionPrompt: "Response will be published in tomorrow's matchday programme.",
      actionButtonText: "Reply: 'High-Tempo Aggressive Gegenpress'",
    },
  ]);

  const handleMarkInboxMessageAsRead = (msgId: string) => {
    setInboxMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, unread: false } : m))
    );
  };

  const wsRef = useRef<WebSocket | null>(null);
  const clientRoleRef = useRef<"host" | "guest" | "spectator" | null>(null);
  clientRoleRef.current = clientRole;
  const roomCodeRef = useRef<string | null>(null);
  roomCodeRef.current = roomCode;
  const activeChatPlayerRef = useRef<PlayerState | null>(null);
  activeChatPlayerRef.current = activeChatPlayer;
  const gameStateRef = useRef<GameSnapshot | null>(null);
  gameStateRef.current = gameState;
  const teamConfigRef = useRef<TeamConfig>(teamConfig);
  teamConfigRef.current = teamConfig;

  // If initial team has no starting11, populate from CM database
  useEffect(() => {
    fetch("/api/llm/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.activeModel) setActiveLLMModel(data.activeModel);
      })
      .catch(() => {});
  }, []);
  // Fallback squad prefill using Tier 4 grassroots draft if no squad present
  useEffect(() => {
    if (!teamConfig.starting11 || teamConfig.starting11.length < 11) {
      fetch("/api/cm/draft-squad")
        .then((res) => res.json())
        .then((draftData) => {
          if (draftData && draftData.starting11) {
            setTeamConfig((prev) => {
              const updated = {
                ...prev,
                starting11: draftData.starting11,
                benchSubs: draftData.benchSubs,
                squadHarmony: prev.squadHarmony || 82,
                totalSquadValue: draftData.totalSquadValue || 3.5,
              };
              localStorage.setItem("afc_team_config", JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch((e) => console.warn("Could not prefill draft squad:", e));
    }
  }, []);

  // Sanitize any stale local storage from prior sessions with elite clubs or high budgets
  useEffect(() => {
    const savedBudget = localStorage.getItem("afc_transfer_budget");
    const budgetVal = savedBudget ? parseFloat(savedBudget) : 1.5;
    const isElite =
      budgetVal > 4.0 ||
      teamConfig.name.toLowerCase().includes("arsenal") ||
      teamConfig.name.toLowerCase().includes("manchester") ||
      teamConfig.name.toLowerCase().includes("liverpool") ||
      (teamConfig.totalSquadValue && teamConfig.totalSquadValue > 30.0);

    if (isElite) {
      console.log("Resetting club from elite legacy data to Tier 4 Grassroots start...");
      fetch("/api/cm/draft-squad")
        .then((res) => res.json())
        .then((draftData) => {
          const freshClub: TeamConfig = {
            name: "East End Wanderers FC",
            color: "#00E5FF",
            secondaryColor: "#0B1528",
            formation: "4-4-2",
            squadHarmony: 82,
            totalSquadValue: draftData.totalSquadValue || 3.5,
            starting11: draftData.starting11,
            benchSubs: draftData.benchSubs,
            prompt: "Organised grassroots structure, compact defensive lines, energetic counter-attacks and rapid transitions.",
          };
          setTeamConfig(freshClub);
          setTransferBudget(1.5);
          setSquadHarmony(82);
          localStorage.setItem("afc_team_config", JSON.stringify(freshClub));
          localStorage.setItem("afc_transfer_budget", "1.5");
          localStorage.setItem("afc_squad_harmony", "82");
          localStorage.removeItem("afc_club_setup_done");
          setShowSetupModal(true);
        })
        .catch((e) => console.warn("Could not reset to grassroots squad:", e));
    }
  }, []);

  // Initialize WebSocket connection (runs once on mount, stable lifecycle)
  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const isDev = window.location.port === "5173";
    const wsHost = isDev ? `${window.location.hostname}:3001` : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}`;

    let isUnmounted = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connectWs() {
      if (isUnmounted) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("Connected to Agentic Football Cup server:", wsUrl);

        const params = new URLSearchParams(window.location.search);
        const codeToJoin = roomCodeRef.current || params.get("room");
        if (codeToJoin) {
          ws.send(
            JSON.stringify({
              type: "JOIN_ROOM",
              roomCode: codeToJoin.toUpperCase(),
              teamConfig: teamConfigRef.current,
            })
          );
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("Disconnected from server, will retry in 2s...");
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connectWs, 2000);
        }
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case "ROOM_CREATED": {
              setRoomCode(msg.roomCode);
              roomCodeRef.current = msg.roomCode;
              setClientRole(msg.role);
              clientRoleRef.current = msg.role;
              if (msg.roomState?.awayTeam) setAwayTeam(msg.roomState.awayTeam);
              break;
            }

            case "ROOM_JOINED": {
              setRoomCode(msg.roomCode);
              roomCodeRef.current = msg.roomCode;
              setClientRole(msg.role);
              clientRoleRef.current = msg.role;
              if (msg.roomState?.awayTeam) setAwayTeam(msg.roomState.awayTeam);
              break;
            }

            case "LOBBY_UPDATE": {
              if (msg.roomState?.awayTeam) setAwayTeam(msg.roomState.awayTeam);
              break;
            }

            case "MATCH_STARTED": {
              setActiveTab("matchday");
              setShowPostMatchModal(false);
              setPostMatchSummary(null);
              break;
            }

            case "TICK": {
              setGameState(msg.state);
              if (msg.state.matchPace) setMatchPace(msg.state.matchPace);
              // Sync live state for currently inspected chat player
              if (activeChatPlayerRef.current) {
                const live = msg.state.players.find((p: PlayerState) => p.id === activeChatPlayerRef.current?.id);
                if (live) setActiveChatPlayer(live);
              }
              break;
            }

            case "AGENT_CHAT_REPLY": {
              if (msg.chat) {
                const reply = msg.chat;
                setChatHistory((prev) => {
                  const existingIdx = prev.findIndex((c) => c.message === reply.directive && !c.response);
                  if (existingIdx !== -1) {
                    const copy = [...prev];
                    copy[existingIdx] = {
                      ...copy[existingIdx],
                      response: reply.response,
                      actionTaken: reply.actionTaken,
                    };
                    return copy;
                  }
                  const currentGS = gameStateRef.current;
                  return [
                    ...prev,
                    {
                      id: `${Date.now()}`,
                      playerId: reply.player.id,
                      playerName: reply.player.name,
                      playerRole: reply.player.role,
                      message: reply.directive,
                      response: reply.response,
                      actionTaken: reply.actionTaken,
                      timestamp: reply.timestamp,
                      minute: currentGS
                        ? Math.min(90, Math.floor((currentGS.elapsedSeconds / currentGS.matchDuration) * 90))
                        : 0,
                    },
                  ];
                });
              }
              break;
            }

            case "MATCH_ENDED": {
              setGameState(msg.finalState);
              const summary = msg.postMatchSummary || msg.finalState?.postMatchSummary;
              if (summary) {
                setPostMatchSummary(summary);
                setShowPostMatchModal(true);
              }
              if (msg.activeTier) setActiveTier(msg.activeTier);
              if (msg.leagueStandings) setLeagueStandings(msg.leagueStandings);
              if (msg.fixtures) setLeagueFixtures(msg.fixtures);
              if (msg.gameweek) setCurrentGameweek(msg.gameweek);
              if (msg.matchHistory) setRecentMatches(msg.matchHistory);

              // Refresh calendar after match ends
              fetch("/api/calendar")
                .then((r) => r.json())
                .then((d) => {
                  if (d.calendar) setCalendarState(d.calendar);
                  if (d.schedule) setSchedule(d.schedule);
                })
                .catch(() => {});

              // Dynamic player valuation appreciation & tactical mastery progression
              if (msg.finalState && msg.finalState.players) {
                const currentCfg = teamConfigRef.current;
                const userTeamKey = clientRoleRef.current === "guest" ? "away" : "home";
                const matchPlayers: PlayerState[] = msg.finalState.players.filter(
                  (p: PlayerState) => p.team === userTeamKey
                );

                const updatedStarting11 = (currentCfg.starting11 || []).map((p) => {
                  const live = matchPlayers.find((mp) => mp.name === p.name || mp.number === p.number);
                  const mastery = Math.min(100, (p.tacticalMastery || 75) + 1);
                  if (live && live.rating) {
                    let delta = 0.0;
                    if (live.rating >= 8.5) delta = 0.5;
                    else if (live.rating >= 7.8) delta = 0.4;
                    else if (live.rating >= 7.0) delta = 0.3;
                    else if (live.rating >= 6.5) delta = 0.1;
                    else if (live.rating < 5.0) delta = -0.2;
                    else if (live.rating < 5.8) delta = -0.1;
                    const newV = Math.max(1.0, Math.min(45.0, +((p.transferValue || 10.0) + delta).toFixed(1)));
                    return { ...p, transferValue: newV, tacticalMastery: mastery };
                  }
                  return { ...p, tacticalMastery: mastery };
                });

                const updatedBench = (currentCfg.benchSubs || []).map((p) => {
                  const live = matchPlayers.find((mp) => mp.name === p.name);
                  const mastery = Math.min(100, (p.tacticalMastery || 72) + 1);
                  if (live && live.rating) {
                    let delta = 0.0;
                    if (live.rating >= 8.0) delta = 0.4;
                    else if (live.rating >= 6.5) delta = 0.2;
                    const newV = Math.max(1.0, Math.min(45.0, +((p.transferValue || 6.0) + delta).toFixed(1)));
                    return { ...p, transferValue: newV, tacticalMastery: mastery };
                  }
                  return { ...p, tacticalMastery: mastery };
                });

                const newHarm = Math.min(100, (currentCfg.squadHarmony || 88) + 3);
                const updatedConfig: TeamConfig = {
                  ...currentCfg,
                  starting11: updatedStarting11,
                  benchSubs: updatedBench,
                  squadHarmony: newHarm,
                };

                setTeamConfig(updatedConfig);
                setSquadHarmony(newHarm);
                localStorage.setItem("afc_team_config", JSON.stringify(updatedConfig));
                localStorage.setItem("afc_squad_harmony", `${newHarm}`);
              }
              break;
            }

            case "LEAGUE_UPDATE": {
              if (msg.activeTier) setActiveTier(msg.activeTier);
              if (msg.leagueStandings) setLeagueStandings(msg.leagueStandings);
              if (msg.fixtures) setLeagueFixtures(msg.fixtures);
              if (msg.gameweek) setCurrentGameweek(msg.gameweek);
              if (msg.matchHistory) setRecentMatches(msg.matchHistory);
              break;
            }

            case "ERROR": {
              alert(msg.message || "Something went wrong.");
              break;
            }
          }
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };
    }

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Actions
  const handleCreateRoom = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "CREATE_ROOM", teamConfig }));
  };

  const handleJoinRoom = (code: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "JOIN_ROOM", roomCode: code, teamConfig }));
  };

  const handleStartScrimmage = (botPresetKey?: string, opponentName?: string, venue: "home" | "away" = "home") => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "START_SCRIMMAGE",
        botPresetKey: botPresetKey || "GEGENPRESS",
        opponentName,
        userTeam: teamConfig,
        venue,
      })
    );
    setActiveTab("matchday");
  };

  const currentGw = calendarState?.currentGameweek || currentGameweek || 1;
  const userFixture = leagueFixtures.find(
    (f) =>
      f.gameweek === currentGw &&
      (f.homeTeam.toLowerCase().includes(teamConfig.name.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(teamConfig.name.toLowerCase()))
  );
  const nextOpponentName = userFixture
    ? userFixture.homeTeam.toLowerCase().includes(teamConfig.name.toLowerCase())
      ? userFixture.awayTeam
      : userFixture.homeTeam
    : "Chesterfield";
  const isUserFixtureHome = userFixture
    ? userFixture.homeTeam.toLowerCase().includes(teamConfig.name.toLowerCase())
    : true;

  const handlePlayScheduledMatch = () => {
    setPreMatchFixture({
      opponent: nextOpponentName,
      isHome: isUserFixtureHome,
      gameweek: currentGw,
    });
  };

  const handleAdvanceDay = async (prompt?: string | React.MouseEvent) => {
    if (isAdvancingCalendar) return;
    setIsAdvancingCalendar(true);
    try {
      const promptText = typeof prompt === "string" && prompt.trim() ? prompt.trim() : (teamConfig.prompt || "Focus on pressing discipline and crisp passes");
      const res = await fetch("/api/calendar/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerPrompt: promptText,
          squad: teamConfig.starting11 || [],
        }),
      });
      const d = await res.json();
      if (d.calendar) {
        setCalendarState(d.calendar);
        if (d.calendar.isMatchday) {
          showCalendarToast(
            "🏟️ MATCHDAY ARRIVED!",
            `Saturday Matchday (GW #${d.calendar.currentGameweek}) vs ${nextOpponentName}. Click 'PLAY MATCH' to set lineup!`,
            "matchday"
          );
        } else {
          showCalendarToast(
            `🗓️ Advanced to ${d.calendar.date}`,
            `${d.calendar.activityDesc || "Squad completed daily tactical drill"} • Tactical Mastery +2%`,
            "info"
          );
        }
      }
      if (d.schedule) setSchedule(d.schedule);
    } catch (e) {
      console.error("Advance day error:", e);
    } finally {
      setIsAdvancingCalendar(false);
    }
  };

  const handleAdvanceToMatchday = async (prompt?: string | React.MouseEvent) => {
    if (isAdvancingCalendar) return;
    setIsAdvancingCalendar(true);
    try {
      const promptText = typeof prompt === "string" && prompt.trim() ? prompt.trim() : (teamConfig.prompt || "Focus on pressing discipline and crisp passes");
      const res = await fetch("/api/calendar/advance-matchday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerPrompt: promptText,
          squad: teamConfig.starting11 || [],
        }),
      });
      const d = await res.json();
      if (d.calendar) {
        setCalendarState(d.calendar);
        showCalendarToast(
          "🏟️ SATURDAY MATCHDAY ARRIVED!",
          `Gameweek #${d.calendar.currentGameweek} fixture vs ${nextOpponentName} is ready for kickoff!`,
          "matchday"
        );
      }
      if (d.schedule) setSchedule(d.schedule);
    } catch (e) {
      console.error("Advance to matchday error:", e);
    } finally {
      setIsAdvancingCalendar(false);
    }
  };

  const handleSelectTier = (tierKey: string) => {
    fetch(`/api/league?tier=${tierKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.standings) setLeagueStandings(d.standings);
        if (d.fixtures) setLeagueFixtures(d.fixtures);
      })
      .catch(() => {});
  };

  const handlePlayFixture = (opponentName: string, isHome: boolean, gameweek: number) => {
    setPreMatchFixture({ opponent: opponentName, isHome, gameweek });
  };

  const handleConfirmPreMatchKickoff = (finalConfig: TeamConfig, venue: "home" | "away") => {
    setTeamConfig(finalConfig);
    localStorage.setItem("afc_team_config", JSON.stringify(finalConfig));
    const opponent = preMatchFixture?.opponent;
    setPreMatchFixture(null);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "START_SCRIMMAGE",
        opponentName: opponent,
        userTeam: finalConfig,
        venue,
      })
    );
    setActiveTab("matchday");
  };

  const handleKickoffSecondHalf = (updatedFormation?: Formation, teamTalkDirective?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "RESUME_SECOND_HALF",
        homeTactics: {
          formation: updatedFormation,
          prompt: teamTalkDirective,
        },
      })
    );
  };

  const handleStartMatch = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "START_MATCH" }));
    setActiveTab("matchday");
  };

  const handleSaveTactics = (updatedTeam: TeamConfig) => {
    setTeamConfig(updatedTeam);
    localStorage.setItem("afc_team_config", JSON.stringify(updatedTeam));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomCode) {
      wsRef.current.send(JSON.stringify({ type: "UPDATE_TEAM", teamConfig: updatedTeam }));
    }
  };

  const handleCompleteSetup = (newTeam: TeamConfig, initialBudget: number) => {
    setTeamConfig(newTeam);
    setTransferBudget(initialBudget);
    setSquadHarmony(newTeam.squadHarmony || 82);
    localStorage.setItem("afc_team_config", JSON.stringify(newTeam));
    localStorage.setItem("afc_transfer_budget", `${initialBudget}`);
    localStorage.setItem("afc_squad_harmony", `${newTeam.squadHarmony || 82}`);
    localStorage.setItem("afc_club_setup_done", "true");
    setShowSetupModal(false);

    // Register user club with backend fixture & league engine
    fetch("/api/cm/register-user-club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTeam.name,
        color: newTeam.color,
        secondaryColor: newTeam.secondaryColor,
        tier: "tier_4",
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.fixtures) setLeagueFixtures(d.fixtures);
        if (d.standings) setLeagueStandings(d.standings);
      })
      .catch((e) => console.warn("Could not register club:", e));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomCode) {
      wsRef.current.send(JSON.stringify({ type: "UPDATE_TEAM", teamConfig: newTeam }));
    }
  };

  const handleUpdateSquadAndBudget = (
    newSquad: SquadPlayerConfig[],
    newBench: SquadPlayerConfig[],
    newBudget: number,
    newHarmony: number
  ) => {
    const newTotalSquadValue = +[...newSquad, ...newBench]
      .reduce((sum, p) => sum + (p.transferValue || 10.0), 0)
      .toFixed(1);

    const updated: TeamConfig = {
      ...teamConfig,
      starting11: newSquad,
      benchSubs: newBench,
      squadHarmony: newHarmony,
      totalSquadValue: newTotalSquadValue,
    };
    setTeamConfig(updated);
    setTransferBudget(newBudget);
    setSquadHarmony(newHarmony);
    localStorage.setItem("afc_team_config", JSON.stringify(updated));
    localStorage.setItem("afc_transfer_budget", `${newBudget}`);
    localStorage.setItem("afc_squad_harmony", `${newHarmony}`);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomCode) {
      wsRef.current.send(JSON.stringify({ type: "UPDATE_TEAM", teamConfig: updated }));
    }
  };

  const handleSwapSquadPlayers = (newStarters: SquadPlayerConfig[], newBench: SquadPlayerConfig[]) => {
    handleUpdateSquadAndBudget(newStarters, newBench, transferBudget, squadHarmony);
  };

  const handleMakeSubstitution = (targetPlayerId: string, subName: string, subRole: string, subPrompt: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "MAKE_SUBSTITUTION",
        targetPlayerId,
        subConfig: {
          name: subName,
          role: subRole,
          prompt: subPrompt,
        },
      })
    );
  };

  const handleSubstituteWithBench = (targetPlayer: PlayerState, benchSubId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "MAKE_SUBSTITUTION",
        targetPlayerId: targetPlayer.id,
        subIndexOrId: benchSubId,
      })
    );
  };

  const handleUpdateTacticsLive = (prompt: string, macroKey?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: "UPDATE_TACTICS_LIVE",
        prompt,
        macroKey,
      })
    );
  };

  const handleSendAgentDirective = (playerId: string, message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const simMin = gameState ? Math.min(90, Math.floor((gameState.elapsedSeconds / gameState.matchDuration) * 90)) : 0;
    const newChat: ChatMessage = {
      id: `${Date.now()}_${Math.random()}`,
      playerId,
      playerName: activeChatPlayer?.name || "Player",
      playerRole: activeChatPlayer?.role || "MID",
      message,
      timestamp: Date.now(),
      minute: simMin,
    };
    setChatHistory((prev) => [...prev, newChat]);
    wsRef.current.send(JSON.stringify({ type: "AGENT_CHAT", playerId, message }));
  };

  const handleSetMatchPace = (pace: number) => {
    setMatchPace(pace);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "SET_MATCH_PACE", pace }));
    }
  };

  const handleResetLeague = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "RESET_LEAGUE" }));
  };

  const handlePlayerClick = (player: PlayerState) => {
    setActiveChatPlayer(player);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cds-background)", color: "var(--cds-text-primary)" }}>
      {/* Left Navigation Rail (IBM Carbon Style) */}
      <LeftRailNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        teamConfig={teamConfig}
        inboxUnreadCount={inboxMessages.filter((m) => m.unread).length}
        onOpenSettings={() => setShowSetupModal(true)}
      />

      {/* Main Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Carbon Header */}
        <CarbonHeader
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          calendarState={calendarState}
          teamConfig={teamConfig}
          activeLLMModel={activeLLMModel}
          isConnected={isConnected}
          isAdvancing={isAdvancingCalendar}
          onOpenAIInspector={() => setShowAIInferenceModal(true)}
          onOpenAssistantManager={() => setShowAssistantManagerDrawer(true)}
          onAdvanceDay={handleAdvanceDay}
          onAdvanceToMatchday={handleAdvanceToMatchday}
          onPlayScheduledMatch={handlePlayScheduledMatch}
        />

        {/* Floating Calendar Day Progression & Matchday Alert Toast */}
        {calendarToast && (
          <div
            className="carbon-card"
            style={{
              position: "fixed",
              top: "76px",
              right: "24px",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 18px",
              background: calendarToast.type === "matchday" ? "var(--cds-green-light)" : "var(--cds-surface)",
              border: calendarToast.type === "matchday" ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              maxWidth: "460px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "4px",
                background: calendarToast.type === "matchday" ? "var(--cds-green-primary)" : "var(--cds-layer-selected)",
                color: calendarToast.type === "matchday" ? "#fff" : "var(--cds-green-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {calendarToast.type === "matchday" ? "🏟️" : "🗓️"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>
                {calendarToast.message}
              </div>
              {calendarToast.subtext && (
                <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)", marginTop: "2px", lineHeight: 1.35 }}>
                  {calendarToast.subtext}
                </div>
              )}
            </div>
            <button
              onClick={() => setCalendarToast(null)}
              className="btn btn-secondary"
              style={{ padding: "4px 6px", height: "auto", flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Scrollable Workspace */}
        <main style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          {/* Dashboard Overview View (Top screen of mockup) */}
          {activeTab === "dashboard" && (
            <DashboardOverview
              teamConfig={teamConfig}
              budget={transferBudget}
              calendarState={calendarState}
              nextOpponentName={nextOpponentName}
              onViewMatchPreview={() => {
                const fix = leagueFixtures.find((f) => f.gameweek === currentGameweek);
                if (fix) handlePlayFixture(nextOpponentName, fix.homeTeam === teamConfig.name, currentGameweek);
                else setActiveTab("tactics");
              }}
              onViewAllMatches={() => setActiveTab("fixtures")}
              onViewFullSquad={() => setActiveTab("squad")}
              onSelectPlayerDossier={(p) => setSelectedDossierPlayer(p)}
              onApplyTacticalRecommendation={(directive) => handleUpdateTacticsLive(directive, "AI_INSIGHT")}
            />
          )}

          {/* Tactics Pitch Board View (Bottom-left screen of mockup) */}
          {activeTab === "tactics" && (
            <TacticsBoardCarbon
              teamConfig={teamConfig}
              onSaveTactics={handleSaveTactics}
              onSelectPlayerDossier={(p) => setSelectedDossierPlayer(p)}
              onEnterLiveMatch={() => setActiveTab("matchday")}
            />
          )}
        {activeTab === "matchday" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(420px, 1.05fr) minmax(500px, 1.25fr)", gap: "16px", alignItems: "start" }}>
            {/* Left Column: Pitch + Dugout + Match Commentary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <PitchCanvas
                gameState={gameState}
                homeTeam={teamConfig}
                awayTeam={awayTeam || { name: "FC Halifax Town", color: "#C8102E", formation: "4-3-3" }}
                onPlayerClick={(player) => {
                  handlePlayerClick(player);
                  setMatchdayRightTab("chat");
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>
                  💡 Click any player on the pitch for 1-on-1 Touchline Chat.
                </span>
                {!gameState && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {calendarState?.isMatchday ? (
                      <button
                        className="btn btn-primary"
                        onClick={handlePlayScheduledMatch}
                        style={{
                          padding: "6px 14px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <Trophy size={14} />
                        <span>Kick Off Matchday #{calendarState?.currentGameweek ?? 1}: vs {nextOpponentName}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveTab("calendar")}
                          style={{ padding: "6px 10px", fontWeight: "700", gap: "4px", fontSize: "11px" }}
                        >
                          <Calendar size={13} />
                          <span>Calendar</span>
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAdvanceToMatchday()}
                          style={{ padding: "6px 12px", fontWeight: "700", gap: "4px", fontSize: "11px" }}
                        >
                          <FastForward size={13} />
                          <span>Advance</span>
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowFriendlyModal(true)}
                      style={{ padding: "6px 10px", fontWeight: "700", gap: "4px", fontSize: "11px" }}
                      title="Play friendly exhibition match"
                    >
                      <Swords size={13} />
                      <span>Friendly</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Manager Technical Area / Live Dugout */}
              <LiveTacticsDugout
                gameState={gameState}
                onMakeSubstitution={handleMakeSubstitution}
                onUpdateTacticsLive={handleUpdateTacticsLive}
                userTeamType={clientRole === "guest" ? "away" : "home"}
              />

              {/* Real-time Matchday Commentary */}
              <MatchCommentary
                events={gameState?.events || []}
                homeTeamColor={gameState?.homeTeam?.color || teamConfig.color}
                awayTeamColor={gameState?.awayTeam?.color || "#ef4444"}
                crowdAtmosphere={gameState?.crowdAtmosphere}
              />
            </div>

            {/* Right Column: Scoreboard, Live Ratings Squad Sheet & Touchline Chat */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <MatchHUD
                gameState={gameState}
                currentPace={matchPace}
                onSetMatchPace={handleSetMatchPace}
              />

              {/* Sub-tab switcher between Live Squad Sheet & 1-on-1 Touchline Chat */}
              <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--cds-border)", paddingBottom: "6px" }}>
                <button
                  type="button"
                  onClick={() => setMatchdayRightTab("squad")}
                  className={`btn ${matchdayRightTab === "squad" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "11px", height: "26px", padding: "0 10px", fontWeight: "700" }}
                >
                  Live Squad & Ratings ({(teamConfig.starting11?.length || 11) + (teamConfig.benchSubs?.length || 3)})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchdayRightTab("chat")}
                  className={`btn ${matchdayRightTab === "chat" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "11px", height: "26px", padding: "0 10px", fontWeight: "700" }}
                >
                  1-on-1 Touchline Chat {activeChatPlayer ? `(${activeChatPlayer.name})` : ""}
                </button>
              </div>

              {/* Tab Content 1: Live Championship Manager Squad Sheet */}
              {matchdayRightTab === "squad" && (
                <PlayerSquadCM
                  players={gameState?.players || []}
                  benchSubs={gameState?.benchSubs}
                  subsRemaining={gameState?.subsRemaining || { home: 3, away: 3 }}
                  homeTeam={{
                    name: gameState?.homeTeam?.name || teamConfig.name,
                    color: gameState?.homeTeam?.color || teamConfig.color,
                    formation: gameState?.homeTeam?.formation || teamConfig.formation,
                  }}
                  awayTeam={{
                    name: gameState?.awayTeam?.name || awayTeam?.name || "FC Halifax Town",
                    color: gameState?.awayTeam?.color || awayTeam?.color || "#FF3366",
                    formation: gameState?.awayTeam?.formation || awayTeam?.formation || "4-3-3",
                  }}
                  userTeamKey={clientRole === "guest" ? "away" : "home"}
                  onChatWithPlayer={(player) => {
                    setActiveChatPlayer(player);
                    setMatchdayRightTab("chat");
                  }}
                  onSubstitutePlayer={handleSubstituteWithBench}
                  onSwapSquadPlayers={handleSwapSquadPlayers}
                  onFormationChange={(newF) => {
                    const updated = { ...teamConfig, formation: newF };
                    setTeamConfig(updated);
                    localStorage.setItem("afc_team_config", JSON.stringify(updated));
                  }}
                  fallbackSquad={teamConfig.starting11}
                  fallbackBench={teamConfig.benchSubs}
                  squadHarmony={squadHarmony}
                  transferBudget={transferBudget}
                  totalSquadValue={teamConfig.totalSquadValue}
                />
              )}

              {/* Tab Content 2: Embedded 1-on-1 Player Touchline Chat & Club Dynamics */}
              {matchdayRightTab === "chat" && (
                <EmbeddedPlayerChat
                  players={gameState?.players || []}
                  selectedPlayer={activeChatPlayer}
                  onSelectPlayer={(p) => setActiveChatPlayer(p)}
                  onSendDirective={handleSendAgentDirective}
                  chatHistory={chatHistory}
                  teamColor={gameState?.homeTeam?.color || teamConfig.color}
                  fanFeedback={gameState?.fanFeedback}
                  chairpersonFeedback={gameState?.chairpersonFeedback}
                  activeModel={activeLLMModel}
                  onOpenLLMStudio={() => setShowLLMStudioModal(true)}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "squad" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <PlayerSquadCM
              players={gameState?.players || []}
              benchSubs={gameState?.benchSubs}
              subsRemaining={gameState?.subsRemaining || { home: 3, away: 3 }}
              homeTeam={{
                name: gameState?.homeTeam?.name || teamConfig.name,
                color: gameState?.homeTeam?.color || teamConfig.color,
                formation: gameState?.homeTeam?.formation || teamConfig.formation,
              }}
              awayTeam={{
                name: gameState?.awayTeam?.name || awayTeam?.name || "AI FC",
                color: gameState?.awayTeam?.color || awayTeam?.color || "#FF3366",
                formation: gameState?.awayTeam?.formation || awayTeam?.formation || "4-3-3",
              }}
              userTeamKey={clientRole === "guest" ? "away" : "home"}
              onChatWithPlayer={(player) => setActiveChatPlayer(player)}
              onSubstitutePlayer={handleSubstituteWithBench}
              onSwapSquadPlayers={handleSwapSquadPlayers}
              onFormationChange={(newF) => {
                const updated = { ...teamConfig, formation: newF };
                setTeamConfig(updated);
                localStorage.setItem("afc_team_config", JSON.stringify(updated));
              }}
              fallbackSquad={teamConfig.starting11}
              fallbackBench={teamConfig.benchSubs}
              squadHarmony={squadHarmony}
              transferBudget={transferBudget}
              totalSquadValue={teamConfig.totalSquadValue}
            />
          </div>
        )}

        {activeTab === "market" && (
          <TransferMarket
            teamConfig={teamConfig}
            budget={transferBudget}
            userActiveTier={activeTier}
            onUpdateSquadAndBudget={handleUpdateSquadAndBudget}
          />
        )}

        {activeTab === "scouting" && (
          <ScoutingHub
            teamConfig={teamConfig}
            budget={transferBudget}
            onNavigateToTransfers={() => setActiveTab("market")}
          />
        )}

        {activeTab === "calendar" && (
          <SeasonCalendar
            calendar={calendarState}
            schedule={schedule}
            userTeamName={teamConfig.name}
            nextOpponent={nextOpponentName}
            isHomeFixture={isUserFixtureHome}
            squad={teamConfig.starting11 || []}
            onAdvanceDay={handleAdvanceDay}
            onAdvanceToMatchday={() => handleAdvanceToMatchday()}
            onPlayScheduledMatch={handlePlayScheduledMatch}
            isMatchActive={!!gameState && gameState.phase !== "fulltime"}
          />
        )}

        {activeTab === "fixtures" && (
          <FixtureList
            currentGameweek={currentGameweek}
            userClubName={teamConfig.name}
            activeTier={activeTier}
            fixtures={leagueFixtures}
            onPlayFixture={handlePlayFixture}
            onSelectTier={handleSelectTier}
          />
        )}

        {activeTab === "tactics" && (
          <TeamBuilder team={teamConfig} onSave={handleSaveTactics} title="Squad Tactical Studio" />
        )}

        {activeTab === "table" && (
          <LeagueTable
            standings={leagueStandings}
            gameweek={currentGameweek}
            recentMatches={recentMatches}
            userTeamName={teamConfig.name}
            activeTier={activeTier}
            currentTier={activeTier}
            onSelectTier={handleSelectTier}
            onResetLeague={handleResetLeague}
            onQuickPlayMatch={(opponent) => handleStartScrimmage(undefined, opponent)}
          />
        )}

        {activeTab === "finances" && (
          <FinancesOverview
            teamConfig={teamConfig}
            budget={transferBudget}
          />
        )}

        {activeTab === "inbox" && (
          <ClubInbox
            teamConfig={teamConfig}
            messages={inboxMessages}
            onMarkAsRead={handleMarkInboxMessageAsRead}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === "lobby" && (
          <MatchLobby
            roomCode={roomCode}
            role={clientRole}
            homeTeam={teamConfig}
            awayTeam={awayTeam}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartScrimmage={handleStartScrimmage}
            onStartMatch={handleStartMatch}
            onOpenShareModal={() => setShowHostingModal(true)}
          />
        )}
      </main>

      {/* Local LLM Model Studio & Prompt Telemetry Inspector Modal */}
      <LLMStudioModal
        isOpen={showLLMStudioModal}
        onClose={() => setShowLLMStudioModal(false)}
        activeModel={activeLLMModel}
        onSelectModel={(modelName) => setActiveLLMModel(modelName)}
      />

      {/* Post-Match Summary & Pundit Analysis Modal */}
      {gameState && (
        <PostMatchSummaryModal
          summary={postMatchSummary || gameState.postMatchSummary || null}
          gameState={gameState}
          isOpen={showPostMatchModal}
          onClose={() => setShowPostMatchModal(false)}
          onRematch={() => handleStartScrimmage("GEGENPRESS")}
        />
      )}

      {/* First-Time Club & Manager Onboarding Setup Wizard */}
      <FirstTimeSetupWizard
        isOpen={showSetupModal}
        onComplete={(newTeam) => {
          handleCompleteSetup(newTeam, 1.5);
          setShowSetupModal(false);
        }}
        onCancel={() => setShowSetupModal(false)}
      />

      {/* AI Assistant Manager Drawer */}
      <AssistantManagerDrawer
        isOpen={showAssistantManagerDrawer}
        onClose={() => setShowAssistantManagerDrawer(false)}
        teamConfig={teamConfig}
        gameState={gameState}
        activeTier={activeTier}
        activeModel={activeLLMModel}
      />

      {/* AI Inference & Neural Inspector Modal */}
      <AIInferenceInspectorModal
        isOpen={showAIInferenceModal}
        onClose={() => setShowAIInferenceModal(false)}
        teamConfig={teamConfig}
        activeModel={activeLLMModel}
        onSelectModel={(modelName) => setActiveLLMModel(modelName)}
      />

      {/* Half-Time Dressing Room Modal */}
      {gameState && gameState.phase === "halftime" && (
        <HalfTimeModal
          snapshot={gameState}
          onKickoffSecondHalf={handleKickoffSecondHalf}
          onExecuteSub={(starterId, benchSubId) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            wsRef.current.send(
              JSON.stringify({
                type: "MAKE_SUBSTITUTION",
                targetPlayerId: starterId,
                subIndexOrId: benchSubId,
              })
            );
          }}
        />
      )}

      {/* Pre-Match Tactical Hub Modal */}
      {preMatchFixture && (
        <PreMatchModal
          userTeam={teamConfig}
          opponentName={preMatchFixture.opponent}
          isHome={preMatchFixture.isHome}
          gameweek={preMatchFixture.gameweek}
          onConfirmAndKickoff={handleConfirmPreMatchKickoff}
          onClose={() => setPreMatchFixture(null)}
        />
      )}

      {/* Hosting & Sharing Modal */}
      <HostingModal isOpen={showHostingModal} onClose={() => setShowHostingModal(false)} />

      {/* Friendly Exhibition Modal */}
      <FriendlyExhibitionModal
        isOpen={showFriendlyModal}
        onClose={() => setShowFriendlyModal(false)}
        userTeam={teamConfig}
        onStartFriendly={(opponentName, botPresetKey, venue) =>
          handleStartScrimmage(botPresetKey, opponentName, venue)
        }
      />

      {/* Player Dossier Modal (Bottom-right screen of mockup) */}
      <PlayerDossierModal
        player={selectedDossierPlayer}
        onClose={() => setSelectedDossierPlayer(null)}
        clubName={teamConfig.name}
        onApplyRecommendation={(directive) => handleUpdateTacticsLive(directive, "DOSSIER_INSIGHT")}
      />
      </div>
    </div>
  );
};

export default App;
