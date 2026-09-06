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
    { key: "GEGENPRESS", name: "Klopp's Relentless Gegenpress", color: "var(--cds-red)", formation: "4-3-3", desc: "Suffocating packs, high line & rapid vertical blitzes" },
    { key: "TIKI_TAKA", name: "Guardiola's Tiki-Taka Triangles", color: "var(--cds-blue)", formation: "4-3-3", desc: "Patient possession triangles, 1-touch pass & move" },
    { key: "LOW_BLOCK", name: "Mourinho's Impenetrable Bus", color: "var(--cds-amber)", formation: "5-3-2", desc: "10 behind the ball, crunching tackles & long diagonal counters" },
    { key: "SAMBA_FLAIR", name: "Ancelotti's Fluid Counter", color: "var(--cds-green-primary)", formation: "4-2-3-1", desc: "Creative freedom, expressiveness & dynamic wing play" },
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
        inset: 0,
        backgroundColor: "rgba(22, 22, 22, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        className="carbon-card"
        style={{
          width: "min(780px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--cds-border)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "4px",
                background: "var(--cds-green-light)",
                border: "1px solid var(--cds-green-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Swords size={20} color="var(--cds-green-primary)" />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-green-primary)", textTransform: "uppercase" }}>
                Practice & Tuning Hub
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
                Friendly Exhibition Scrimmage
              </h2>
              <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>
                Test tactical prompts & team cohesion without affecting official League points
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "6px 8px", height: "auto" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Selector */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "preset", label: "Tactical Masterminds" },
            { id: "tier_1", label: "Premier (Tier 1)" },
            { id: "tier_2", label: "Div One (Tier 2)" },
            { id: "tier_3", label: "Div Two (Tier 3)" },
            { id: "tier_4", label: "National (Tier 4)" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn ${selectedCategory === cat.id ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "6px 14px", fontSize: "12px" }}
              onClick={() => setSelectedCategory(cat.id as any)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Opponents Grid */}
        <div style={{ maxHeight: "260px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                  className="carbon-card"
                  style={{
                    padding: "12px 16px",
                    background: isSelected ? "var(--cds-layer-selected)" : "var(--cds-surface)",
                    border: isSelected ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>{p.name}</span>
                    <span className="badge badge-info" style={{ fontSize: "10px", padding: "1px 5px" }}>{p.formation}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)" }}>{p.desc}</span>
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
                  className="carbon-card"
                  style={{
                    padding: "10px 14px",
                    background: isSelected ? "var(--cds-layer-selected)" : "var(--cds-surface)",
                    border: isSelected ? "2px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: c.color || "var(--cds-green-primary)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--cds-text-primary)" }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                      Val: £{c.totalSquadValue}M • Rep: {c.reputation}★
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Venue Selection */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--cds-border)", paddingTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--cds-text-secondary)" }}>Venue:</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn ${venue === "home" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setVenue("home")}
              >
                🏟️ Home Ground (+Crowd Boost)
              </button>
              <button
                type="button"
                className={`btn ${venue === "away" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setVenue("away")}
              >
                ✈️ Away Match (+Hostile Atmosphere)
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleLaunch}
            style={{ padding: "8px 20px", fontSize: "13px", fontWeight: "600", gap: "6px" }}
          >
            <Play size={14} />
            <span>Kick Off Friendly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
