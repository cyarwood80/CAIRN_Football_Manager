// server/engine/promotionEngine.js
// Evaluates season standings, executes promotions and relegations across the 4 tiers

const PROMOTION_REWARDS = {
  tier_4: { nextTier: "tier_3", rewardMillions: 6.0, title: "Promoted to Division Two!" },
  tier_3: { nextTier: "tier_2", rewardMillions: 18.0, title: "Promoted to Division One!" },
  tier_2: { nextTier: "tier_1", rewardMillions: 50.0, title: "Promoted to Premier Championship!" },
};

const RELEGATION_PENALTIES = {
  tier_1: { prevTier: "tier_2", penaltyPct: 0.35, title: "Relegated to Division One" },
  tier_2: { prevTier: "tier_3", penaltyPct: 0.35, title: "Relegated to Division Two" },
  tier_3: { prevTier: "tier_4", penaltyPct: 0.35, title: "Relegated to National League" },
};

/**
 * Concludes a season for a tier and evaluates promotion / relegation / championship
 */
export function evaluateSeasonConclusion(standings, currentTier = "tier_4", userTeamId = "wrexham") {
  // Sort standings by points, GD, GF
  const sorted = [...standings].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  const champions = sorted[0];
  const promotedTeams = sorted.slice(0, 3);
  const relegatedTeams = sorted.slice(sorted.length - 3);

  const isUserPromoted = promotedTeams.some((t) => t.id === userTeamId);
  const isUserRelegated = relegatedTeams.some((t) => t.id === userTeamId);
  const isUserChampion = champions.id === userTeamId;

  let outcome = {
    isUserPromoted,
    isUserRelegated,
    isUserChampion,
    currentTier,
    nextTier: currentTier,
    financialBonus: 0,
    fanSentimentImpact: 0,
    boardMemo: "",
    title: "Season Completed",
  };

  if (isUserChampion && currentTier === "tier_1") {
    outcome.title = "🏆 CHAMPIONS OF THE WORLD! 🏆";
    outcome.financialBonus = 75.0;
    outcome.fanSentimentImpact = 100;
    outcome.boardMemo = "HISTORIC TRIUMPH! The Chairperson and Board are in tears of joy. You have won the Premier Championship!";
  } else if (isUserPromoted) {
    const promoSpec = PROMOTION_REWARDS[currentTier];
    if (promoSpec) {
      outcome.nextTier = promoSpec.nextTier;
      outcome.financialBonus = promoSpec.rewardMillions;
      outcome.fanSentimentImpact = 95;
      outcome.title = `🎉 ${promoSpec.title}`;
      outcome.boardMemo = `Magnificent achievement! The Board awards £${promoSpec.rewardMillions}M in promotion funding for squad reinforcements.`;
    }
  } else if (isUserRelegated) {
    const relSpec = RELEGATION_PENALTIES[currentTier];
    if (relSpec) {
      outcome.nextTier = relSpec.prevTier;
      outcome.fanSentimentImpact = 15;
      outcome.title = `⚠️ ${relSpec.title}`;
      outcome.boardMemo = `Crisis meeting called. The Board is furious with relegation. Budget is reduced and expectations are severe.`;
    }
  } else {
    outcome.title = "Season Concluded - Mid-table Finish";
    outcome.fanSentimentImpact = 60;
    outcome.boardMemo = "The Board appreciates stability this season. We expect to mount a serious promotion challenge next year.";
  }

  return {
    standings: sorted,
    champions,
    promotedTeams,
    relegatedTeams,
    userOutcome: outcome,
  };
}
