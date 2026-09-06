// src/components/PlayerSquadCM.tsx
import React, { useState } from "react";
import { MessageSquare, RefreshCw, Shield, Zap, Heart, AlertTriangle, DollarSign, Sparkles, TrendingUp } from "lucide-react";
import type { PlayerState, SubAgent, SquadPlayerConfig, Formation } from "../types";

interface PlayerSquadCMProps {
  players: PlayerState[];
  benchSubs?: { home: SubAgent[]; away: SubAgent[] };
  subsRemaining: { home: number; away: number };
  homeTeam: { name: string; color: string; formation?: string };
  awayTeam: { name: string; color: string; formation?: string };
  userTeamKey?: "home" | "away";
  onChatWithPlayer: (player: PlayerState) => void;
  onSubstitutePlayer: (targetPlayer: PlayerState, benchSubId?: string) => void;
  onSwapSquadPlayers?: (newStarters: SquadPlayerConfig[], newBench: SquadPlayerConfig[]) => void;
  onFormationChange?: (newFormation: Formation) => void;
  fallbackSquad?: SquadPlayerConfig[];
  fallbackBench?: SquadPlayerConfig[];
  squadHarmony?: number;
  transferBudget?: number;
  totalSquadValue?: number;
}

export const PlayerSquadCM: React.FC<PlayerSquadCMProps> = ({
  players,
  benchSubs,
  subsRemaining,
  homeTeam,
  awayTeam,
  userTeamKey = "home",
  onChatWithPlayer,
  onSubstitutePlayer,
  onSwapSquadPlayers,
  onFormationChange,
  fallbackSquad = [],
  fallbackBench = [],
  squadHarmony = 88,
  transferBudget = 60.0,
  totalSquadValue,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">(userTeamKey);
  const [activeSubbingTargetId, setActiveSubbingTargetId] = useState<string | null>(null);

  const teamConfig = selectedTeam === "home" ? homeTeam : awayTeam;
  const teamLivePlayers = players.filter((p) => p.team === selectedTeam && !p.subbedOut);
  const teamLiveBench = (benchSubs && benchSubs[selectedTeam]) || [];
  const subsLeft = subsRemaining[selectedTeam] ?? 3;

  const isLiveMatch = teamLivePlayers.length > 0;
  const isUserTeam = selectedTeam === userTeamKey;

  // Rating color helper
  const getRatingBadge = (rating: number = 6.0) => {
    if (rating >= 8.0) {
      return {
        bg: "rgba(16, 185, 129, 0.2)",
        border: "#10b981",
        color: "#34d399",
        label: "Superb",
        glow: "0 0 10px rgba(16, 185, 129, 0.4)",
      };
    }
    if (rating >= 6.8) {
      return {
        bg: "rgba(6, 182, 212, 0.2)",
        border: "#06b6d4",
        color: "#22d3ee",
        label: "Good",
        glow: "none",
      };
    }
    if (rating >= 5.8) {
      return {
        bg: "rgba(245, 158, 11, 0.2)",
        border: "#f59e0b",
        color: "#fbbf24",
        label: "Average",
        glow: "none",
      };
    }
    return {
      bg: "rgba(239, 68, 68, 0.2)",
      border: "#ef4444",
      color: "#f87171",
      label: "Needs Sub",
      glow: "0 0 10px rgba(239, 68, 68, 0.4)",
    };
  };

  // Convert fallback squad to PlayerState structure if offline
  const displayPlayers: PlayerState[] = isLiveMatch
    ? teamLivePlayers
    : fallbackSquad.map((cfg, idx) => ({
        id: `squad_${idx + 1}`,
        number: cfg.number || idx + 1,
        team: selectedTeam,
        name: cfg.name,
        role: cfg.role,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        state: "ready",
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
        thought: cfg.prompt || "Tactically drilled and ready for kickoff.",
        transferValue: cfg.transferValue || 12.0,
        tier: cfg.tier || 3,
        promptCapability: cfg.promptCapability,
        isYouth: cfg.isYouth,
        tacticalMastery: cfg.tacticalMastery || 75,
      }));

  const displayBench: (SubAgent | SquadPlayerConfig)[] = isLiveMatch
    ? teamLiveBench
    : fallbackBench.map((cfg, idx) => ({
        id: `bench_${idx + 1}`,
        number: cfg.number || 12 + idx,
        name: cfg.name,
        role: cfg.role,
        prompt: cfg.prompt || "Impact substitute: ready to inject energy.",
        stamina: 100,
        used: false,
        transferValue: cfg.transferValue || 6.5,
        tier: cfg.tier || 2,
        promptCapability: cfg.promptCapability,
        isYouth: cfg.isYouth,
        tacticalMastery: cfg.tacticalMastery || 72,
      }));

  const calculatedTotalSquadValue = totalSquadValue || +(
    [...displayPlayers, ...displayBench].reduce((sum, p) => sum + (p.transferValue || 10.0), 0)
  ).toFixed(1);

  const activeTargetPlayer = displayPlayers.find((p) => p.id === activeSubbingTargetId);

  const handleDeployOrSwapSub = (sub: any, subIdx: number) => {
    if (!activeSubbingTargetId) return;

    if (isLiveMatch) {
      if (subsLeft <= 0 || sub.used) return;
      const target = teamLivePlayers.find((p) => p.id === activeSubbingTargetId);
      if (target) {
        onSubstitutePlayer(target, sub.id || subIdx);
        setActiveSubbingTargetId(null);
      }
    } else {
      // Pre-match squad swap between starting 11 and bench
      const starterIdx = displayPlayers.findIndex((p) => p.id === activeSubbingTargetId);
      if (starterIdx === -1 || !fallbackSquad[starterIdx] || !fallbackBench[subIdx]) {
        setActiveSubbingTargetId(null);
        return;
      }

      const newStarters = [...fallbackSquad];
      const newBench = [...fallbackBench];

      const currentStarter = newStarters[starterIdx];
      const currentBenchSub = newBench[subIdx];

      const starterNumber = currentStarter.number || starterIdx + 1;
      const benchNumber = currentBenchSub.number || 12 + subIdx;

      newStarters[starterIdx] = {
        ...currentBenchSub,
        number: starterNumber,
      };

      newBench[subIdx] = {
        ...currentStarter,
        number: benchNumber,
      };

      if (onSwapSquadPlayers) {
        onSwapSquadPlayers(newStarters, newBench);
      }
      setActiveSubbingTargetId(null);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Top Header: Club Identity, Financials & Team Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Shield size={18} color={teamConfig.color} />
            <span style={{ fontWeight: "800", fontSize: "1rem", color: "#fff" }}>
              {teamConfig.name} Squad Sheet
            </span>
            {isUserTeam && onFormationChange ? (
              <select
                value={teamConfig.formation || "4-3-3"}
                onChange={(e) => onFormationChange(e.target.value as Formation)}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  background: "rgba(0,0,0,0.45)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  cursor: "pointer",
                  outline: "none",
                }}
                title="Change team formation"
              >
                <option value="4-3-3">4-3-3</option>
                <option value="4-4-2">4-4-2</option>
                <option value="3-5-2">3-5-2</option>
                <option value="5-3-2">5-3-2</option>
                <option value="4-2-3-1">4-2-3-1</option>
                <option value="3-4-3">3-4-3</option>
              </select>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                ({teamConfig.formation || "4-3-3"})
              </span>
            )}
          </div>

          {/* Transfer Budget & Squad Value Counters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "0.78rem",
              fontWeight: "700",
              color: "#10b981",
            }}
          >
            <DollarSign size={14} />
            <span>Budget: £{transferBudget.toFixed(1)}M</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "8px",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              fontSize: "0.78rem",
              fontWeight: "700",
              color: "#38bdf8",
            }}
          >
            <TrendingUp size={14} />
            <span>Squad Value: £{calculatedTotalSquadValue}M</span>
          </div>

          {/* Squad Chemistry & Harmony */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "8px",
              background: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              fontSize: "0.78rem",
              fontWeight: "700",
              color: "#c084fc",
            }}
            title="Squad Chemistry & Harmony: impacts on-pitch passing coherence. Selling stars and promoting youth temporarily drops harmony."
          >
            <Sparkles size={14} />
            <span>Harmony: {squadHarmony}%</span>
          </div>

          {/* Subs Counter */}
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "20px",
              background: subsLeft > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: subsLeft > 0 ? "#10b981" : "#ef4444",
              border: `1px solid ${subsLeft > 0 ? "#10b98155" : "#ef444455"}`,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <RefreshCw size={12} />
            <span>Subs: {subsLeft} / 3</span>
          </div>
        </div>

        {/* Team toggle buttons */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "10px" }}>
          <button
            onClick={() => {
              setSelectedTeam("home");
              setActiveSubbingTargetId(null);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              background: selectedTeam === "home" ? homeTeam.color : "transparent",
              color: selectedTeam === "home" ? "#000" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            {homeTeam.name}
          </button>
          <button
            onClick={() => {
              setSelectedTeam("away");
              setActiveSubbingTargetId(null);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              background: selectedTeam === "away" ? awayTeam.color : "transparent",
              color: selectedTeam === "away" ? "#fff" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            {awayTeam.name}
          </button>
        </div>
      </div>

      {/* Championship Manager Squad Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>
              <th style={{ padding: "8px 6px" }}>#</th>
              <th style={{ padding: "8px 6px" }}>Pos</th>
              <th style={{ padding: "8px 10px" }}>Agent / Player</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Tier</th>
              <th style={{ padding: "8px 8px", textAlign: "center" }}>CM Rating</th>
              <th style={{ padding: "8px 8px" }}>Health & Stamina</th>
              <th style={{ padding: "8px 8px", textAlign: "center" }}>Transfer Val</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Mastery</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>G</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>A</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Sh</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Tk</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Sv</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>Manager Action</th>
            </tr>
          </thead>
          <tbody>
            {displayPlayers.map((player) => {
              const rBadge = getRatingBadge(player.rating);
              const isSubbingThis = activeSubbingTargetId === player.id;
              const isLowRating = (player.rating || 6.0) < 5.8;

              return (
                <tr
                  key={player.id}
                  onClick={() => {
                    if (!isUserTeam) return;
                    if (isLiveMatch && subsLeft <= 0) return;

                    // If another starter is already selected in pre-match, swap positions!
                    if (activeSubbingTargetId && activeSubbingTargetId !== player.id && !isLiveMatch) {
                      const idxA = fallbackSquad.findIndex((p, i) => (p.number || i + 1) === activeTargetPlayer?.number);
                      const idxB = fallbackSquad.findIndex((p, i) => (p.number || i + 1) === player.number);
                      if (idxA !== -1 && idxB !== -1 && onSwapSquadPlayers) {
                        const newStarters = [...fallbackSquad];
                        const temp = newStarters[idxA];
                        newStarters[idxA] = newStarters[idxB];
                        newStarters[idxB] = temp;
                        onSwapSquadPlayers(newStarters, [...fallbackBench]);
                        setActiveSubbingTargetId(null);
                        return;
                      }
                    }

                    setActiveSubbingTargetId((prev) => (prev === player.id ? null : player.id));
                  }}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    background: isSubbingThis
                      ? "rgba(234, 179, 8, 0.16)"
                      : isLowRating
                      ? "rgba(239, 68, 68, 0.05)"
                      : "transparent",
                    outline: isSubbingThis ? "2px solid #fbbf24" : "none",
                    outlineOffset: "-2px",
                    cursor: isUserTeam ? "pointer" : "default",
                    transition: "all 0.15s ease",
                  }}
                  title={
                    isUserTeam
                      ? isSubbingThis
                        ? "Click to deselect player"
                        : `Click to select ${player.name} to sub off / swap`
                      : undefined
                  }
                >
                  {/* Number */}
                  <td style={{ padding: "10px 6px", fontWeight: "800", color: isSubbingThis ? "#fbbf24" : teamConfig.color }}>
                    {player.number}
                  </td>

                  {/* Position */}
                  <td style={{ padding: "10px 6px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        background: player.role === "GK" ? "#f59e0b33" : player.role.includes("B") ? "#3b82f633" : player.role.includes("M") ? "#10b98133" : "#ef444433",
                        color: player.role === "GK" ? "#fbbf24" : player.role.includes("B") ? "#60a5fa" : player.role.includes("M") ? "#34d399" : "#f87171",
                      }}
                    >
                      {player.role}
                    </span>
                  </td>

                  {/* Name & Thought */}
                  <td style={{ padding: "10px 10px", minWidth: "160px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "700", color: "#fff" }}>{player.name}</span>
                      {isSubbingThis && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "#fbbf24",
                            color: "#000",
                            fontWeight: "900",
                            letterSpacing: "0.04em",
                          }}
                        >
                          SUB TARGET
                        </span>
                      )}
                      {player.isYouth && (
                        <span style={{ fontSize: "0.65rem", padding: "1px 5px", borderRadius: "4px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", fontWeight: "800" }}>
                          YOUTH
                        </span>
                      )}
                      {player.goals ? (
                        <span title={`${player.goals} Goals`} style={{ fontSize: "0.75rem" }}>⚽ {player.goals > 1 ? `x${player.goals}` : ""}</span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      "{player.thought || "Awaiting instruction..."}"
                    </div>
                  </td>

                  {/* Prompt Capability Tier */}
                  <td style={{ padding: "10px 6px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        background: (player.tier || 3) >= 4 ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        color: (player.tier || 3) >= 4 ? "#fbbf24" : "var(--text-secondary)",
                      }}
                      title={player.promptCapability || `Tier ${player.tier || 3}`}
                    >
                      T{player.tier || 3}
                    </span>
                  </td>

                  {/* Championship Manager Rating */}
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: rBadge.bg,
                        border: `1px solid ${rBadge.border}`,
                        boxShadow: rBadge.glow,
                        fontWeight: "900",
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-mono)",
                        color: rBadge.color,
                      }}
                      title={rBadge.label}
                    >
                      <span>{(player.rating || 6.0).toFixed(1)}</span>
                      {isLowRating ? <AlertTriangle size={12} color="#ef4444" /> : null}
                    </div>
                  </td>

                  {/* Health & Stamina Bars */}
                  <td style={{ padding: "10px 8px", minWidth: "120px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {/* Health */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.68rem" }}>
                        <Heart size={10} color="#f43f5e" />
                        <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${player.health || 100}%`,
                              height: "100%",
                              background: (player.health || 100) > 75 ? "#10b981" : (player.health || 100) > 55 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", width: "24px" }}>{player.health || 100}%</span>
                      </div>
                      {/* Stamina */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.68rem" }}>
                        <Zap size={10} color="#38bdf8" />
                        <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${player.stamina || 100}%`, height: "100%", background: "#38bdf8" }} />
                        </div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", width: "24px" }}>{player.stamina || 100}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Transfer Value */}
                  <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: "800", color: "#10b981", fontSize: "0.85rem" }}>
                    £{player.transferValue || 12}M
                  </td>

                  {/* Tactical Mastery */}
                  <td style={{ padding: "10px 6px", textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "800",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                      title="Tactical Mastery % (Learned from manager directives and match experience)"
                    >
                      {player.tacticalMastery || 75}%
                    </span>
                  </td>

                  {/* Stats */}
                  <td style={{ padding: "10px 6px", textAlign: "center", fontWeight: "700", color: player.goals ? "#fbbf24" : "var(--text-muted)" }}>
                    {player.goals || 0}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "center", fontWeight: "700", color: player.assists ? "#38bdf8" : "var(--text-muted)" }}>
                    {player.assists || 0}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "center", color: "var(--text-muted)" }}>
                    {player.shots || 0}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "center", color: "var(--text-muted)" }}>
                    {player.tackles || 0}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "center", color: "var(--text-muted)" }}>
                    {player.saves || 0}
                  </td>

                  {/* Manager Action Buttons */}
                  <td style={{ padding: "10px 10px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                      {/* Chat Drawer trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatWithPlayer(player);
                        }}
                        className="btn"
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          borderRadius: "6px",
                          background: "rgba(0, 229, 255, 0.15)",
                          color: "#00E5FF",
                          border: "1px solid rgba(0, 229, 255, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer",
                        }}
                        title={`1-on-1 Touchline Chat with ${player.name}`}
                      >
                        <MessageSquare size={12} />
                        <span>Chat</span>
                      </button>

                      {/* Substitution / Swap Trigger (Available whenever user manages this team) */}
                      {isUserTeam && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isLiveMatch && subsLeft <= 0) return;
                            setActiveSubbingTargetId((prev) => (prev === player.id ? null : player.id));
                          }}
                          disabled={isLiveMatch && subsLeft <= 0}
                          className="btn"
                          style={{
                            padding: "5px 10px",
                            fontSize: "0.72rem",
                            fontWeight: "800",
                            borderRadius: "6px",
                            background: isSubbingThis
                              ? "rgba(234, 179, 8, 0.35)"
                              : isLowRating
                              ? "rgba(239, 68, 68, 0.25)"
                              : "rgba(255, 255, 255, 0.08)",
                            color: isSubbingThis ? "#fbbf24" : isLowRating ? "#f87171" : "#fff",
                            border: `1px solid ${
                              isSubbingThis
                                ? "#fbbf24"
                                : isLowRating
                                ? "#ef444488"
                                : "rgba(255, 255, 255, 0.18)"
                            }`,
                            cursor: isLiveMatch && subsLeft <= 0 ? "not-allowed" : "pointer",
                            opacity: isLiveMatch && subsLeft <= 0 ? 0.4 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: isSubbingThis ? "0 0 10px rgba(234, 179, 8, 0.3)" : "none",
                          }}
                          title={
                            isLiveMatch
                              ? subsLeft > 0
                                ? `Sub off ${player.name}`
                                : "No substitutions remaining"
                              : `Select ${player.name} to swap with bench substitute`
                          }
                        >
                          <RefreshCw size={12} />
                          <span>{isSubbingThis ? "Cancel Sub" : "Sub Off"}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Available Bench Substitutes Tray */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Available Bench Substitutes (3 Tactical Replacements)
            </span>
            {activeSubbingTargetId && activeTargetPlayer && (
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "rgba(234, 179, 8, 0.2)",
                  border: "1px solid #fbbf24",
                  color: "#fbbf24",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Target: #{activeTargetPlayer.number} {activeTargetPlayer.name} ({activeTargetPlayer.role})</span>
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "0.74rem",
              color: activeSubbingTargetId ? "#34d399" : "#38bdf8",
              fontWeight: activeSubbingTargetId ? "800" : "600",
            }}
          >
            {activeSubbingTargetId
              ? isLiveMatch
                ? `⚡ Subbing off ${activeTargetPlayer?.name || "player"} — click any substitute below to deploy!`
                : `⇄ Swapping ${activeTargetPlayer?.name || "player"} — click any substitute below to deploy to Starting 11!`
              : "Select any pitch player above and click 'Sub Off' to deploy"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
          {displayBench.map((sub: any, idx: number) => {
            const isUsed = sub.used;
            const canDeploy = isUserTeam && activeSubbingTargetId && !isUsed && (!isLiveMatch || subsLeft > 0);

            return (
              <div
                key={sub.id || idx}
                onClick={() => {
                  if (canDeploy) {
                    handleDeployOrSwapSub(sub, idx);
                  }
                }}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: isUsed
                    ? "rgba(0, 0, 0, 0.3)"
                    : canDeploy
                    ? "rgba(234, 179, 8, 0.1)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${
                    canDeploy
                      ? "#fbbf24"
                      : isUsed
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(255, 255, 255, 0.08)"
                  }`,
                  boxShadow: canDeploy ? "0 0 15px rgba(234, 179, 8, 0.25)" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isUsed ? 0.4 : 1,
                  transition: "all 0.2s ease",
                  cursor: canDeploy ? "pointer" : "default",
                  transform: canDeploy ? "translateY(-1px)" : "none",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "800", color: "#fbbf24", fontSize: "0.85rem" }}>
                      #{sub.number || 12 + idx}
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "0.88rem", color: "#fff" }}>
                      {sub.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "var(--accent-cyan)",
                        fontWeight: "700",
                      }}
                    >
                      {sub.role}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    Val: <strong style={{ color: "#10b981" }}>£{sub.transferValue || 6}M</strong> • Stamina: 100% (Fresh)
                  </div>
                </div>

                {/* Sub Action Button */}
                {isUserTeam && (
                  <button
                    disabled={!canDeploy}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canDeploy) {
                        handleDeployOrSwapSub(sub, idx);
                      }
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      cursor: canDeploy ? "pointer" : "not-allowed",
                      background: canDeploy
                        ? isLiveMatch
                          ? "linear-gradient(135deg, #10b981, #059669)"
                          : "linear-gradient(135deg, #fbbf24, #d97706)"
                        : "rgba(255, 255, 255, 0.05)",
                      color: canDeploy ? "#000" : "var(--text-muted)",
                      boxShadow: canDeploy
                        ? isLiveMatch
                          ? "0 0 10px rgba(16, 185, 129, 0.4)"
                          : "0 0 10px rgba(251, 191, 36, 0.4)"
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isUsed
                      ? "Deployed"
                      : canDeploy
                      ? isLiveMatch
                        ? "Deploy Sub 🔄"
                        : "Deploy to 11 ⇄"
                      : "Standby"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
