// server/services/llmService.js
/**
 * Local LLM Service connecting to Ollama at http://localhost:11434.
 * Features:
 * - Dynamic discovery of installed local models
 * - Runtime model selection (hot-swapping)
 * - Player 1-on-1 touchline chat responses
 * - Fan sentiment & stadium chant generation
 * - Chairperson boardroom feedback generation
 * - Live prompt telemetry logging for inspection
 * - Graceful fallback to deterministic heuristic engine if Ollama is unreachable
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

// In-memory telemetry log (max 30 entries)
const telemetryLogs = [];

// Default active model: llama3.2:1b (fast & lightweight) or fallback heuristic
let activeModel = "llama3.2:1b";

/**
 * Fetch all installed models from local Ollama
 */
export async function getInstalledModels() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: "GET" });
    if (!res.ok) throw new Error(`Ollama returned status ${res.status}`);
    const data = await res.json();
    const models = (data.models || []).map((m) => {
      const details = m.details || {};
      return {
        name: m.name,
        sizeBytes: m.size,
        family: details.family || "unknown",
        parameterSize: details.parameter_size || "unknown",
        quantizationLevel: details.quantization_level || "unknown",
        contextLength: details.context_length || 32768,
        modifiedAt: m.modified_at,
      };
    });

    // If activeModel is not in installed list, set to the first one available
    if (models.length > 0 && !models.some((m) => m.name === activeModel)) {
      activeModel = models[0].name;
    }

    return {
      connected: true,
      activeModel,
      models,
    };
  } catch (err) {
    return {
      connected: false,
      activeModel: "heuristic-fast",
      models: [],
      error: err.message,
    };
  }
}

/**
 * Set active model
 */
export function setActiveModel(modelName) {
  activeModel = modelName;
  return { success: true, activeModel };
}

/**
 * Get active model
 */
export function getActiveModel() {
  return activeModel;
}

/**
 * Get prompt telemetry logs
 */
export function getTelemetryLogs() {
  return telemetryLogs.slice(-30).reverse();
}

/**
 * Record a telemetry entry
 */
function recordTelemetry(entry) {
  telemetryLogs.push({
    id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    model: activeModel,
    ...entry,
  });
  if (telemetryLogs.length > 50) {
    telemetryLogs.shift();
  }
}

/**
 * Generate player touchline chat response using the active local LLM
 */
export async function generatePlayerChatReply(player, message, gameState) {
  const startTime = Date.now();
  const simMinute = gameState
    ? Math.min(90, Math.floor((gameState.elapsedSeconds / gameState.matchDuration) * 90))
    : 45;
  const scoreText = gameState
    ? `${gameState.score.home} - ${gameState.score.away}`
    : "0 - 0";
  const ratingNum = typeof player?.rating === "number" ? player.rating : 7.2;
  const staminaNum = typeof player?.stamina === "number" ? player.stamina : 95;
  const playerNumber = player?.number || 9;
  const playerName = player?.name || "Player";
  const playerRole = player?.role || "MID";
  const teamType = player?.team === "away" ? "Away" : "Home";

  const systemPrompt = `You are ${playerName}, a professional footballer playing as ${playerRole} (#${playerNumber}) for the ${teamType} team.
Current match state: Minute ${simMinute}', Score: ${scoreText}. Your match performance rating is ${ratingNum.toFixed(1)}/10, Stamina: ${Math.round(staminaNum)}%.
The manager has just shouted instructions to you from the touchline technical area.
Respond as the player in 1-2 punchy, professional, passionate sentences directly acknowledging the manager's tactical shout. Stay in character as a committed elite footballer. Do NOT include markdown, explanations, or quotes.`;

  const userPrompt = `Manager shouts: "${message}"`;

  // Try calling local Ollama if activeModel is not heuristic
  if (activeModel && activeModel !== "heuristic-fast") {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          prompt: `${systemPrompt}\n\n${userPrompt}\n\nPlayer reply:`,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 80,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let rawResponse = (data.response || "").trim();
        let reasoningTrace = undefined;

        // Parse reasoning <think> tags for models like DeepSeek-R1
        const thinkMatch = rawResponse.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoningTrace = thinkMatch[1].trim();
          rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }

        // Clean any leading/trailing quotes
        rawResponse = rawResponse.replace(/^["']|["']$/g, "").trim();

        const latencyMs = Date.now() - startTime;

        recordTelemetry({
          type: "player_chat",
          targetName: player.name,
          role: player.role,
          systemPrompt,
          userPrompt,
          response: rawResponse,
          reasoningTrace,
          latencyMs,
          tokenCount: data.eval_count || 30,
        });

        return {
          response: rawResponse,
          modelUsed: activeModel,
          latencyMs,
          reasoningTrace,
        };
      }
    } catch (err) {
      console.warn(`Local Ollama error (${activeModel}):`, err.message);
    }
  }

  // Fast heuristic fallback
  const fallbackReply = getFallbackPlayerReply(player, message);
  const latencyMs = Date.now() - startTime;

  recordTelemetry({
    type: "player_chat",
    targetName: player.name,
    role: player.role,
    systemPrompt: "(Heuristic Engine)",
    userPrompt,
    response: fallbackReply,
    latencyMs,
    tokenCount: 20,
  });

  return {
    response: fallbackReply,
    modelUsed: "heuristic-fast",
    latencyMs,
  };
}

/**
 * Generate fan chant and chairperson boardroom memo using active local LLM
 */
export async function generateClubFeedback(gameState) {
  const startTime = Date.now();
  if (!gameState) return null;

  const { score, stats, homeTeam, awayTeam, elapsedSeconds, matchDuration } = gameState;
  const simMinute = Math.min(90, Math.floor((elapsedSeconds / matchDuration) * 90));
  const isWinning = score.home > score.away;
  const isDrawing = score.home === score.away;
  const isLosing = score.home < score.away;

  // Derive heuristic baseline sentiment & confidence
  let fanSentiment = 65;
  if (isWinning) fanSentiment = 85 + (score.home - score.away) * 5;
  else if (isDrawing) fanSentiment = 58;
  else fanSentiment = Math.max(15, 45 - (score.away - score.home) * 12);

  let boardConfidence = 72;
  if (isWinning) boardConfidence = 88;
  else if (isDrawing) boardConfidence = 68;
  else boardConfidence = Math.max(25, 52 - (score.away - score.home) * 10);

  fanSentiment = Math.min(100, Math.max(0, fanSentiment));
  boardConfidence = Math.min(100, Math.max(0, boardConfidence));

  // Determine sentiment status
  let fanStatus = "Optimistic";
  if (fanSentiment >= 80) fanStatus = "Ecstatic";
  else if (fanSentiment >= 60) fanStatus = "Optimistic";
  else if (fanSentiment >= 45) fanStatus = "Nervous";
  else if (fanSentiment >= 30) fanStatus = "Discontent";
  else fanStatus = "Hostile";

  let boardStatus = "Satisfied";
  if (boardConfidence >= 80) boardStatus = "Delighted";
  else if (boardConfidence >= 65) boardStatus = "Satisfied";
  else if (boardConfidence >= 45) boardStatus = "Cautious";
  else boardStatus = "Under Pressure";

  const systemPrompt = `You are a football club communications officer for ${homeTeam.name}.
Match Minute: ${simMinute}', Score: ${homeTeam.name} ${score.home} - ${score.away} ${awayTeam.name}.
Home possession: ${stats.possession.home}%, shots: ${stats.shots.home}.
Produce two short distinct reactions in JSON format:
1. "fanChant": A 1-sentence stadium crowd chant or fan social reaction reflecting their ${fanStatus} mood.
2. "boardMemo": A 1-2 sentence formal boardroom statement from the Chairperson reflecting ${boardStatus} board confidence.
Output strictly valid JSON with keys "fanChant" and "boardMemo".`;

  let fanChant = isWinning
    ? `🎶 "We're top of the league and having a party! Keep attacking, ${homeTeam.name}!"`
    : isDrawing
    ? `📢 "Come on boys, take your chances! Push forward and find the winner!"`
    : `⚠️ "Sort it out! We want attacking football and pride in the shirt!"`;

  let boardMemo = isWinning
    ? `The Chairperson is delighted with the team's commanding tactical display. Continued positive form will unlock bonus transfer reinforcements.`
    : isDrawing
    ? `The Board expects a competitive performance and remains confident in the manager's tactical strategy.`
    : `The Board expresses serious concern regarding today's defensive vulnerability. High standards are expected at this club.`;

  if (activeModel && activeModel !== "heuristic-fast") {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          prompt: `${systemPrompt}\n\nJSON Output:`,
          format: "json",
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 120,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.response || "{}");
        if (parsed.fanChant) fanChant = parsed.fanChant;
        if (parsed.boardMemo) boardMemo = parsed.boardMemo;

        recordTelemetry({
          type: "club_feedback",
          targetName: `${homeTeam.name} Fans & Board`,
          systemPrompt,
          userPrompt: `Evaluate match at ${simMinute}'`,
          response: `[Fan] ${fanChant} | [Board] ${boardMemo}`,
          latencyMs: Date.now() - startTime,
          tokenCount: data.eval_count || 50,
        });
      }
    } catch {
      // Keep heuristic fallback
    }
  }

  // Morale & attribute effects
  const moraleEffect = fanSentiment >= 65
    ? "+5% Sprint Speed & Pressing Aggression from passionate home support"
    : fanSentiment <= 40
    ? "-5% Composure & +20% Stamina drain from crowd anxiety"
    : "Neutral crowd atmosphere";

  const boardInfluence = boardConfidence >= 75
    ? "Board backing: +£1.5m Transfer Allowance & high squad stability (+2% TM)"
    : boardConfidence <= 40
    ? "Board scrutiny: Squad under intense expectation pressure"
    : "Standard board backing";

  return {
    fanFeedback: {
      sentiment: fanSentiment,
      status: fanStatus,
      chant: fanChant,
      moraleEffect,
    },
    chairpersonFeedback: {
      boardConfidence,
      status: boardStatus,
      message: boardMemo,
      influence: boardInfluence,
    },
  };
}

/**
 * Fallback player reply based on message keywords
 */
function getFallbackPlayerReply(player, message) {
  const msg = (message || "").toLowerCase();
  if (msg.includes("press") || msg.includes("hunt") || msg.includes("close")) {
    return `Understood Boss! Stepping up the press and hunting down their midfield immediately!`;
  }
  if (msg.includes("shoot") || msg.includes("attack") || msg.includes("goal")) {
    return `Got it Boss! I'll pull the trigger at the first sight of goal!`;
  }
  if (msg.includes("pass") || msg.includes("calm") || msg.includes("possession")) {
    return `On it Coach! Slowing the tempo down, keeping possession and looking for open triangles.`;
  }
  if (msg.includes("tackle") || msg.includes("defend") || msg.includes("stay")) {
    return `Understood! Putting in hard challenges and locking down our defensive third!`;
  }
  if (msg.includes("wake up") || msg.includes("poor") || msg.includes("improve")) {
    return `Heard you loud and clear Boss! I know my rating is ${player.rating.toFixed(1)}. Giving 110% to turn it around!`;
  }
  return `Copy that Boss! Adjusting my focus now: "${message.slice(0, 30)}...". Let's win this!`;
}

/**
 * Generate Assistant Manager tactical briefing & drill recommendations
 */
export async function generateAssistantManagerBriefing(directive, teamConfig, gameState = null, activeTier = "tier_4") {
  const startTime = Date.now();
  const dir = (directive || "Give me a general squad and tactical review").trim();
  const tierName = activeTier === "tier_4" ? "National League (Tier 4)" : activeTier === "tier_3" ? "Division Two (Tier 3)" : activeTier === "tier_2" ? "Division One (Tier 2)" : "Premier Championship (Tier 1)";

  const systemPrompt = `You are Roy Evans, experienced Assistant Manager for ${teamConfig?.name || "our club"}.
Current division: ${tierName}. Available transfer budget: £${(teamConfig?.transferBudget || 1.5).toFixed(1)}M. Squad harmony: ${teamConfig?.squadHarmony || 75}%.
The Manager has just issued this backroom directive to you: "${dir}".
Provide a sharp, authentic, professional Championship Manager coaching debrief in JSON format:
{
  "heading": "Short tactical headline (max 8 words)",
  "analysis": "1-2 sentences with candid evaluation of the team's tactical execution and form",
  "actionPlan": "1-2 sentences outlining the specific training drill or positional adjustment to implement immediately",
  "recommendations": ["Point 1", "Point 2", "Point 3"]
}
Output strictly valid JSON.`;

  let parsedResponse = getFallbackAssistantBriefing(dir, teamConfig, activeTier);

  if (activeModel && activeModel !== "heuristic-fast") {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          prompt: `${systemPrompt}\n\nJSON Output:`,
          format: "json",
          stream: false,
          options: {
            temperature: 0.65,
            num_predict: 160,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const json = JSON.parse(data.response || "{}");
        if (json.heading && json.analysis) {
          parsedResponse = {
            heading: json.heading,
            analysis: json.analysis,
            actionPlan: json.actionPlan || parsedResponse.actionPlan,
            recommendations: json.recommendations || parsedResponse.recommendations,
          };
        }

        recordTelemetry({
          type: "assistant_manager_directive",
          targetName: "Assistant Manager (Roy Evans)",
          systemPrompt,
          userPrompt: dir,
          response: JSON.stringify(parsedResponse),
          latencyMs: Date.now() - startTime,
          tokenCount: data.eval_count || 90,
        });

        return {
          ...parsedResponse,
          modelUsed: activeModel,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch {
      // Keep heuristic fallback
    }
  }

  const latencyMs = Date.now() - startTime;
  recordTelemetry({
    type: "assistant_manager_directive",
    targetName: "Assistant Manager (Roy Evans)",
    systemPrompt: "(Heuristic Cognitive Engine)",
    userPrompt: dir,
    response: JSON.stringify(parsedResponse),
    latencyMs,
    tokenCount: 45,
  });

  return {
    ...parsedResponse,
    modelUsed: "heuristic-fast",
    latencyMs,
  };
}

/**
 * Fallback Assistant Manager coaching briefs based on prompt intent
 */
function getFallbackAssistantBriefing(directive, teamConfig, activeTier) {
  const d = directive.toLowerCase();

  if (d.includes("defense") || d.includes("defend") || d.includes("concede") || d.includes("shape")) {
    return {
      heading: "Backline Compacting & Pivot Cover",
      analysis: "Our center-backs are getting pulled out of position when fullbacks overlap. In Tier 4, discipline beats frantic slide tackles.",
      actionPlan: "Drill our holding midfielder (CDM) to drop between center-backs during defensive transitions to protect against direct counters.",
      recommendations: [
        "Instruct center-backs to avoid lunging early in 1v1 duels.",
        "Maintain a lower defensive block against teams with rapid wingers.",
        "Set fullbacks to staggered overlaps rather than committing both simultaneously.",
      ],
    };
  }

  if (d.includes("attack") || d.includes("goal") || d.includes("score") || d.includes("striker") || d.includes("shoot")) {
    return {
      heading: "Channel Overloads & Finishing Precision",
      analysis: "We are generating decent half-chances, but our shots on target ratio needs improvement. Our number 9 needs earlier delivery.",
      actionPlan: "Implement Monday morning technical finishing drills with quick 1-2 combination passes into the 18-yard box.",
      recommendations: [
        "Encourage wingers to cut back from the byline rather than lofting blind crosses.",
        "Prompt the attacking midfielder (CAM) to arrive late on the edge of the area.",
        "Increase shot bias to 0.85 when inside 20 yards.",
      ],
    };
  }

  if (d.includes("transfer") || d.includes("target") || d.includes("market") || d.includes("scout") || d.includes("sign")) {
    return {
      heading: "Targeted Realistic Reinforcements",
      analysis: `With a £${(teamConfig?.transferBudget || 1.5).toFixed(1)}M budget in ${activeTier}, elite players will reject us, but there are gems in Tier 3 surplus and Free Agency.`,
      actionPlan: "Prioritize signing an experienced ball-winning CDM or an explosive free-agent winger who can raise our match sharpness.",
      recommendations: [
        "Focus on players with 'Tenacious' or 'Leader' traits to anchor our spine.",
        "Scout the Free Agent listings to save transfer fee capital for future promotions.",
        "Avoid bidding on Tier 1 stars who will flatly refuse contract talks.",
      ],
    };
  }

  return {
    heading: "Squad Mastery & Tactical Cohesion",
    analysis: `Squad harmony is sitting at ${teamConfig?.squadHarmony || 75}%. Our grassroots players respond best when instructions are consistent and direct.`,
    actionPlan: "Run technical agility drills and reinforce pressing triggers so our raw 5.7 ratings punch above their weight on Saturday.",
    recommendations: [
      "Maintain a 4-3-3 shape to maximize wide passing triangles.",
      "Praise high-performing players in touchline chat to boost morale.",
      "Monitor fatigue carefully—rotate bench subs when stamina drops below 60%.",
    ],
  };
}

/**
 * Decomposes a manager's tactical prompt and calculates trait resonance across the squad
 */
export function evaluatePromptTraitResonance(promptText, squad = []) {
  const p = (promptText || "").toLowerCase();
  const resonances = (squad || []).map((player) => {
    const trait = (player.personalityTrait || "Methodical").toLowerCase();
    let score = 70;
    let adjustment = "Balanced tactical adherence";
    let resonanceType = "Standard";

    if (trait.includes("creative")) {
      if (p.includes("pass") || p.includes("possession") || p.includes("tiki") || p.includes("express") || p.includes("freedom")) {
        score = 96;
        adjustment = "+15% Vision & Passing Precision, +5% Creative Flair";
        resonanceType = "Optimal";
      } else if (p.includes("park") || p.includes("rigid") || p.includes("stay back")) {
        score = 52;
        adjustment = "-8% Initiative (constrained by rigid instructions)";
        resonanceType = "Friction";
      }
    } else if (trait.includes("methodical")) {
      if (p.includes("shape") || p.includes("discipline") || p.includes("compact") || p.includes("park") || p.includes("defend")) {
        score = 98;
        adjustment = "+18% Positional Containment, +10% Interceptions";
        resonanceType = "Optimal";
      } else if (p.includes("chaos") || p.includes("all out") || p.includes("roam")) {
        score = 55;
        adjustment = "-6% Composure in chaotic formation";
        resonanceType = "Friction";
      }
    } else if (trait.includes("flair")) {
      if (p.includes("dribble") || p.includes("attack") || p.includes("shoot") || p.includes("skill") || p.includes("counter")) {
        score = 95;
        adjustment = "+16% Take-on Success & Audacious Shooting";
        resonanceType = "Optimal";
      } else if (p.includes("defend") || p.includes("anchor")) {
        score = 50;
        adjustment = "-10% Energy when forced to defend deep";
        resonanceType = "Friction";
      }
    } else if (trait.includes("aggressive")) {
      if (p.includes("press") || p.includes("hunt") || p.includes("tackle") || p.includes("blitz") || p.includes("hard")) {
        score = 97;
        adjustment = "+20% Press Tenacity & Ball Recovery Speed";
        resonanceType = "Optimal";
      } else if (p.includes("calm") || p.includes("slow")) {
        score = 60;
        adjustment = "-5% Agitation when tempo is throttled";
        resonanceType = "Friction";
      }
    } else if (trait.includes("leader")) {
      score = 90;
      adjustment = "+10% Team Composure Stabilization & Communication";
      resonanceType = "Captaincy Anchor";
    } else if (trait.includes("tenacious")) {
      score = 92;
      adjustment = "+14% Relentless Stamina Efficiency & Second Ball Recovery";
      resonanceType = "High Workrate";
    } else if (trait.includes("sensitive")) {
      if (p.includes("wake up") || p.includes("poor") || p.includes("bad")) {
        score = 42;
        adjustment = "-15% Morale (player feels targeted by harsh criticism)";
        resonanceType = "Severe Friction";
      } else {
        score = 88;
        adjustment = "+12% Self-Belief from positive coaching backing";
        resonanceType = "Optimal";
      }
    }

    return {
      playerId: player.id || player.number,
      name: player.name,
      role: player.role,
      trait: player.personalityTrait || "Methodical",
      traitIcon: player.personalityIcon || "🛡️",
      resonanceScore: score,
      resonanceType,
      tacticalAdjustment: adjustment,
    };
  });

  const avgResonance = resonances.length > 0
    ? Math.round(resonances.reduce((sum, r) => sum + r.resonanceScore, 0) / resonances.length)
    : 75;

  return {
    promptAnalyzed: promptText,
    averageResonance: avgResonance,
    resonances,
  };
}

/**
 * 1-Click AI Prompt Optimizer & Coach
 * Upgrades casual prompts into structured, high-resonance prompt engineering patterns
 */
export async function optimizePromptWithAI(rawPrompt) {
  const p = (rawPrompt || "").trim();
  const startTime = Date.now();

  const systemPrompt = `You are an elite AI Prompt Engineer and UEFA Pro Tactical Analyst for the football simulation engine CAIRN FC.
Your task is to take a manager's casual tactical instruction and rewrite it into a highly structured, professional prompt engineering masterclass instruction.
Incorporate:
1. Trigger condition (When / Upon...)
2. Precise tactical action & target pitch zone
3. Clear negative constraint / guardrail (Do NOT...)
4. Desired outcome
Output valid JSON in exactly this format:
{
  "originalPrompt": "${p}",
  "optimizedPrompt": "rewritten prompt here",
  "techniqueApplied": "Few-Shot / Trigger-Action-Guardrail / CoT",
  "reasoningExplanation": "Short 1-2 sentence explanation of why this prompt yields higher model adherence",
  "expectedResonanceBoost": "+25% Tactical Mastery"
}`;

  if (activeModel && activeModel !== "heuristic-fast") {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          prompt: `${systemPrompt}\n\nManager Prompt: "${p}"\n\nJSON Output:`,
          format: "json",
          stream: false,
          options: { temperature: 0.3, num_predict: 200 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.response);
        const latencyMs = Date.now() - startTime;
        recordTelemetry({
          type: "tactical_eval",
          targetName: "Prompt Optimizer",
          systemPrompt,
          userPrompt: p,
          response: parsed.optimizedPrompt,
          latencyMs,
          tokenCount: data.eval_count || 60,
        });
        return { ...parsed, latencyMs, modelUsed: activeModel };
      }
    } catch (err) {
      console.warn("Prompt optimizer Ollama error, using heuristic optimization:", err.message);
    }
  }

  // Heuristic rule-based prompt optimizer
  let optimized = "";
  let technique = "Trigger-Action-Guardrail";
  const lower = p.toLowerCase();

  if (lower.includes("press") || lower.includes("hunt")) {
    optimized = "Upon losing possession in the middle third, execute immediate high-intensity Gegenpress within 4 seconds; swarm ball carrier with 2 players while preserving backline depth. Do NOT commit reckless fouls inside the 25-yard danger zone.";
    technique = "Conditional Trigger + Flank Guardrail";
  } else if (lower.includes("shoot") || lower.includes("attack") || lower.includes("score")) {
    optimized = "When penetrating the attacking third, isolate opposing center-backs with quick 1v1 drop-shoulder feints and pull the trigger on sight within 20 yards. Do NOT force low-probability shots when overlapping winger is unmarked in the box.";
    technique = "Zonal Action + Negative Constraint";
  } else if (lower.includes("pass") || lower.includes("tiki") || lower.includes("possession")) {
    optimized = "Maintain high-tempo short-passing triangles across the midfield pivot; advance through the half-spaces and recycle to the CDM if passing lanes are blocked. Do NOT attempt contested long balls into a crowded penalty box.";
    technique = "Chain-of-Thought Decision Tree";
  } else if (lower.includes("defend") || lower.includes("park") || lower.includes("hold")) {
    optimized = "Form a compact 5-man defensive low block across our own 18-yard box; deny central passing lanes and initiate lethal vertical counter-attacks down the flanks upon interception. Do NOT break defensive line shape until ball is fully cleared.";
    technique = "Spatial Constraint + Transition Anchor";
  } else {
    optimized = `When in possession, structure rapid one-touch combinations and exploit open channels with purposeful movement; remain alert to transition triggers and protect defensive balance. Do NOT concede unnecessary turnovers in central midfield.`;
    technique = "Balanced Role-Conditioned Prompt";
  }

  const latencyMs = Date.now() - startTime;
  return {
    originalPrompt: p || "play fast and win",
    optimizedPrompt: optimized,
    techniqueApplied: technique,
    reasoningExplanation: "Structured prompt with clear trigger condition, pitch zone specification, and negative constraint guardrails to prevent stochastic hallucinations.",
    expectedResonanceBoost: "+24% Tactical Mastery",
    latencyMs,
    modelUsed: "heuristic-optimizer",
  };
}

/**
 * Prompt A/B Testing Lab
 * Compares two prompts side-by-side on a given player
 */
export async function comparePromptsWithAI(player, promptA, promptB, gameState) {
  const [resA, resB] = await Promise.all([
    generatePlayerChatReply(player, promptA, gameState),
    generatePlayerChatReply(player, promptB, gameState),
  ]);

  const pALower = (promptA || "").toLowerCase();
  const pBLower = (promptB || "").toLowerCase();

  const getWeights = (p) => ({
    pressBias: p.includes("press") ? 0.95 : p.includes("defend") ? 0.35 : 0.6,
    shotBias: p.includes("shoot") ? 0.95 : p.includes("pass") ? 0.3 : 0.5,
    passBias: p.includes("pass") || p.includes("tiki") ? 0.2 : p.includes("direct") ? 0.85 : 0.5,
  });

  return {
    player: { id: player.id, name: player.name, role: player.role, trait: player.personalityTrait },
    promptA: {
      text: promptA,
      response: resA.response,
      latencyMs: resA.latencyMs,
      modelUsed: resA.modelUsed,
      reasoningTrace: resA.reasoningTrace,
      weights: getWeights(pALower),
    },
    promptB: {
      text: promptB,
      response: resB.response,
      latencyMs: resB.latencyMs,
      modelUsed: resB.modelUsed,
      reasoningTrace: resB.reasoningTrace,
      weights: getWeights(pBLower),
    },
    comparisonInsight: `Prompt A focuses on ${pALower.includes("press") ? "High Press" : pALower.includes("shoot") ? "Direct Attack" : "General Play"}, while Prompt B activates ${pBLower.includes("pass") ? "Possession Retention" : pBLower.includes("defend") ? "Low Block Containment" : "Tactical Discipline"}.`,
  };
}

