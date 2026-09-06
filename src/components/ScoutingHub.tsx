// src/components/ScoutingHub.tsx
import React, { useState } from "react";
import {
  Search,
  Eye,
  Compass,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { TeamConfig, SquadPlayerConfig } from "../types";

interface ScoutingHubProps {
  teamConfig?: TeamConfig;
  budget: number;
  onSelectPlayerForDossier?: (player: SquadPlayerConfig) => void;
  onNavigateToTransfers?: () => void;
}

interface ScoutReport {
  id: string;
  name: string;
  age: number;
  position: "GK" | "RB" | "CB" | "LB" | "CDM" | "CM" | "CAM" | "RW" | "LW" | "ST";
  currentClub: string;
  overall: number;
  potential: number;
  value: number;
  wage: number;
  scoutRating: number; // e.g. 94%
  primaryTrait: string;
  scoutVerdict: string;
  pros: string[];
  cons: string[];
  tacticalFit: number; // 0-100%
  status: "Available" | "Shortlisted" | "Under Observation";
}

const SCOUT_REPORTS_DATA: ScoutReport[] = [
  {
    id: "scout_01",
    name: "Archie 'The Rocket' Vance",
    age: 19,
    position: "ST",
    currentClub: "Halifax Town Youth",
    overall: 61,
    potential: 84,
    value: 0.18,
    wage: 650,
    scoutRating: 96,
    primaryTrait: "Lightning Poacher & High Press Hunter",
    scoutVerdict:
      "A raw diamond with blinding pace (88) and natural instinctive finishing. Thrives on direct counter-press transitions in Tier 4.",
    pros: ["Blinding acceleration behind defenders", "Relentless work rate out of possession"],
    cons: ["Needs composure under high-pressure penalties"],
    tacticalFit: 94,
    status: "Shortlisted",
  },
  {
    id: "scout_02",
    name: "Kofi Boateng",
    age: 21,
    position: "CDM",
    currentClub: "Bromley Reserves",
    overall: 60,
    potential: 80,
    value: 0.22,
    wage: 800,
    scoutRating: 92,
    primaryTrait: "Deep Anchor & Tactical Interceptor",
    scoutVerdict:
      "Dominant ball winner who reads the passing lanes masterfully. Breaks up opposing transition attacks effortlessly.",
    pros: ["Elite stamina and ground duel success (78%)", "Calm passing under physical press"],
    cons: ["Can accumulate yellow cards during aggressive presses"],
    tacticalFit: 91,
    status: "Available",
  },
  {
    id: "scout_03",
    name: "Elias Lindqvist",
    age: 20,
    position: "CAM",
    currentClub: "Free Agent (Trialist)",
    overall: 62,
    potential: 82,
    value: 0.15,
    wage: 900,
    scoutRating: 95,
    primaryTrait: "Through-Ball Maestro & Free-Kick Specialist",
    scoutVerdict:
      "Creative playmaker released by Swedish academy. Possesses high vision and creates 2.8 key chances per match.",
    pros: ["Pinpoint set-piece delivery", "Vision to break low defensive blocks"],
    cons: ["Requires physical conditioning for muddy winter fixtures"],
    tacticalFit: 88,
    status: "Available",
  },
  {
    id: "scout_04",
    name: "Declan O'Connor",
    age: 22,
    position: "CB",
    currentClub: "Sligo Rovers",
    overall: 59,
    potential: 77,
    value: 0.12,
    wage: 500,
    scoutRating: 89,
    primaryTrait: "Aerial Tower & No-Nonsense Stopper",
    scoutVerdict:
      "Strong 6ft 3in centre-back with dominant aerial presence. Clears 92% of box crosses with commanding authority.",
    pros: ["Aerial duel mastery", "Vocal backline communicator"],
    cons: ["Vulnerable to rapid agile wingers cutting inside"],
    tacticalFit: 86,
    status: "Under Observation",
  },
  {
    id: "scout_05",
    name: "Mateo 'El Rayo' Ruiz",
    age: 18,
    position: "RW",
    currentClub: "National League South",
    overall: 58,
    potential: 85,
    value: 0.25,
    wage: 700,
    scoutRating: 98,
    primaryTrait: "Flair Dribbler & Inverted Cutter",
    scoutVerdict:
      "Generational grassroots prospect with exceptional close control and dynamic step-overs that terrorize fullbacks.",
    pros: ["Electrifying 1v1 dribbling rate", "Huge potential upside for future re-sale"],
    cons: ["Needs to release the ball quicker in transition"],
    tacticalFit: 95,
    status: "Shortlisted",
  },
  {
    id: "scout_06",
    name: "Tomasz Nowak",
    age: 23,
    position: "GK",
    currentClub: "Free Agent",
    overall: 61,
    potential: 76,
    value: 0.10,
    wage: 600,
    scoutRating: 90,
    primaryTrait: "Sweeper Keeper & Reflex Stopper",
    scoutVerdict:
      "Confident goalkeeper who rushes out to sweep behind a high pressing backline. High reflex rating from close range.",
    pros: ["Decisive rushing out on breakaways", "Accurate side-volley distribution"],
    cons: ["Occasionally aggressive on aerial crosses in traffic"],
    tacticalFit: 89,
    status: "Available",
  },
];

export const ScoutingHub: React.FC<ScoutingHubProps> = ({
  teamConfig,
  budget,
  onSelectPlayerForDossier: _onSelectPlayerForDossier,
  onNavigateToTransfers,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPos, setSelectedPos] = useState<string>("ALL");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(["scout_01", "scout_05"]);

  const toggleShortlist = (id: string) => {
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredReports = SCOUT_REPORTS_DATA.filter((player) => {
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase()) && !player.primaryTrait.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedPos !== "ALL" && player.position !== selectedPos) {
      return false;
    }
    if (selectedFilter === "WONDERKID" && player.potential < 82) return false;
    if (selectedFilter === "BARGAIN" && player.value > 0.15) return false;
    if (selectedFilter === "FREE_AGENT" && !player.currentClub.toLowerCase().includes("free")) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner: Chief Scout Dossier & Network Status */}
      <div className="carbon-card" style={{ padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "4px",
              background: "var(--cds-green-light)",
              border: "1px solid var(--cds-green-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cds-green-primary)",
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
                Chief Scout Recruitment Hub
              </h1>
              <span className="badge badge-success" style={{ fontSize: "11px" }}>
                Active Network
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--cds-text-secondary)", margin: "4px 0 0 0" }}>
              {teamConfig?.name ? `${teamConfig.name} • ` : ""}Overseen by Chief Scout <strong>Malcolm Davies</strong> • 4 Regional Scouts Active • Target Budget: <strong>£{budget.toFixed(1)}M</strong>
            </p>
          </div>
        </div>

        {/* Quick Scout Network Stats */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ padding: "8px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Players Monitored</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)" }}>142</div>
          </div>
          <div style={{ padding: "8px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Wonderkids Found</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-green-primary)" }}>7</div>
          </div>
          <div style={{ padding: "8px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Scout Accuracy</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F62FE" }}>94%</div>
          </div>
        </div>
      </div>

      {/* Active Scouting Assignments Bar */}
      <div className="carbon-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--cds-text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Eye size={16} color="var(--cds-green-primary)" />
            Active Scouting Assignments & Dispatches
          </h2>
          <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
            3 of 3 Scouts Assigned
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {/* Assignment 1 */}
          <div style={{ padding: "14px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                🇬🇧 Domestic Grassroots Tier 4 Focus
              </span>
              <span className="badge badge-success" style={{ fontSize: "10px" }}>Active (Day 12/14)</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", margin: 0 }}>
              Scout: Peter Rawson • Hunting hidden gems with high stamina and aggressive pressing traits.
            </p>
            <div style={{ width: "100%", height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "85%", height: "100%", background: "var(--cds-green-primary)" }} />
            </div>
          </div>

          {/* Assignment 2 */}
          <div style={{ padding: "14px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                🌟 U21 Non-League Wonderkid Pipeline
              </span>
              <span className="badge badge-info" style={{ fontSize: "10px" }}>Active (Day 8/14)</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", margin: 0 }}>
              Scout: Gary Higgins • Filtering unattached academy releases with potential &gt; 80.
            </p>
            <div style={{ width: "100%", height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "57%", height: "100%", background: "#0F62FE" }} />
            </div>
          </div>

          {/* Assignment 3 */}
          <div style={{ padding: "14px 16px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                🆓 Free Agent Trialists & Bargains
              </span>
              <span className="badge badge-warning" style={{ fontSize: "10px" }}>Completing (Day 13/14)</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", margin: 0 }}>
              Scout: Keith Miller • Inspecting uncontracted veterans willing to sign on &lt;£1k/wk.
            </p>
            <div style={{ width: "100%", height: "4px", background: "var(--cds-border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "93%", height: "100%", background: "var(--cds-amber)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="carbon-card" style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        {/* Left Search */}
        <div style={{ position: "relative", minWidth: "280px", flex: "1" }}>
          <Search size={16} color="var(--cds-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="carbon-input"
            placeholder="Search by player name, trait (e.g. Poacher, Anchor)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "36px", height: "36px", fontSize: "13px" }}
          />
        </div>

        {/* Position Filter Pills */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {["ALL", "GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST"].map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPos(pos)}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: selectedPos === pos ? "600" : "400",
                background: selectedPos === pos ? "var(--cds-layer-selected)" : "transparent",
                color: selectedPos === pos ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                border: selectedPos === pos ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setSelectedFilter("ALL")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: selectedFilter === "ALL" ? "600" : "400",
              background: selectedFilter === "ALL" ? "var(--cds-layer-selected)" : "transparent",
              color: selectedFilter === "ALL" ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
              border: selectedFilter === "ALL" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            All Targets
          </button>
          <button
            onClick={() => setSelectedFilter("WONDERKID")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: selectedFilter === "WONDERKID" ? "600" : "400",
              background: selectedFilter === "WONDERKID" ? "rgba(15, 98, 254, 0.08)" : "transparent",
              color: selectedFilter === "WONDERKID" ? "#0F62FE" : "var(--cds-text-secondary)",
              border: selectedFilter === "WONDERKID" ? "1px solid #0F62FE" : "1px solid var(--cds-border)",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            ⭐ Wonderkids
          </button>
          <button
            onClick={() => setSelectedFilter("BARGAIN")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: selectedFilter === "BARGAIN" ? "600" : "400",
              background: selectedFilter === "BARGAIN" ? "rgba(241, 194, 27, 0.08)" : "transparent",
              color: selectedFilter === "BARGAIN" ? "#B28600" : "var(--cds-text-secondary)",
              border: selectedFilter === "BARGAIN" ? "1px solid #F1C21B" : "1px solid var(--cds-border)",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            💰 Bargains (&lt;£150k)
          </button>
        </div>
      </div>

      {/* Scout Reports Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
        {filteredReports.map((player) => {
          const isShortlisted = shortlistedIds.includes(player.id);
          return (
            <div
              key={player.id}
              className="carbon-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
                borderLeft: player.potential >= 82 ? "3px solid var(--cds-green-primary)" : "3px solid var(--cds-border)",
              }}
            >
              {/* Card Header: Avatar, Name, Potential */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <PlayerAvatar name={player.name} size="md" />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                        {player.name}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        {player.position}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
                      Age: {player.age} • {player.currentClub}
                    </div>
                  </div>
                </div>

                {/* Rating & Potential Badge */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--cds-green-primary)" }}>
                    {player.overall} <span style={{ fontSize: "11px", fontWeight: "500", color: "var(--cds-text-muted)" }}>/ POT {player.potential}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--cds-text-secondary)", fontWeight: "600" }}>
                    {player.scoutRating}% Scouted
                  </div>
                </div>
              </div>

              {/* Trait & Valuation Row */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--cds-layer)", borderRadius: "4px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--cds-text-muted)" }}>Valuation: </span>
                  <strong style={{ color: "var(--cds-text-primary)" }}>£{(player.value * 1000).toFixed(0)}k</strong>
                </div>
                <div>
                  <span style={{ color: "var(--cds-text-muted)" }}>Wage: </span>
                  <strong style={{ color: "var(--cds-text-primary)" }}>£{player.wage}/wk</strong>
                </div>
                <div>
                  <span style={{ color: "var(--cds-text-muted)" }}>Tactical Fit: </span>
                  <strong style={{ color: "var(--cds-green-primary)" }}>{player.tacticalFit}%</strong>
                </div>
              </div>

              {/* Trait Callout */}
              <div style={{ fontSize: "12px", color: "var(--cds-text-primary)", background: "var(--cds-green-light)", padding: "6px 10px", borderRadius: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={13} color="var(--cds-green-primary)" />
                <strong style={{ color: "var(--cds-green-primary)" }}>{player.primaryTrait}</strong>
              </div>

              {/* Scout Verdict */}
              <div style={{ fontSize: "12px", color: "var(--cds-text-secondary)", lineHeight: 1.45, fontStyle: "italic" }}>
                "{player.scoutVerdict}"
              </div>

              {/* Pros & Cons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px" }}>
                {player.pros.map((pro, idx) => (
                  <div key={idx} style={{ color: "var(--cds-green-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>✓</span> <span>{pro}</span>
                  </div>
                ))}
                {player.cons.map((con, idx) => (
                  <div key={idx} style={{ color: "var(--cds-red)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>✗</span> <span>{con}</span>
                  </div>
                ))}
              </div>

              {/* Actions Bottom Bar */}
              <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--cds-border-subtle)" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => toggleShortlist(player.id)}
                  style={{ flex: 1, height: "32px", fontSize: "12px" }}
                >
                  {isShortlisted ? "★ Shortlisted" : "☆ Add Shortlist"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (onNavigateToTransfers) onNavigateToTransfers();
                  }}
                  style={{ flex: 1, height: "32px", fontSize: "12px", gap: "4px" }}
                >
                  <span>Transfer Inquiry</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
