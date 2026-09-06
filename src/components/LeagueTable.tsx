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
    color: "#F1C21B",
    desc: "Top Flight: 20 European & World Titans",
    promoTarget: null,
    windfall: "🏆 Champions Prize: £75M + Global Glory",
  },
  tier_2: {
    name: "Division One",
    short: "Tier 2",
    color: "#0F62FE",
    desc: "Challenger League: 20 High-Pressing Contenders",
    promoTarget: "Premier Championship",
    windfall: "▲ Top 3 Promoted: £50M TV Windfall",
  },
  tier_3: {
    name: "Division Two",
    short: "Tier 3",
    color: "#8A3FFC",
    desc: "Development League: 20 Hungry Clubs",
    promoTarget: "Division One",
    windfall: "▲ Top 3 Promoted: £18M Investment",
  },
  tier_4: {
    name: "National League",
    short: "Tier 4",
    color: "#0F6B45",
    desc: "Grassroots Pyramid Base: 20 Determined Clubs (Career Start)",
    promoTarget: "Division Two",
    windfall: "▲ Top 3 Promoted: £6M Breakthrough Reward",
  },
};

export const LeagueTable: React.FC<LeagueTableProps> = ({
  standings,
  gameweek,
  recentMatches,
  userTeamName = "Cairn Athletic FC",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Header Banner */}
      <div className="carbon-card" style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "4px",
              background: "var(--cds-green-light)",
              border: "1px solid var(--cds-green-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cds-green-primary)",
            }}
          >
            <Trophy size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-success" style={{ fontSize: "11px" }}>
                {tierInfo.short}
              </span>
              <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                {tierInfo.name.toUpperCase()}
              </h1>
            </div>
            <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span style={{ color: "var(--cds-green-primary)", fontWeight: "600" }}>ROUND / GAMEWEEK #{gameweek}</span>
              <span>•</span>
              <span>{tierInfo.desc}</span>
            </div>
          </div>
        </div>

        {onResetLeague && (
          <button
            className="btn btn-secondary"
            onClick={onResetLeague}
            style={{ height: "34px", padding: "0 14px", fontSize: "12px", gap: "6px" }}
          >
            <RotateCcw size={13} /> Reset 4-Tier Season
          </button>
        )}
      </div>

      {/* Tier Selector Navigation Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "12px",
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
              className="carbon-card"
              style={{
                padding: "14px 18px",
                border: isSelected ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                background: isSelected ? "var(--cds-layer-selected)" : "var(--cds-surface)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: isSelected ? "700" : "600", fontSize: "14px", color: "var(--cds-text-primary)" }}>
                  {meta.name}
                </span>
                {isUserActiveCareer && (
                  <span className="badge badge-success" style={{ fontSize: "10px", padding: "1px 6px" }}>
                    YOU ARE HERE
                  </span>
                )}
              </div>
              <span style={{ fontSize: "11px", color: isSelected ? "var(--cds-green-primary)" : "var(--cds-text-muted)", fontWeight: "600" }}>
                {meta.short} • 20 Clubs
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
        {/* Main Standings Table */}
        <div className="carbon-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="carbon-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 12px", width: "50px", textAlign: "center" }}>POS</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>CLUB</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>PL</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>W</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>D</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>L</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>GF</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>GA</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>GD</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", color: "var(--cds-green-primary)", fontWeight: "700" }}>PTS</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>RECENT FORM</th>
                  {onQuickPlayMatch && <th style={{ padding: "10px 12px", textAlign: "center" }}>FIXTURE</th>}
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
                        borderLeft: isTop1
                          ? "4px solid #F1C21B"
                          : isPromotionZone
                          ? "4px solid var(--cds-green-primary)"
                          : isRelegationZone
                          ? "4px solid var(--cds-red)"
                          : "4px solid transparent",
                        background: isUserClub
                          ? "var(--cds-layer-selected)"
                          : idx % 2 === 0
                          ? "transparent"
                          : "rgba(0, 0, 0, 0.01)",
                      }}
                    >
                      {/* Position & Rank Delta Indicator */}
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13px",
                              color: isPromotionZone ? "var(--cds-green-primary)" : isRelegationZone ? "var(--cds-red)" : "var(--cds-text-primary)",
                            }}
                          >
                            {idx + 1}
                          </span>
                          {rankDelta > 0 && (
                            <span style={{ color: "var(--cds-green-primary)", fontSize: "10px" }} title={`Up ${rankDelta} spots`}>
                              <TrendingUp size={11} />
                            </span>
                          )}
                          {rankDelta < 0 && (
                            <span style={{ color: "var(--cds-red)", fontSize: "10px" }} title={`Down ${Math.abs(rankDelta)} spots`}>
                              <TrendingDown size={11} />
                            </span>
                          )}
                          {rankDelta === 0 && (
                            <span style={{ color: "var(--cds-text-muted)", fontSize: "10px" }}>
                              <Minus size={9} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Club Name & Badge */}
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              background: club.color,
                              border: "1px solid var(--cds-border)",
                            }}
                          />
                          <span
                            style={{
                              fontWeight: isUserClub ? "700" : "500",
                              color: isUserClub ? "var(--cds-green-primary)" : "var(--cds-text-primary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {club.name}
                            {isUserClub && (
                              <span className="badge badge-success" style={{ fontSize: "10px", padding: "1px 5px" }}>
                                YOU
                              </span>
                            )}
                            {isTop1 && <span title="League Leader">👑</span>}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--cds-text-secondary)" }}>{club.played}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: "600", color: "var(--cds-text-primary)" }}>{club.won}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--cds-text-secondary)" }}>{club.drawn}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--cds-text-secondary)" }}>{club.lost}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--cds-text-muted)" }}>{club.gf}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--cds-text-muted)" }}>{club.ga}</td>
                      <td
                        style={{
                          padding: "10px 8px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: club.gd > 0 ? "var(--cds-green-primary)" : club.gd < 0 ? "var(--cds-red)" : "var(--cds-text-muted)",
                        }}
                      >
                        {club.gd > 0 ? `+${club.gd}` : club.gd}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "center",
                          fontWeight: "700",
                          fontSize: "14px",
                          color: "var(--cds-text-primary)",
                        }}
                      >
                        {club.pts}
                      </td>

                      {/* Last 5 Form Badges */}
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          {club.form.length === 0 ? (
                            <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>—</span>
                          ) : (
                            club.form.map((f, fIdx) => (
                              <div
                                key={fIdx}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "3px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: "#fff",
                                  background:
                                    f === "W"
                                      ? "var(--cds-green-primary)"
                                      : f === "D"
                                      ? "#8D8D8D"
                                      : "var(--cds-red)",
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
                              style={{ height: "26px", padding: "0 8px", fontSize: "11px", gap: "4px" }}
                              onClick={() => onQuickPlayMatch(club.name)}
                            >
                              ⚡ Play
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "var(--cds-green-primary)", fontWeight: "600" }}>Home Club</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Promotion & Relegation Legend */}
          <div
            style={{
              padding: "12px 20px",
              background: "var(--cds-layer)",
              borderTop: "1px solid var(--cds-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-green-primary)", fontWeight: "600" }}>
                <ArrowUpCircle size={14} /> Pos 1-3: Automatic Promotion
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--cds-red)", fontWeight: "600" }}>
                <ArrowDownCircle size={14} /> Pos 18-20: Relegation Zone
              </span>
            </div>
            <span style={{ color: "var(--cds-text-primary)", fontWeight: "600" }}>
              {tierInfo.windfall}
            </span>
          </div>
        </div>

        {/* Right Column: Recent Results & Pyramid Explainer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Recent Gameweek Results */}
          <div className="carbon-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--cds-border)", paddingBottom: "8px" }}>
              <Calendar size={16} color="var(--cds-green-primary)" />
              <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>
                RECENT MATCH RESULTS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentMatches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--cds-text-muted)", fontSize: "12px" }}>
                  Play a match to kickoff Gameweek #1 results!
                </div>
              ) : (
                recentMatches.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "var(--cds-layer)",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      border: "1px solid var(--cds-border)",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--cds-text-primary)", fontWeight: "600" }}>{m.home}</span>
                      <span style={{ color: "var(--cds-text-muted)", margin: "0 6px" }}>vs</span>
                      <span style={{ color: "var(--cds-text-secondary)" }}>{m.away}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: "700",
                        padding: "2px 6px",
                        background: "var(--cds-surface)",
                        borderRadius: "2px",
                        border: "1px solid var(--cds-border)",
                        color: "var(--cds-text-primary)",
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
            className="carbon-card"
            style={{
              padding: "18px 20px",
              borderLeft: "3px solid var(--cds-green-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Shield size={16} color="var(--cds-green-primary)" />
              <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>
                4-TIER PYRAMID PROMOTION & RELEGATION
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", color: "var(--cds-text-secondary)" }}>
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
