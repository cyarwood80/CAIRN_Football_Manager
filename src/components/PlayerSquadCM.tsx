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
  const subsLeft = subsRemaining[selectedTeam] ?? 4;

  const isLiveMatch = teamLivePlayers.length > 0;
  const isUserTeam = selectedTeam === userTeamKey;

  // Rating color helper (IBM Carbon Compliant)
  const getRatingBadge = (rating: number = 6.0) => {
    if (rating >= 8.0) {
      return {
        bg: "#e6f4ea",
        border: "#b7e1cd",
        color: "#0F6B45",
        label: "Superb",
      };
    }
    if (rating >= 6.8) {
      return {
        bg: "#e0f2fe",
        border: "#bae6fd",
        color: "#0369a1",
        label: "Good",
      };
    }
    if (rating >= 5.8) {
      return {
        bg: "#fef3c7",
        border: "#fde68a",
        color: "#b45309",
        label: "Average",
      };
    }
    return {
      bg: "#fce8e6",
      border: "#f5c6cb",
      color: "#da1e28",
      label: "Needs Sub",
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
      className="carbon-card"
      style={{
        padding: "14px 18px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Top Header: Club Identity, Financials & Team Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Shield size={16} color={teamConfig.color || "var(--cds-green-primary)"} />
            <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>
              {teamConfig.name} Squad Sheet
            </span>
            {isUserTeam && onFormationChange ? (
              <select
                value={teamConfig.formation || "4-3-3"}
                onChange={(e) => onFormationChange(e.target.value as Formation)}
                className="carbon-input"
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "1px 6px",
                  height: "22px",
                  cursor: "pointer",
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
              <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                ({teamConfig.formation || "4-3-3"})
              </span>
            )}
          </div>

          {/* Transfer Budget & Squad Value Counters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--cds-green-primary)",
            }}
          >
            <DollarSign size={13} />
            <span>Budget: £{transferBudget.toFixed(1)}M</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--cds-text-primary)",
            }}
          >
            <TrendingUp size={13} />
            <span>Squad Value: £{calculatedTotalSquadValue}M</span>
          </div>

          {/* Squad Chemistry & Harmony */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "var(--cds-layer)",
              border: "1px solid var(--cds-border)",
              fontSize: "11px",
              fontWeight: "700",
              color: "#7c3aed",
            }}
            title="Squad Harmony: impacts passing coherence"
          >
            <Sparkles size={13} />
            <span>Harmony: {squadHarmony}%</span>
          </div>

          {/* Subs Counter */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "4px",
              background: subsLeft > 0 ? "#e6f4ea" : "#fce8e6",
              color: subsLeft > 0 ? "#0F6B45" : "#da1e28",
              border: `1px solid ${subsLeft > 0 ? "#b7e1cd" : "#f5c6cb"}`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <RefreshCw size={11} />
            <span>Subs: {subsLeft} / 4</span>
          </div>
        </div>

        {/* Team toggle buttons */}
        <div style={{ display: "flex", gap: "4px", background: "var(--cds-layer)", padding: "2px", borderRadius: "4px", border: "1px solid var(--cds-border)" }}>
          <button
            type="button"
            onClick={() => {
              setSelectedTeam("home");
              setActiveSubbingTargetId(null);
            }}
            className={`btn ${selectedTeam === "home" ? "btn-primary" : "btn-secondary"}`}
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              height: "24px",
            }}
          >
            {homeTeam.name}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTeam("away");
              setActiveSubbingTargetId(null);
            }}
            className={`btn ${selectedTeam === "away" ? "btn-primary" : "btn-secondary"}`}
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              height: "24px",
            }}
          >
            {awayTeam.name}
          </button>
        </div>
      </div>

      {/* Championship Manager Squad Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="carbon-table" style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th style={{ width: "24px", textAlign: "center" }}>#</th>
              <th style={{ width: "40px" }}>Pos</th>
              <th>Player / Agent</th>
              <th style={{ width: "36px", textAlign: "center" }}>Tier</th>
              <th style={{ width: "65px", textAlign: "center" }}>Rating</th>
              <th style={{ width: "140px" }}>Stamina & Health</th>
              <th style={{ width: "60px", textAlign: "center" }}>Value</th>
              <th style={{ width: "45px", textAlign: "center" }}>Mast</th>
              <th style={{ width: "26px", textAlign: "center" }}>G</th>
              <th style={{ width: "26px", textAlign: "center" }}>A</th>
              <th style={{ width: "26px", textAlign: "center" }}>Sh</th>
              <th style={{ width: "26px", textAlign: "center" }}>Tk</th>
              <th style={{ width: "26px", textAlign: "center" }}>Sv</th>
              <th style={{ width: "140px", textAlign: "right" }}>Actions</th>
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
                    background: isSubbingThis
                      ? "#fef3c7"
                      : isLowRating
                      ? "#fdf2f2"
                      : "transparent",
                    cursor: isUserTeam ? "pointer" : "default",
                  }}
                >
                  {/* Number */}
                  <td style={{ textAlign: "center", fontWeight: "700", color: isSubbingThis ? "#b45309" : "var(--cds-text-primary)" }}>
                    {player.number}
                  </td>

                  {/* Position */}
                  <td>
                    <span
                      style={{
                        padding: "1px 5px",
                        borderRadius: "3px",
                        fontSize: "10px",
                        fontWeight: "700",
                        background: player.role === "GK" ? "#fef3c7" : player.role.includes("B") ? "#e0f2fe" : player.role.includes("M") ? "#e6f4ea" : "#fee2e2",
                        color: player.role === "GK" ? "#b45309" : player.role.includes("B") ? "#0369a1" : player.role.includes("M") ? "#0F6B45" : "#b91c1c",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      {player.role}
                    </span>
                  </td>

                  {/* Name & Thought */}
                  <td style={{ minWidth: "150px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "700", color: "var(--cds-text-primary)" }}>{player.name}</span>
                      {isSubbingThis && (
                        <span className="badge badge-warning" style={{ fontSize: "9px", padding: "0 4px" }}>
                          TARGET
                        </span>
                      )}
                      {player.isYouth && (
                        <span className="badge badge-info" style={{ fontSize: "9px", padding: "0 4px" }}>
                          YOUTH
                        </span>
                      )}
                      {player.goals ? (
                        <span title={`${player.goals} Goals`} style={{ fontSize: "11px" }}>⚽ {player.goals > 1 ? `x${player.goals}` : ""}</span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--cds-text-secondary)",
                        fontStyle: "italic",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      "{player.thought || "Awaiting tactical instruction..."}"
                    </div>
                  </td>

                  {/* Prompt Capability Tier */}
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "1px 4px",
                        borderRadius: "2px",
                        fontSize: "10px",
                        fontWeight: "700",
                        background: (player.tier || 3) >= 4 ? "#fef3c7" : "var(--cds-layer)",
                        color: (player.tier || 3) >= 4 ? "#b45309" : "var(--cds-text-muted)",
                        border: "1px solid var(--cds-border-subtle)",
                      }}
                    >
                      T{player.tier || 3}
                    </span>
                  </td>

                  {/* Championship Manager Rating */}
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: rBadge.bg,
                        border: `1px solid ${rBadge.border}`,
                        fontWeight: "800",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                        color: rBadge.color,
                      }}
                      title={rBadge.label}
                    >
                      <span>{(player.rating || 6.0).toFixed(1)}</span>
                      {isLowRating && <AlertTriangle size={11} color="#da1e28" />}
                    </div>
                  </td>

                  {/* Stamina & Health Bars */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {/* Stamina */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                        <Zap size={9} color="var(--cds-green-primary)" />
                        <div style={{ flex: 1, height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${player.stamina || 100}%`,
                              height: "100%",
                              background: (player.stamina || 100) > 70 ? "var(--cds-green-primary)" : (player.stamina || 100) > 40 ? "#d97706" : "#da1e28",
                            }}
                          />
                        </div>
                        <span style={{ color: "var(--cds-text-muted)", fontSize: "10px", width: "22px", textAlign: "right" }}>{player.stamina || 100}%</span>
                      </div>
                      {/* Health */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                        <Heart size={9} color="#e11d48" />
                        <div style={{ flex: 1, height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${player.health || 100}%`,
                              height: "100%",
                              background: (player.health || 100) > 75 ? "var(--cds-green-primary)" : "#da1e28",
                            }}
                          />
                        </div>
                        <span style={{ color: "var(--cds-text-muted)", fontSize: "10px", width: "22px", textAlign: "right" }}>{player.health || 100}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Transfer Value */}
                  <td style={{ textAlign: "center", fontWeight: "700", color: "var(--cds-green-primary)", fontSize: "11px" }}>
                    £{player.transferValue || 12}M
                  </td>

                  {/* Tactical Mastery */}
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        background: "#e6f4ea",
                        color: "#0F6B45",
                        border: "1px solid #b7e1cd",
                      }}
                      title="Tactical Mastery %"
                    >
                      {player.tacticalMastery || 75}%
                    </span>
                  </td>

                  {/* Stats */}
                  <td style={{ textAlign: "center", fontWeight: "700", color: player.goals ? "var(--cds-green-primary)" : "var(--cds-text-muted)" }}>
                    {player.goals || 0}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "700", color: player.assists ? "#0284c7" : "var(--cds-text-muted)" }}>
                    {player.assists || 0}
                  </td>
                  <td style={{ textAlign: "center", color: "var(--cds-text-muted)" }}>
                    {player.shots || 0}
                  </td>
                  <td style={{ textAlign: "center", color: "var(--cds-text-muted)" }}>
                    {player.tackles || 0}
                  </td>
                  <td style={{ textAlign: "center", color: "var(--cds-text-muted)" }}>
                    {player.saves || 0}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatWithPlayer(player);
                        }}
                        className="btn btn-secondary"
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          height: "22px",
                          gap: "3px",
                        }}
                        title={`1-on-1 Touchline Chat with ${player.name}`}
                      >
                        <MessageSquare size={11} />
                        <span>Chat</span>
                      </button>

                      {isUserTeam && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isLiveMatch && subsLeft <= 0) return;
                            setActiveSubbingTargetId((prev) => (prev === player.id ? null : player.id));
                          }}
                          disabled={isLiveMatch && subsLeft <= 0}
                          className={`btn ${isSubbingThis ? "btn-primary" : "btn-secondary"}`}
                          style={{
                            padding: "2px 6px",
                            fontSize: "11px",
                            height: "22px",
                            gap: "3px",
                          }}
                          title={
                            isLiveMatch
                              ? subsLeft > 0
                                ? `Sub off ${player.name}`
                                : "No substitutions remaining"
                              : `Select ${player.name} to swap`
                          }
                        >
                          <RefreshCw size={11} />
                          <span>{isSubbingThis ? "Cancel" : "Sub"}</span>
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
          borderTop: "1px solid var(--cds-border)",
          paddingTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Bench Substitutes (4 Tactical Replacements: GK, DEF, MID, ST)
            </span>
            {activeSubbingTargetId && activeTargetPlayer && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#b45309",
                  fontWeight: "700",
                }}
              >
                Target: #{activeTargetPlayer.number} {activeTargetPlayer.name} ({activeTargetPlayer.role})
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "11px",
              color: activeSubbingTargetId ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              fontWeight: activeSubbingTargetId ? "700" : "500",
            }}
          >
            {activeSubbingTargetId
              ? isLiveMatch
                ? `⚡ Select a bench substitute below to deploy!`
                : `⇄ Select a bench substitute below to swap into Starting 11!`
              : "Click 'Sub' on any player above to replace"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
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
                  padding: "8px 12px",
                  borderRadius: "4px",
                  background: isUsed
                    ? "var(--cds-layer)"
                    : canDeploy
                    ? "#fef3c7"
                    : "var(--cds-surface)",
                  border: `1px solid ${
                    canDeploy
                      ? "#fde68a"
                      : "var(--cds-border)"
                  }`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isUsed ? 0.4 : 1,
                  cursor: canDeploy ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontWeight: "700", color: "var(--cds-text-primary)", fontSize: "12px" }}>
                      #{sub.number || 12 + idx}
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "12px", color: "var(--cds-text-primary)" }}>
                      {sub.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 5px",
                        borderRadius: "3px",
                        background: "var(--cds-layer)",
                        color: "var(--cds-text-secondary)",
                        fontWeight: "700",
                        border: "1px solid var(--cds-border-subtle)",
                      }}
                    >
                      {sub.role}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)", marginTop: "2px" }}>
                    Val: <strong style={{ color: "var(--cds-green-primary)" }}>£{sub.transferValue || 6}M</strong> • Fresh (100%)
                  </div>
                </div>

                {isUserTeam && (
                  <button
                    type="button"
                    disabled={!canDeploy}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canDeploy) {
                        handleDeployOrSwapSub(sub, idx);
                      }
                    }}
                    className={`btn ${canDeploy ? "btn-primary" : "btn-secondary"}`}
                    style={{
                      padding: "3px 8px",
                      fontSize: "11px",
                      height: "24px",
                    }}
                  >
                    {isUsed
                      ? "Deployed"
                      : canDeploy
                      ? isLiveMatch
                        ? "Deploy"
                        : "Swap"
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
