// src/utils/avatarUtils.ts
// Cartoon-Based Player Avatar Generator for IBM Carbon Theme

export interface AvatarStyle {
  id: string;
  skinTone: string;
  skinShadow: string;
  hairColor: string;
  hairStyle: string; // 'curls_beard' | 'braids' | 'topknot' | 'quiff' | 'blonde_sweep' | 'afro' | 'buzz' | 'waves' | 'manager'
  facialHair?: 'full_beard' | 'goatee' | 'stubble' | 'mustache' | 'none';
  eyeColor: string;
  bgFill: string;
  jerseyColor: string;
  collarColor: string;
  flag?: string;
}

// Preset Signatures for Famous Football Stars
const STAR_PRESETS: Record<string, AvatarStyle> = {
  salah: {
    id: "salah",
    skinTone: "#C68642",
    skinShadow: "#A66A2E",
    hairColor: "#1A1A1A",
    hairStyle: "curls_beard",
    facialHair: "full_beard",
    eyeColor: "#2B1A09",
    bgFill: "#E8F8F5",
    jerseyColor: "#C8102E",
    collarColor: "#FFFFFF",
    flag: "🇪🇬",
  },
  "alexander-arnold": {
    id: "trent",
    skinTone: "#A06030",
    skinShadow: "#804820",
    hairColor: "#111111",
    hairStyle: "braids",
    facialHair: "mustache",
    eyeColor: "#1A1A1A",
    bgFill: "#EDF5FF",
    jerseyColor: "#C8102E",
    collarColor: "#FFFFFF",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  "van dijk": {
    id: "vandijk",
    skinTone: "#B37848",
    skinShadow: "#925D34",
    hairColor: "#141414",
    hairStyle: "topknot",
    facialHair: "goatee",
    eyeColor: "#2A1810",
    bgFill: "#FEF9E7",
    jerseyColor: "#C8102E",
    collarColor: "#FFFFFF",
    flag: "🇳🇱",
  },
  alisson: {
    id: "alisson",
    skinTone: "#E8B896",
    skinShadow: "#C99672",
    hairColor: "#24180F",
    hairStyle: "quiff",
    facialHair: "full_beard",
    eyeColor: "#3D2714",
    bgFill: "#EBF5FB",
    jerseyColor: "#000000",
    collarColor: "#FFCC00",
    flag: "🇧🇷",
  },
  fernandes: {
    id: "fernandes",
    skinTone: "#E5B695",
    skinShadow: "#C89574",
    hairColor: "#1F1A17",
    hairStyle: "quiff",
    facialHair: "stubble",
    eyeColor: "#332211",
    bgFill: "#FDF2E9",
    jerseyColor: "#DA291C",
    collarColor: "#FFFFFF",
    flag: "🇵🇹",
  },
  haaland: {
    id: "haaland",
    skinTone: "#FCE1CE",
    skinShadow: "#E2BFAB",
    hairColor: "#E8C872",
    hairStyle: "blonde_sweep",
    facialHair: "none",
    eyeColor: "#3A75C4",
    bgFill: "#E8F8F5",
    jerseyColor: "#6CABDD",
    collarColor: "#FFFFFF",
    flag: "🇳🇴",
  },
  bellingham: {
    id: "bellingham",
    skinTone: "#7D4E2D",
    skinShadow: "#613A1F",
    hairColor: "#101010",
    hairStyle: "afro",
    facialHair: "none",
    eyeColor: "#1C140E",
    bgFill: "#EDF5FF",
    jerseyColor: "#FFFFFF",
    collarColor: "#0F62FE",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  rice: {
    id: "rice",
    skinTone: "#FAD8C3",
    skinShadow: "#DAB29C",
    hairColor: "#4A3728",
    hairStyle: "buzz",
    facialHair: "stubble",
    eyeColor: "#2E4057",
    bgFill: "#FEF9E7",
    jerseyColor: "#EF0107",
    collarColor: "#FFFFFF",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  rashford: {
    id: "rashford",
    skinTone: "#6D4024",
    skinShadow: "#502D17",
    hairColor: "#121212",
    hairStyle: "afro",
    facialHair: "stubble",
    eyeColor: "#1A1A1A",
    bgFill: "#FDF2E9",
    jerseyColor: "#DA291C",
    collarColor: "#000000",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  manager: {
    id: "manager",
    skinTone: "#F5CEB5",
    skinShadow: "#D4A98E",
    hairColor: "#2E241F",
    hairStyle: "manager",
    facialHair: "stubble",
    eyeColor: "#34495E",
    bgFill: "#DEFBE6",
    jerseyColor: "#0F6B45",
    collarColor: "#FFFFFF",
    flag: "👔",
  },
};

const GENERIC_SKIN_TONES = [
  { skin: "#FCD7B8", shadow: "#E0B392" },
  { skin: "#E4B188", shadow: "#C49067" },
  { skin: "#B87A4C", shadow: "#965E32" },
  { skin: "#87532B", shadow: "#6B3E1D" },
  { skin: "#4F2E18", shadow: "#3A1F0E" },
];

const GENERIC_HAIR_COLORS = ["#1A1A1A", "#332218", "#593B26", "#D9B464", "#A64B2A", "#636059"];
const GENERIC_HAIR_STYLES = [
  "curls_beard",
  "braids",
  "topknot",
  "quiff",
  "blonde_sweep",
  "afro",
  "buzz",
  "waves",
];
const GENERIC_FACIAL_HAIR: ("none" | "stubble" | "goatee" | "full_beard")[] = [
  "none",
  "stubble",
  "goatee",
  "full_beard",
  "none",
];
const GENERIC_BG_COLORS = ["#EBF5FB", "#E8F8F5", "#FEF9E7", "#FDF2E9", "#EDF5FF", "#F4ECF7"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlayerAvatarStyle(playerName: string, defaultJerseyColor = "#0F6B45"): AvatarStyle {
  if (!playerName) return STAR_PRESETS.manager;
  const lower = playerName.toLowerCase();

  for (const key of Object.keys(STAR_PRESETS)) {
    if (lower.includes(key)) {
      return STAR_PRESETS[key];
    }
  }

  const hash = hashString(playerName);
  const skinPair = GENERIC_SKIN_TONES[hash % GENERIC_SKIN_TONES.length];
  const hairColor = GENERIC_HAIR_COLORS[(hash >> 2) % GENERIC_HAIR_COLORS.length];
  const hairStyle = GENERIC_HAIR_STYLES[(hash >> 4) % GENERIC_HAIR_STYLES.length];
  const facialHair = GENERIC_FACIAL_HAIR[(hash >> 6) % GENERIC_FACIAL_HAIR.length];
  const bgFill = GENERIC_BG_COLORS[(hash >> 8) % GENERIC_BG_COLORS.length];

  return {
    id: `p_${hash}`,
    skinTone: skinPair.skin,
    skinShadow: skinPair.shadow,
    hairColor,
    hairStyle,
    facialHair,
    eyeColor: "#1A1A1A",
    bgFill,
    jerseyColor: defaultJerseyColor,
    collarColor: "#FFFFFF",
    flag: "⚽",
  };
}

// Generate an inline Cartoon SVG string
export function generateCartoonAvatarSvg(playerName: string, defaultJerseyColor = "#0F6B45"): string {
  const style = getPlayerAvatarStyle(playerName, defaultJerseyColor);
  const { skinTone, skinShadow, hairColor, hairStyle, facialHair, bgFill, jerseyColor, collarColor } = style;

  // Hair SVG snippet based on hairStyle
  let hairSvg = "";
  if (hairStyle === "curls_beard") {
    hairSvg = `
      <!-- Curly textured afro curls -->
      <path d="M 28 42 C 24 30, 32 18, 45 16 C 55 14, 68 15, 74 22 C 82 28, 80 42, 74 46 C 70 34, 60 26, 48 26 C 36 26, 30 34, 28 42 Z" fill="${hairColor}" />
      <circle cx="28" cy="32" r="7" fill="${hairColor}" />
      <circle cx="38" cy="20" r="8" fill="${hairColor}" />
      <circle cx="50" cy="18" r="8.5" fill="${hairColor}" />
      <circle cx="62" cy="20" r="8" fill="${hairColor}" />
      <circle cx="72" cy="30" r="7.5" fill="${hairColor}" />
    `;
  } else if (hairStyle === "braids") {
    hairSvg = `
      <!-- Braids / Dreadlocks -->
      <path d="M 30 38 C 30 22, 40 18, 50 18 C 60 18, 70 22, 70 38 Z" fill="${hairColor}" />
      <line x1="34" y1="28" x2="30" y2="52" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
      <line x1="42" y1="22" x2="38" y2="54" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
      <line x1="50" y1="20" x2="50" y2="48" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
      <line x1="58" y1="22" x2="62" y2="54" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
      <line x1="66" y1="28" x2="70" y2="52" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
    `;
  } else if (hairStyle === "topknot") {
    hairSvg = `
      <!-- Top knot bun and slicked sides -->
      <ellipse cx="50" cy="14" rx="8" ry="7" fill="${hairColor}" />
      <path d="M 32 40 C 32 24, 40 20, 50 20 C 60 20, 68 24, 68 40 C 64 30, 58 24, 50 24 C 42 24, 36 30, 32 40 Z" fill="${hairColor}" />
    `;
  } else if (hairStyle === "blonde_sweep") {
    hairSvg = `
      <!-- Swept back blonde hair / ponytail -->
      <path d="M 30 40 C 30 20, 42 16, 54 16 C 68 16, 74 24, 74 38 C 72 26, 62 22, 52 22 C 40 22, 34 30, 30 40 Z" fill="${hairColor}" />
      <path d="M 46 16 C 44 8, 54 6, 56 12 Z" fill="${hairColor}" />
      <path d="M 68 30 C 74 34, 76 45, 72 52 C 70 42, 68 36, 68 30 Z" fill="${hairColor}" />
    `;
  } else if (hairStyle === "afro") {
    hairSvg = `
      <!-- Afro fade -->
      <ellipse cx="50" cy="30" rx="22" ry="18" fill="${hairColor}" />
      <path d="M 32 42 C 32 30, 40 24, 50 24 C 60 24, 68 30, 68 42 Z" fill="${skinTone}" />
    `;
  } else if (hairStyle === "buzz") {
    hairSvg = `
      <!-- Clean short buzz cut -->
      <path d="M 32 40 C 32 26, 40 22, 50 22 C 60 22, 68 26, 68 40 C 64 32, 58 26, 50 26 C 42 26, 36 32, 32 40 Z" fill="${hairColor}" opacity="0.9" />
    `;
  } else if (hairStyle === "manager") {
    hairSvg = `
      <!-- Styled side part for Manager -->
      <path d="M 31 38 C 30 22, 42 18, 52 18 C 66 18, 70 24, 70 38 C 66 28, 58 24, 48 24 C 38 24, 34 30, 31 38 Z" fill="${hairColor}" />
      <path d="M 31 32 C 38 28, 48 26, 60 28 Z" stroke="${hairColor}" stroke-width="2" />
    `;
  } else {
    // Standard quiff / modern textured taper
    hairSvg = `
      <path d="M 32 38 C 30 22, 44 16, 54 16 C 66 16, 70 24, 70 38 C 65 28, 56 22, 48 22 C 40 22, 35 28, 32 38 Z" fill="${hairColor}" />
      <path d="M 44 16 C 48 10, 58 12, 60 18 Z" fill="${hairColor}" />
    `;
  }

  // Facial hair SVG
  let facialHairSvg = "";
  if (facialHair === "full_beard") {
    facialHairSvg = `
      <!-- Full beard -->
      <path d="M 34 54 C 34 74, 44 82, 50 82 C 56 82, 66 74, 66 54 C 62 62, 56 68, 50 68 C 44 68, 38 62, 34 54 Z" fill="${hairColor}" opacity="0.92" />
      <path d="M 44 60 C 47 58, 53 58, 56 60 C 53 62, 47 62, 44 60 Z" fill="${hairColor}" />
    `;
  } else if (facialHair === "goatee") {
    facialHairSvg = `
      <!-- Goatee -->
      <path d="M 45 66 C 45 78, 50 80, 50 80 C 50 80, 55 78, 55 66 C 53 70, 47 70, 45 66 Z" fill="${hairColor}" />
      <path d="M 44 60 C 47 58, 53 58, 56 60 Z" stroke="${hairColor}" stroke-width="2" />
    `;
  } else if (facialHair === "mustache") {
    facialHairSvg = `
      <!-- Trimmed mustache -->
      <path d="M 42 59 C 46 57, 54 57, 58 59 C 55 62, 45 62, 42 59 Z" fill="${hairColor}" />
    `;
  } else if (facialHair === "stubble") {
    facialHairSvg = `
      <!-- 5 o'clock shadow stubble -->
      <path d="M 36 56 C 36 72, 44 78, 50 78 C 56 78, 64 72, 64 56 C 60 62, 56 66, 50 66 C 44 66, 40 62, 36 56 Z" fill="${hairColor}" opacity="0.25" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Circular Background Badge -->
      <circle cx="50" cy="50" r="48" fill="${bgFill}" />

      <!-- Shoulders / Jersey -->
      <path d="M 20 96 C 22 80, 34 76, 50 76 C 66 76, 78 80, 80 96 Z" fill="${jerseyColor}" />
      <!-- Jersey Collar -->
      <path d="M 40 76 L 50 86 L 60 76 Z" fill="${collarColor}" />
      
      <!-- Neck -->
      <rect x="44" y="62" width="12" height="16" fill="${skinShadow}" rx="2" />
      
      <!-- Head Base -->
      <ellipse cx="50" cy="48" rx="18" ry="22" fill="${skinTone}" />
      
      <!-- Ears -->
      <circle cx="31" cy="48" r="4.5" fill="${skinTone}" />
      <circle cx="69" cy="48" r="4.5" fill="${skinTone}" />
      <circle cx="31" cy="48" r="2.5" fill="${skinShadow}" />
      <circle cx="69" cy="48" r="2.5" fill="${skinShadow}" />

      <!-- Eyes & Eyebrows -->
      <!-- Left Eyebrow -->
      <path d="M 39 40 Q 43 38 47 40" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <!-- Right Eyebrow -->
      <path d="M 53 40 Q 57 38 61 40" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
      
      <!-- Left Eye -->
      <ellipse cx="43" cy="46" rx="2.8" ry="3.2" fill="#FFFFFF" />
      <circle cx="43.5" cy="46" r="1.8" fill="${hairColor}" />
      <circle cx="44.2" cy="45.2" r="0.7" fill="#FFFFFF" />
      
      <!-- Right Eye -->
      <ellipse cx="57" cy="46" rx="2.8" ry="3.2" fill="#FFFFFF" />
      <circle cx="56.5" cy="46" r="1.8" fill="${hairColor}" />
      <circle cx="57.2" cy="45.2" r="0.7" fill="#FFFFFF" />

      <!-- Nose -->
      <path d="M 50 46 L 49 53 L 52 53" stroke="${skinShadow}" stroke-width="1.8" stroke-linecap="round" fill="none" />

      <!-- Mouth -->
      <path d="M 45 61 Q 50 64 55 61" stroke="${skinShadow}" stroke-width="1.8" stroke-linecap="round" fill="none" />

      <!-- Facial Hair (if any) -->
      ${facialHairSvg}

      <!-- Hair Style -->
      ${hairSvg}
    </svg>
  `.trim();
}

export function getCartoonAvatarDataUrl(playerName: string, defaultJerseyColor = "#0F6B45"): string {
  const svg = generateCartoonAvatarSvg(playerName, defaultJerseyColor);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
