// src/components/LeagueTable.tsx
import React, { useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
} from "lucide-react";
import type { LeagueClubStanding, LeagueMatchHistoryItem } from "../types";

interface LeagueTableProps {
  standings: LeagueClubStanding[];
  gameweek: number;
  recentMatches: LeagueMatchHistoryItem[];
  userTeamName?: string;
  activeTier?: string;
  currentTier?: string;
  onSelectTier?: (tierKey: string) => void;
  onResetLeague?: () => void;
  onQuickPlayMatch?: (opponentKey: string) => void;
}

const TIER_METADATA: Record<
  string,
  { name: string; short: string; color: string; desc: string; promoTarget: string | null; windfall: string }
> = {
  tier_1: {
    name: "Premier Championship",
    short: "Tier 1",
    color: "#f59e0b",
    desc: "Top Flight: 20 European & World Titans",
    promoTarget: null,
    windfall: "🏆 Champions Prize: £75M + Global Glory",
  },
  tier_2: {
    name: "Division One",
    short: "Tier 2",
    color: "#00E5FF",
    desc: "Challenger League: 20 High-Pressing Contenders",
    promoTarget: "Premier Championship",
    windfall: "▲ Top 3 Promoted: £50M TV Windfall",
  },
  tier_3: {
    name: "Division Two",
    short: "Tier 3",
    color: "#a855f7",
    desc: "Development League: 20 Hungry Clubs",
    promoTarget: "Division One",
    windfall: "▲ Top 3 Promoted: £18M Investment",
  },
  tier_4: {
    name: "National League",
    short: "Tier 4",
    color: "#10b981",
    desc: "Grassroots Pyramid Base: 20 Determined Clubs (Career Start)",
    promoTarget: "Division Two",
    windfall: "▲ Top 3 Promoted: £6M Breakthrough Reward",
  },
};

export const LeagueTable: React.FC<LeagueTableProps> = ({
  standings,
  gameweek,
  recentMatches,
  userTeamName = "London Cybers FC",
  activeTier = "tier_4",
  currentTier,
  onSelectTier,
  onResetLeague,
  onQuickPlayMatch,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>(currentTier || activeTier || "tier_4");

  const handleTierClick = (tKey: string) => {
    setSelectedTier(tKey);
    if (onSelectTier) onSelectTier(tKey);
  };

  const tierInfo = TIER_METADATA[selectedTier] || TIER_METADATA.tier_4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "20px 28px",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
          border: `1px solid ${tierInfo.color}44`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${tierInfo.color}, #030712)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${tierInfo.color}55`,
            }}
          >
            <Trophy size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: "900",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: `${tierInfo.color}22`,
                  color: tierInfo.color,
                  border: `1px solid ${tierInfo.color}55`,
                  textTransform: "uppercase",
                }}
              >
                {tierInfo.short}
              </span>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", letterSpacing: "-0.02em", color: "#fff" }}>
                {tierInfo.name.toUpperCase()}
              </h1>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "10px", marginTop: "3px" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>ROUND / GAMEWEEK #{gameweek}</span>
              <span>•</span>
              <span>{tierInfo.desc}</span>
            </div>
          </div>
        </div>

        {onResetLeague && (
          <button
            className="btn btn-secondary"
            onClick={onResetLeague}
            style={{ padding: "8px 16px", fontSize: "0.8rem", gap: "6px" }}
          >
            <RotateCcw size={14} /> Reset 4-Tier Season
          </button>
        )}
      </div>

      {/* Tier Selector Navigation Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "10px",
        }}
      >
        {Object.entries(TIER_METADATA).map(([key, meta]) => {
          const isSelected = selectedTier === key;
          const isUserActiveCareer = activeTier === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleTierClick(key)}
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                border: isSelected ? `2px solid ${meta.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                background: isSelected
                  ? `linear-gradient(135deg, ${meta.color}22, rgba(15, 23, 42, 0.95))`
                  : "rgba(11, 15, 25, 0.6)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? `0 0 20px ${meta.color}33` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "900", fontSize: "0.95rem", color: isSelected ? "#fff" : "#cbd5e1" }}>
                  {meta.name}
                </span>
                {isUserActiveCareer && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: "900",
                      background: "rgba(0, 229, 255, 0.2)",
                      color: "#00E5FF",
                      border: "1px solid rgba(0, 229, 255, 0.5)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    YOU START HERE
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.72rem", color: isSelected ? meta.color : "var(--text-muted)", fontWeight: "700" }}>
                {meta.short} • 20 Clubs
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
        {/* Main Standings Table */}
        <div
          className="glass-panel"
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(11, 15, 25, 0.85)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "12px 14px", width: "50px", textAlign: "center" }}>Pos</th>
                <th style={{ padding: "12px 14px" }}>Club</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>PL</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>W</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>D</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>L</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>GF</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>GA</th>
                <th style={{ padding: "12px 8px", textAlign: "center" }}>GD</th>
                <th style={{ padding: "12px 12px", textAlign: "center", color: "var(--accent-gold)", fontWeight: "900" }}>PTS</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>Recent Form</th>
                {onQuickPlayMatch && <th style={{ padding: "12px 12px", textAlign: "center" }}>Fixture</th>}
              </tr>
            </thead>
            <tbody>
              {standings.map((club, idx) => {
                const isUserClub = club.name.toLowerCase() === userTeamName.toLowerCase();
                const rankDelta = (club.prevRank || idx + 1) - (idx + 1);
                const isTop1 = idx === 0;
                const isPromotionZone = idx < 3; // Ranks 1-3
                const isRelegationZone = idx >= 17; // Ranks 18-20 (bottom 3)

                return (
                  <tr
                    key={club.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      borderLeft: isTop1
                        ? "4px solid var(--accent-gold)"
                        : isPromotionZone
                        ? "4px solid #10b981"
                        : isRelegationZone
                        ? "4px solid #ef4444"
                        : "4px solid transparent",
                      background: isUserClub
                        ? "rgba(0, 242, 254, 0.1)"
                        : isPromotionZone
                        ? "rgba(16, 185, 129, 0.03)"
                        : isRelegationZone
                        ? "rgba(239, 68, 68, 0.03)"
                        : idx % 2 === 0
                        ? "rgba(255, 255, 255, 0.01)"
                        : "transparent",
                      transition: "background 0.2s ease",
                    }}
                  >
                    {/* Position & Rank Delta Indicator */}
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        <span
                          style={{
                            fontWeight: "900",
                            fontSize: "0.95rem",
                            color: isTop1
                              ? "var(--accent-gold)"
                              : isPromotionZone
                              ? "#10b981"
                              : isRelegationZone
                              ? "#ef4444"
                              : "#fff",
                          }}
                        >
                          {idx + 1}
                        </span>
                        {rankDelta > 0 && (
                          <span style={{ color: "var(--accent-green)", fontSize: "0.65rem", display: "flex", alignItems: "center" }} title={`Up ${rankDelta} spots`}>
                            <TrendingUp size={11} />
                          </span>
                        )}
                        {rankDelta < 0 && (
                          <span style={{ color: "var(--accent-pink)", fontSize: "0.65rem", display: "flex", alignItems: "center" }} title={`Down ${Math.abs(rankDelta)} spots`}>
                            <TrendingDown size={11} />
                          </span>
                        )}
                        {rankDelta === 0 && (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                            <Minus size={9} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Club Name & Badge */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            background: club.color,
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            boxShadow: `0 0 8px ${club.color}55`,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: isUserClub ? "800" : "600",
                            color: isUserClub ? "var(--accent-cyan)" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {club.name}
                          {isUserClub && (
                            <span
                              style={{
                                fontSize: "0.65rem",
                                background: "rgba(0, 242, 254, 0.2)",
                                color: "var(--accent-cyan)",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontWeight: "800",
                              }}
                            >
                              YOU
                            </span>
                          )}
                          {isTop1 && <span title="League Leader / Champions">👑</span>}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-secondary)" }}>{club.played}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#e2e8f0", fontWeight: "600" }}>{club.won}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-secondary)" }}>{club.drawn}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-secondary)" }}>{club.lost}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>{club.gf}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-muted)" }}>{club.ga}</td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: club.gd > 0 ? "var(--accent-green)" : club.gd < 0 ? "var(--accent-pink)" : "var(--text-muted)",
                      }}
                    >
                      {club.gd > 0 ? `+${club.gd}` : club.gd}
                    </td>
                    <td
                      style={{
                        padding: "12px 12px",
                        textAlign: "center",
                        fontWeight: "900",
                        fontSize: "1.05rem",
                        color: "var(--accent-gold)",
                      }}
                    >
                      {club.pts}
                    </td>

                    {/* Last 5 Form Badges */}
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        {club.form.length === 0 ? (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>—</span>
                        ) : (
                          club.form.map((f, fIdx) => (
                            <div
                              key={fIdx}
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.65rem",
                                fontWeight: "800",
                                color: "#000",
                                background:
                                  f === "W"
                                    ? "var(--accent-green)"
                                    : f === "D"
                                    ? "var(--accent-gold)"
                                    : "var(--accent-pink)",
                              }}
                            >
                              {f}
                            </div>
                          ))
                        )}
                      </div>
                    </td>

                    {onQuickPlayMatch && (
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        {!isUserClub ? (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.72rem", gap: "4px" }}
                            onClick={() =>
                              onQuickPlayMatch(
                                club.name
                              )
                            }
                          >
                            ⚡ Play
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "700" }}>Home Club</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Promotion & Relegation Legend */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(0, 0, 0, 0.4)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "0.74rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: "700" }}>
                <ArrowUpCircle size={14} /> Pos 1-3: Automatic Promotion Zone
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontWeight: "700" }}>
                <ArrowDownCircle size={14} /> Pos 18-20: Relegation Zone
              </span>
            </div>
            <span style={{ color: "var(--accent-gold)", fontWeight: "800" }}>
              {tierInfo.windfall}
            </span>
          </div>
        </div>

        {/* Right Column: Recent Results & Pyramid Explainer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Recent Gameweek Results */}
          <div className="glass-panel" style={{ padding: "16px 20px", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
              <Calendar size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: "800", fontSize: "0.88rem", color: "#fff" }}>
                RECENT MATCH RESULTS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentMatches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Play a match to kickoff Gameweek #1 results!
                </div>
              ) : (
                recentMatches.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.78rem",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div>
                      <span style={{ color: "#fff", fontWeight: "700" }}>{m.home}</span>
                      <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>vs</span>
                      <span style={{ color: "#cbd5e1" }}>{m.away}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: "800",
                        padding: "2px 8px",
                        background: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "4px",
                        color: "var(--accent-gold)",
                      }}
                    >
                      {m.score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Championship Explainer Box */}
          <div
            className="glass-panel"
            style={{
              padding: "16px 20px",
              borderRadius: "14px",
              background: "rgba(0, 242, 254, 0.04)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Shield size={15} color="var(--accent-cyan)" />
              <span style={{ fontWeight: "800", fontSize: "0.82rem", color: "var(--accent-cyan)" }}>
                4-TIER PYRAMID PROMOTION & RELEGATION
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4", color: "var(--text-secondary)" }}>
              All managers start at the grassroots in <strong>National League (Tier 4)</strong>. Earn promotion by finishing
              in the top 3 to unlock massive transfer budgets, elite opponents, and higher reputation! Finish in the bottom
              3 to face board scrutiny and severe budget cuts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
