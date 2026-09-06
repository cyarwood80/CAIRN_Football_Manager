// src/components/DashboardOverview.tsx
import React, { useState } from "react";
import {
  Trophy,
  FileText,
  CreditCard,
  Activity,
  Sparkles,
  UserCheck,
  ClipboardList,
  Calendar,
  X,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { TeamConfig, SquadPlayerConfig, CalendarState } from "../types";

interface DashboardOverviewProps {
  teamConfig: TeamConfig;
  budget: number;
  calendarState: CalendarState | null;
  nextOpponentName?: string;
  onViewMatchPreview: () => void;
  onViewAllMatches: () => void;
  onViewFullSquad: () => void;
  onSelectPlayerDossier: (player: SquadPlayerConfig) => void;
  onApplyTacticalRecommendation?: (directive: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  teamConfig,
  budget,
  calendarState,
  nextOpponentName = "Liverpool",
  onViewMatchPreview,
  onViewAllMatches,
  onViewFullSquad,
  onSelectPlayerDossier,
  onApplyTacticalRecommendation,
}) => {
  const [aiInsightApplied, setAiInsightApplied] = useState(false);
  const [aiInsightDismissed, setAiInsightDismissed] = useState(false);

  // Full 14-player squad: 11 Starters + 3 Substitutes
  const starting11 = teamConfig.starting11 || [];
  const benchSubs = teamConfig.benchSubs || [];

  const default14Roster: SquadPlayerConfig[] = [
    { number: 1, name: "Alisson Becker", role: "GK", rating: 8.9, transferValue: 32.0, personalityTrait: "Leader" },
    { number: 2, name: "Trent Alexander-Arnold", role: "RB", rating: 8.7, transferValue: 70.0, personalityTrait: "Creative" },
    { number: 3, name: "Virgil van Dijk", role: "CB", rating: 8.9, transferValue: 60.0, personalityTrait: "Leader" },
    { number: 4, name: "Ruben Dias", role: "CB", rating: 8.8, transferValue: 65.0, personalityTrait: "Methodical" },
    { number: 5, name: "Andrew Robertson", role: "LB", rating: 8.6, transferValue: 40.0, personalityTrait: "Tenacious" },
    { number: 6, name: "Declan Rice", role: "CDM", rating: 8.8, transferValue: 85.0, personalityTrait: "Leader" },
    { number: 7, name: "Jude Bellingham", role: "CM", rating: 9.0, transferValue: 120.0, personalityTrait: "Creative" },
    { number: 8, name: "Bruno Fernandes", role: "CAM", rating: 8.7, transferValue: 75.0, personalityTrait: "Creative" },
    { number: 9, name: "Mohamed Salah", role: "RW", rating: 8.8, transferValue: 82.0, personalityTrait: "Flair" },
    { number: 10, name: "Erling Haaland", role: "ST", rating: 9.1, transferValue: 140.0, personalityTrait: "Aggressive" },
    { number: 11, name: "Marcus Rashford", role: "LW", rating: 8.5, transferValue: 55.0, personalityTrait: "Flair" },
    { number: 12, name: "Caoimhin Kelleher", role: "GK", rating: 7.8, transferValue: 18.0, personalityTrait: "Methodical" },
    { number: 13, name: "Harvey Elliott", role: "CM", rating: 8.0, transferValue: 28.0, personalityTrait: "Creative" },
    { number: 14, name: "Darwin Nunez", role: "ST", rating: 8.2, transferValue: 48.0, personalityTrait: "Aggressive" },
  ];

  const squadPlayers: (SquadPlayerConfig & { isBench?: boolean })[] =
    starting11.length > 0 || benchSubs.length > 0
      ? [
          ...starting11.map((p, idx) => ({ ...p, number: p.number || idx + 1, isBench: false })),
          ...benchSubs.map((p, idx) => ({ ...p, number: p.number || starting11.length + idx + 1, isBench: true })),
        ]
      : default14Roster.map((p, idx) => ({ ...p, isBench: idx >= 11 }));

  const recentMatches = [
    { date: "29 Aug", opponent: "Man Utd", score: "2 - 0", outcome: "W", crest: "🔴" },
    { date: "22 Aug", opponent: "Bournemouth", score: "3 - 1", outcome: "W", crest: "🍒" },
    { date: "15 Aug", opponent: "Spurs", score: "1 - 1", outcome: "D", crest: "⚪" },
    { date: "8 Aug", opponent: "Newcastle", score: "4 - 0", outcome: "W", crest: "⚫" },
    { date: "1 Aug", opponent: "West Ham", score: "2 - 1", outcome: "W", crest: "⚒️" },
  ];

  const newsItems = [
    { icon: UserCheck, text: "Scout recommends 2 targets for January", time: "2h" },
    { icon: ClipboardList, text: "Board meeting scheduled for Monday", time: "5h" },
    { icon: Activity, text: "Rashford returns to full training", time: "8h" },
    { icon: Calendar, text: "Winter transfer window opens in 3 months", time: "1d" },
  ];

  const handleApplyInsight = () => {
    setAiInsightApplied(true);
    if (onApplyTacticalRecommendation) {
      onApplyTacticalRecommendation("Move right winger inside to protect flank and instruct full-back to hold position.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Welcome Greeting Banner */}
      <div>
        <h1 className="type-h1" style={{ marginBottom: "4px" }}>
          Good afternoon, Chris
        </h1>
        <p className="type-body" style={{ color: "var(--cds-text-secondary)" }}>
          Here's what's happening at {teamConfig.name || "CAIRN FC"} today.
        </p>
      </div>

      {/* Row 1: 4 KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {/* KPI 1: League Position */}
        <div className="carbon-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Trophy size={18} color="var(--cds-text-secondary)" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>League Position</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-text-primary)", lineHeight: 1.1 }}>
              3rd
            </span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-green-primary)" }}>
              ▲ +2 from last match
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            Premier League
          </div>
        </div>

        {/* KPI 2: Form */}
        <div className="carbon-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <FileText size={18} color="var(--cds-text-secondary)" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>Form</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0" }}>
            <span className="form-pill form-pill-win">W</span>
            <span className="form-pill form-pill-win">W</span>
            <span className="form-pill form-pill-draw">D</span>
            <span className="form-pill form-pill-win">W</span>
            <span className="form-pill form-pill-win">W</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
            Last 5 matches
          </div>
        </div>

        {/* KPI 3: Finances */}
        <div className="carbon-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <CreditCard size={18} color="var(--cds-text-secondary)" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>Finances</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-text-primary)", lineHeight: 1.1 }}>
            £{(teamConfig.totalSquadValue || 42.3).toFixed(1)}m
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-green-primary)", marginTop: "4px", fontWeight: "500" }}>
            Transfer budget: £{budget.toFixed(1)}m
          </div>
        </div>

        {/* KPI 4: Squad Health */}
        <div className="carbon-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Activity size={18} color="var(--cds-text-secondary)" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-secondary)" }}>Squad Health</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-text-primary)", lineHeight: 1.1 }}>
              4
            </span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cds-red)" }}>
              ▲ +1
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            Injured / Doubtful
          </div>
        </div>
      </div>

      {/* Row 2: Next Match, Recent Results, AI Insight & Intelligence */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.1fr", gap: "16px", alignItems: "stretch" }}>
        {/* Next Match Card */}
        <div className="carbon-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className="type-h3">Next Match</span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
                Premier League • Matchday {calendarState?.currentGameweek || 5}
              </span>
            </div>

            {/* Matchup Banner */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "16px 0" }}>
              {/* Home Team */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "54px",
                    background: "linear-gradient(135deg, #0F6B45, #085C3B)",
                    clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#F1C21B", fontWeight: "900", fontSize: "16px" }}>CFC</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{teamConfig.name || "CAIRN FC"}</span>
              </div>

              {/* VS Divider */}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cds-text-muted)", background: "var(--cds-layer)", padding: "2px 8px", borderRadius: "10px" }}>
                  VS
                </span>
                <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", marginTop: "6px", fontWeight: "500" }}>
                  Saturday, 15:00
                </div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                  Cairn Stadium
                </div>
              </div>

              {/* Away Team */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "54px",
                    background: "#C8102E",
                    clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#FFFFFF", fontWeight: "900", fontSize: "16px" }}>LIV</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{nextOpponentName}</span>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--cds-border-subtle)" }}>
            <button
              className="btn btn-primary"
              onClick={onViewMatchPreview}
              style={{ fontSize: "13px", height: "34px", padding: "0 14px" }}
            >
              View Match Preview
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>🏠 Home</div>
              <div style={{ fontSize: "12px", color: "var(--cds-green-primary)", fontWeight: "600" }}>
                ▲ 52% Win probability
              </div>
            </div>
          </div>
        </div>

        {/* Recent Results Card */}
        <div className="carbon-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span className="type-h3">Recent Results</span>
            </div>

            {/* Results Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentMatches.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: "2px",
                    background: idx % 2 === 0 ? "var(--cds-layer)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "var(--cds-text-muted)", width: "50px", fontSize: "12px" }}>{m.date}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                    <span>{m.crest}</span>
                    <span style={{ fontWeight: "500" }}>{m.opponent}</span>
                  </div>
                  <span style={{ fontWeight: "700", margin: "0 12px", fontFamily: "var(--font-mono)" }}>{m.score}</span>
                  <span className={`form-pill ${m.outcome === "W" ? "form-pill-win" : "form-pill-draw"}`} style={{ width: "20px", height: "20px", fontSize: "10px" }}>
                    {m.outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "right", paddingTop: "12px", borderTop: "1px solid var(--cds-border-subtle)" }}>
            <button
              className="btn btn-ghost"
              onClick={onViewAllMatches}
              style={{ fontSize: "12px", color: "var(--cds-green-primary)", fontWeight: "600", padding: "4px 8px", height: "auto" }}
            >
              View All Matches →
            </button>
          </div>
        </div>

        {/* AI Insight & Key News Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* AI Insight Card */}
          {!aiInsightDismissed && (
            <div
              className="carbon-card"
              style={{
                padding: "16px",
                background: "var(--cds-layer)",
                borderColor: "rgba(15, 107, 69, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-green-primary)", fontWeight: "700", fontSize: "13px" }}>
                  <Sparkles size={16} />
                  <span>AI Insight</span>
                </div>
                <button
                  onClick={() => setAiInsightDismissed(true)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--cds-text-muted)" }}
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: "13px", color: "var(--cds-text-secondary)", lineHeight: 1.45, marginBottom: "12px" }}>
                {aiInsightApplied
                  ? "✓ Recommendation applied: Winger tucked inside to protect right channel and maintain compact shape."
                  : "Your right flank is being overloaded. Consider moving the winger inside and instructing the full-back to hold position."}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {!aiInsightApplied ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleApplyInsight}
                      style={{ fontSize: "12px", height: "30px", padding: "0 12px" }}
                    >
                      Apply recommendation
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setAiInsightApplied(true)}
                      style={{ fontSize: "12px", height: "30px", padding: "0 10px" }}
                    >
                      Review
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--cds-green-primary)", fontWeight: "600" }}>
                    Active in Matchday Tactics
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Key News & Intelligence */}
          <div className="carbon-card" style={{ padding: "16px", flex: 1 }}>
            <div className="type-h3" style={{ fontSize: "14px", marginBottom: "12px" }}>
              Key News & Intelligence
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {newsItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "var(--cds-layer)",
                          border: "1px solid var(--cds-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={13} color="var(--cds-text-secondary)" />
                      </div>
                      <span style={{ color: "var(--cds-text-primary)", fontWeight: "400" }}>{item.text}</span>
                    </div>
                    <span style={{ color: "var(--cds-text-muted)", fontSize: "11px" }}>{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Squad Overview Table */}
      <div className="carbon-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h2 className="type-h3">Squad Overview (14 Players)</h2>
            <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
              Full 14-player matchday squad: 11 Starters + 3 Substitutes
            </span>
          </div>
          <button
            className="btn btn-ghost"
            onClick={onViewFullSquad}
            style={{ fontSize: "13px", color: "var(--cds-green-primary)", fontWeight: "600", height: "auto", padding: "4px 8px" }}
          >
            View Full Squad →
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="carbon-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Player</th>
                <th>Status</th>
                <th>Pos</th>
                <th>OVR</th>
                <th>Form</th>
                <th>Value</th>
                <th>Contract</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {squadPlayers.map((player) => {
                const ovrScore = Math.round((player.rating || 8.0) * 10);
                const isBench = player.isBench ?? (player.number ? player.number > 11 : false);
                return (
                  <tr
                    key={`${player.name}_${player.number}`}
                    onClick={() => onSelectPlayerDossier(player)}
                    style={{ cursor: "pointer" }}
                    title="Click to view detailed Player Dossier"
                  >
                    <td style={{ color: "var(--cds-text-muted)", fontWeight: "600" }}>{player.number}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <PlayerAvatar
                          name={player.name}
                          size="sm"
                          teamColor="#0F6B45"
                          showFlag={true}
                          traitIcon={player.personalityIcon}
                        />
                        <div>
                          <div style={{ fontWeight: "600", color: "var(--cds-text-primary)" }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                            {player.personalityTrait || "Methodical"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: isBench ? "var(--cds-layer)" : "rgba(15, 107, 69, 0.1)",
                          color: isBench ? "var(--cds-text-secondary)" : "var(--cds-green-primary)",
                          border: `1px solid ${isBench ? "var(--cds-border)" : "rgba(15, 107, 69, 0.3)"}`,
                          padding: "2px 6px",
                          borderRadius: "2px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {isBench ? "BENCH" : "STARTER"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "var(--cds-layer)",
                          border: "1px solid var(--cds-border)",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {player.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--cds-green-primary)", fontFamily: "var(--font-mono)" }}>
                        {ovrScore}
                      </span>
                    </td>
                    <td>
                      {/* Green Form Bars */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
                        <span style={{ width: "3px", height: "8px", background: "var(--cds-green-primary)", borderRadius: "1px" }} />
                        <span style={{ width: "3px", height: "10px", background: "var(--cds-green-primary)", borderRadius: "1px" }} />
                        <span style={{ width: "3px", height: "14px", background: "var(--cds-green-primary)", borderRadius: "1px" }} />
                        <span style={{ width: "3px", height: "12px", background: "var(--cds-green-primary)", borderRadius: "1px" }} />
                        <span style={{ width: "3px", height: "14px", background: "var(--cds-green-primary)", borderRadius: "1px" }} />
                      </div>
                    </td>
                    <td style={{ fontWeight: "500", fontFamily: "var(--font-mono)" }}>
                      £{(player.transferValue || 35.0).toFixed(1)}m
                    </td>
                    <td style={{ color: "var(--cds-text-secondary)", fontSize: "13px" }}>2028</td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--cds-green-primary)", fontSize: "12px", fontWeight: "600" }}>
                        Inspect →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
