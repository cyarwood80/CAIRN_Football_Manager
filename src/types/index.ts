// src/types/index.ts

export type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "5-3-2" | "4-2-3-1" | "3-4-3" | "1-2-1" | "2-1-1" | "1-1-2";

export interface PlayerTactic {
  role: string;
  roleKey: string;
  prompt: string;
  workRate: number;
  shotBias: number;
  passBias: number;
  dribbleBias: number;
  pressBias: number;
  tackleBias: number;
  positionalDiscipline: number;
  sweeperKeeper?: boolean;
}

export interface SquadPlayerConfig {
  number: number;
  name: string;
  role: string;
  transferValue?: number;
  tier?: number;
  promptCapability?: string;
  isYouth?: boolean;
  prompt?: string;
  tacticalMastery?: number;
  rating?: number;
  potentialRating?: number;
  personalityTrait?: string;
  personalityIcon?: string;
  personalityDescription?: string;
  growthPoints?: number;
}

export interface TeamConfig {
  name: string;
  color: string;
  secondaryColor?: string;
  formation: Formation;
  prompt: string;
  playerPrompts?: Record<string, string>;
  starting11?: SquadPlayerConfig[];
  benchSubs?: SquadPlayerConfig[];
  squadHarmony?: number;
  transferBudget?: number;
  totalSquadValue?: number;
}

export interface PlayerState {
  id: string;
  number: number;
  team: "home" | "away";
  name: string;
  role: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: string;
  stamina: number;
  health: number;
  rating: number; // CM rating: 1.0 - 10.0
  potentialRating?: number;
  impact: "high" | "med" | "low";
  goals: number;
  assists: number;
  passes: number;
  tackles: number;
  shots: number;
  saves: number;
  thought: string;
  personalityTrait?: string;
  personalityIcon?: string;
  personalityDescription?: string;
  subbedOut?: boolean;
  transferValue?: number;
  tier?: number;
  promptCapability?: string;
  isYouth?: boolean;
  tacticalMastery?: number;
}

export interface PlayerFeedback {
  playerId: string;
  playerName: string;
  playerRole: string;
  type: "challenge" | "encourage";
  message: string;
  tacticalAdvice?: string;
  rating?: number;
}

export interface CrowdAtmosphere {
  decibels: number;
  pressureLevel: "low" | "medium" | "high" | "intense";
  venue: "home" | "away";
  homeExpectationPenalty: boolean;
}

export interface SubAgent {
  id: string;
  number: number;
  name: string;
  role: string;
  prompt: string;
  stamina: number;
  used?: boolean;
  transferValue?: number;
  tier?: number;
  promptCapability?: string;
  isYouth?: boolean;
  personalityTrait?: string;
  personalityIcon?: string;
}

export interface TransferMarketListing {
  id: string;
  name: string;
  role: string;
  club: string;
  tier: number;
  tierKey?: string;
  tierName?: string;
  rating?: number;
  potentialRating?: number;
  transferValue: number;
  weeklyWage?: number;
  isFreeAgent?: boolean;
  personalityTrait?: string;
  personalityIcon?: string;
  personalityDescription?: string;
  promptCapability: string;
  scoutReport?: string;
  negotiationFeasibility?: "interested" | "doubtful" | "unrealistic";
  negotiationReason?: string;
  status: "available" | "owned";
}

export interface AssistantManagerBriefing {
  heading: string;
  analysis: string;
  actionPlan: string;
  recommendations: string[];
  modelUsed?: string;
  latencyMs?: number;
}

export interface TraitResonanceItem {
  playerId: string | number;
  name: string;
  role: string;
  trait: string;
  traitIcon: string;
  resonanceScore: number;
  resonanceType: string;
  tacticalAdjustment: string;
}

export interface TraitResonanceAnalysis {
  promptAnalyzed: string;
  averageResonance: number;
  resonances: TraitResonanceItem[];
}


export interface LeagueFixture {
  id: string;
  gameweek: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  isShot: boolean;
  possessorId: string | null;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  shotAccuracy?: { home: number; away: number };
  saves?: { home: number; away: number };
  passes: { home: number; away: number };
  passesAttempted?: { home: number; away: number };
  passesCompleted?: { home: number; away: number };
  passAccuracy?: { home: number; away: number };
  tackles: { home: number; away: number };
  tacklesAttempted?: { home: number; away: number };
  tacklesWon?: { home: number; away: number };
  tackleSuccess?: { home: number; away: number };
  interceptions?: { home: number; away: number };
  xG: { home: number; away: number };
}

export interface MatchEvent {
  id: string;
  minute: number;
  text: string;
  type: "goal" | "shot" | "save" | "tackle" | "pass" | "info" | "whistle" | "sub" | "tactic" | "chat";
  player?: { name: string; number?: number } | null;
}

export interface ActiveThought {
  playerId: string;
  playerName: string;
  team: "home" | "away";
  text: string;
  personalityTrait?: string;
  personalityIcon?: string;
  x: number;
  y: number;
  timestamp: number;
}


export interface PostMatchSummary {
  playerOfTheMatch?: {
    id?: string;
    name: string;
    number?: number;
    team: "home" | "away";
    teamName?: string;
    role?: string;
    rating: number;
    goals: number;
    assists: number;
    saves: number;
    tackles?: number;
    shots?: number;
    quote?: string;
  } | null;
  score?: { home: number; away: number };
  stats?: MatchStats;
  turningPoints?: {
    minute: number;
    text: string;
    type?: string;
  }[];
  tacticalVerdict?: string;
  managerCritique?: {
    home: string;
    away: string;
  };
  headline?: string;
  verdict?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName?: string;
  playerRole?: string;
  message: string;
  response?: string;
  actionTaken?: string;
  timestamp?: number;
  minute?: number;
  sender?: "manager" | "agent";
  text?: string;
  time?: string;
  rating?: number;
}

export interface GameSnapshot {
  phase: "kickoff" | "live" | "goal" | "halftime" | "fulltime";
  currentHalf: 1 | 2;
  elapsedSeconds: number;
  matchDuration: number;
  matchPace?: number;
  score: { home: number; away: number };
  subsRemaining?: { home: number; away: number };
  benchSubs?: { home: SubAgent[]; away: SubAgent[] };
  stats: MatchStats;
  ball: BallState;
  players: PlayerState[];
  activeThought: ActiveThought | null;
  latestEvent: MatchEvent | null;
  events: MatchEvent[];
  postMatchSummary?: PostMatchSummary | null;
  crowdAtmosphere?: CrowdAtmosphere;
  playerFeedback?: PlayerFeedback[];
  fanFeedback?: FanFeedback;
  chairpersonFeedback?: ChairpersonFeedback;
  homeTeam: {
    name: string;
    color: string;
    secondaryColor: string;
    formation: Formation;
  };
  awayTeam: {
    name: string;
    color: string;
    secondaryColor: string;
    formation: Formation;
  };
}

export interface FanFeedback {
  sentiment: number; // 0 - 100
  status: "Ecstatic" | "Optimistic" | "Nervous" | "Discontent" | "Hostile";
  chant: string;
  moraleEffect: string;
}

export interface ChairpersonFeedback {
  boardConfidence: number; // 0 - 100
  status: "Delighted" | "Satisfied" | "Cautious" | "Under Pressure";
  message: string;
  influence: string;
}

export interface LLMTelemetryEntry {
  id: string;
  timestamp: number;
  model: string;
  type: "player_chat" | "club_feedback" | "inner_thought" | "tactical_eval";
  targetName?: string;
  role?: string;
  systemPrompt: string;
  userPrompt: string;
  response: string;
  reasoningTrace?: string;
  latencyMs: number;
  tokenCount?: number;
}

export interface LLMModelInfo {
  name: string;
  sizeBytes?: number;
  family?: string;
  parameterSize?: string;
  quantizationLevel?: string;
  contextLength?: number;
  modifiedAt?: string;
}

export interface LeagueClubStanding {
  id: string;
  name: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: ("W" | "D" | "L")[];
  prevRank: number;
  currentRank: number;
}

export interface SubAgentConfig {
  name: string;
  role: string;
  prompt: string;
}

export interface LeagueMatchHistoryItem {
  id: string;
  gameweek: number;
  home: string;
  away: string;
  score: string;
  time: string;
}

export interface CalendarState {
  date: string;
  isoDate: string;
  dayOfWeek: number;
  dayName: string;
  activityType: "rest" | "tactical_training" | "technical_training" | "match";
  activityDesc: string;
  isMatchday: boolean;
  currentGameweek: number;
  activeTier: string;
  lastTrainingLog?: {
    date: string;
    type: string;
    prompt: string;
    result: string;
  };
}

export interface CalendarScheduleItem {
  dateStr: string;
  dayOfWeek: number;
  type: "rest" | "tactical_training" | "technical_training" | "match";
  name: string;
  isMatchday: boolean;
  isToday: boolean;
}

export interface SeasonConclusionOutcome {
  standings: LeagueClubStanding[];
  champions: LeagueClubStanding;
  promotedTeams: LeagueClubStanding[];
  relegatedTeams: LeagueClubStanding[];
  userOutcome: {
    isUserPromoted: boolean;
    isUserRelegated: boolean;
    isUserChampion: boolean;
    currentTier: string;
    nextTier: string;
    financialBonus: number;
    fanSentimentImpact: number;
    boardMemo: string;
    title: string;
  };
}
