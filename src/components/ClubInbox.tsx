// src/components/ClubInbox.tsx
import React, { useState } from "react";
import {
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { TeamConfig } from "../types";

export interface ClubMessage {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatarEmoji: string;
  subject: string;
  date: string;
  unread: boolean;
  category: "BOARD" | "SCOUT" | "PHYSIO" | "PRESS" | "TACTICS";
  body: string[];
  actionPrompt?: string;
  actionButtonText?: string;
}

const INITIAL_MESSAGES: ClubMessage[] = [
  {
    id: "msg_01",
    sender: "Club Board of Directors",
    senderRole: "Executive Chairman Sir Arthur Sterling",
    senderAvatarEmoji: "🏛️",
    subject: "Official Season Objectives & National League Charter (2026/27)",
    date: "Today, 08:30",
    unread: true,
    category: "BOARD",
    body: [
      "Welcome to Cairn Athletic FC, Manager. The Board is pleased to formally ratify your appointment.",
      "Our core operational mandate for Tier 4 National League is straightforward: ensure competitive stability, maintain strict Financial Fair Play discipline with our £1.5M warchest, and target a top-half finish with realistic playoff aspirations.",
      "The Board guarantees 100% autonomy regarding starting formations and player prompt conditioning. We expect complete dedication to tactical excellence and squad harmony.",
    ],
    actionPrompt: "The Board requests your formal signature on the 2026/27 Club Charter.",
    actionButtonText: "Sign Season Charter & Confirm",
  },
  {
    id: "msg_02",
    sender: "Malcolm Davies",
    senderRole: "Chief Scout",
    senderAvatarEmoji: "🧭",
    subject: "Scout Alert: 19yo Striker Archie Vance Available for Trial",
    date: "Yesterday, 14:15",
    unread: false,
    category: "SCOUT",
    body: [
      "Boss, our regional scout Peter Rawson has uncovered a gem at Halifax Town Youth — 19yo Archie 'The Rocket' Vance.",
      "His raw sprint velocity (88) and direct hunter instinct fit our high-pressing transition philosophy like a glove. Halifax are willing to release his grassroots contract for under £180k.",
      "I recommend reviewing his full dossier in the Scouting Hub before rival National League clubs submit an inquiry.",
    ],
    actionPrompt: "Chief Scout has added Archie Vance to your Shortlist.",
    actionButtonText: "Open in Scouting Hub",
  },
  {
    id: "msg_03",
    sender: "Dr. Sarah Evans",
    senderRole: "Head of Sports Science & Physio",
    senderAvatarEmoji: "🩺",
    subject: "Squad Energy & Training Recovery Status Report",
    date: "Thursday, 11:00",
    unread: false,
    category: "PHYSIO",
    body: [
      "Good morning Boss. Squad medical checkups before the upcoming fixture are 100% clean with zero muscular strains reported.",
      "Overall squad energy is currently sitting at an optimal 94%. We recommend maintaining the active 1-touch Gegenpress training drills while keeping Monday rest sessions intact to avoid hamstring fatigue.",
    ],
    actionPrompt: "Physio team recommends light recovery after Matchday.",
    actionButtonText: "Acknowledge Medical Briefing",
  },
  {
    id: "msg_04",
    sender: "The Non-League Football Paper",
    senderRole: "Senior Football Correspondent",
    senderAvatarEmoji: "📰",
    subject: "Media Interview Request: Pre-Season Hopes for Cairn Athletic",
    date: "Wednesday, 16:45",
    unread: false,
    category: "PRESS",
    body: [
      "Hello Manager, with the National League opening round upon us, local supporters are buzzing with excitement about your tactical AI philosophy.",
      "Would you describe your managerial style as aggressive high-pressing rock-and-roll football, or methodical patient possession?",
    ],
    actionPrompt: "Response will be published in tomorrow's matchday programme.",
    actionButtonText: "Reply: 'High-Tempo Aggressive Gegenpress'",
  },
];

interface ClubInboxProps {
  teamConfig: TeamConfig;
  messages: ClubMessage[];
  onMarkAsRead: (id: string) => void;
  onNavigateTab?: (tabKey: any) => void;
}

export const ClubInbox: React.FC<ClubInboxProps> = ({
  teamConfig,
  messages = INITIAL_MESSAGES,
  onMarkAsRead,
  onNavigateTab,
}) => {
  const [selectedMsgId, setSelectedMsgId] = useState<string>(messages[0]?.id || "msg_01");
  const [actionDoneMap, setActionDoneMap] = useState<Record<string, boolean>>({});

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || messages[0];

  const handleSelectMessage = (msg: ClubMessage) => {
    setSelectedMsgId(msg.id);
    if (msg.unread) {
      onMarkAsRead(msg.id);
    }
  };

  const handleExecuteAction = (msg: ClubMessage) => {
    setActionDoneMap((prev) => ({ ...prev, [msg.id]: true }));
    if (msg.category === "SCOUT" && onNavigateTab) {
      onNavigateTab("scouting");
    }
  };

  const getCategoryBadge = (cat: ClubMessage["category"]) => {
    switch (cat) {
      case "BOARD":
        return <span className="badge badge-warning" style={{ fontSize: "10px" }}>BOARDROOM</span>;
      case "SCOUT":
        return <span className="badge badge-success" style={{ fontSize: "10px" }}>SCOUTING</span>;
      case "PHYSIO":
        return <span className="badge badge-info" style={{ fontSize: "10px" }}>MEDICAL</span>;
      case "PRESS":
        return <span className="badge badge-neutral" style={{ fontSize: "10px" }}>MEDIA</span>;
      default:
        return <span className="badge badge-neutral" style={{ fontSize: "10px" }}>MEMO</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner */}
      <div className="carbon-card" style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            <Mail size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
              Club Communications & Manager Inbox
            </h1>
            <p style={{ fontSize: "12px", color: "var(--cds-text-secondary)", margin: "2px 0 0 0" }}>
              Official boardroom correspondence, scouting dispatches, physio reports, and press releases.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="badge badge-info" style={{ fontSize: "11px" }}>
            {messages.filter((m) => m.unread).length} Unread Messages
          </span>
        </div>
      </div>

      {/* Two-Pane Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", minHeight: "560px" }}>
        {/* Left Pane: Message List */}
        <div className="carbon-card" style={{ padding: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--cds-border)", background: "var(--cds-layer)", fontSize: "13px", fontWeight: "600", color: "var(--cds-text-primary)" }}>
            Inbox Messages ({messages.length})
          </div>

          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {messages.map((msg) => {
              const isSelected = selectedMsg?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--cds-border-subtle)",
                    cursor: "pointer",
                    background: isSelected
                      ? "var(--cds-layer-selected)"
                      : msg.unread
                      ? "rgba(15, 107, 69, 0.03)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "3px solid var(--cds-green-primary)"
                      : msg.unread
                      ? "3px solid var(--cds-amber)"
                      : "3px solid transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>{msg.senderAvatarEmoji}</span>
                      <span style={{ fontSize: "13px", fontWeight: msg.unread ? "700" : "600", color: "var(--cds-text-primary)" }}>
                        {msg.sender}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>{msg.date}</span>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: msg.unread ? "600" : "400",
                      color: msg.unread ? "var(--cds-text-primary)" : "var(--cds-text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "6px",
                    }}
                  >
                    {msg.subject}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {getCategoryBadge(msg.category)}
                    {msg.unread && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cds-green-primary)" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Message Reader */}
        {selectedMsg ? (
          <div className="carbon-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "20px" }}>
            <div>
              {/* Message Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "18px", borderBottom: "1px solid var(--cds-border)" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--cds-layer)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", border: "1px solid var(--cds-border)" }}>
                    {selectedMsg.senderAvatarEmoji}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
                        {selectedMsg.sender}
                      </h2>
                      {getCategoryBadge(selectedMsg.category)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "2px" }}>
                      {selectedMsg.senderRole} • To: Chris (Manager, {teamConfig.name || "Cairn Athletic FC"})
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
                  {selectedMsg.date}
                </div>
              </div>

              {/* Subject */}
              <div style={{ margin: "20px 0 16px 0", fontSize: "17px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                {selectedMsg.subject}
              </div>

              {/* Body paragraphs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--cds-text-secondary)", lineHeight: 1.6 }}>
                {selectedMsg.body.map((p, idx) => (
                  <p key={idx} style={{ margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Action Box at bottom */}
            {selectedMsg.actionButtonText && (
              <div
                style={{
                  padding: "16px 20px",
                  background: "var(--cds-layer)",
                  border: "1px solid var(--cds-border)",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ fontSize: "13px", color: "var(--cds-text-primary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} color="var(--cds-green-primary)" />
                  <span>{selectedMsg.actionPrompt || "Recommended Action:"}</span>
                </div>

                <button
                  className={actionDoneMap[selectedMsg.id] ? "btn btn-secondary" : "btn btn-primary"}
                  onClick={() => handleExecuteAction(selectedMsg)}
                  style={{ height: "36px", fontSize: "13px", gap: "6px" }}
                >
                  {actionDoneMap[selectedMsg.id] ? (
                    <>
                      <CheckCircle2 size={15} color="var(--cds-green-primary)" />
                      <span>Action Confirmed</span>
                    </>
                  ) : (
                    <span>{selectedMsg.actionButtonText}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="carbon-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cds-text-muted)" }}>
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
};
