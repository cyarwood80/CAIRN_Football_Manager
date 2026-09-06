// src/components/SeasonCalendar.tsx
import React, { useState } from "react";
import {
  Calendar,
  Play,
  FastForward,
  Activity,
  Zap,
  BatteryCharging,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import type { CalendarState, CalendarScheduleItem, SquadPlayerConfig } from "../types";

interface SeasonCalendarProps {
  calendar: CalendarState | null;
  schedule: CalendarScheduleItem[];
  userTeamName: string;
  nextOpponent?: string;
  isHomeFixture?: boolean;
  squad?: SquadPlayerConfig[];
  onAdvanceDay: (prompt?: string) => Promise<void>;
  onAdvanceToMatchday: (prompt?: string) => Promise<void>;
  onPlayScheduledMatch: () => void;
  isMatchActive?: boolean;
}

export const SeasonCalendar: React.FC<SeasonCalendarProps> = ({
  calendar,
  schedule,
  userTeamName,
  nextOpponent = "Chesterfield",
  isHomeFixture = true,
  squad = [],
  onAdvanceDay,
  onAdvanceToMatchday,
  onPlayScheduledMatch,
  isMatchActive = false,
}) => {
  const [trainingPrompt, setTrainingPrompt] = useState<string>(
    "Focus on high pressing triggers, rapid 1-touch transition passing, and staying defensively compact."
  );
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const isMatchday = calendar?.isMatchday ?? false;
  const activityType = calendar?.activityType ?? "rest";

  const handleAdvanceOneDay = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await onAdvanceDay(trainingPrompt);
      setLastActionFeedback(`Advanced to next calendar day.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleFastForwardToMatch = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await onAdvanceToMatchday(trainingPrompt);
      setLastActionFeedback(`Advanced through training & rest straight to Matchday!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdvancing(false);
    }
  };

  const QUICK_DRILL_PROMPTS = [
    {
      title: "⚡ Relentless Gegenpress",
      prompt: "Execute intense ball-hunting in packs, high defensive line, and instantaneous counter-pressing upon losing possession.",
    },
    {
      title: "🎯 Tiki-Taka Triangles",
      prompt: "Patient possession play, quick 1-2 passing triangles, dragging defenders out of position before slipping through-balls.",
    },
    {
      title: "🛡️ Low Block & Clearance",
      prompt: "Strict defensive discipline, 10 men behind the ball, ruthless slide tackles and immediate long diagonal clearances.",
    },
    {
      title: "🚀 Rapid Wing Overlaps",
      prompt: "Explosive full-back overlaps, whipped crosses into the 6-yard box, and late box-to-box midfield arrivals.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner: Date, Calendar Rhythm, and Advance Controls */}
      <div
        className="glass-panel"
        style={{
          padding: "24px 28px",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          background: isMatchday
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)"
            : activityType === "rest"
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: isMatchday
            ? "1px solid rgba(239, 68, 68, 0.4)"
            : activityType === "rest"
            ? "1px solid rgba(16, 185, 129, 0.4)"
            : "1px solid rgba(0, 229, 255, 0.3)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "14px",
              background: isMatchday
                ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                : activityType === "rest"
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #00E5FF, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isMatchday
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : "0 0 20px rgba(0, 229, 255, 0.4)",
            }}
          >
            {isMatchday ? (
              <Trophy size={28} color="#fff" />
            ) : activityType === "rest" ? (
              <BatteryCharging size={28} color="#fff" />
            ) : (
              <Zap size={28} color="#030712" />
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: isMatchday ? "rgba(239, 68, 68, 0.2)" : "rgba(0, 229, 255, 0.15)",
                  color: isMatchday ? "#ef4444" : "#00E5FF",
                  border: `1px solid ${isMatchday ? "rgba(239, 68, 68, 0.4)" : "rgba(0, 229, 255, 0.3)"}`,
                }}
              >
                {calendar?.activeTier ? calendar.activeTier.replace("_", " ").toUpperCase() : "TIER 4 NATIONAL LEAGUE"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>•</span>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700" }}>
                ROUND / GAMEWEEK #{calendar?.currentGameweek ?? 1}
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em" }}>
              {calendar?.date ?? "Saturday, 9 Aug 2025"}
            </h1>

            <div style={{ fontSize: "0.85rem", color: "#e2e8f0", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <strong style={{ color: isMatchday ? "#ef4444" : activityType === "rest" ? "#10b981" : "#00E5FF" }}>
                {calendar?.dayName ?? "Matchday Fixture"}
              </strong>
              <span>— {calendar?.activityDesc ?? "Matchday in progress."}</span>
            </div>
          </div>
        </div>

        {/* Championship Manager Day Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {isMatchday ? (
            <button
              className="btn btn-primary"
              onClick={onPlayScheduledMatch}
              disabled={isMatchActive}
              style={{
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "900",
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 25px rgba(16, 185, 129, 0.5)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Trophy size={18} />
              <span>{isMatchActive ? "Match In Progress..." : `🏟️ KICK OFF MATCHDAY #${calendar?.currentGameweek ?? 1}`}</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleAdvanceOneDay}
                disabled={isAdvancing}
                style={{
                  padding: "10px 18px",
                  fontSize: "0.88rem",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <Play size={16} color="var(--accent-cyan)" />
                <span>{isAdvancing ? "Advancing..." : "▶ Advance Day"}</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleFastForwardToMatch}
                disabled={isAdvancing}
                style={{
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  fontWeight: "900",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #00E5FF, #0284c7)",
                }}
              >
                <FastForward size={16} color="#030712" />
                <span>{isAdvancing ? "Simulating Days..." : "⏭ Advance To Matchday"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 14-Day Calendar Strip */}
      <div
        className="glass-panel"
        style={{
          borderRadius: "14px",
          padding: "16px 20px",
          background: "rgba(11, 15, 25, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: "800", color: "#fff" }}>
            <Calendar size={16} color="var(--accent-cyan)" />
            <span>Season Schedule Horizon (Next 14 Days)</span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            CM Calendar Rhythm: Mon/Tue/Thu/Fri Training • Sun/Wed Rest • Sat Matchday
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {schedule.map((item, idx) => {
            const isMatch = item.isMatchday;
            const isRest = item.type === "rest";

            return (
              <div
                key={idx}
                style={{
                  borderRadius: "10px",
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border: item.isToday
                    ? "2px solid #00E5FF"
                    : isMatch
                    ? "1px solid rgba(239, 68, 68, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: item.isToday
                    ? "rgba(0, 229, 255, 0.15)"
                    : isMatch
                    ? "rgba(239, 68, 68, 0.1)"
                    : isRest
                    ? "rgba(16, 185, 129, 0.05)"
                    : "rgba(15, 23, 42, 0.4)",
                  boxShadow: item.isToday ? "0 0 15px rgba(0, 229, 255, 0.3)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    color: item.isToday ? "#00E5FF" : isMatch ? "#ef4444" : "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  {item.dateStr}
                </span>

                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "4px",
                    background: isMatch
                      ? "rgba(239, 68, 68, 0.2)"
                      : isRest
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(0, 229, 255, 0.2)",
                  }}
                >
                  {isMatch ? (
                    <Trophy size={13} color="#ef4444" />
                  ) : isRest ? (
                    <BatteryCharging size={13} color="#10b981" />
                  ) : (
                    <Zap size={13} color="#00E5FF" />
                  )}
                </div>

                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: item.isToday ? "#fff" : "var(--text-secondary)",
                    lineHeight: "1.1",
                  }}
                >
                  {isMatch ? "MATCH" : isRest ? "REST" : "DRILL"}
                </span>

                {item.isToday && (
                  <span
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: "900",
                      color: "#030712",
                      background: "#00E5FF",
                      borderRadius: "4px",
                      padding: "1px 4px",
                      marginTop: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split: Left = Tactical Training Prompt Studio & Superstar Evolution, Right = Squad Readiness & Activity Logs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px", alignItems: "start" }}>
        {/* Left: Prompt Coaching Studio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            className="glass-panel"
            style={{
              borderRadius: "14px",
              padding: "20px",
              background: "rgba(11, 15, 25, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#fff" }}>
                  Prompt Coaching & Superstar Development
                </h3>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontWeight: "700" }}>
                ⭐ Grassroots to Superstar Evolution Engine
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              In the National League (Tier 4), players start with raw ratings (~5.8). High-quality prompt engineering during
              training days and matches unlocks their hidden potential (up to 8.5+), transforming grassroots players into
              prized home-grown superstars with tens of millions in transfer market value!
            </p>

            {/* Prompt Input Area */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Manager Training Directive Prompt:
              </label>
              <textarea
                rows={3}
                value={trainingPrompt}
                onChange={(e) => setTrainingPrompt(e.target.value)}
                placeholder="Instruct the squad on tactical concepts, passing combinations, high-pressing aggression, or set-piece routines..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                  color: "#fff",
                  fontSize: "0.86rem",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
                }}
              />
            </div>

            {/* Quick Macro Buttons */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                QUICK COACHING MACRO DRILLS:
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {QUICK_DRILL_PROMPTS.map((macro, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTrainingPrompt(macro.prompt)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(255, 255, 255, 0.03)",
                      color: "#fff",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-cyan)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)")}
                  >
                    {macro.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Execution Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Tactical training days boost Tactical Mastery (+2% to +3%). Rest days restore +25% Stamina.
              </span>
              <button
                className="btn btn-secondary"
                onClick={handleAdvanceOneDay}
                disabled={isAdvancing || isMatchday}
                style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: "800", gap: "6px" }}
              >
                <Play size={14} color="var(--accent-cyan)" />
                <span>Run Drills & Advance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Next Match Briefing & Last Training Activity Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Next Match Card */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "14px",
              padding: "20px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 26, 0.95) 100%)",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: isHomeFixture ? "rgba(16, 185, 129, 0.2)" : "rgba(138, 63, 252, 0.2)",
                  color: isHomeFixture ? "#10b981" : "#c084fc",
                  border: `1px solid ${isHomeFixture ? "rgba(16, 185, 129, 0.4)" : "rgba(138, 63, 252, 0.4)"}`,
                  textTransform: "uppercase",
                }}
              >
                {isHomeFixture ? "🏟️ HOME FIXTURE" : "✈️ AWAY FIXTURE"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Matchday #{calendar?.currentGameweek ?? 1}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "900", fontSize: "1rem", color: isHomeFixture ? "#00E5FF" : "#fff" }}>
                  {isHomeFixture ? userTeamName : nextOpponent}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {isHomeFixture ? "Home Club (Your Team)" : "Host Club"}
                </div>
              </div>
              <div style={{ fontWeight: "900", fontSize: "0.9rem", color: "var(--accent-gold)" }}>VS</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "900", fontSize: "1rem", color: !isHomeFixture ? "#00E5FF" : "#fff" }}>
                  {isHomeFixture ? nextOpponent : userTeamName}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {!isHomeFixture ? "Away Club (Your Team)" : "Visiting Challenger"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.74rem",
                color: isHomeFixture ? "var(--accent-green)" : "var(--accent-cyan)",
                background: "rgba(255, 255, 255, 0.04)",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              {isHomeFixture
                ? "🏟️ Home Roar Advantage: Morale is boosted by loyal home supporters."
                : "✈️ Hostile Away Match: Crowd pressure increases, requiring tactical discipline."}
            </div>

            {isMatchday ? (
              <button
                className="btn btn-primary"
                onClick={onPlayScheduledMatch}
                style={{ width: "100%", padding: "10px", fontSize: "0.88rem", fontWeight: "900" }}
              >
                {isHomeFixture ? "🏟️ Kick Off Home Match Now" : "✈️ Kick Off Away Match Now"}
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                <Clock size={13} color="var(--accent-gold)" />
                <span>Advance days on the calendar to arrive at Saturday matchday.</span>
              </div>
            )}
          </div>

          {/* Last Activity / Training Log */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "14px",
              padding: "18px",
              background: "rgba(11, 15, 25, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Activity size={16} color="var(--accent-cyan)" />
                <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "#fff" }}>
                  Coach Activity Bulletin
                </h4>
              </div>
              {squad && squad.length > 0 && (
                <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontWeight: "700" }}>
                  {squad.length} Players Active
                </span>
              )}
            </div>

            {lastActionFeedback && (
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(0, 229, 255, 0.1)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                  fontSize: "0.75rem",
                  color: "#00E5FF",
                  fontWeight: "700",
                }}
              >
                {lastActionFeedback}
              </div>
            )}

            {calendar?.lastTrainingLog ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.76rem" }}>
                <div style={{ color: "var(--text-muted)" }}>{calendar.lastTrainingLog.date}</div>
                <div style={{ color: "#e2e8f0", background: "rgba(255, 255, 255, 0.04)", padding: "8px 10px", borderRadius: "6px" }}>
                  "{calendar.lastTrainingLog.prompt}"
                </div>
                <div style={{ color: "var(--accent-green)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} /> {calendar.lastTrainingLog.result}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>No recent training logs recorded.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
