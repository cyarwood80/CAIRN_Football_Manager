// src/components/PromptQualityAnalyzer.tsx
import React, { useMemo } from "react";
import { Sparkles, Brain, Zap, Shield, Target } from "lucide-react";

interface PromptQualityAnalyzerProps {
  promptText: string;
  compact?: boolean;
}

interface AnalyzedPrompt {
  score: number;
  grade: "Tactical Masterclass" | "Solid Directive" | "Basic Instruction" | "Vague / Low Impact";
  gradeColor: string;
  gradeBg: string;
  directives: string[];
  resonatingTraits: string[];
  synergyBoosts: { label: string; value: string }[];
  evolutionBonus: string;
}

export function analyzePromptQuality(text: string): AnalyzedPrompt {
  const p = (text || "").toLowerCase().trim();

  if (!p || p.length < 5) {
    return {
      score: 25,
      grade: "Vague / Low Impact",
      gradeColor: "var(--cds-text-secondary)",
      gradeBg: "var(--cds-layer)",
      directives: ["Default Balanced Play"],
      resonatingTraits: ["General Squad"],
      synergyBoosts: [{ label: "Tactical Stability", value: "+0%" }],
      evolutionBonus: "+1 XP Baseline Development",
    };
  }

  const directives: string[] = [];
  const resonatingTraits: string[] = [];
  const synergyBoosts: { label: string; value: string }[] = [];
  let score = 40;

  // Pressing & Defending
  if (p.includes("gegenpress") || p.includes("heavy press") || p.includes("high press") || p.includes("suffocate") || p.includes("hunt")) {
    score += 15;
    directives.push("Relentless High Press");
    resonatingTraits.push("Aggressive", "Tenacious");
    synergyBoosts.push({ label: "Turnover Forcing", value: "+22%" });
  } else if (p.includes("park the bus") || p.includes("low block") || p.includes("compact") || p.includes("absorb") || p.includes("tight line")) {
    score += 14;
    directives.push("Compact Low Block");
    resonatingTraits.push("Methodical", "Leader");
    synergyBoosts.push({ label: "Defensive Solidity", value: "+25%" });
  }

  // Passing & Build-up
  if (p.includes("tiki") || p.includes("possession") || p.includes("patient") || p.includes("short pass") || p.includes("triangles") || p.includes("control tempo")) {
    score += 15;
    directives.push("Patient Possession Triangles");
    resonatingTraits.push("Creative", "Methodical");
    synergyBoosts.push({ label: "Passing Retention", value: "+18%" });
  } else if (p.includes("direct") || p.includes("counter") || p.includes("fast break") || p.includes("vertical") || p.includes("transitions")) {
    score += 15;
    directives.push("Rapid Vertical Counter");
    resonatingTraits.push("Flair", "Tenacious");
    synergyBoosts.push({ label: "Breakout Speed", value: "+20%" });
  }

  // Attack & Finishing
  if (p.includes("shoot on sight") || p.includes("from distance") || p.includes("test the keeper") || p.includes("clinical") || p.includes("rocket")) {
    score += 12;
    directives.push("Shoot on Sight");
    resonatingTraits.push("Flair", "Aggressive");
    synergyBoosts.push({ label: "Shot Volume", value: "+24%" });
  } else if (p.includes("work ball into box") || p.includes("cut inside") || p.includes("through ball") || p.includes("delicate pass")) {
    score += 12;
    directives.push("Precision Box Penetration");
    resonatingTraits.push("Creative", "Sensitive");
    synergyBoosts.push({ label: "Chance Quality (xG)", value: "+16%" });
  }

  // Flanks & Shape
  if (p.includes("overlap") || p.includes("wing") || p.includes("flank") || p.includes("cross") || p.includes("wide")) {
    score += 10;
    directives.push("Flank Overload & Crosses");
    resonatingTraits.push("Tenacious", "Flair");
    synergyBoosts.push({ label: "Wing Delivery", value: "+15%" });
  }

  // Length and specificity bonus
  if (p.length > 50) score += 8;
  if (p.length > 100) score += 6;

  score = Math.min(98, Math.max(30, score));

  // Deduplicate
  const uniqueTraits = Array.from(new Set(resonatingTraits));
  const uniqueDirectives = Array.from(new Set(directives));

  let grade: "Tactical Masterclass" | "Solid Directive" | "Basic Instruction" | "Vague / Low Impact" = "Basic Instruction";
  let gradeColor = "#8E6A00";
  let gradeBg = "#FEF7E0";
  let evolutionBonus = "+1 XP Development";

  if (score >= 85) {
    grade = "Tactical Masterclass";
    gradeColor = "var(--cds-green-primary)";
    gradeBg = "#DEFBE6";
    evolutionBonus = "⚡ +3 XP Maximum Superstar Acceleration";
  } else if (score >= 65) {
    grade = "Solid Directive";
    gradeColor = "var(--cds-blue)";
    gradeBg = "#EDF5FF";
    evolutionBonus = "📈 +2 XP Enhanced Development";
  } else if (score >= 45) {
    grade = "Basic Instruction";
    gradeColor = "#8E6A00";
    gradeBg = "#FEF7E0";
    evolutionBonus = "+1 XP Standard Growth";
  }

  return {
    score,
    grade,
    gradeColor,
    gradeBg,
    directives: uniqueDirectives.length > 0 ? uniqueDirectives : ["Standard Structured Shape"],
    resonatingTraits: uniqueTraits.length > 0 ? uniqueTraits : ["Methodical"],
    synergyBoosts: synergyBoosts.length > 0 ? synergyBoosts : [{ label: "Team Shape", value: "+5%" }],
    evolutionBonus,
  };
}

export const PromptQualityAnalyzer: React.FC<PromptQualityAnalyzerProps> = ({ promptText, compact = false }) => {
  const analysis = useMemo(() => analyzePromptQuality(promptText), [promptText]);

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderRadius: "4px",
          background: analysis.gradeBg,
          border: `1px solid ${analysis.gradeColor}33`,
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Brain size={14} color={analysis.gradeColor} />
          <span style={{ fontWeight: "700", color: analysis.gradeColor }}>
            Prompt Fidelity: {analysis.score}% ({analysis.grade})
          </span>
        </div>
        <span style={{ color: "var(--cds-text-secondary)", fontSize: "11px", fontWeight: "600" }}>
          {analysis.evolutionBonus}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "14px 16px",
        borderRadius: "4px",
        background: "var(--cds-surface)",
        border: "1px solid var(--cds-border)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      {/* Top Header: Meter & Grade */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "4px",
              background: analysis.gradeBg,
              border: `1px solid ${analysis.gradeColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Brain size={16} color={analysis.gradeColor} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                AI Prompt Tactical Fidelity
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  background: analysis.gradeBg,
                  color: analysis.gradeColor,
                  border: `1px solid ${analysis.gradeColor}44`,
                }}
              >
                {analysis.grade} ({analysis.score}%)
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--cds-text-secondary)" }}>
              Evaluates how clearly autonomous players can execute your instructions
            </span>
          </div>
        </div>

        {/* Development Bonus Pill */}
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            padding: "4px 10px",
            borderRadius: "2px",
            background: "#DEFBE6",
            color: "var(--cds-green-primary)",
            border: "1px solid #A7F0BA",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Sparkles size={13} />
          <span>{analysis.evolutionBonus}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", height: "6px", background: "var(--cds-layer)", borderRadius: "2px", overflow: "hidden", border: "1px solid var(--cds-border)" }}>
        <div
          style={{
            width: `${analysis.score}%`,
            height: "100%",
            background: analysis.gradeColor,
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Directives & Trait Resonance Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", paddingTop: "4px" }}>
        {/* Directives */}
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
            <Target size={12} color="var(--cds-green-primary)" />
            <span>Extracted Tactical Directives</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
            {analysis.directives.map((d, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  background: "var(--cds-layer)",
                  border: "1px solid var(--cds-border)",
                  color: "var(--cds-text-primary)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Trait Resonance */}
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={12} color="#8A3FFC" />
            <span>Resonates With Squad Traits</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
            {analysis.resonatingTraits.map((t, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  background: "#F8F0FE",
                  border: "1px solid #E8DAFF",
                  color: "#6929C4",
                }}
              >
                ⭐ {t}
              </span>
            ))}
          </div>
        </div>

        {/* In-Match Buffs */}
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
            <Shield size={12} color="var(--cds-blue)" />
            <span>In-Match Execution Buffs</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
            {analysis.synergyBoosts.map((b, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  background: "#EDF5FF",
                  border: "1px solid #D0E2FF",
                  color: "#0043CE",
                }}
              >
                {b.label}: <strong>{b.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
