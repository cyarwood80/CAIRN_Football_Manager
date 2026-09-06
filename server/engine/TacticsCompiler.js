// TacticsCompiler.js
// Translates plain-English coaching prompts and tactical presets into numeric behavioral weights
import { getRealClubRoster, getRandomCmPlayer } from "./cmDatabase.js";

export const DEFAULT_TACTICAL_PROFILES = {
  TIKI_TAKA: {
    id: "TIKI_TAKA",
    name: "Manchester City",
    prompt: "High possession, short crisp passing triangles, patient build-up, medium-high pressing to recover possession instantly.",
    formation: "4-3-3", // 11v11: 1 GK, 4 DEF, 3 MID, 3 FWD
    pressAggression: 0.8,
    defensiveLine: 0.65,
    passDirectness: 0.2, // short passes
    dribbleFrequency: 0.25,
    shotGreed: 0.4, // prefers creating clear chances
    counterAttack: 0.3,
    wingPlayBias: 0.5,
    color: "#6CABDD",
    secondaryColor: "#1C2C5B",
  },
  GEGENPRESS: {
    id: "GEGENPRESS",
    name: "Liverpool",
    prompt: "Suffocate opponent in their half with relentless pressing, blitz counter-attacks, direct vertical passing into the box.",
    formation: "4-3-3", // 11v11: 1 GK, 4 DEF, 3 MID, 3 FWD
    pressAggression: 0.95,
    defensiveLine: 0.8,
    passDirectness: 0.75,
    dribbleFrequency: 0.5,
    shotGreed: 0.75,
    counterAttack: 0.9,
    wingPlayBias: 0.6,
    color: "#C8102E",
    secondaryColor: "#00B2A9",
  },
  LOW_BLOCK: {
    id: "LOW_BLOCK",
    name: "Real Madrid",
    prompt: "Park the bus inside our own third, ruthless slide tackles, absorb pressure, lethal long-ball counter-attacks to lone striker.",
    formation: "5-3-2", // 11v11: 1 GK, 5 DEF, 3 MID, 2 FWD
    pressAggression: 0.35,
    defensiveLine: 0.25,
    passDirectness: 0.85,
    dribbleFrequency: 0.3,
    shotGreed: 0.8,
    counterAttack: 0.95,
    wingPlayBias: 0.3,
    color: "#FFFFFF",
    secondaryColor: "#FEBE10",
  },
  SAMBA_FLAIR: {
    id: "SAMBA_FLAIR",
    name: "Barcelona",
    prompt: "High tempo dribbling, trick moves, exploit 1v1 duels on the wings, shoot with venom from outside the box.",
    formation: "4-4-2", // 11v11: 1 GK, 4 DEF, 4 MID, 2 FWD
    pressAggression: 0.6,
    defensiveLine: 0.5,
    passDirectness: 0.45,
    dribbleFrequency: 0.85,
    shotGreed: 0.7,
    counterAttack: 0.6,
    wingPlayBias: 0.8,
    color: "#004D98",
    secondaryColor: "#A50044",
  }
};

export const SQUAD_11_ROLES = {
  "4-3-3": [
    { number: 1, roleKey: "gk", defaultRole: "GK", name: "Keeper" },
    { number: 2, roleKey: "rb", defaultRole: "RB", name: "Right Back" },
    { number: 3, roleKey: "cb_l", defaultRole: "CB", name: "Center Back L" },
    { number: 4, roleKey: "cb_r", defaultRole: "CB", name: "Center Back R" },
    { number: 5, roleKey: "lb", defaultRole: "LB", name: "Left Back" },
    { number: 6, roleKey: "cdm", defaultRole: "CDM", name: "Defensive Mid" },
    { number: 7, roleKey: "rw", defaultRole: "RW", name: "Right Winger" },
    { number: 8, roleKey: "cm_r", defaultRole: "CAM", name: "Playmaker CAM" },
    { number: 9, roleKey: "st", defaultRole: "ST", name: "Center Forward" },
    { number: 10, roleKey: "cm_l", defaultRole: "CM", name: "Box-to-Box CM" },
    { number: 11, roleKey: "lw", defaultRole: "LW", name: "Left Winger" },
  ],
  "4-4-2": [
    { number: 1, roleKey: "gk", defaultRole: "GK", name: "Keeper" },
    { number: 2, roleKey: "rb", defaultRole: "RB", name: "Right Back" },
    { number: 3, roleKey: "cb_l", defaultRole: "CB", name: "Center Back L" },
    { number: 4, roleKey: "cb_r", defaultRole: "CB", name: "Center Back R" },
    { number: 5, roleKey: "lb", defaultRole: "LB", name: "Left Back" },
    { number: 6, roleKey: "rm", defaultRole: "RM", name: "Right Mid" },
    { number: 7, roleKey: "cm_r", defaultRole: "CM", name: "Center Mid R" },
    { number: 8, roleKey: "cm_l", defaultRole: "CM", name: "Center Mid L" },
    { number: 9, roleKey: "st_r", defaultRole: "ST", name: "Striker R" },
    { number: 10, roleKey: "st_l", defaultRole: "ST", name: "Striker L" },
    { number: 11, roleKey: "lm", defaultRole: "LM", name: "Left Mid" },
  ],
  "3-5-2": [
    { number: 1, roleKey: "gk", defaultRole: "GK", name: "Keeper" },
    { number: 2, roleKey: "cb_r", defaultRole: "CB", name: "Center Back R" },
    { number: 3, roleKey: "cb_c", defaultRole: "CB", name: "Center Back C" },
    { number: 4, roleKey: "cb_l", defaultRole: "CB", name: "Center Back L" },
    { number: 5, roleKey: "rwb", defaultRole: "RWB", name: "Right Wingback" },
    { number: 6, roleKey: "cdm", defaultRole: "CDM", name: "Holding Mid" },
    { number: 7, roleKey: "cm_r", defaultRole: "CM", name: "Center Mid R" },
    { number: 8, roleKey: "cam", defaultRole: "CAM", name: "Playmaker CAM" },
    { number: 9, roleKey: "st_r", defaultRole: "ST", name: "Striker R" },
    { number: 10, roleKey: "st_l", defaultRole: "ST", name: "Striker L" },
    { number: 11, roleKey: "lwb", defaultRole: "LWB", name: "Left Wingback" },
  ],
  "5-3-2": [
    { number: 1, roleKey: "gk", defaultRole: "GK", name: "Keeper" },
    { number: 2, roleKey: "rwb", defaultRole: "RWB", name: "Right Wingback" },
    { number: 3, roleKey: "cb_r", defaultRole: "CB", name: "Center Back R" },
    { number: 4, roleKey: "cb_c", defaultRole: "CB", name: "Center Stopper" },
    { number: 5, roleKey: "cb_l", defaultRole: "CB", name: "Center Back L" },
    { number: 6, roleKey: "lwb", defaultRole: "LWB", name: "Left Wingback" },
    { number: 7, roleKey: "cdm", defaultRole: "CDM", name: "Anchor CDM" },
    { number: 8, roleKey: "cm_r", defaultRole: "CM", name: "Midfield Shuttler" },
    { number: 9, roleKey: "st_r", defaultRole: "ST", name: "Target Man" },
    { number: 10, roleKey: "st_l", defaultRole: "ST", name: "Counter Striker" },
    { number: 11, roleKey: "cm_l", defaultRole: "CM", name: "Ball Carrier" },
  ],
};

export function generateBenchSubstitutes(teamBase, clubRoster = null, userBench = null) {
  const benchList = (userBench && userBench.length > 0) ? userBench : (clubRoster?.benchSubs || []);
  return [
    {
      id: "sub_1",
      number: benchList[0]?.number || 12,
      name: benchList[0]?.name || getRandomCmPlayer("ST").name || "Impact Striker",
      role: benchList[0]?.role || "ST",
      roleKey: "st_sub",
      transferValue: benchList[0]?.transferValue || 6.0,
      tier: benchList[0]?.tier || 2,
      promptCapability: benchList[0]?.promptCapability || "Impact Sub",
      isYouth: !!benchList[0]?.isYouth,
      prompt: "Impact striker: fresh explosive pace, attack the box directly, shoot on sight.",
      stamina: 100,
      tactic: compilePlayerRole("fwd", "Impact striker: fresh pace, shoot on sight", teamBase, benchList[0]?.role || "ST"),
      used: false,
    },
    {
      id: "sub_2",
      number: benchList[1]?.number || 13,
      name: benchList[1]?.name || getRandomCmPlayer("CAM").name || "Playmaker CAM",
      role: benchList[1]?.role || "CAM",
      roleKey: "cam_sub",
      transferValue: benchList[1]?.transferValue || 7.0,
      tier: benchList[1]?.tier || 2,
      promptCapability: benchList[1]?.promptCapability || "Creative Sub",
      isYouth: !!benchList[1]?.isYouth,
      prompt: "Creative playmaker: unlock defenses with through balls, high vision and workrate.",
      stamina: 100,
      tactic: compilePlayerRole("mid2", "Creative playmaker: high vision, through balls", teamBase, benchList[1]?.role || "CAM"),
      used: false,
    },
    {
      id: "sub_3",
      number: benchList[2]?.number || 14,
      name: benchList[2]?.name || getRandomCmPlayer("CDM").name || "Iron Anchor",
      role: benchList[2]?.role || "CDM",
      roleKey: "cdm_sub",
      transferValue: benchList[2]?.transferValue || 5.5,
      tier: benchList[2]?.tier || 2,
      promptCapability: benchList[2]?.promptCapability || "Anchor Sub",
      isYouth: !!benchList[2]?.isYouth,
      prompt: "Defensive anchor: aggressive tackling, break up counters, protect the lead.",
      stamina: 100,
      tactic: compilePlayerRole("def", "Defensive anchor: aggressive tackling, shield backline", teamBase, benchList[2]?.role || "CDM"),
      used: false,
    },
  ];
}

/**
 * Compiles plain English prompts into tactical behavior modifiers
 */
export function compileTeamTactics(teamConfig = {}) {
  const prompt = (teamConfig.prompt || "").toLowerCase();
  const playerPrompts = teamConfig.playerPrompts || {};
  const teamName = teamConfig.name || "AI FC";

  // Check if team name matches an authentic Championship Manager 2025 club roster
  const realRoster = getRealClubRoster(teamName);

  // Base profile
  const base = {
    pressAggression: 0.6,
    defensiveLine: 0.5,
    passDirectness: 0.5,
    dribbleFrequency: 0.4,
    shotGreed: 0.5,
    counterAttack: 0.5,
    wingPlayBias: 0.5,
    tackleAggression: 0.5,
  };

  // Keyword rules for team prompt
  if (prompt.includes("gegenpress") || prompt.includes("heavy press") || prompt.includes("high press") || prompt.includes("suffocate")) {
    base.pressAggression = Math.min(1.0, base.pressAggression + 0.3);
    base.defensiveLine = Math.min(0.9, base.defensiveLine + 0.25);
  }
  if (prompt.includes("park the bus") || prompt.includes("low block") || prompt.includes("defensive") || prompt.includes("absorb")) {
    base.defensiveLine = 0.25;
    base.pressAggression = 0.3;
    base.counterAttack = 0.9;
  }
  if (prompt.includes("tiki") || prompt.includes("possession") || prompt.includes("patient") || prompt.includes("short pass")) {
    base.passDirectness = 0.2;
    base.shotGreed = 0.4;
    base.dribbleFrequency = 0.3;
  }
  if (prompt.includes("counter") || prompt.includes("fast break") || prompt.includes("quick transition")) {
    base.counterAttack = 0.85;
    base.passDirectness = Math.max(base.passDirectness, 0.7);
  }
  if (prompt.includes("shoot on sight") || prompt.includes("from distance") || prompt.includes("aggressive shooting") || prompt.includes("long shot")) {
    base.shotGreed = 0.85;
  }
  if (prompt.includes("wing") || prompt.includes("flank") || prompt.includes("cross") || prompt.includes("wide")) {
    base.wingPlayBias = 0.8;
  }
  if (prompt.includes("slide tackle") || prompt.includes("hard tackle") || prompt.includes("aggressive") || prompt.includes("crunching")) {
    base.tackleAggression = 0.85;
  }
  if (prompt.includes("clean") || prompt.includes("cautious") || prompt.includes("don't commit")) {
    base.tackleAggression = 0.25;
  }

  // Compile 11 starting players & 3 substitutes
  const formationKey = SQUAD_11_ROLES[teamConfig.formation] ? teamConfig.formation : "4-3-3";
  const squadTemplate = SQUAD_11_ROLES[formationKey] || SQUAD_11_ROLES["4-3-3"];

  const players = squadTemplate.map((slot, index) => {
    const prompt =
      playerPrompts[slot.roleKey] ||
      playerPrompts[slot.defaultRole.toLowerCase()] ||
      "";
    const compiledRole = compilePlayerRole(slot.roleKey, prompt, base, slot.defaultRole);

    // Assign player name and transfer attributes
    let playerName = slot.name;
    let playerVal = 8.0;
    let playerTier = 2;
    let playerPromptCap = "Solid Performer";
    let isYouth = false;

    if (teamConfig.starting11 && teamConfig.starting11[index]) {
      const cfgP = teamConfig.starting11[index];
      playerName = cfgP.name;
      playerVal = cfgP.transferValue || playerVal;
      playerTier = cfgP.tier || playerTier;
      playerPromptCap = cfgP.promptCapability || playerPromptCap;
      isYouth = !!cfgP.isYouth;
    } else if (realRoster && realRoster.starting11 && realRoster.starting11[index]) {
      const cfgP = realRoster.starting11[index];
      playerName = cfgP.name;
      playerVal = cfgP.transferValue || playerVal;
      playerTier = cfgP.tier || playerTier;
      playerPromptCap = cfgP.promptCapability || playerPromptCap;
      isYouth = !!cfgP.isYouth;
    } else if (teamConfig.players && teamConfig.players[index]?.name) {
      playerName = teamConfig.players[index].name;
    }

    return {
      ...compiledRole,
      number: slot.number,
      name: playerName,
      transferValue: playerVal,
      tier: playerTier,
      promptCapability: playerPromptCap,
      isYouth,
    };
  });

  const benchSubs = generateBenchSubstitutes(base, realRoster, teamConfig.benchSubs);

  return {
    teamName: teamConfig.name || (realRoster ? realRoster.name : teamName),
    color: teamConfig.color || realRoster?.color || "#00E5FF",
    secondaryColor: teamConfig.secondaryColor || realRoster?.secondaryColor || "#0A192F",
    formation: formationKey,
    teamPrompt: teamConfig.prompt || "Balanced, disciplined teamwork",
    teamWeights: base,
    players,
    benchSubs,
  };
}

function compilePlayerRole(roleKey, prompt, teamBase, defaultRole) {
  const p = prompt.toLowerCase();
  const player = {
    role: defaultRole,
    roleKey,
    prompt,
    workRate: 0.7,
    shotBias: teamBase.shotGreed,
    passBias: teamBase.passDirectness,
    dribbleBias: teamBase.dribbleFrequency,
    pressBias: teamBase.pressAggression,
    tackleBias: teamBase.tackleAggression,
    positionalDiscipline: 0.7,
    sweeperKeeper: false
  };

  if (defaultRole === "GK") {
    player.sweeperKeeper = p.includes("sweeper") || p.includes("aggressive") || p.includes("rush out") || p.includes("high");
    if (p.includes("long ball") || p.includes("launch") || p.includes("distribute long")) {
      player.passBias = 0.9;
    }
  }

  if (defaultRole === "DEF") {
    if (p.includes("stay back") || p.includes("anchor") || p.includes("no nonsense") || p.includes("clear")) {
      player.positionalDiscipline = 0.95;
      player.workRate = 0.85;
    }
    if (p.includes("overlap") || p.includes("attack") || p.includes("roam")) {
      player.positionalDiscipline = 0.4;
    }
  }

  if (defaultRole.startsWith("MID")) {
    if (p.includes("playmaker") || p.includes("through ball") || p.includes("orchestrate")) {
      player.passBias = 0.8;
      player.shotBias = 0.35;
    }
    if (p.includes("box to box") || p.includes("engine") || p.includes("relentless")) {
      player.workRate = 0.95;
      player.pressBias = 0.9;
    }
  }

  if (defaultRole === "FWD") {
    if (p.includes("cherry pick") || p.includes("poacher") || p.includes("stay high") || p.includes("never defend")) {
      player.positionalDiscipline = 0.3;
      player.workRate = 0.5;
      player.shotBias = 0.9;
    }
    if (p.includes("false 9") || p.includes("drop deep") || p.includes("link play")) {
      player.positionalDiscipline = 0.5;
      player.passBias = 0.7;
    }
  }

  return player;
}

export const MACRO_TOUCHLINE_SHOUTS = {
  ALL_OUT_PRESS: {
    name: "Heavy Metal Press",
    prompt: "relentless heavy press, suffocate in opponent half, high line, blitz tackle",
    weights: { pressAggression: 0.95, defensiveLine: 0.85, shotGreed: 0.8, tackleAggression: 0.9 }
  },
  PARK_THE_BUS: {
    name: "Park The Bus",
    prompt: "park the bus inside own third, low block, clean defense, direct clear",
    weights: { pressAggression: 0.3, defensiveLine: 0.2, shotGreed: 0.5, tackleAggression: 0.75, counterAttack: 0.95 }
  },
  COUNTER_ATTACK: {
    name: "Direct Counter Blitz",
    prompt: "fast break, direct vertical passing into box, counter attack",
    weights: { passDirectness: 0.85, counterAttack: 0.95, shotGreed: 0.8 }
  },
  TIKI_TAKA_CONTROL: {
    name: "Tiki-Taka Retain",
    prompt: "patient short passing, keep possession, calm build up",
    weights: { passDirectness: 0.2, dribbleFrequency: 0.3, shotGreed: 0.4 }
  },
  SHOOT_ON_SIGHT: {
    name: "Shoot On Sight",
    prompt: "shoot on sight from distance, aggressive shooting, test the keeper",
    weights: { shotGreed: 0.95 }
  }
};

/**
 * Recompiles tactical weights for an active team and updates live engine players
 */
export function recompileLiveTactics(currentTeamConfig, newPrompt, macroKey = null) {
  const effectivePrompt = macroKey && MACRO_TOUCHLINE_SHOUTS[macroKey]
    ? `${newPrompt || ""} ${MACRO_TOUCHLINE_SHOUTS[macroKey].prompt}`
    : newPrompt || currentTeamConfig.prompt || "";

  const updatedConfig = {
    ...currentTeamConfig,
    prompt: effectivePrompt
  };

  const compiled = compileTeamTactics(updatedConfig);
  if (macroKey && MACRO_TOUCHLINE_SHOUTS[macroKey]?.weights) {
    Object.assign(compiled.teamWeights, MACRO_TOUCHLINE_SHOUTS[macroKey].weights);
  }

  return compiled;
}

/**
 * Compiles a substitute agent with default or customized impact role
 */
export function compileSubAgent(teamWeights, subConfig = {}) {
  const role = subConfig.role || "FWD";
  const roleKey = subConfig.roleKey || (role === "GK" ? "gk" : role === "DEF" ? "def" : role === "MID" ? "mid1" : "fwd");
  const prompt = subConfig.prompt || "Super sub with fresh explosive stamina. Press fiercely, find open pockets, and strike decisively!";
  const playerTactic = compilePlayerRole(roleKey, prompt, teamWeights, role);

  return {
    name: subConfig.name || "Super Sub",
    number: subConfig.number || 6,
    role,
    roleKey,
    prompt,
    tactic: playerTactic
  };
}

