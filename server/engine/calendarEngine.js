// server/engine/calendarEngine.js
// Championship Manager style Season Calendar and Day-by-Day Progression Engine

let currentDate = new Date(2025, 7, 9); // Saturday, 9 Aug 2025
let currentGameweek = 1;
let activeTier = "tier_4"; // Starts in lowest tier: National League

// Day schedule templates based on day of week:
// 0: Sun (Rest), 1: Mon (Tactical Training), 2: Tue (Technical Drills), 3: Wed (Rest/Recovery),
// 4: Thu (Match Prep Training), 5: Fri (Pre-Match Set Pieces), 6: Sat (Matchday)
const WEEKDAY_SCHEDULE = {
  0: { type: "rest", name: "Rest & Recovery Day", desc: "Full squad rest. Stamina restores +25%, fatigue drops." },
  1: { type: "tactical_training", name: "Tactical Coaching & Prompting", desc: "Manager tactical instruction drills. Boosts Tactical Mastery +2%." },
  2: { type: "technical_training", name: "Technical Ball Work & Sharpness", desc: "One-touch passing, crossing & finishing drills. Boosts sharpness." },
  3: { type: "rest", name: "Light Recovery Day", desc: "Stretching, physiotherapy & video analysis. Stamina restores +15%." },
  4: { type: "tactical_training", name: "Opponent Shape & Transition Drills", desc: "Drills tailored to disrupt next opponent's tactical formation." },
  5: { type: "technical_training", name: "Pre-Match Set-Piece Drills", desc: "Corner kick routines, free-kicks, and defensive wall positioning." },
  6: { type: "match", name: "League Matchday", desc: "Championship League Fixture. All focus on 3 points!" },
};

let lastTrainingLog = {
  date: "Friday, 8 Aug 2025",
  type: "tactical_training",
  prompt: "High-intensity Gegenpress conditioning and swift transition passing.",
  result: "Squad completed drills with high focus (+2% Tactical Mastery).",
};

export function getCurrentCalendarState() {
  const dayOfWeek = currentDate.getDay();
  const scheduleDef = WEEKDAY_SCHEDULE[dayOfWeek];
  const isMatchday = scheduleDef.type === "match";

  const dateFormatted = currentDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    date: dateFormatted,
    isoDate: currentDate.toISOString().split("T")[0],
    dayOfWeek,
    dayName: scheduleDef.name,
    activityType: scheduleDef.type,
    activityDesc: scheduleDef.desc,
    isMatchday,
    currentGameweek,
    activeTier,
    lastTrainingLog,
  };
}

export function advanceCalendarDay(managerPrompt = "", squadPlayers = []) {
  const dayOfWeek = currentDate.getDay();
  const scheduleDef = WEEKDAY_SCHEDULE[dayOfWeek];

  // Process today's activities on squad before advancing
  const results = {
    previousDate: currentDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }),
    activityType: scheduleDef.type,
    staminaChange: 0,
    masteryChange: 0,
    feedback: "",
  };

  if (scheduleDef.type === "tactical_training" || scheduleDef.type === "technical_training") {
    const promptText = managerPrompt.trim() || "Work on passing speed, spatial awareness and pressing cohesion.";
    const isTactical = scheduleDef.type === "tactical_training";
    const masteryBoost = isTactical ? (managerPrompt.length > 20 ? 3 : 1) : 1;

    results.staminaChange = -6;
    results.masteryChange = masteryBoost;
    results.feedback = `Squad drilled manager directive: "${promptText.slice(0, 50)}...". Tactical Mastery gained (+${masteryBoost}%).`;

    lastTrainingLog = {
      date: results.previousDate,
      type: scheduleDef.type,
      prompt: promptText,
      result: results.feedback,
    };

    // Apply to squad array in place if provided
    squadPlayers.forEach((p) => {
      p.stamina = Math.max(35, (p.stamina || 100) - 6);
      p.matchSharpness = Math.min(100, (p.matchSharpness || 75) + 4);
      p.tacticalMastery = Math.min(100, (p.tacticalMastery || 50) + masteryBoost);
    });
  } else if (scheduleDef.type === "rest") {
    results.staminaChange = 25;
    results.feedback = "Full rest day granted. Squad recharged physical condition (+25% Stamina).";

    lastTrainingLog = {
      date: results.previousDate,
      type: "rest",
      prompt: "Rest & Recovery",
      result: results.feedback,
    };

    squadPlayers.forEach((p) => {
      p.stamina = Math.min(100, (p.stamina || 70) + 25);
    });
  }

  // Advance by 1 calendar day
  currentDate.setDate(currentDate.getDate() + 1);

  const newDayOfWeek = currentDate.getDay();
  const newSchedule = WEEKDAY_SCHEDULE[newDayOfWeek];

  return {
    ...getCurrentCalendarState(),
    dayResults: results,
  };
}

export function advanceToNextMatchday(managerPrompt = "", squadPlayers = []) {
  const dayLogs = [];
  let loops = 0;

  // Advance day by day until reaching Saturday matchday (max 7 days to prevent infinite loop)
  while (!getCurrentCalendarState().isMatchday && loops < 8) {
    const res = advanceCalendarDay(managerPrompt, squadPlayers);
    dayLogs.push(res.dayResults);
    loops++;
  }

  return {
    ...getCurrentCalendarState(),
    advancementLogs: dayLogs,
  };
}

export function incrementGameweek() {
  currentGameweek = Math.min(38, currentGameweek + 1);
  return currentGameweek;
}

export function setCalendarActiveTier(tierKey) {
  activeTier = tierKey;
}

export function getUpcomingSchedule() {
  const schedule = [];
  const tempDate = new Date(currentDate);

  for (let i = 0; i < 14; i++) {
    const dayOfWeek = tempDate.getDay();
    const scheduleDef = WEEKDAY_SCHEDULE[dayOfWeek];
    schedule.push({
      dateStr: tempDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      dayOfWeek,
      type: scheduleDef.type,
      name: scheduleDef.name,
      isMatchday: scheduleDef.type === "match",
      isToday: i === 0,
    });
    tempDate.setDate(tempDate.getDate() + 1);
  }

  return schedule;
}
