// src/components/LeftRailNav.tsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  Sliders,
  ArrowLeftRight,
  Search,
  Dumbbell,
  Calendar,
  Shield,
  CreditCard,
  Mail,
  Settings,
} from "lucide-react";
import type { TeamConfig } from "../types";

export type NavTabKey =
  | "dashboard"
  | "squad"
  | "tactics"
  | "market"
  | "scouting"
  | "calendar"
  | "fixtures"
  | "table"
  | "finances"
  | "inbox"
  | "matchday"
  | "lobby";

interface LeftRailNavProps {
  activeTab: NavTabKey;
  onSelectTab: (tab: NavTabKey) => void;
  teamConfig: TeamConfig;
  seasonLabel?: string;
  inboxUnreadCount?: number;
  onOpenSettings: () => void;
}

export const LeftRailNav: React.FC<LeftRailNavProps> = ({
  activeTab,
  onSelectTab,
  teamConfig,
  seasonLabel = "Season 26/27",
  inboxUnreadCount = 1,
  onOpenSettings,
}) => {
  const navItems = [
    { key: "dashboard" as NavTabKey, label: "Dashboard", icon: LayoutDashboard },
    { key: "squad" as NavTabKey, label: "Squad", icon: Users },
    { key: "tactics" as NavTabKey, label: "Tactics", icon: Sliders },
    { key: "market" as NavTabKey, label: "Transfers", icon: ArrowLeftRight },
    { key: "scouting" as NavTabKey, label: "Scouting", icon: Search },
    { key: "calendar" as NavTabKey, label: "Training", icon: Dumbbell },
    { key: "fixtures" as NavTabKey, label: "Matches", icon: Calendar },
    { key: "table" as NavTabKey, label: "Club", icon: Shield },
    { key: "finances" as NavTabKey, label: "Finances", icon: CreditCard },
    { key: "inbox" as NavTabKey, label: "Inbox", icon: Mail, badge: inboxUnreadCount },
  ];

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "var(--cds-surface)",
        borderRight: "1px solid var(--cds-border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 100,
        userSelect: "none",
      }}
    >
      {/* Top Club Crest & Brand */}
      <div>
        <div
          style={{
            padding: "20px 20px 16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid var(--cds-border-subtle)",
          }}
        >
          {/* Crest Shield */}
          <div
            style={{
              width: "36px",
              height: "40px",
              background: "linear-gradient(135deg, #0F6B45, #085C3B)",
              clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(15, 107, 69, 0.25)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#F1C21B", letterSpacing: "-0.05em" }}>
              {(teamConfig.name || "CFC").slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--cds-text-primary)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={teamConfig.name}
            >
              {teamConfig.name || "CAIRN FC"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", fontWeight: "500" }}>
              {seasonLabel}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                  background: isActive ? "var(--cds-layer-selected)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid var(--cds-green-primary)" : "3px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.12s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--cds-layer)";
                    e.currentTarget.style.color = "var(--cds-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--cds-text-secondary)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={20} color={isActive ? "var(--cds-green-primary)" : "currentColor"} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      background: "var(--cds-green-primary)",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      lineHeight: "14px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings Link */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--cds-border-subtle)" }}>
        <button
          onClick={onOpenSettings}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            color: "var(--cds-text-secondary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            padding: "8px 0",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cds-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--cds-text-secondary)")}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
