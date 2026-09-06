// server/engine/cmDatabase.js
// Provides authentic Championship Manager 4-tier league pyramid, clubs, and player database
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/cm2025Database.json");

let cmData = {
  version: "2025.4-tiers",
  tiers: {},
  clubs: [],
  marketListings: [],
  totalPlayersInPool: 0,
};

try {
  if (fs.existsSync(dbPath)) {
    cmData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  }
} catch (err) {
  console.warn("Could not load cm2025Database.json, using fallback:", err.message);
}

export function getTiersInfo() {
  return (
    cmData.tiers || {
      tier_1: { id: "tier_1", name: "Premier Championship" },
      tier_2: { id: "tier_2", name: "Division One" },
      tier_3: { id: "tier_3", name: "Division Two" },
      tier_4: { id: "tier_4", name: "National League" },
    }
  );
}

export function getAllCmClubs(tierKey = null) {
  if (!tierKey) return cmData.clubs || [];
  return (cmData.clubs || []).filter((c) => c.tier === tierKey);
}

export function getClubsByTier(tierKey) {
  return (cmData.clubs || []).filter((c) => c.tier === tierKey);
}

/**
 * Calculates negotiation feasibility based on manager club tier and target tier.
 */
export function calculateNegotiationFeasibility(target, userTier = "tier_4") {
  if (target.isFreeAgent) {
    return {
      feasibility: "interested",
      reason: "Free Agent: Eager for contract negotiations and first-team football.",
    };
  }

  const targetTierNum = target.tier || (target.tierKey === "tier_1" ? 1 : target.tierKey === "tier_2" ? 2 : target.tierKey === "tier_3" ? 3 : 4);
  const userTierNum = userTier === "tier_1" ? 1 : userTier === "tier_2" ? 2 : userTier === "tier_3" ? 3 : 4;

  const tierGap = userTierNum - targetTierNum; // e.g. Tier 4 user vs Tier 1 target = 4 - 1 = +3

  if (tierGap >= 2) {
    return {
      feasibility: "unrealistic",
      reason: `Refuses talks: Player considers ${userTier === "tier_4" ? "National League" : "lower leagues"} below their professional standard.`,
    };
  } else if (tierGap === 1) {
    return {
      feasibility: "doubtful",
      reason: "Hesitant: Demands maximum wage packet and significant promotion bonus clauses.",
    };
  } else if (tierGap === 0) {
    return {
      feasibility: "interested",
      reason: "Interested: Ready to negotiate standard league wage and bonus incentives.",
    };
  } else {
    // Target is lower tier than user club
    return {
      feasibility: "interested",
      reason: "Eager to sign: Enthusiastic about moving up to a higher division!",
    };
  }
}

export function getTransferMarketListings(tierKey = null, userTier = "tier_4") {
  let listings = cmData.marketListings || [];
  if (tierKey) {
    const tierNum = tierKey === "tier_1" ? 1 : tierKey === "tier_2" ? 2 : tierKey === "tier_3" ? 3 : 4;
    listings = listings.filter((p) => p.tier === tierNum || p.tierKey === tierKey);
  }

  return listings.map((p) => {
    const neg = calculateNegotiationFeasibility(p, userTier);
    return {
      ...p,
      negotiationFeasibility: neg.feasibility,
      negotiationReason: neg.reason,
    };
  });
}

export function getFilteredTransferTargets(userTier = "tier_4", filters = {}) {
  const { tier, role, realisticOnly, search, freeAgentsOnly } = filters;
  let list = getTransferMarketListings(tier === "ALL" ? null : tier, userTier);

  if (freeAgentsOnly) {
    list = list.filter((p) => p.isFreeAgent);
  }

  if (realisticOnly) {
    list = list.filter((p) => p.negotiationFeasibility === "interested");
  }

  if (role && role !== "ALL") {
    if (role === "DEF") list = list.filter((p) => ["CB", "LB", "RB", "DEF"].includes(p.role));
    else if (role === "MID") list = list.filter((p) => ["CDM", "CM", "CAM", "MID"].includes(p.role));
    else if (role === "FWD") list = list.filter((p) => ["ST", "LW", "RW", "FWD"].includes(p.role));
    else list = list.filter((p) => p.role === role);
  }

  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(s) || (p.club && p.club.toLowerCase().includes(s)));
  }

  return list;
}


export function getRealClubRoster(clubNameOrId) {
  if (!clubNameOrId) return null;
  const search = clubNameOrId.toLowerCase().trim();
  const match = (cmData.clubs || []).find(
    (c) =>
      c.id === search ||
      c.name.toLowerCase() === search ||
      (c.shortName && c.shortName.toLowerCase() === search) ||
      c.name.toLowerCase().includes(search)
  );
  return match ? JSON.parse(JSON.stringify(match)) : null;
}

export function getCmPlayerByName(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const c of cmData.clubs || []) {
    const p = c.starting11.find((x) => x.name.toLowerCase() === lower);
    if (p) return p;
    const b = c.benchSubs.find((x) => x.name.toLowerCase() === lower);
    if (b) return b;
  }
  for (const m of cmData.marketListings || []) {
    if (m.name.toLowerCase() === lower) return m;
  }
  return null;
}

export function getRandomCmPlayer() {
  const clubs = cmData.clubs || [];
  if (clubs.length === 0) return null;
  const club = clubs[Math.floor(Math.random() * clubs.length)];
  const pool = [...(club.starting11 || []), ...(club.benchSubs || [])];
  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
}

/**
 * Generates a balanced 14-man draft squad for the grassroots starting league (Tier 4)
 */
export function getRandomDraftSquad(clubName = "Grassroots United FC", tierKey = "tier_4") {
  const tierClubs = getClubsByTier(tierKey);
  const sampleClub = tierClubs.length > 0 ? tierClubs[Math.floor(Math.random() * tierClubs.length)] : null;

  if (sampleClub && sampleClub.starting11 && sampleClub.starting11.length >= 11) {
    const starting11 = sampleClub.starting11.map((p, idx) => ({
      ...p,
      number: idx + 1,
      tacticalMastery: 50,
      growthPoints: 0,
      matchSharpness: 80,
    }));
    const benchSubs = sampleClub.benchSubs.map((p, idx) => ({
      ...p,
      number: 12 + idx,
      tacticalMastery: 48,
      growthPoints: 0,
      matchSharpness: 75,
    }));
    const totalValue = +(starting11.reduce((sum, p) => sum + p.transferValue, 0) + benchSubs.reduce((sum, p) => sum + p.transferValue, 0)).toFixed(2);

    return {
      id: clubName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: clubName,
      shortName: clubName.slice(0, 3).toUpperCase(),
      color: "#00E5FF",
      secondaryColor: "#0A192F",
      tier: tierKey,
      tierName: "National League",
      transferBudget: 1.5,
      totalSquadValue: totalValue,
      squadHarmony: 75,
      formation: "4-3-3",
      starting11,
      benchSubs,
    };
  }

  // Fallback programmatic generation with rich personality traits
  const defaultStarters = [
    { number: 1, name: "Liam Cooper", role: "GK", rating: 5.6, potentialRating: 7.8, transferValue: 0.25, tacticalMastery: 50, personalityTrait: "Methodical", personalityIcon: "🛡️" },
    { number: 2, name: "Jack Walker", role: "RB", rating: 5.5, potentialRating: 7.5, transferValue: 0.2, tacticalMastery: 50, personalityTrait: "Tenacious", personalityIcon: "⚙️" },
    { number: 3, name: "Harry Davies", role: "CB", rating: 5.8, potentialRating: 8.0, transferValue: 0.35, tacticalMastery: 52, personalityTrait: "Aggressive", personalityIcon: "🔥" },
    { number: 4, name: "Ethan Wright", role: "CB", rating: 5.7, potentialRating: 7.7, transferValue: 0.3, tacticalMastery: 50, personalityTrait: "Leader", personalityIcon: "👑" },
    { number: 5, name: "Charlie Wilson", role: "LB", rating: 5.4, potentialRating: 7.4, transferValue: 0.18, tacticalMastery: 48, personalityTrait: "Methodical", personalityIcon: "🛡️" },
    { number: 6, name: "George Evans", role: "CDM", rating: 5.7, potentialRating: 8.2, transferValue: 0.32, tacticalMastery: 52, personalityTrait: "Tenacious", personalityIcon: "⚙️" },
    { number: 7, name: "Noah Roberts", role: "RW", rating: 5.9, potentialRating: 8.5, transferValue: 0.45, tacticalMastery: 54, personalityTrait: "Flair", personalityIcon: "⚡" },
    { number: 8, name: "Archie Hughes", role: "CAM", rating: 5.8, potentialRating: 8.6, transferValue: 0.4, tacticalMastery: 52, personalityTrait: "Creative", personalityIcon: "🧠" },
    { number: 9, name: "Mason Taylor", role: "ST", rating: 6.0, potentialRating: 8.8, transferValue: 0.55, tacticalMastery: 55, personalityTrait: "Aggressive", personalityIcon: "🔥" },
    { number: 10, name: "Freddie Smith", role: "CM", rating: 5.6, potentialRating: 7.9, transferValue: 0.28, tacticalMastery: 50, personalityTrait: "Creative", personalityIcon: "🧠" },
    { number: 11, name: "Arthur Jones", role: "LW", rating: 5.8, potentialRating: 8.4, transferValue: 0.38, tacticalMastery: 52, personalityTrait: "Flair", personalityIcon: "⚡" },
  ];

  const defaultSubs = [
    { number: 12, name: "Oscar Turner (Sub)", role: "ST", rating: 5.4, potentialRating: 7.6, transferValue: 0.18, tacticalMastery: 46, personalityTrait: "Sensitive", personalityIcon: "🎭" },
    { number: 13, name: "Alfie Scott (Sub)", role: "CAM", rating: 5.3, potentialRating: 7.5, transferValue: 0.15, tacticalMastery: 45, personalityTrait: "Creative", personalityIcon: "🧠" },
    { number: 14, name: "Theo Clark (Sub)", role: "CDM", rating: 5.2, potentialRating: 7.2, transferValue: 0.12, tacticalMastery: 44, personalityTrait: "Methodical", personalityIcon: "🛡️" },
  ];

  return {
    id: clubName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: clubName,
    shortName: clubName.slice(0, 3).toUpperCase(),
    color: "#00E5FF",
    secondaryColor: "#0A192F",
    tier: "tier_4",
    tierName: "National League",
    transferBudget: 1.5,
    totalSquadValue: 3.96,
    squadHarmony: 75,
    formation: "4-3-3",
    starting11: defaultStarters,
    benchSubs: defaultSubs,
  };
}

/**
 * Promotes a Youth Academy player to backfill a sold squad player
 */
export function generateYouthPlayer(role = "CM", number = 14, tierKey = "tier_4") {
  const YOUTH_FIRST_NAMES = ["Oliver", "Leo", "Lucas", "Noah", "Ethan", "Mateo", "Felix", "Theo", "Sam", "Charlie"];
  const YOUTH_LAST_NAMES = ["Smith", "Jones", "Williams", "Taylor", "Davies", "Evans", "Thomas", "Johnson", "Walker", "Wright"];

  const fName = YOUTH_FIRST_NAMES[Math.floor(Math.random() * YOUTH_FIRST_NAMES.length)];
  const lName = YOUTH_LAST_NAMES[Math.floor(Math.random() * YOUTH_LAST_NAMES.length)];
  const name = `${fName} ${lName} (Youth)`;

  const baseVal = tierKey === "tier_1" ? 3.0 : tierKey === "tier_2" ? 1.2 : tierKey === "tier_3" ? 0.4 : 0.08;
  const baseRating = tierKey === "tier_1" ? 7.2 : tierKey === "tier_2" ? 6.4 : tierKey === "tier_3" ? 5.8 : 5.0;

  const traits = ["Creative", "Methodical", "Flair", "Aggressive", "Leader", "Sensitive", "Tenacious"];
  const selectedTrait = traits[Math.floor(Math.random() * traits.length)];
  const icons = { Creative: "🧠", Methodical: "🛡️", Flair: "⚡", Aggressive: "🔥", Leader: "👑", Sensitive: "🎭", Tenacious: "⚙️" };

  return {
    number,
    name,
    role,
    isYouth: true,
    rating: baseRating,
    potentialRating: +(baseRating + 2.5).toFixed(1),
    tier: tierKey === "tier_1" ? 1 : tierKey === "tier_2" ? 2 : tierKey === "tier_3" ? 3 : 4,
    transferValue: baseVal,
    tacticalMastery: 45,
    personalityTrait: selectedTrait,
    personalityIcon: icons[selectedTrait] || "⚽",
    matchSharpness: 70,
    growthPoints: 0,
  };
}

/**
 * Prompt-Driven Superstar Evolution Engine:
 * Evaluates how manager coaching prompts and match performance trigger attribute leaps.
 */
export function evaluatePlayerEvolution(player, promptQuality = "high", matchRating = 7.0, managerPrompt = "") {
  if (!player) return { evolved: false, player };

  const currentRating = player.rating || 5.8;
  const potential = player.potentialRating || 8.2;
  const maxPossibleGain = Math.max(0, potential - currentRating);

  let pointsEarned = 1;
  if (matchRating >= 7.5) pointsEarned += 2;
  if (matchRating >= 8.5) pointsEarned += 3;
  if (promptQuality === "high") pointsEarned += 2;

  // Trait resonance calculation
  let traitResonance = 70;
  const pMsg = (managerPrompt || "").toLowerCase();
  const trait = (player.personalityTrait || "Methodical").toLowerCase();
  if (trait.includes("creative") && (pMsg.includes("pass") || pMsg.includes("create") || pMsg.includes("freedom") || pMsg.includes("express"))) {
    traitResonance = 95;
    pointsEarned += 2;
  } else if (trait.includes("methodical") && (pMsg.includes("shape") || pMsg.includes("discipline") || pMsg.includes("compact") || pMsg.includes("defend"))) {
    traitResonance = 95;
    pointsEarned += 2;
  } else if (trait.includes("flair") && (pMsg.includes("dribble") || pMsg.includes("attack") || pMsg.includes("shoot") || pMsg.includes("skill"))) {
    traitResonance = 95;
    pointsEarned += 2;
  } else if (trait.includes("aggressive") && (pMsg.includes("press") || pMsg.includes("hunt") || pMsg.includes("tackle") || pMsg.includes("close"))) {
    traitResonance = 95;
    pointsEarned += 2;
  } else if (trait.includes("leader")) {
    traitResonance = 90;
    pointsEarned += 1;
  } else if (trait.includes("tenacious") && (pMsg.includes("run") || pMsg.includes("work") || pMsg.includes("relentless"))) {
    traitResonance = 95;
    pointsEarned += 2;
  } else if (trait.includes("sensitive")) {
    if (pMsg.includes("wake up") || pMsg.includes("poor") || pMsg.includes("shame")) {
      traitResonance = 45;
      pointsEarned = Math.max(0, pointsEarned - 1);
    } else {
      traitResonance = 85;
      pointsEarned += 1;
    }
  }

  player.growthPoints = (player.growthPoints || 0) + pointsEarned;
  player.tacticalMastery = Math.min(100, (player.tacticalMastery || 50) + (promptQuality === "high" ? 2 : 1));

  let evolved = false;
  let ratingBoost = 0;

  // Rating breakthrough threshold
  if (player.growthPoints >= 10 && maxPossibleGain > 0) {
    player.growthPoints = 0;
    ratingBoost = +(Math.min(0.3, maxPossibleGain * 0.35)).toFixed(1);
    player.rating = +(player.rating + ratingBoost).toFixed(1);
    // Value scales with rating
    player.transferValue = +(player.transferValue * (1 + ratingBoost * 1.8)).toFixed(2);
    evolved = true;
  }

  // Superstar badges
  if (player.rating >= 8.5) {
    player.statusBadge = "💎 SUPERSTAR";
  } else if (player.rating >= 7.5) {
    player.statusBadge = "🌟 PRODIGY";
  }

  return {
    evolved,
    ratingBoost,
    traitResonance,
    player,
  };
}


export function calculateSquadHarmony(squad = []) {
  if (!squad || squad.length === 0) return 80;
  const avgMastery = squad.reduce((sum, p) => sum + (p.tacticalMastery || 70), 0) / squad.length;
  return Math.round(Math.min(99, Math.max(50, avgMastery * 0.9 + 10)));
}

export function updatePlayerValuationAfterMatch(player, matchRating = 6.0) {
  const diff = matchRating - 6.0;
  const pctChange = diff * 0.04;
  const newVal = Math.max(0.05, (player.transferValue || 0.2) * (1 + pctChange));
  return +newVal.toFixed(2);
}
