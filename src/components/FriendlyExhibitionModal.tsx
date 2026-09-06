// src/components/FriendlyExhibitionModal.tsx
import React, { useState, useEffect } from "react";
import { Swords, X, Play } from "lucide-react";
import type { TeamConfig } from "../types";

interface FriendlyExhibitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTeam?: TeamConfig;
  onStartFriendly: (opponentName: string, botPresetKey?: string, venue?: "home" | "away") => void;
}

export const FriendlyExhibitionModal: React.FC<FriendlyExhibitionModalProps> = ({
  isOpen,
  onClose,
  onStartFriendly,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"preset" | "tier_1" | "tier_2" | "tier_3" | "tier_4">("preset");
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedOpponentName, setSelectedOpponentName] = useState<string>("Liverpool");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("GEGENPRESS");
  const [venue, setVenue] = useState<"home" | "away">("home");

  const BOT_PRESETS = [
    { key: "GEGENPRESS", name: "Klopp's Relentless Gegenpress", color: "#C8102E", formation: "4-3-3", desc: "Suffocating packs, high line & rapid vertical blitzes" },
    { key: "TIKI_TAKA", name: "Guardiola's Tiki-Taka Triangles", color: "#6CABDD", formation: "4-3-3", desc: "Patient possession triangles, 1-touch pass & move" },
    { key: "LOW_BLOCK", name: "Mourinho's Impenetrable Bus", color: "#FEBE10", formation: "5-3-2", desc: "10 behind the ball, crunching tackles & long diagonal counters" },
    { key: "SAMBA_FLAIR", name: "Ancelotti's Fluid Counter", color: "#10B981", formation: "4-2-3-1", desc: "Creative freedom, expressiveness & dynamic wing play" },
  ];

  useEffect(() => {
    if (selectedCategory !== "preset") {
      fetch(`/api/cm/clubs?tier=${selectedCategory}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.clubs) {
            setClubs(data.clubs);
            if (data.clubs.length > 0) setSelectedOpponentName(data.clubs[0].name);
          }
        })
        .catch(() => {});
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (selectedCategory === "preset") {
      onStartFriendly(selectedOpponentName, selectedPresetKey, venue);
    } else {
      onStartFriendly(selectedOpponentName, undefined, venue);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.98) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.3)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.15)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.15)", border: "1px solid #00E5FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Swords size={20} color="#00E5FF" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                Friendly Exhibition Scrimmage
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Test tactical prompts & team cohesion without affecting official League points
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Category Selector */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn ${selectedCategory === "preset" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => setSelectedCategory("preset")}
          >
            Tactical Masterminds
          </button>
          <button
            type="button"
            className={`btn ${selectedCategory === "tier_1" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => setSelectedCategory("tier_1")}
          >
            Premier (Tier 1)
          </button>
          <button
            type="button"
            className={`btn ${selectedCategory === "tier_2" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => setSelectedCategory("tier_2")}
          >
            Div One (Tier 2)
          </button>
          <button
            type="button"
            className={`btn ${selectedCategory === "tier_3" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => setSelectedCategory("tier_3")}
          >
            Div Two (Tier 3)
          </button>
          <button
            type="button"
            className={`btn ${selectedCategory === "tier_4" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => setSelectedCategory("tier_4")}
          >
            National (Tier 4)
          </button>
        </div>

        {/* Opponents Grid */}
        <div style={{ maxHeight: "240px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {selectedCategory === "preset" ? (
            BOT_PRESETS.map((p) => {
              const isSelected = selectedPresetKey === p.key;
              return (
                <div
                  key={p.key}
                  onClick={() => {
                    setSelectedPresetKey(p.key);
                    setSelectedOpponentName(p.name);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${isSelected ? "#00E5FF" : "rgba(255, 255, 255, 0.08)"}`,
                    background: isSelected ? "rgba(0, 229, 255, 0.1)" : "rgba(255, 255, 255, 0.02)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.88rem", color: "#fff" }}>{p.name}</span>
                    <span style={{ fontSize: "0.68rem", color: p.color, fontWeight: "700" }}>{p.formation}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{p.desc}</span>
                </div>
              );
            })
          ) : (
            clubs.map((c) => {
              const isSelected = selectedOpponentName === c.name;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedOpponentName(c.name)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${isSelected ? c.color : "rgba(255, 255, 255, 0.08)"}`,
                    background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: c.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "0.86rem", color: "#fff" }}>{c.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Val: £{c.totalSquadValue}M • Rep: {c.reputation}★
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Venue Selection */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)" }}>Venue:</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`btn ${venue === "home" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                onClick={() => setVenue("home")}
              >
                🏟️ Home Ground (+Crowd Boost)
              </button>
              <button
                type="button"
                className={`btn ${venue === "away" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                onClick={() => setVenue("away")}
              >
                ✈️ Away Match (+Hostile Atmosphere)
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleLaunch}
            style={{ padding: "10px 22px", fontSize: "0.9rem", fontWeight: "900", gap: "6px" }}
          >
            <Play size={15} />
            <span>Kick Off Friendly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
