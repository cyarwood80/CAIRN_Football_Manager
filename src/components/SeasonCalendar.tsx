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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner: Date, Calendar Rhythm, and Advance Controls */}
      <div
        className="carbon-card"
        style={{
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          borderLeft: isMatchday ? "4px solid var(--cds-red)" : "4px solid var(--cds-green-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "4px",
              background: isMatchday
                ? "var(--cds-red-light)"
                : activityType === "rest"
                ? "var(--cds-layer)"
                : "var(--cds-green-light)",
              border: `1px solid ${isMatchday ? "var(--cds-red)" : "var(--cds-green-primary)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isMatchday ? "var(--cds-red)" : "var(--cds-green-primary)",
            }}
          >
            {isMatchday ? (
              <Trophy size={24} />
            ) : activityType === "rest" ? (
              <BatteryCharging size={24} />
            ) : (
              <Zap size={24} />
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className={isMatchday ? "badge badge-error" : "badge badge-success"} style={{ fontSize: "11px" }}>
                {calendar?.activeTier ? calendar.activeTier.replace("_", " ").toUpperCase() : "TIER 4 NATIONAL LEAGUE"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>•</span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-secondary)", fontWeight: "600" }}>
                ROUND / GAMEWEEK #{calendar?.currentGameweek ?? 1}
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "var(--cds-text-primary)", letterSpacing: "-0.01em" }}>
              {calendar?.date ?? "Saturday, 9 Aug 2025"}
            </h1>

            <div style={{ fontSize: "13px", color: "var(--cds-text-secondary)", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
              <strong style={{ color: isMatchday ? "var(--cds-red)" : "var(--cds-green-primary)" }}>
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
                height: "40px",
                padding: "0 20px",
                fontSize: "14px",
                fontWeight: "600",
                background: "var(--cds-red)",
                borderColor: "var(--cds-red)",
                gap: "8px",
              }}
            >
              <Trophy size={16} />
              <span>{isMatchActive ? "Match In Progress..." : `PLAY MATCHDAY #${calendar?.currentGameweek ?? 1}`}</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleAdvanceOneDay}
                disabled={isAdvancing}
                style={{ height: "38px", padding: "0 16px", fontSize: "13px", fontWeight: "600", gap: "6px" }}
              >
                <Play size={14} color="var(--cds-green-primary)" />
                <span>{isAdvancing ? "Advancing..." : "Advance Day"}</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleFastForwardToMatch}
                disabled={isAdvancing}
                style={{ height: "38px", padding: "0 18px", fontSize: "13px", fontWeight: "600", gap: "6px" }}
              >
                <FastForward size={14} />
                <span>{isAdvancing ? "Simulating Days..." : "Fast Forward to Matchday"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 14-Day Calendar Strip */}
      <div className="carbon-card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
            <Calendar size={16} color="var(--cds-green-primary)" />
            <span>Season Schedule Horizon (Next 14 Days)</span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
            Calendar Rhythm: Mon/Tue/Thu/Fri Training • Sun/Wed Rest • Sat Matchday
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(76px, 1fr))",
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
                  borderRadius: "4px",
                  padding: "10px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border: item.isToday
                    ? "2px solid var(--cds-green-primary)"
                    : isMatch
                    ? "1px solid var(--cds-red)"
                    : "1px solid var(--cds-border)",
                  background: item.isToday
                    ? "var(--cds-layer-selected)"
                    : isMatch
                    ? "var(--cds-red-light)"
                    : isRest
                    ? "var(--cds-layer)"
                    : "var(--cds-surface)",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: item.isToday ? "var(--cds-green-primary)" : isMatch ? "var(--cds-red)" : "var(--cds-text-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  {item.dateStr}
                </span>

                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "4px",
                    background: isMatch
                      ? "rgba(218, 30, 40, 0.15)"
                      : isRest
                      ? "rgba(141, 141, 141, 0.15)"
                      : "rgba(15, 107, 69, 0.15)",
                  }}
                >
                  {isMatch ? (
                    <Trophy size={13} color="var(--cds-red)" />
                  ) : isRest ? (
                    <BatteryCharging size={13} color="var(--cds-text-muted)" />
                  ) : (
                    <Zap size={13} color="var(--cds-green-primary)" />
                  )}
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: item.isToday ? "var(--cds-green-primary)" : "var(--cds-text-primary)",
                    lineHeight: "1.1",
                  }}
                >
                  {isMatch ? "MATCH" : isRest ? "REST" : "DRILL"}
                </span>

                {item.isToday && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      color: "#fff",
                      background: "var(--cds-green-primary)",
                      borderRadius: "2px",
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
          <div className="carbon-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} color="var(--cds-green-primary)" />
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                  Prompt Coaching & Superstar Development
                </h2>
              </div>
              <span className="badge badge-success" style={{ fontSize: "11px" }}>
                ⭐ Evolution Engine
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "13px", color: "var(--cds-text-secondary)", lineHeight: "1.5" }}>
              In the National League (Tier 4), players start with raw ratings (~5.8). High-quality prompt engineering during
              training days and matches unlocks their hidden potential (up to 8.5+), transforming grassroots players into
              prized home-grown superstars with millions in transfer market valuation.
            </p>

            {/* Prompt Input Area */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--cds-text-secondary)", marginBottom: "6px" }}>
                Manager Training Directive Prompt:
              </label>
              <textarea
                rows={3}
                value={trainingPrompt}
                onChange={(e) => setTrainingPrompt(e.target.value)}
                placeholder="Instruct the squad on tactical concepts, passing combinations, high-pressing aggression, or set-piece routines..."
                className="carbon-input"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "13px",
                  lineHeight: "1.45",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Quick Macro Buttons */}
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--cds-text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                Quick Coaching Macro Drills:
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {QUICK_DRILL_PROMPTS.map((macro, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTrainingPrompt(macro.prompt)}
                    className="btn btn-secondary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textAlign: "left",
                      justifyContent: "flex-start",
                      height: "auto",
                    }}
                  >
                    {macro.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Execution Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border-subtle)", paddingTop: "14px" }}>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
                Tactical training days boost Tactical Mastery (+2% to +3%). Rest days restore +25% Stamina.
              </span>
              <button
                className="btn btn-primary"
                onClick={handleAdvanceOneDay}
                disabled={isAdvancing || isMatchday}
                style={{ height: "36px", padding: "0 16px", fontSize: "13px", fontWeight: "600", gap: "6px" }}
              >
                <Play size={14} />
                <span>Run Drills & Advance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Next Match Briefing & Last Training Activity Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Next Match Card */}
          <div className="carbon-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={isHomeFixture ? "badge badge-success" : "badge badge-info"} style={{ fontSize: "11px" }}>
                {isHomeFixture ? "🏟️ HOME FIXTURE" : "✈️ AWAY FIXTURE"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
                Matchday #{calendar?.currentGameweek ?? 1}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--cds-text-primary)" }}>
                  {isHomeFixture ? userTeamName : nextOpponent}
                </div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                  {isHomeFixture ? "Home Club (Your Team)" : "Host Club"}
                </div>
              </div>
              <div style={{ fontWeight: "800", fontSize: "13px", color: "var(--cds-text-muted)" }}>VS</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--cds-text-primary)" }}>
                  {isHomeFixture ? nextOpponent : userTeamName}
                </div>
                <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                  {!isHomeFixture ? "Away Club (Your Team)" : "Visiting Challenger"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: isHomeFixture ? "var(--cds-green-primary)" : "#0F62FE",
                background: isHomeFixture ? "var(--cds-green-light)" : "var(--cds-blue-light)",
                padding: "8px 12px",
                borderRadius: "4px",
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
                style={{ width: "100%", height: "38px", fontSize: "13px", fontWeight: "600", background: "var(--cds-red)", borderColor: "var(--cds-red)" }}
              >
                {isHomeFixture ? "🏟️ Kick Off Home Match Now" : "✈️ Kick Off Away Match Now"}
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--cds-text-secondary)" }}>
                <Clock size={14} color="var(--cds-text-muted)" />
                <span>Advance days on the calendar to arrive at Saturday matchday.</span>
              </div>
            )}
          </div>

          {/* Last Activity / Training Log */}
          <div className="carbon-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Activity size={16} color="var(--cds-green-primary)" />
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
                  Coach Activity Bulletin
                </h3>
              </div>
              {squad && squad.length > 0 && (
                <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>
                  {squad.length} Players Active
                </span>
              )}
            </div>

            {lastActionFeedback && (
              <div className="badge badge-success" style={{ padding: "6px 10px", fontSize: "11px" }}>
                {lastActionFeedback}
              </div>
            )}

            {calendar?.lastTrainingLog ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                <div style={{ color: "var(--cds-text-muted)" }}>{calendar.lastTrainingLog.date}</div>
                <div style={{ color: "var(--cds-text-primary)", background: "var(--cds-layer)", padding: "8px 12px", borderRadius: "4px" }}>
                  "{calendar.lastTrainingLog.prompt}"
                </div>
                <div style={{ color: "var(--cds-green-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} /> {calendar.lastTrainingLog.result}
                </div>
              </div>
            ) : (
              <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>No recent training logs recorded.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
