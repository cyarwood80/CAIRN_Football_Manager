// src/components/PitchCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { GameSnapshot, PlayerState } from "../types";

interface PitchCanvasProps {
  gameState: GameSnapshot | null;
  homeTeam?: { name: string; color: string; formation?: string; starting11?: any[] };
  awayTeam?: { name: string; color: string; formation?: string };
  onPlayerClick?: (player: PlayerState) => void;
}

// Logical pitch dimensions
const PITCH_W = 1000;
const PITCH_H = 640;
const MARGIN = 20;

// Color clash resolution helpers
function parseColorToRgb(colorStr: string): [number, number, number] {
  if (!colorStr) return [100, 100, 100];
  const hex = colorStr.replace("#", "").trim();
  if (hex.length === 6) {
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  }
  if (hex.length === 3) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ];
  }
  return [100, 100, 100];
}

function getColorDistance(colorA: string, colorB: string): number {
  const [r1, g1, b1] = parseColorToRgb(colorA);
  const [r2, g2, b2] = parseColorToRgb(colorB);
  return Math.sqrt(
    Math.pow(r1 - r2, 2) * 0.3 +
    Math.pow(g1 - g2, 2) * 0.59 +
    Math.pow(b1 - b2, 2) * 0.11
  );
}

export function getContrastingTextColor(bgColor: string): string {
  const [r, g, b] = parseColorToRgb(bgColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0a0e1a" : "#ffffff";
}

export function resolveEffectiveAwayKit(
  homeColor: string,
  awayColor: string,
  awaySecondaryColor?: string
): { kitColor: string; isAwayStrip: boolean } {
  const dist = getColorDistance(homeColor, awayColor);
  if (dist < 75) {
    if (awaySecondaryColor && getColorDistance(homeColor, awaySecondaryColor) >= 75) {
      return { kitColor: awaySecondaryColor, isAwayStrip: true };
    }
    const [r, g, b] = parseColorToRgb(homeColor);
    // If home is reddish
    if (r > 150 && g < 90 && b < 90) {
      return { kitColor: "#facc15", isAwayStrip: true }; // High contrast yellow away kit
    }
    // If home is blueish
    if (b > 140 && r < 90) {
      return { kitColor: "#ffffff", isAwayStrip: true }; // High contrast white away kit
    }
    // Default high contrast away strip
    return { kitColor: "#f8fafc", isAwayStrip: true };
  }
  return { kitColor: awayColor, isAwayStrip: false };
}

const DEFAULT_ANCHORS_HOME: Record<string, { x: number; y: number }[]> = {
  "4-3-3": [
    { x: 50, y: 320 },   // 1: GK
    { x: 220, y: 530 },  // 2: RB
    { x: 180, y: 250 },  // 3: CB_L
    { x: 180, y: 390 },  // 4: CB_R
    { x: 220, y: 110 },  // 5: LB
    { x: 380, y: 320 },  // 6: CDM
    { x: 720, y: 530 },  // 7: RW
    { x: 550, y: 390 },  // 8: CAM
    { x: 780, y: 320 },  // 9: ST
    { x: 550, y: 250 },  // 10: CM
    { x: 720, y: 110 },  // 11: LW
  ],
  "4-4-2": [
    { x: 50, y: 320 },   // 1: GK
    { x: 220, y: 530 },  // 2: RB
    { x: 180, y: 250 },  // 3: CB_L
    { x: 180, y: 390 },  // 4: CB_R
    { x: 220, y: 110 },  // 5: LB
    { x: 520, y: 530 },  // 6: RM
    { x: 480, y: 390 },  // 7: CM_R
    { x: 480, y: 250 },  // 8: CM_L
    { x: 760, y: 390 },  // 9: ST_R
    { x: 760, y: 250 },  // 10: ST_L
    { x: 520, y: 110 },  // 11: LM
  ],
  "3-5-2": [
    { x: 50, y: 320 },   // 1: GK
    { x: 190, y: 440 },  // 2: CB_R
    { x: 170, y: 320 },  // 3: CB_C
    { x: 190, y: 200 },  // 4: CB_L
    { x: 420, y: 550 },  // 5: RWB
    { x: 360, y: 320 },  // 6: CDM
    { x: 520, y: 400 },  // 7: CM_R
    { x: 600, y: 320 },  // 8: CAM
    { x: 770, y: 390 },  // 9: ST_R
    { x: 770, y: 250 },  // 10: ST_L
    { x: 420, y: 90 },   // 11: LWB
  ],
  "5-3-2": [
    { x: 50, y: 320 },   // 1: GK
    { x: 250, y: 540 },  // 2: RWB
    { x: 180, y: 430 },  // 3: CB_R
    { x: 160, y: 320 },  // 4: CB_C
    { x: 180, y: 210 },  // 5: CB_L
    { x: 250, y: 100 },  // 6: LWB
    { x: 380, y: 320 },  // 7: CDM
    { x: 500, y: 390 },  // 8: CM_R
    { x: 770, y: 390 },  // 9: ST_R
    { x: 770, y: 250 },  // 10: ST_L
    { x: 500, y: 250 },  // 11: CM_L
  ],
  "4-2-3-1": [
    { x: 50, y: 320 },   // 1: GK
    { x: 220, y: 530 },  // 2: RB
    { x: 180, y: 390 },  // 3: CB_R
    { x: 180, y: 250 },  // 4: CB_L
    { x: 220, y: 110 },  // 5: LB
    { x: 360, y: 390 },  // 6: CDM_R
    { x: 650, y: 530 },  // 7: RM
    { x: 360, y: 250 },  // 8: CDM_L
    { x: 800, y: 320 },  // 9: ST
    { x: 600, y: 320 },  // 10: CAM
    { x: 650, y: 110 },  // 11: LM
  ],
  "3-4-3": [
    { x: 50, y: 320 },   // 1: GK
    { x: 190, y: 440 },  // 2: CB_R
    { x: 170, y: 320 },  // 3: CB_C
    { x: 190, y: 200 },  // 4: CB_L
    { x: 480, y: 540 },  // 5: RM
    { x: 450, y: 390 },  // 6: CM_R
    { x: 760, y: 520 },  // 7: RW
    { x: 450, y: 250 },  // 8: CM_L
    { x: 820, y: 320 },  // 9: ST
    { x: 480, y: 100 },  // 10: LM
    { x: 760, y: 120 },  // 11: LW
  ],
};

function getPreMatchAnchors(formation = "4-3-3", isHome = true): { x: number; y: number }[] {
  const template = DEFAULT_ANCHORS_HOME[formation] || DEFAULT_ANCHORS_HOME["4-3-3"];
  return template.map((pos) => {
    // Keep on own half before kickoff
    const scaledX = isHome
      ? Math.min(460, pos.x * 0.55 + 20)
      : Math.max(540, PITCH_W - (pos.x * 0.55 + 20));
    return { x: Math.round(scaledX), y: pos.y };
  });
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  gameState,
  homeTeam,
  awayTeam,
  onPlayerClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerState | null>(null);
  const prevPhaseRef = useRef<string>("");

  // Goal confetti trigger
  useEffect(() => {
    if (gameState?.phase === "goal" && prevPhaseRef.current !== "goal") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: [gameState.homeTeam.color, gameState.awayTeam.color, "#00f2fe", "#ffffff", "#ffd700"],
      });
    }
    if (gameState) {
      prevPhaseRef.current = gameState.phase;
    }
  }, [gameState?.phase, gameState?.homeTeam?.color, gameState?.awayTeam?.color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.save();
    ctx.scale((rect.width / PITCH_W) * dpr, (rect.height / PITCH_H) * dpr);

    // ==========================================
    // 1. Draw Pitch Turf & Alternating Grass Stripes
    // ==========================================
    const stripeCount = 12;
    const stripeW = PITCH_W / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#0d3b22" : "#0a301b";
      ctx.fillRect(i * stripeW, 0, stripeW, PITCH_H);
    }

    // Outer subtle pitch vignette
    const vignette = ctx.createRadialGradient(PITCH_W / 2, PITCH_H / 2, 200, PITCH_W / 2, PITCH_H / 2, 600);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.38)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, PITCH_W, PITCH_H);

    // ==========================================
    // 2. Draw Crisp White Pitch Markings
    // ==========================================
    ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
    ctx.lineWidth = 3;

    // Outer boundary line
    ctx.strokeRect(MARGIN, MARGIN, PITCH_W - 2 * MARGIN, PITCH_H - 2 * MARGIN);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(PITCH_W / 2, MARGIN);
    ctx.lineTo(PITCH_W / 2, PITCH_H - MARGIN);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(PITCH_W / 2, PITCH_H / 2, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(PITCH_W / 2, PITCH_H / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Area (Home)
    ctx.strokeRect(MARGIN, 170, 150, 300);
    // Left 6-Yard Box
    ctx.strokeRect(MARGIN, 240, 55, 160);
    // Left Penalty Spot
    ctx.beginPath();
    ctx.arc(MARGIN + 105, PITCH_H / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    // Left Penalty Arc
    ctx.beginPath();
    ctx.arc(MARGIN + 105, PITCH_H / 2, 65, -0.65, 0.65);
    ctx.stroke();

    // Right Penalty Area (Away)
    ctx.strokeRect(PITCH_W - MARGIN - 150, 170, 150, 300);
    // Right 6-Yard Box
    ctx.strokeRect(PITCH_W - MARGIN - 55, 240, 55, 160);
    // Right Penalty Spot
    ctx.beginPath();
    ctx.arc(PITCH_W - MARGIN - 105, PITCH_H / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    // Right Penalty Arc
    ctx.beginPath();
    ctx.arc(PITCH_W - MARGIN - 105, PITCH_H / 2, 65, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // Corner Arcs
    const cornerR = 18;
    ctx.beginPath();
    ctx.arc(MARGIN, MARGIN, cornerR, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(MARGIN, PITCH_H - MARGIN, cornerR, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(PITCH_W - MARGIN, MARGIN, cornerR, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(PITCH_W - MARGIN, PITCH_H - MARGIN, cornerR, Math.PI, -Math.PI / 2);
    ctx.stroke();

    // Goals & Net
    const goalYMin = 260;
    const goalYMax = 380;
    const goalH = goalYMax - goalYMin;

    // Left Goal
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(MARGIN - 18, goalYMin, 18, goalH);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(MARGIN - 18, goalYMin, 18, goalH);

    // Right Goal
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(PITCH_W - MARGIN, goalYMin, 18, goalH);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(PITCH_W - MARGIN, goalYMin, 18, goalH);

    // ==========================================
    // 3. Draw Players & Ball (Live OR Pre-Match)
    // ==========================================
    if (gameState && gameState.players && gameState.players.length > 0) {
      // --- LIVE MATCH PLAYERS ---
      // Ball
      const ball = gameState.ball;
      if (ball) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(ball.x, ball.y + 6, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (ball.isShot || ball.speed > 12) {
          ctx.strokeStyle = "rgba(255, 235, 59, 0.7)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(ball.x, ball.y);
          ctx.lineTo(ball.x - ball.vx * 3.5, ball.y - ball.vy * 3.5);
          ctx.stroke();
        }

        const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, 8);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f1f5f9");
        ballGrad.addColorStop(1, "#cbd5e1");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Resolve effective away kit color to avoid color clash
      const effectiveHomeColor = gameState.homeTeam.color || "#00f2fe";
      const effectiveAwayInfo = resolveEffectiveAwayKit(
        effectiveHomeColor,
        gameState.awayTeam.color || "#ff3366",
        gameState.awayTeam.secondaryColor
      );
      const effectiveAwayColor = effectiveAwayInfo.kitColor;

      // Players
      gameState.players.forEach((player) => {
        const isHome = player.team === "home";
        const isGK = player.role === "GK";
        const teamColor = isHome ? effectiveHomeColor : effectiveAwayColor;
        const playerColor = isGK ? (isHome ? "#facc15" : "#a855f7") : teamColor;

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 11, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Selection / Hover Ring
        if (hoveredPlayer?.id === player.id) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(player.x, player.y, 19, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Stamina Arc
        const staminaAngle = ((player.stamina || 100) / 100) * Math.PI * 2;
        ctx.strokeStyle = player.stamina > 50 ? "rgba(16, 185, 129, 0.7)" : "rgba(239, 68, 68, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 16, -Math.PI / 2, -Math.PI / 2 + staminaAngle);
        ctx.stroke();

        // Player Circle
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isHome ? "#ffffff" : "#0f172a";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number
        ctx.fillStyle = isGK ? "#030712" : getContrastingTextColor(teamColor);
        ctx.font = "bold 11px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${player.number}`, player.x, player.y);

        // Role tag
        ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
        ctx.font = "600 9px Outfit, sans-serif";
        ctx.fillText(player.role, player.x, player.y + 23);

        // Personality trait badge / state indicator
        if (player.state && player.state !== "idle" && player.state !== "running") {
          ctx.fillStyle = player.state === "shoot" ? "#ef4444" : player.state === "save" ? "#f59e0b" : "#00f2fe";
          ctx.font = "bold 8px Outfit, sans-serif";
          ctx.fillText(player.state.toUpperCase(), player.x, player.y - 18);
        } else if (player.personalityIcon) {
          ctx.font = "9px Outfit, sans-serif";
          ctx.fillText(player.personalityIcon, player.x, player.y - 18);
        }
      });

      // Active Agent Thought Bubble (High-contrast Carbon style)
      if (gameState.activeThought) {
        const thought = gameState.activeThought;
        const icon = thought.personalityIcon || "💭";
        const bubbleText = `${icon} ${thought.playerName}: "${thought.text}"`;
        const bubbleW = Math.min(360, Math.max(140, bubbleText.length * 6.2 + 24));
        const bubbleH = 26;
        const bx = Math.max(10, Math.min(PITCH_W - bubbleW - 10, thought.x - bubbleW / 2));
        const by = Math.max(15, thought.y - 42);

        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = thought.team === "home" ? (gameState.homeTeam.color || "#0F6B45") : (gameState.awayTeam.color || "#DA1E28");
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bubbleW, bubbleH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(thought.x - 4, by + bubbleH);
        ctx.lineTo(thought.x, by + bubbleH + 6);
        ctx.lineTo(thought.x + 4, by + bubbleH);
        ctx.closePath();
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#161616";
        ctx.font = "600 10.5px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bubbleText, bx + bubbleW / 2, by + bubbleH / 2);
      }

      // Goal celebration overlay
      if (gameState.phase === "goal") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(0, 0, PITCH_W, PITCH_H);

        ctx.fillStyle = "#F1C21B";
        ctx.font = "900 44px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚽ GOAL! ⚽", PITCH_W / 2, PITCH_H / 2 - 16);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 22px 'IBM Plex Sans', sans-serif";
        ctx.fillText(`${gameState.score.home}  —  ${gameState.score.away}`, PITCH_W / 2, PITCH_H / 2 + 25);
      }
    } else {
      // --- PRE-MATCH PERSISTENT STADIUM VIEW ---
      // Place match ball on the center spot
      const ballGrad = ctx.createRadialGradient(PITCH_W / 2 - 2, PITCH_H / 2 - 2, 1, PITCH_W / 2, PITCH_H / 2, 8);
      ballGrad.addColorStop(0, "#ffffff");
      ballGrad.addColorStop(0.7, "#f1f5f9");
      ballGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(PITCH_W / 2, PITCH_H / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Home Team Formation Preview (Left Half)
      const hColor = homeTeam?.color || "#0F6B45";
      const hFormation = homeTeam?.formation || "4-3-3";
      const hAnchors = getPreMatchAnchors(hFormation, true);
      const hPlayers = homeTeam?.starting11 || [];

      hAnchors.forEach((pos, idx) => {
        const pNum = hPlayers[idx]?.number || idx + 1;
        const pRole = hPlayers[idx]?.role || (idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD");
        const isGK = pRole === "GK" || idx === 0;

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 11, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isGK ? "#F1C21B" : hColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${pNum}`, pos.x, pos.y);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "600 9px 'IBM Plex Sans', sans-serif";
        ctx.fillText(pRole, pos.x, pos.y + 22);
      });

      // Away Team Formation Preview (Right Half)
      const aColorRaw = awayTeam?.color || "#DA1E28";
      const { kitColor: effectiveAwayColor } = resolveEffectiveAwayKit(hColor, aColorRaw);
      const aFormation = awayTeam?.formation || "4-3-3";
      const aAnchors = getPreMatchAnchors(aFormation, false);

      aAnchors.forEach((pos, idx) => {
        const pNum = idx + 1;
        const isGK = idx === 0;

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 11, 13, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isGK ? "#8A3FFC" : effectiveAwayColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isGK ? "#FFFFFF" : getContrastingTextColor(effectiveAwayColor);
        ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${pNum}`, pos.x, pos.y);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "600 9px 'IBM Plex Sans', sans-serif";
        ctx.fillText(idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD", pos.x, pos.y + 22);
      });

      // Stadium Center Ready Badge
      ctx.fillStyle = "rgba(15, 107, 69, 0.95)";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      const bW = 340;
      const bH = 32;
      ctx.beginPath();
      ctx.roundRect(PITCH_W / 2 - bW / 2, 45, bW, bH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 11px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡ MATCH READY • KICK OFF TO START SIMULATION", PITCH_W / 2, 45 + bH / 2);
    }

    ctx.restore();
  }, [gameState, hoveredPlayer, homeTeam, awayTeam]);

  // Handle canvas mouse move for player tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = PITCH_W / rect.width;
    const scaleY = PITCH_H / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (gameState && gameState.players) {
      const hit = gameState.players.find((p) => Math.hypot(p.x - mouseX, p.y - mouseY) < 22);
      setHoveredPlayer(hit || null);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: "260px",
        aspectRatio: "1000 / 640",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPlayer(null)}
        onClick={() => hoveredPlayer && onPlayerClick && onPlayerClick(hoveredPlayer)}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "260px",
          display: "block",
          borderRadius: "4px",
          cursor: hoveredPlayer ? "pointer" : "default",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          border: "1px solid var(--cds-border)",
        }}
      />

      {/* Hover Card (Clean Carbon Light Style) */}
      {hoveredPlayer && (
        <div
          className="carbon-card"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            padding: "8px 12px",
            fontSize: "12px",
            zIndex: 10,
            maxWidth: "260px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontWeight: "700", display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span>{hoveredPlayer.name} (#{hoveredPlayer.number})</span>
            <span style={{ color: "var(--cds-green-primary)", fontWeight: "700" }}>{hoveredPlayer.role}</span>
          </div>
          <div style={{ color: "var(--cds-text-secondary)", fontSize: "11px" }}>
            Stamina: {hoveredPlayer.stamina}% | Rating: {hoveredPlayer.rating?.toFixed(1) || 6.0} ★
          </div>
          <div style={{ marginTop: "4px", fontStyle: "italic", color: "var(--cds-text-primary)", fontSize: "11px" }}>
            "{hoveredPlayer.thought}"
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchCanvas;
