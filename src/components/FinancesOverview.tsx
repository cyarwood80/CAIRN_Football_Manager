// src/components/FinancesOverview.tsx
import React from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { TeamConfig } from "../types";

interface FinancesOverviewProps {
  teamConfig: TeamConfig;
  budget: number;
}

export const FinancesOverview: React.FC<FinancesOverviewProps> = ({ teamConfig, budget }) => {
  const squad = teamConfig.starting11 || [];
  const bench = teamConfig.benchSubs || [];
  const allPlayers = [...squad, ...bench];

  // Calculate estimated wages
  const playerWages = allPlayers.map((p, idx) => {
    const ovr = p.rating ? Math.round(p.rating * 10) : 58;
    const weeklyWage = Math.round(ovr * 12 + (idx < 11 ? 150 : 50));
    return {
      ...p,
      weeklyWage,
      ovr,
      contractYears: 2,
    };
  });

  const totalWeeklyWage = playerWages.reduce((sum, p) => sum + p.weeklyWage, 0);
  const maxWeeklyWageBudget = 14000;
  const wageCapUsage = Math.round((totalWeeklyWage / maxWeeklyWageBudget) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner: Club Financial Health */}
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
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--cds-text-primary)", margin: 0 }}>
                Club Financial Intelligence & Budget Runaway
              </h1>
              <span className="badge badge-success" style={{ fontSize: "11px" }}>
                Solvent • Grade A
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--cds-text-secondary)", margin: "4px 0 0 0" }}>
              {teamConfig.name || "Cairn Athletic FC"} • National League Season 26/27 • Financial Fair Play (FFP) Compliant
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" style={{ height: "36px", fontSize: "13px" }}>
            Export Audit Report
          </button>
          <button className="btn btn-primary" style={{ height: "36px", fontSize: "13px" }}>
            Request Board Budget Review
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {/* Card 1: Bank Balance */}
        <div className="carbon-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--cds-text-secondary)", fontWeight: "500" }}>Overall Club Balance</span>
            <span className="badge badge-success" style={{ fontSize: "10px" }}>▲ +£12.4k/wk</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-text-primary)", letterSpacing: "-0.02em" }}>
            £{(teamConfig.totalSquadValue || 3.5).toFixed(1)}m
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            Estimated total club valuation & liquid assets
          </div>
        </div>

        {/* Card 2: Transfer Budget */}
        <div className="carbon-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--cds-text-secondary)", fontWeight: "500" }}>Transfer Warchest</span>
            <span className="badge badge-info" style={{ fontSize: "10px" }}>Active Budget</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-green-primary)", letterSpacing: "-0.02em" }}>
            £{budget.toFixed(1)}m
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            100% available for incoming transfer fees
          </div>
        </div>

        {/* Card 3: Weekly Wage Bill */}
        <div className="carbon-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--cds-text-secondary)", fontWeight: "500" }}>Weekly Wage Bill</span>
            <span className="badge badge-success" style={{ fontSize: "10px" }}>{wageCapUsage}% of Cap</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--cds-text-primary)", letterSpacing: "-0.02em" }}>
            £{totalWeeklyWage.toLocaleString()} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--cds-text-muted)" }}>/ wk</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "var(--cds-border)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ width: `${wageCapUsage}%`, height: "100%", background: "var(--cds-green-primary)" }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            Cap: £{maxWeeklyWageBudget.toLocaleString()}/wk (£{(maxWeeklyWageBudget - totalWeeklyWage).toLocaleString()}/wk headroom)
          </div>
        </div>

        {/* Card 4: Matchday Income */}
        <div className="carbon-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--cds-text-secondary)", fontWeight: "500" }}>Matchday Gate Receipts</span>
            <span className="badge badge-info" style={{ fontSize: "10px" }}>Per Home Match</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0F62FE", letterSpacing: "-0.02em" }}>
            £34,500
          </div>
          <div style={{ fontSize: "12px", color: "var(--cds-text-muted)", marginTop: "4px" }}>
            Based on 3,450 avg attendance @ £10/ticket
          </div>
        </div>
      </div>

      {/* Middle Row: Income & Expenditure Breakdown + Board Financial Mandate */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "20px" }}>
        {/* Income Breakdown */}
        <div className="carbon-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--cds-text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowUpRight size={18} color="var(--cds-green-primary)" />
              Monthly Revenue Channels
            </h2>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-green-primary)" }}>
              +£185,000 / mo
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Matchday Gate & Hospitality</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£69,000 (37%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "37%", height: "100%", background: "var(--cds-green-primary)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Domestic TV Rights & Streaming Pass</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£54,000 (29%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "29%", height: "100%", background: "#0F62FE" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Commercial Shirt & Stadium Sponsors</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£42,000 (23%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "23%", height: "100%", background: "#8A3FFC" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Club Shop & Merchandise</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£20,000 (11%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "11%", height: "100%", background: "var(--cds-amber)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Expenditure Breakdown */}
        <div className="carbon-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--cds-text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowDownRight size={18} color="var(--cds-red)" />
              Monthly Operational Outgoings
            </h2>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--cds-red)" }}>
              -£68,800 / mo
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Player First-Team Wages</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£33,800 (49%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "49%", height: "100%", background: "var(--cds-red)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Coaching & Scouting Staff</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£16,000 (23%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "23%", height: "100%", background: "#FF7EB6" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Stadium Maintenance & Pitch Care</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£11,000 (16%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "16%", height: "100%", background: "#6F6F6F" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ color: "var(--cds-text-secondary)" }}>Travel, Hotel & Match Logistics</span>
                <strong style={{ color: "var(--cds-text-primary)" }}>£8,000 (12%)</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--cds-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "12%", height: "100%", background: "#8D8D8D" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Wage Hierarchy Table */}
      <div className="carbon-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--cds-text-primary)", margin: 0 }}>
              Squad Contract & Wage Distribution
            </h2>
            <span style={{ fontSize: "12px", color: "var(--cds-text-muted)" }}>
              Sorted by weekly wage commitment
            </span>
          </div>
          <span className="badge badge-success" style={{ fontSize: "11px" }}>
            14 Active Contracts
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="carbon-table" style={{ width: "100%", fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 12px" }}>PLAYER</th>
                <th style={{ textAlign: "center", padding: "10px 12px" }}>POS</th>
                <th style={{ textAlign: "center", padding: "10px 12px" }}>OVR</th>
                <th style={{ textAlign: "right", padding: "10px 12px" }}>WEEKLY WAGE</th>
                <th style={{ textAlign: "right", padding: "10px 12px" }}>ANNUAL COST</th>
                <th style={{ textAlign: "center", padding: "10px 12px" }}>CONTRACT EXPIRY</th>
                <th style={{ textAlign: "right", padding: "10px 12px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {playerWages
                .sort((a, b) => b.weeklyWage - a.weeklyWage)
                .map((p, idx) => (
                  <tr key={p.number || p.name || idx}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <PlayerAvatar name={p.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: "600", color: "var(--cds-text-primary)" }}>{p.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--cds-text-muted)" }}>{p.personalityTrait || "Grassroots"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px" }}>
                      <span className="badge badge-info" style={{ fontSize: "11px", padding: "2px 6px" }}>
                        {p.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                      {p.ovr}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                      £{p.weeklyWage}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", color: "var(--cds-text-secondary)" }}>
                      £{(p.weeklyWage * 52).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", color: "var(--cds-text-secondary)" }}>
                      June 2028 (2 yrs)
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px" }}>
                      <span className="badge badge-success" style={{ fontSize: "10px" }}>
                        Secured
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
