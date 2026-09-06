// server/engine/build4Tiers.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define 80 authentic clubs across 4 tiers
const TIER_1_CLUBS = [
  { id: "arsenal", name: "Arsenal", shortName: "ARS", color: "#EF0107", secondaryColor: "#023474" },
  { id: "man-city", name: "Manchester City", shortName: "MCI", color: "#6CABDD", secondaryColor: "#1C2C5B" },
  { id: "liverpool", name: "Liverpool", shortName: "LIV", color: "#C8102E", secondaryColor: "#00B2A9" },
  { id: "chelsea", name: "Chelsea", shortName: "CHE", color: "#034694", secondaryColor: "#EE242C" },
  { id: "man-united", name: "Manchester United", shortName: "MUN", color: "#DA291C", secondaryColor: "#FBE122" },
  { id: "tottenham", name: "Tottenham Hotspur", shortName: "TOT", color: "#132257", secondaryColor: "#EAEAEA" },
  { id: "newcastle", name: "Newcastle United", shortName: "NEW", color: "#241F20", secondaryColor: "#41B6E6" },
  { id: "aston-villa", name: "Aston Villa", shortName: "AVL", color: "#95BFE5", secondaryColor: "#670E36" },
  { id: "real-madrid", name: "Real Madrid", shortName: "RMA", color: "#FEBE10", secondaryColor: "#00529F" },
  { id: "barcelona", name: "Barcelona", shortName: "BAR", color: "#004D98", secondaryColor: "#A50044" },
  { id: "bayern-munich", name: "Bayern Munich", shortName: "BAY", color: "#DC052D", secondaryColor: "#0066B2" },
  { id: "paris-sg", name: "Paris Saint-Germain", shortName: "PSG", color: "#004170", secondaryColor: "#DA291C" },
  { id: "inter-milan", name: "Inter Milan", shortName: "INT", color: "#010E80", secondaryColor: "#0093E9" },
  { id: "ac-milan", name: "AC Milan", shortName: "ACM", color: "#FB090B", secondaryColor: "#000000" },
  { id: "juventus", name: "Juventus", shortName: "JUV", color: "#1B1B1B", secondaryColor: "#D69A28" },
  { id: "bayer-leverkusen", name: "Bayer Leverkusen", shortName: "B04", color: "#E32221", secondaryColor: "#FBE600" },
  { id: "atletico-madrid", name: "Atletico Madrid", shortName: "ATM", color: "#CB3524", secondaryColor: "#272E61" },
  { id: "dortmund", name: "Borussia Dortmund", shortName: "BVB", color: "#FDE100", secondaryColor: "#000000" },
  { id: "benfica", name: "SL Benfica", shortName: "SLB", color: "#E41B17", secondaryColor: "#FFFFFF" },
  { id: "ajax", name: "Ajax Amsterdam", shortName: "AJX", color: "#D2122E", secondaryColor: "#FFFFFF" },
];

const TIER_2_CLUBS = [
  { id: "leeds", name: "Leeds United", shortName: "LEE", color: "#FFCD00", secondaryColor: "#1D428A" },
  { id: "leicester", name: "Leicester City", shortName: "LEI", color: "#003090", secondaryColor: "#FDBE11" },
  { id: "southampton", name: "Southampton", shortName: "SOU", color: "#D71920", secondaryColor: "#130C0E" },
  { id: "west-ham", name: "West Ham United", shortName: "WHU", color: "#7A263A", secondaryColor: "#1BB1E7" },
  { id: "wolves", name: "Wolverhampton", shortName: "WOL", color: "#FDB913", secondaryColor: "#231F20" },
  { id: "everton", name: "Everton", shortName: "EVE", color: "#003399", secondaryColor: "#FFFFFF" },
  { id: "brighton", name: "Brighton & Hove", shortName: "BHA", color: "#0057B8", secondaryColor: "#FFCD00" },
  { id: "fulham", name: "Fulham", shortName: "FUL", color: "#CC0000", secondaryColor: "#000000" },
  { id: "crystal-palace", name: "Crystal Palace", shortName: "CRY", color: "#1B458F", secondaryColor: "#C4122E" },
  { id: "brentford", name: "Brentford", shortName: "BRE", color: "#E30613", secondaryColor: "#FBB900" },
  { id: "celtic", name: "Celtic FC", shortName: "CEL", color: "#018749", secondaryColor: "#FFE600" },
  { id: "rangers", name: "Rangers FC", shortName: "RAN", color: "#0038A8", secondaryColor: "#D3122A" },
  { id: "porto", name: "FC Porto", shortName: "FCP", color: "#0038A8", secondaryColor: "#EA6D00" },
  { id: "sporting", name: "Sporting CP", shortName: "SCP", color: "#006633", secondaryColor: "#FFCC00" },
  { id: "sevilla", name: "Sevilla FC", shortName: "SEV", color: "#D4001F", secondaryColor: "#FFFFFF" },
  { id: "valencia", name: "Valencia CF", shortName: "VAL", color: "#EE7500", secondaryColor: "#1D1D1B" },
  { id: "as-roma", name: "AS Roma", shortName: "ASR", color: "#8E1F2F", secondaryColor: "#F0BC42" },
  { id: "napoli", name: "SSC Napoli", shortName: "NAP", color: "#003C82", secondaryColor: "#0080FF" },
  { id: "monaco", name: "AS Monaco", shortName: "ASM", color: "#E30613", secondaryColor: "#CCA300" },
  { id: "lyon", name: "Olympique Lyonnais", shortName: "OL", color: "#002F6C", secondaryColor: "#DA291C" },
];

const TIER_3_CLUBS = [
  { id: "sunderland", name: "Sunderland", shortName: "SUN", color: "#EB172B", secondaryColor: "#231F20" },
  { id: "middlesbrough", name: "Middlesbrough", shortName: "MID", color: "#E21E28", secondaryColor: "#FFFFFF" },
  { id: "blackburn", name: "Blackburn Rovers", shortName: "BLA", color: "#009EE0", secondaryColor: "#D81A21" },
  { id: "sheffield-utd", name: "Sheffield United", shortName: "SHU", color: "#EE2737", secondaryColor: "#000000" },
  { id: "norwich", name: "Norwich City", shortName: "NOR", color: "#00A650", secondaryColor: "#FFF200" },
  { id: "watford", name: "Watford", shortName: "WAT", color: "#FBEE23", secondaryColor: "#ED2127" },
  { id: "coventry", name: "Coventry City", shortName: "COV", color: "#00A3E0", secondaryColor: "#1D252C" },
  { id: "derby", name: "Derby County", shortName: "DER", color: "#FFFFFF", secondaryColor: "#000000" },
  { id: "stoke", name: "Stoke City", shortName: "STK", color: "#E03A3E", secondaryColor: "#002D62" },
  { id: "preston", name: "Preston North End", shortName: "PNE", color: "#FFFFFF", secondaryColor: "#002B49" },
  { id: "hull-city", name: "Hull City", shortName: "HUL", color: "#F5971E", secondaryColor: "#000000" },
  { id: "swansea", name: "Swansea City", shortName: "SWA", color: "#FFFFFF", secondaryColor: "#121212" },
  { id: "qpr", name: "Queens Park Rangers", shortName: "QPR", color: "#1D70B8", secondaryColor: "#D61A21" },
  { id: "bristol-city", name: "Bristol City", shortName: "BRC", color: "#C8102E", secondaryColor: "#000000" },
  { id: "millwall", name: "Millwall", shortName: "MIL", color: "#001E62", secondaryColor: "#FFFFFF" },
  { id: "plymouth", name: "Plymouth Argyle", shortName: "PLY", color: "#124734", secondaryColor: "#FFFFFF" },
  { id: "portsmouth", name: "Portsmouth", shortName: "POR", color: "#001489", secondaryColor: "#D0103A" },
  { id: "cardiff", name: "Cardiff City", shortName: "CAR", color: "#0047AB", secondaryColor: "#E30613" },
  { id: "oxford", name: "Oxford United", shortName: "OXF", color: "#FFE600", secondaryColor: "#002B49" },
  { id: "luton", name: "Luton Town", shortName: "LUT", color: "#FA4616", secondaryColor: "#002D62" },
];

const TIER_4_CLUBS = [
  { id: "wrexham", name: "Wrexham AFC", shortName: "WRX", color: "#C8102E", secondaryColor: "#007A33" },
  { id: "chesterfield", name: "Chesterfield", shortName: "CHF", color: "#0055A5", secondaryColor: "#FFFFFF" },
  { id: "barnet", name: "Barnet FC", shortName: "BAR", color: "#F47920", secondaryColor: "#000000" },
  { id: "notts-county", name: "Notts County", shortName: "NTC", color: "#000000", secondaryColor: "#FFFFFF" },
  { id: "bromley", name: "Bromley", shortName: "BRO", color: "#000000", secondaryColor: "#E30613" },
  { id: "oldham", name: "Oldham Athletic", shortName: "OLD", color: "#003399", secondaryColor: "#FF6600" },
  { id: "york-city", name: "York City", shortName: "YOR", color: "#C8102E", secondaryColor: "#00205B" },
  { id: "southend", name: "Southend United", shortName: "SOU", color: "#002D62", secondaryColor: "#FFCC00" },
  { id: "rochdale", name: "Rochdale", shortName: "ROC", color: "#0055A5", secondaryColor: "#000000" },
  { id: "hartlepool", name: "Hartlepool United", shortName: "HAR", color: "#003399", secondaryColor: "#FFFFFF" },
  { id: "grimsby", name: "Grimsby Town", shortName: "GRI", color: "#000000", secondaryColor: "#C8102E" },
  { id: "scunthorpe", name: "Scunthorpe United", shortName: "SCU", color: "#670E36", secondaryColor: "#95BFE5" },
  { id: "torquay", name: "Torquay United", shortName: "TOR", color: "#FDB913", secondaryColor: "#0038A8" },
  { id: "yeovil", name: "Yeovil Town", shortName: "YEO", color: "#006837", secondaryColor: "#FFFFFF" },
  { id: "aldershot", name: "Aldershot Town", shortName: "ALD", color: "#C8102E", secondaryColor: "#00205B" },
  { id: "dagenham", name: "Dagenham & Redbridge", shortName: "DAG", color: "#C8102E", secondaryColor: "#002B49" },
  { id: "wealdstone", name: "Wealdstone", shortName: "WEA", color: "#0038A8", secondaryColor: "#FFFFFF" },
  { id: "solihull", name: "Solihull Moors", shortName: "SOL", color: "#FFE600", secondaryColor: "#0038A8" },
  { id: "forest-green", name: "Forest Green Rovers", shortName: "FGR", color: "#74D700", secondaryColor: "#000000" },
  { id: "halifax", name: "FC Halifax Town", shortName: "HAL", color: "#0038A8", secondaryColor: "#FFFFFF" },
];

const POSITIONS = [
  { num: 1, role: "GK" },
  { num: 2, role: "RB" },
  { num: 3, role: "CB" },
  { num: 4, role: "CB" },
  { num: 5, role: "LB" },
  { num: 6, role: "CDM" },
  { num: 7, role: "RW" },
  { num: 8, role: "CAM" },
  { num: 9, role: "ST" },
  { num: 10, role: "CM" },
  { num: 11, role: "LW" },
  { num: 12, role: "SUB_GK" },
  { num: 13, role: "SUB_DEF" },
  { num: 14, role: "SUB_FWD" },
];

// Tier configuration parameters
const TIER_SPECS = {
  tier_1: {
    name: "Premier Championship",
    ratingMin: 7.8,
    ratingMax: 9.3,
    valMin: 25.0,
    valMax: 110.0,
    tacticalMastery: 85,
    budget: 80.0,
    tierNum: 1,
  },
  tier_2: {
    name: "Division One",
    ratingMin: 6.8,
    ratingMax: 7.8,
    valMin: 3.5,
    valMax: 18.0,
    tacticalMastery: 74,
    budget: 25.0,
    tierNum: 2,
  },
  tier_3: {
    name: "Division Two",
    ratingMin: 6.0,
    ratingMax: 6.9,
    valMin: 0.6,
    valMax: 3.0,
    tacticalMastery: 64,
    budget: 8.0,
    tierNum: 3,
  },
  tier_4: {
    name: "National League",
    ratingMin: 5.2,
    ratingMax: 6.2,
    valMin: 0.1,
    valMax: 0.6,
    tacticalMastery: 50,
    budget: 1.5,
    tierNum: 4,
  },
};

// Player name generator pools
const FIRST_NAMES = ["Jack", "Liam", "Harry", "Oliver", "George", "Leo", "Noah", "Freddie", "Charlie", "Arthur", "Archie", "Mason", "Jacob", "Ethan", "Lucas", "James", "Isaac", "Theo", "Alexander", "Daniel", "Thomas", "Oscar", "Alfie", "Joshua", "Logan", "Max", "Callum", "William", "Lucas", "Reuben", "Finley", "Harvey", "Toby", "Caleb", "Elliott", "Harrison", "Sebastian", "Elijah", "Lewis", "Jayden"];
const LAST_NAMES = ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Wood", "Harris", "Martin", "Jackson", "Clarke", "Clark", "Turner", "Hill", "Scott", "Cooper", "Morris", "Ward", "Moore", "King", "Watson", "Baker", "Harrison", "Morgan", "Patel", "Young"];

function getRandomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

// Define 7 distinct personality traits
export const PERSONALITY_TRAITS = [
  {
    id: "creative",
    name: "Creative",
    icon: "🧠",
    description: "High vision and flair, thrives on expressive prompts, invents unexpected passing lanes",
    traitResonanceBias: { pass: 1.25, attack: 1.2, discipline: 0.8 }
  },
  {
    id: "methodical",
    name: "Methodical",
    icon: "🛡️",
    description: "Disciplined and structured, master of positional containment and defensive shape",
    traitResonanceBias: { discipline: 1.3, tackle: 1.2, chaos: 0.7 }
  },
  {
    id: "flair",
    name: "Flair",
    icon: "⚡",
    description: "Audacious dribbler, loves 1v1 duels, chips, and crowd-pleasing moments",
    traitResonanceBias: { dribble: 1.35, shot: 1.2, defend: 0.75 }
  },
  {
    id: "aggressive",
    name: "Aggressive",
    icon: "🔥",
    description: "Tenacious enforcer, ferocious pressing and slide tackles, passionate, risk of cards",
    traitResonanceBias: { press: 1.35, tackle: 1.3, calm: 0.7 }
  },
  {
    id: "leader",
    name: "Leader",
    icon: "👑",
    description: "Captain material, organizes teammates, stabilizes team composure under heavy pressure",
    traitResonanceBias: { leadership: 1.3, harmony: 1.25, composure: 1.2 }
  },
  {
    id: "sensitive",
    name: "Sensitive",
    icon: "🎭",
    description: "Emotionally driven; sulks under harsh shouts, but surges with positive encouragement",
    traitResonanceBias: { praise: 1.35, rebuke: 0.6, motivation: 1.2 }
  },
  {
    id: "tenacious",
    name: "Tenacious",
    icon: "⚙️",
    description: "Tireless workhorse, relentless work rate and stamina retention, never gives up",
    traitResonanceBias: { workRate: 1.35, stamina: 1.25, press: 1.2 }
  },
];

function getRandomTrait() {
  return PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)];
}

function buildClubSquad(clubDef, tierKey) {
  const spec = TIER_SPECS[tierKey];
  const starting11 = [];
  const benchSubs = [];

  POSITIONS.forEach((pos) => {
    const isStarter = pos.num <= 11;
    const ratingRange = spec.ratingMax - spec.ratingMin;
    const rating = +(spec.ratingMin + Math.random() * ratingRange).toFixed(1);
    const valRange = spec.valMax - spec.valMin;
    const transferValue = +(spec.valMin + Math.random() * valRange).toFixed(2);
    const mastery = Math.round(spec.tacticalMastery + (Math.random() * 8 - 4));
    const potentialRating = +(Math.min(9.5, rating + (tierKey === "tier_4" ? 1.6 + Math.random() * 1.8 : 0.8 + Math.random() * 1.0))).toFixed(1);
    const trait = getRandomTrait();

    const playerObj = {
      number: pos.num,
      name: getRandomName(),
      role: pos.role.replace("SUB_", ""),
      rating,
      potentialRating,
      transferValue,
      tacticalMastery: mastery,
      tier: spec.tierNum,
      personalityTrait: trait.name,
      personalityTraitId: trait.id,
      personalityIcon: trait.icon,
      personalityDescription: trait.description,
      health: 100,
      stamina: 100,
      matchSharpness: 80,
      growthPoints: 0,
    };

    if (isStarter) {
      starting11.push(playerObj);
    } else {
      benchSubs.push(playerObj);
    }
  });

  return {
    ...clubDef,
    tier: tierKey,
    tierName: spec.name,
    budget: spec.budget,
    formation: "4-3-3",
    starting11,
    benchSubs,
  };
}

// Generate all 80 clubs
const allClubs = [
  ...TIER_1_CLUBS.map((c) => buildClubSquad(c, "tier_1")),
  ...TIER_2_CLUBS.map((c) => buildClubSquad(c, "tier_2")),
  ...TIER_3_CLUBS.map((c) => buildClubSquad(c, "tier_3")),
  ...TIER_4_CLUBS.map((c) => buildClubSquad(c, "tier_4")),
];

// Build realistic transfer targets across all 4 tiers + Free Agents
const marketListings = [];
let mktId = 1;

["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST"].forEach((role) => {
  ["tier_1", "tier_2", "tier_3", "tier_4"].forEach((tierKey) => {
    const spec = TIER_SPECS[tierKey];
    const clubsInTier = allClubs.filter((c) => c.tier === tierKey);

    // Generate 4 targets per role per tier (160 targets total)
    for (let i = 0; i < 4; i++) {
      const isFreeAgent = i === 0 && tierKey !== "tier_1"; // Free agents in tiers 2, 3, 4
      const sellerClub = isFreeAgent
        ? "Free Agent (Unattached)"
        : clubsInTier[Math.floor(Math.random() * clubsInTier.length)]?.name || "Independent FC";

      const ratingRange = spec.ratingMax - spec.ratingMin;
      const rating = +(spec.ratingMin + Math.random() * ratingRange).toFixed(1);
      const valRange = spec.valMax - spec.valMin;
      // Free agents have lower signing fee
      const transferValue = isFreeAgent
        ? +(Math.max(0.05, (spec.valMin + Math.random() * valRange * 0.4))).toFixed(2)
        : +(spec.valMin + Math.random() * valRange).toFixed(2);

      const trait = getRandomTrait();
      const potential = +(Math.min(9.5, rating + (tierKey === "tier_4" ? 1.8 + Math.random() * 1.5 : 0.8 + Math.random() * 1.0))).toFixed(1);

      // Wage demands in £k per week
      const weeklyWage = tierKey === "tier_4"
        ? Math.round(1 + Math.random() * 2) // £1k - £3k/wk
        : tierKey === "tier_3"
        ? Math.round(4 + Math.random() * 8) // £4k - £12k/wk
        : tierKey === "tier_2"
        ? Math.round(20 + Math.random() * 35) // £20k - £55k/wk
        : Math.round(120 + Math.random() * 180); // £120k - £300k/wk

      // Scout verdict
      let scoutReport = "";
      if (tierKey === "tier_1") {
        scoutReport = `World-class ${role}. High international pedigree. Will flatly decline moves to lower divisions.`;
      } else if (tierKey === "tier_2") {
        scoutReport = `Proven championship performer. Demands ambitious project and high wages to consider a drop down.`;
      } else if (tierKey === "tier_3") {
        scoutReport = `Solid professional in prime development years. Very reachable for an ambitious grassroots club with budget.`;
      } else {
        scoutReport = isFreeAgent
          ? `Available on a free transfer! Immediate starter in the National League with high hunger to prove himself.`
          : `Standout National League ${role}. Ready for regular first-team football with room for breakthrough coaching.`;
      }

      marketListings.push({
        id: `mkt_${mktId++}`,
        name: getRandomName(),
        role,
        club: sellerClub,
        tier: spec.tierNum,
        tierKey,
        tierName: spec.name,
        rating,
        potentialRating: potential,
        transferValue,
        weeklyWage,
        isFreeAgent,
        personalityTrait: trait.name,
        personalityTraitId: trait.id,
        personalityIcon: trait.icon,
        personalityDescription: trait.description,
        tacticalMastery: spec.tacticalMastery,
        promptCapability: `${trait.name} ${role} (Tier ${spec.tierNum})`,
        scoutReport,
        status: "available",
      });
    }
  });
});

const outputDb = {
  version: "2025.4-tiers-ai-cognition",
  traits: PERSONALITY_TRAITS,
  tiers: {
    tier_1: { id: "tier_1", name: "Premier Championship", clubs: TIER_1_CLUBS.map((c) => c.id) },
    tier_2: { id: "tier_2", name: "Division One", clubs: TIER_2_CLUBS.map((c) => c.id) },
    tier_3: { id: "tier_3", name: "Division Two", clubs: TIER_3_CLUBS.map((c) => c.id) },
    tier_4: { id: "tier_4", name: "National League", clubs: TIER_4_CLUBS.map((c) => c.id) },
  },
  clubs: allClubs,
  marketListings,
  totalPlayersInPool: allClubs.length * 14 + marketListings.length,
};

const targetPath = path.join(__dirname, "../data/cm2025Database.json");
fs.writeFileSync(targetPath, JSON.stringify(outputDb, null, 2), "utf-8");
console.log(`✅ Successfully compiled 4-Tier Database with ${allClubs.length} clubs, ${marketListings.length} transfer targets, and ${outputDb.totalPlayersInPool} total players with personality traits into ${targetPath}`);

