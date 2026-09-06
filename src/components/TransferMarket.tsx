// src/components/TransferMarket.tsx
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Sparkles,
  UserCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Info,
} from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import type { SquadPlayerConfig, TransferMarketListing, TeamConfig } from "../types";

interface TransferMarketProps {
  teamConfig: TeamConfig;
  budget: number;
  userActiveTier?: string;
  onUpdateSquadAndBudget: (
    newSquad: SquadPlayerConfig[],
    newBench: SquadPlayerConfig[],
    newBudget: number,
    newHarmony: number
  ) => void;
}

const TIER_TABS = [
  { id: "ALL", label: "All Tiers", badge: "160 Targets" },
  { id: "tier_4", label: "Tier 4: National League", badge: "Grassroots" },
  { id: "tier_3", label: "Tier 3: Division Two", badge: "Developing" },
  { id: "tier_2", label: "Tier 2: Division One", badge: "Challengers" },
  { id: "tier_1", label: "Tier 1: Premier Championship", badge: "Superstars" },
  { id: "FREE_AGENTS", label: "Free Transfers", badge: "No Fee" },
];

export const TransferMarket: React.FC<TransferMarketProps> = ({
  teamConfig,
  budget,
  userActiveTier = "tier_4",
  onUpdateSquadAndBudget,
}) => {
  const [activeTab, setActiveTab] = useState<"market" | "squad">("market");
  const [selectedTierTab, setSelectedTierTab] = useState<string>("ALL");
  const [realisticOnly, setRealisticOnly] = useState<boolean>(true);
  const [marketListings, setMarketListings] = useState<TransferMarketListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "warn" | "error" } | null>(null);
  const [scoutedPlayer, setScoutedPlayer] = useState<TransferMarketListing | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMarket = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTierTab === "FREE_AGENTS") {
        params.set("freeAgentsOnly", "true");
      } else if (selectedTierTab !== "ALL") {
        params.set("tier", selectedTierTab);
      }
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (realisticOnly) params.set("realisticOnly", "true");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("userTier", userActiveTier);

      const res = await fetch(`/api/cm/market?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.market) setMarketListings(data.market);
      }
    } catch (err) {
      console.warn("Could not fetch market listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [selectedTierTab, roleFilter, realisticOnly, userActiveTier]);

  const starting11 = teamConfig.starting11 || [];
  const benchSubs = teamConfig.benchSubs || [];
  const allSquad = [...starting11, ...benchSubs];
  const squadHarmony = teamConfig.squadHarmony || 85;

  const totalValue = +(
    allSquad.reduce((sum, p) => sum + (p.transferValue || 0.3), 0)
  ).toFixed(2);

  const showToast = (msg: string, type: "success" | "warn" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // BUY / SIGN PLAYER
  const handleBuyPlayer = async (listing: TransferMarketListing) => {
    if (budget < listing.transferValue) {
      showToast(
        `Insufficient transfer funds! Required: £${listing.transferValue}M | Available: £${budget.toFixed(1)}M`,
        "error"
      );
      return;
    }

    if (allSquad.some((p) => p.name === listing.name)) {
      showToast(`${listing.name} is already in your squad!`, "warn");
      return;
    }

    if (listing.negotiationFeasibility === "unrealistic") {
      showToast(
        listing.negotiationReason ||
          `Talks broken down: ${listing.name} refuses to play in the National League due to club prestige.`,
        "error"
      );
      return;
    }

    try {
      const res = await fetch("/api/cm/buy-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: listing, userTier: userActiveTier }),
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.reason || "Transfer talks broke down.", "error");
        return;
      }

      const newPlayer: SquadPlayerConfig = {
        number: 14,
        name: listing.name,
        role: listing.role,
        transferValue: listing.transferValue,
        tier: listing.tier,
        promptCapability: listing.promptCapability,
        rating: listing.rating || 5.8,
        potentialRating: listing.potentialRating || 8.0,
        personalityTrait: listing.personalityTrait || "Methodical",
        personalityIcon: listing.personalityIcon || "🛡️",
        personalityDescription: listing.personalityDescription || "Tactical focus",
        isYouth: false,
      };

      let newBench = [...benchSubs];
      let newStarters = [...starting11];

      if (newBench.length >= 3) {
        newBench.sort((a, b) => (a.transferValue || 0) - (b.transferValue || 0));
        const replaced = newBench[0];
        newBench[0] = { ...newPlayer, number: replaced.number };
        showToast(
          `Signed ${listing.name} (£${listing.transferValue}M)! Replaced lowest-valued bench sub (${replaced.name}).`
        );
      } else {
        newBench.push({ ...newPlayer, number: 11 + newBench.length + 1 });
        showToast(`Signed ${listing.name} (£${listing.transferValue}M) to your matchday bench!`);
      }

      const newBudget = Math.max(0, +(budget - listing.transferValue).toFixed(2));
      const newHarmony = Math.min(99, squadHarmony + 3);

      onUpdateSquadAndBudget(newStarters, newBench, newBudget, newHarmony);
      setScoutedPlayer(null);
      fetchMarket();
    } catch (e) {
      console.error(e);
      showToast("Transfer negotiation network error.", "error");
    }
  };

  // SELL SQUAD PLAYER
  const handleSellPlayer = (player: SquadPlayerConfig) => {
    if (allSquad.length <= 11) {
      showToast("Cannot sell player! Squad cannot drop below the starting 11.", "error");
      return;
    }

    const sellPrice = +(player.transferValue || 0.3).toFixed(2);
    const newBudget = +(budget + sellPrice).toFixed(2);

    const youthNames = [
      "Alfie Jenkins",
      "Archie Baxter",
      "Leo Vance",
      "Kian O'Connor",
      "Rory MacLeod",
      "Bobby Campbell",
      "Finley Cross",
      "Callum Thorne",
    ];
    const youthName = `${youthNames[Math.floor(Math.random() * youthNames.length)]} (Youth)`;

    const youthPlayer: SquadPlayerConfig = {
      number: player.number,
      name: youthName,
      role: player.role,
      transferValue: 0.1,
      tier: 4,
      rating: 5.2,
      potentialRating: 7.8,
      personalityTrait: "Tenacious",
      personalityIcon: "⚙️",
      personalityDescription: "Raw youth academy prospect eager to develop",
      promptCapability: "Raw Grassroots Youth",
      isYouth: true,
    };

    let newStarters = starting11.map((p) => (p.name === player.name ? youthPlayer : p));
    let newBench = benchSubs.map((p) => (p.name === player.name ? youthPlayer : p));

    const newHarmony = Math.max(45, squadHarmony - 4);

    showToast(`Sold ${player.name} for +£${sellPrice}M! Promoted ${youthName} from Youth Academy.`);
    onUpdateSquadAndBudget(newStarters, newBench, newBudget, newHarmony);
  };

  const filteredMarket = marketListings.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchClub = p.club && p.club.toLowerCase().includes(q);
      if (!matchName && !matchClub) return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: "4px",
            background:
              notification.type === "error"
                ? "#FFF1F0"
                : notification.type === "warn"
                ? "#FEF7E0"
                : "#DEFBE6",
            border: `1px solid ${
              notification.type === "error"
                ? "#FF8389"
                : notification.type === "warn"
                ? "#F1C21B"
                : "#0F6B45"
            }`,
            color:
              notification.type === "error"
                ? "#DA1E28"
                : notification.type === "warn"
                ? "#8E6A00"
                : "#0F6B45",
            fontWeight: "700",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          {notification.type === "error" ? (
            <XCircle size={18} />
          ) : notification.type === "warn" ? (
            <AlertCircle size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Transfer Window Financial & Scouting HUD (IBM Carbon Light Card) */}
      <div
        className="carbon-card"
        style={{
          borderRadius: "4px",
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          background: "var(--cds-surface)",
          border: "1px solid var(--cds-border)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--cds-text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.04em" }}>
            Available Transfer Budget
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--cds-green-primary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <DollarSign size={24} />
            <span>£{budget.toFixed(2)}M</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--cds-text-muted)" }}>Strictly bounded grassroots funds</span>
        </div>

        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--cds-text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.04em" }}>
            Total Squad Market Value
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--cds-blue)", marginTop: "2px" }}>
            £{totalValue}M
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--cds-text-muted)" }}>14 Registered Players</span>
        </div>

        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--cds-text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.04em" }}>
            Squad Chemistry & Harmony
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "700", color: squadHarmony > 75 ? "var(--cds-green-primary)" : "#F1C21B", marginTop: "2px" }}>
            {squadHarmony}%
          </div>
          <div style={{ width: "100%", height: "6px", background: "var(--cds-layer)", border: "1px solid var(--cds-border)", borderRadius: "2px", overflow: "hidden", marginTop: "6px" }}>
            <div style={{ width: `${squadHarmony}%`, height: "100%", background: squadHarmony > 75 ? "var(--cds-green-primary)" : "#F1C21B" }} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--cds-text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.04em" }}>
            Club Status & Scouting Reach
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--cds-text-primary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <UserCheck size={18} color="var(--cds-green-primary)" />
            <span>National League (Tier 4)</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--cds-text-muted)" }}>Promotion expands scouting reputation</span>
        </div>
      </div>

      {/* Navigation Tabs (Available Transfers vs My Squad) */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--cds-border)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("market")}
          style={{
            padding: "8px 18px",
            borderRadius: "4px",
            border: activeTab === "market" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "market" ? "var(--cds-green-primary)" : "var(--cds-surface)",
            color: activeTab === "market" ? "#FFFFFF" : "var(--cds-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <ArrowDownLeft size={16} />
          <span>Transfer Targets Across 4 Divisions ({marketListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("squad")}
          style={{
            padding: "8px 18px",
            borderRadius: "4px",
            border: activeTab === "squad" ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "squad" ? "var(--cds-green-primary)" : "var(--cds-surface)",
            color: activeTab === "squad" ? "#FFFFFF" : "var(--cds-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <ArrowUpRight size={16} />
          <span>My Squad & Transfer Out (14)</span>
        </button>
      </div>

      {/* TAB 1: MARKET LISTINGS */}
      {activeTab === "market" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Tier Selection Strip */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {TIER_TABS.map((tab) => {
              const isSelected = selectedTierTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTierTab(tab.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "4px",
                    border: isSelected ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                    background: isSelected ? "#DEFBE6" : "var(--cds-surface)",
                    color: isSelected ? "var(--cds-green-primary)" : "var(--cds-text-primary)",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "1px 6px",
                      borderRadius: "2px",
                      background: isSelected ? "rgba(15, 107, 69, 0.15)" : "var(--cds-layer)",
                      color: isSelected ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                    }}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters, Search & Realistic Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                maxWidth: "360px",
                background: "var(--cds-surface)",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid var(--cds-border)",
              }}
            >
              <Search size={16} color="var(--cds-text-secondary)" />
              <input
                type="text"
                placeholder="Search player or selling club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchMarket()}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--cds-text-primary)",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-main)",
                }}
              />
            </div>

            {/* Position Pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {["ALL", "GK", "DEF", "MID", "FWD"].map((r) => {
                const isSelected = roleFilter === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: isSelected ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                      background: isSelected ? "var(--cds-green-primary)" : "var(--cds-surface)",
                      color: isSelected ? "#FFFFFF" : "var(--cds-text-primary)",
                      fontWeight: "600",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Realistic Targets Only Toggle */}
            <button
              onClick={() => setRealisticOnly(!realisticOnly)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "4px",
                border: realisticOnly ? "1px solid var(--cds-green-primary)" : "1px solid var(--cds-border)",
                background: realisticOnly ? "#DEFBE6" : "var(--cds-surface)",
                color: realisticOnly ? "var(--cds-green-primary)" : "var(--cds-text-secondary)",
                fontWeight: "600",
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Filter size={14} />
              <span>{realisticOnly ? "Realistic Targets Only: ON" : "All Targets (Show Refusals)"}</span>
            </button>
          </div>

          {/* Target Cards Grid */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--cds-text-secondary)" }}>
              Scanning scout database across all 4 divisions...
            </div>
          ) : filteredMarket.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--cds-text-secondary)" }}>
              No transfer targets found matching current filters. Try toggling &quot;Realistic Targets Only&quot; or changing division.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {filteredMarket.map((player) => {
                const canAfford = budget >= player.transferValue;
                const isOwned = allSquad.some((p) => p.name === player.name);
                const isUnrealistic = player.negotiationFeasibility === "unrealistic";
                const isDoubtful = player.negotiationFeasibility === "doubtful";

                return (
                  <div
                    key={player.id}
                    className="carbon-card"
                    style={{
                      padding: "16px",
                      borderRadius: "4px",
                      border: isUnrealistic
                        ? "1px solid #FFD8D8"
                        : isDoubtful
                        ? "1px solid #FFE4A0"
                        : "1px solid var(--cds-border)",
                      background: isUnrealistic
                        ? "#FFFBFB"
                        : isDoubtful
                        ? "#FFFDF5"
                        : "var(--cds-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <PlayerAvatar name={player.name} size="sm" teamColor="#0F6B45" traitIcon={player.personalityIcon} />
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--cds-text-primary)" }}>{player.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--cds-text-secondary)", marginTop: "1px" }}>
                            {player.club} {player.isFreeAgent && <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>• Free Agent</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "2px",
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            background: "#EDF5FF",
                            color: "#0043CE",
                            border: "1px solid #D0E2FF",
                          }}
                        >
                          {player.role}
                        </span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "2px",
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            background: "#FEF7E0",
                            color: "#8E6A00",
                            border: "1px solid #F1C21B",
                          }}
                        >
                          T{player.tier}
                        </span>
                      </div>
                    </div>

                    {/* Personality & Potential */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                      <span
                        title={player.personalityDescription}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          background: "#F8F0FE",
                          color: "#6929C4",
                          border: "1px solid #E8DAFF",
                          fontWeight: "600",
                        }}
                      >
                        <span>{player.personalityIcon || "🛡️"}</span>
                        <span>{player.personalityTrait || "Methodical"}</span>
                      </span>

                      <span style={{ color: "var(--cds-text-secondary)", fontWeight: "500" }}>
                        ⭐ <strong style={{ color: "var(--cds-text-primary)" }}>{player.rating?.toFixed(1) || "5.8"}</strong> ➔ <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>{player.potentialRating?.toFixed(1) || "8.0"} Pot</span>
                      </span>
                    </div>

                    {/* Negotiation Feasibility Badge */}
                    <div
                      style={{
                        padding: "6px 8px",
                        borderRadius: "2px",
                        fontSize: "0.72rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isUnrealistic ? "#FFF1F0" : isDoubtful ? "#FEF7E0" : "#DEFBE6",
                        color: isUnrealistic ? "#DA1E28" : isDoubtful ? "#8E6A00" : "#0F6B45",
                        border: `1px solid ${isUnrealistic ? "#FFD8D8" : isDoubtful ? "#F1C21B" : "#A7F0BA"}`,
                        fontWeight: "600",
                      }}
                    >
                      {isUnrealistic ? <XCircle size={14} /> : isDoubtful ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {player.negotiationReason || "Ready for contract negotiations"}
                      </span>
                    </div>

                    {/* Price, Wages & Buy Button */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border)", paddingTop: "10px", marginTop: "auto" }}>
                      <div>
                        <div style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                          £{player.transferValue}M
                        </div>
                        {player.weeklyWage && (
                          <div style={{ fontSize: "0.7rem", color: "var(--cds-text-secondary)" }}>
                            £{player.weeklyWage}k/wk wages
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setScoutedPlayer(player)}
                          title="View Scout Report"
                          style={{
                            padding: "6px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--cds-border)",
                            background: "var(--cds-layer)",
                            color: "var(--cds-text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleBuyPlayer(player)}
                          disabled={!canAfford || isOwned || isUnrealistic}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: isUnrealistic
                              ? "1px solid #FFD8D8"
                              : !canAfford
                              ? "1px solid #F1C21B"
                              : "none",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            cursor: canAfford && !isOwned && !isUnrealistic ? "pointer" : "not-allowed",
                            background: isOwned
                              ? "var(--cds-layer)"
                              : isUnrealistic
                              ? "#FFF1F0"
                              : canAfford
                              ? "var(--cds-green-primary)"
                              : "#FEF7E0",
                            color: isOwned
                              ? "var(--cds-text-secondary)"
                              : isUnrealistic
                              ? "#DA1E28"
                              : canAfford
                              ? "#FFFFFF"
                              : "#8E6A00",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isOwned ? "Owned" : isUnrealistic ? "Refuses" : canAfford ? "Sign ✍️" : "Over Budget"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SQUAD & SELL */}
      {activeTab === "squad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "0.82rem",
              color: "#0043CE",
              background: "#EDF5FF",
              border: "1px solid #D0E2FF",
              padding: "10px 14px",
              borderRadius: "4px",
            }}
          >
            💡 <strong>14-Player Squad Rule:</strong> Selling an established player adds cash to your transfer budget. A promising <strong>Youth Academy Prospect</strong> (£0.1M) will be promoted into their spot so your squad stays ready for matchday.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "12px" }}>
            {allSquad.map((player, idx) => {
              const isBench = idx >= 11;
              return (
                <div
                  key={`${player.name}_${idx}`}
                  className="carbon-card"
                  style={{
                    padding: "14px",
                    borderRadius: "4px",
                    border: "1px solid var(--cds-border)",
                    background: "var(--cds-surface)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <PlayerAvatar name={player.name} size="xs" teamColor="#0F6B45" traitIcon={player.personalityIcon} />
                      <span style={{ fontWeight: "700", color: "var(--cds-green-primary)", fontSize: "0.85rem" }}>
                        #{player.number || idx + 1}
                      </span>
                      <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--cds-text-primary)" }}>
                        {player.name}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "2px",
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        background: isBench ? "#FEF7E0" : "#DEFBE6",
                        color: isBench ? "#8E6A00" : "#0F6B45",
                        border: `1px solid ${isBench ? "#F1C21B" : "#A7F0BA"}`,
                      }}
                    >
                      {isBench ? "BENCH SUB" : player.role}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                    <span style={{ color: "#6929C4", fontWeight: "600" }}>
                      {player.personalityIcon || "🛡️"} {player.personalityTrait || "Methodical"}
                    </span>
                    <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>
                      ⭐ {player.rating?.toFixed(1) || "5.7"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border)", paddingTop: "8px", marginTop: "4px" }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "var(--cds-text-secondary)", textTransform: "uppercase" }}>Current Value</div>
                      <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                        £{player.transferValue || 0.3}M
                      </div>
                    </div>

                    <button
                      onClick={() => handleSellPlayer(player)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: "1px solid #FF8389",
                        background: "#FFF1F0",
                        color: "#DA1E28",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Sell (+£{player.transferValue || 0.3}M)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCOUTING MODAL (IBM Carbon Light Modal) */}
      {scoutedPlayer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(22, 22, 22, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: "16px",
          }}
        >
          <div
            className="carbon-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--cds-surface)",
              border: "1px solid var(--cds-border)",
              borderRadius: "4px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <PlayerAvatar name={scoutedPlayer.name} size="lg" teamColor="#0F6B45" showFlag={true} traitIcon={scoutedPlayer.personalityIcon} />
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--cds-text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>
                    Chief Scout Dossier
                  </span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", fontWeight: "700", color: "var(--cds-text-primary)" }}>
                    {scoutedPlayer.name}
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "var(--cds-text-secondary)" }}>
                    {scoutedPlayer.role} • {scoutedPlayer.club} (Tier {scoutedPlayer.tier})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setScoutedPlayer(null)}
                style={{ background: "transparent", border: "none", color: "var(--cds-text-secondary)", cursor: "pointer", fontSize: "1.2rem", fontWeight: "600" }}
              >
                ✕
              </button>
            </div>

            {/* Trait Deep-Dive */}
            <div style={{ background: "#F8F0FE", borderRadius: "4px", padding: "12px", border: "1px solid #E8DAFF" }}>
              <div style={{ fontSize: "0.75rem", color: "#6929C4", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{scoutedPlayer.personalityIcon || "🛡️"}</span>
                <span>Personality Profile: {scoutedPlayer.personalityTrait}</span>
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", color: "var(--cds-text-primary)", lineHeight: 1.4 }}>
                {scoutedPlayer.personalityDescription || "Disciplined and focused on tactical execution."}
              </p>
            </div>

            {/* Scout Verdict */}
            <div style={{ background: "#EDF5FF", borderRadius: "4px", padding: "12px", border: "1px solid #D0E2FF" }}>
              <div style={{ fontSize: "0.75rem", color: "#0043CE", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Info size={14} />
                <span>Scout Verdict & Feasibility</span>
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", color: "var(--cds-text-primary)", lineHeight: 1.4 }}>
                {scoutedPlayer.scoutReport || "Standout performer ready for regular matchday minutes."}
              </p>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  color: scoutedPlayer.negotiationFeasibility === "unrealistic" ? "#DA1E28" : "#0F6B45",
                  fontWeight: "700",
                }}
              >
                Status: {scoutedPlayer.negotiationReason}
              </div>
            </div>

            {/* Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--cds-border)", paddingTop: "14px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--cds-green-primary)" }}>
                £{scoutedPlayer.transferValue}M
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setScoutedPlayer(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid var(--cds-border)",
                    background: "var(--cds-surface)",
                    color: "var(--cds-text-primary)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => handleBuyPlayer(scoutedPlayer)}
                  disabled={budget < scoutedPlayer.transferValue || scoutedPlayer.negotiationFeasibility === "unrealistic"}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "4px",
                    border: "none",
                    background: scoutedPlayer.negotiationFeasibility === "unrealistic" ? "#FFF1F0" : "var(--cds-green-primary)",
                    color: scoutedPlayer.negotiationFeasibility === "unrealistic" ? "#DA1E28" : "#FFFFFF",
                    fontWeight: "700",
                    cursor: scoutedPlayer.negotiationFeasibility === "unrealistic" ? "not-allowed" : "pointer",
                  }}
                >
                  {scoutedPlayer.negotiationFeasibility === "unrealistic" ? "Cannot Negotiate" : "Sign Player ✍️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
