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
const PITCH_H = 540;
const MARGIN = 16;
const PLAYER_RADIUS = 15;

// Helper to extract player short label (Role + Surname)
function getPlayerShortLabel(name: string, role: string, number: number): string {
  if (!name) return `${role} #${number}`;
  const parts = name.trim().split(" ");
  const surname = parts.length > 1 ? parts[parts.length - 1] : name;
  return `${role} • ${surname}`;
}

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
  return luminance > 0.55 ? "#161616" : "#FFFFFF";
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
    if (r > 150 && g < 90 && b < 90) {
      return { kitColor: "#F1C21B", isAwayStrip: true };
    }
    if (b > 140 && r < 90) {
      return { kitColor: "#FFFFFF", isAwayStrip: true };
    }
    return { kitColor: "#F4F4F4", isAwayStrip: true };
  }
  return { kitColor: awayColor, isAwayStrip: false };
}

const DEFAULT_ANCHORS_HOME: Record<string, { x: number; y: number }[]> = {
  "4-3-3": [
    { x: 50, y: 270 },   // 1: GK
    { x: 220, y: 450 },  // 2: RB
    { x: 180, y: 195 },  // 3: CB_L
    { x: 180, y: 345 },  // 4: CB_R
    { x: 220, y: 90 },   // 5: LB
    { x: 380, y: 270 },  // 6: CDM
    { x: 720, y: 450 },  // 7: RW
    { x: 550, y: 345 },  // 8: CAM
    { x: 780, y: 270 },  // 9: ST
    { x: 550, y: 195 },  // 10: CM
    { x: 720, y: 90 },   // 11: LW
  ],
  "4-4-2": [
    { x: 50, y: 270 },   // 1: GK
    { x: 220, y: 450 },  // 2: RB
    { x: 180, y: 195 },  // 3: CB_L
    { x: 180, y: 345 },  // 4: CB_R
    { x: 220, y: 90 },   // 5: LB
    { x: 520, y: 450 },  // 6: RM
    { x: 480, y: 345 },  // 7: CM_R
    { x: 480, y: 195 },  // 8: CM_L
    { x: 760, y: 345 },  // 9: ST_R
    { x: 760, y: 195 },  // 10: ST_L
    { x: 520, y: 90 },   // 11: LM
  ],
  "3-5-2": [
    { x: 50, y: 270 },   // 1: GK
    { x: 190, y: 380 },  // 2: CB_R
    { x: 170, y: 270 },  // 3: CB_C
    { x: 190, y: 160 },  // 4: CB_L
    { x: 420, y: 465 },  // 5: RWB
    { x: 360, y: 270 },  // 6: CDM
    { x: 520, y: 345 },  // 7: CM_R
    { x: 600, y: 270 },  // 8: CAM
    { x: 770, y: 345 },  // 9: ST_R
    { x: 770, y: 195 },  // 10: ST_L
    { x: 420, y: 75 },   // 11: LWB
  ],
  "5-3-2": [
    { x: 50, y: 270 },   // 1: GK
    { x: 250, y: 460 },  // 2: RWB
    { x: 180, y: 365 },  // 3: CB_R
    { x: 160, y: 270 },  // 4: CB_C
    { x: 180, y: 175 },  // 5: CB_L
    { x: 250, y: 80 },   // 6: LWB
    { x: 380, y: 270 },  // 7: CDM
    { x: 500, y: 345 },  // 8: CM_R
    { x: 770, y: 345 },  // 9: ST_R
    { x: 770, y: 195 },  // 10: ST_L
    { x: 500, y: 195 },  // 11: CM_L
  ],
  "4-2-3-1": [
    { x: 50, y: 270 },   // 1: GK
    { x: 220, y: 450 },  // 2: RB
    { x: 180, y: 345 },  // 3: CB_R
    { x: 180, y: 195 },  // 4: CB_L
    { x: 220, y: 90 },   // 5: LB
    { x: 360, y: 345 },  // 6: CDM_R
    { x: 650, y: 450 },  // 7: RM
    { x: 360, y: 195 },  // 8: CDM_L
    { x: 800, y: 270 },  // 9: ST
    { x: 600, y: 270 },  // 10: CAM
    { x: 650, y: 90 },   // 11: LM
  ],
  "3-4-3": [
    { x: 50, y: 270 },   // 1: GK
    { x: 190, y: 380 },  // 2: CB_R
    { x: 170, y: 270 },  // 3: CB_C
    { x: 190, y: 160 },  // 4: CB_L
    { x: 480, y: 455 },  // 5: RM
    { x: 450, y: 335 },  // 6: CM_R
    { x: 760, y: 440 },  // 7: RW
    { x: 450, y: 205 },  // 8: CM_L
    { x: 820, y: 270 },  // 9: ST
    { x: 480, y: 85 },   // 10: LM
    { x: 760, y: 100 },  // 11: LW
  ],
};

function getPreMatchAnchors(formation = "4-3-3", isHome = true): { x: number; y: number }[] {
  const template = DEFAULT_ANCHORS_HOME[formation] || DEFAULT_ANCHORS_HOME["4-3-3"];
  return template.map((pos) => {
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

  // Smooth 60fps interpolation state refs
  const interpPlayersRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());
  const interpBallRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 500, y: 270, vx: 0, vy: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Keep latest game snapshot in ref for the 60fps RAF render loop
  const latestGameStateRef = useRef<GameSnapshot | null>(gameState);
  latestGameStateRef.current = gameState;

  // Goal confetti trigger
  useEffect(() => {
    if (gameState?.phase === "goal" && prevPhaseRef.current !== "goal") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: [gameState.homeTeam.color, gameState.awayTeam.color, "#0F6B45", "#FFFFFF", "#F1C21B"],
      });
    }
    if (gameState) {
      prevPhaseRef.current = gameState.phase;
    }
  }, [gameState?.phase, gameState?.homeTeam?.color, gameState?.awayTeam?.color]);

  // Main 60 FPS RequestAnimationFrame Canvas Render Loop
  useEffect(() => {
    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // High DPI scaling
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale((rect.width / PITCH_W) * dpr, (rect.height / PITCH_H) * dpr);

      // ==========================================
      // 1. Draw Pitch Turf & Alternating Grass Stripes
      // ==========================================
      const stripeCount = 14;
      const stripeW = PITCH_W / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#0d3c22" : "#09311c";
        ctx.fillRect(i * stripeW, 0, stripeW, PITCH_H);
      }

      // Subtle pitch vignette
      const vignette = ctx.createRadialGradient(PITCH_W / 2, PITCH_H / 2, 180, PITCH_W / 2, PITCH_H / 2, 560);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.36)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, PITCH_W, PITCH_H);

      // ==========================================
      // 2. Draw Crisp White Pitch Markings
      // ==========================================
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
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
      ctx.arc(PITCH_W / 2, PITCH_H / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Center spot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(PITCH_W / 2, PITCH_H / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Left Penalty Area (Home)
      ctx.strokeRect(MARGIN, 135, 145, 270);
      // Left 6-Yard Box
      ctx.strokeRect(MARGIN, 195, 50, 150);
      // Left Penalty Spot
      ctx.beginPath();
      ctx.arc(MARGIN + 100, PITCH_H / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      // Left Penalty Arc
      ctx.beginPath();
      ctx.arc(MARGIN + 100, PITCH_H / 2, 65, -0.65, 0.65);
      ctx.stroke();

      // Right Penalty Area (Away)
      ctx.strokeRect(PITCH_W - MARGIN - 145, 135, 145, 270);
      // Right 6-Yard Box
      ctx.strokeRect(PITCH_W - MARGIN - 50, 195, 50, 150);
      // Right Penalty Spot
      ctx.beginPath();
      ctx.arc(PITCH_W - MARGIN - 100, PITCH_H / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      // Right Penalty Arc
      ctx.beginPath();
      ctx.arc(PITCH_W - MARGIN - 100, PITCH_H / 2, 65, Math.PI - 0.65, Math.PI + 0.65);
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
      const goalYMin = 210;
      const goalYMax = 330;
      const goalH = goalYMax - goalYMin;

      // Left Goal
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.fillRect(MARGIN - 18, goalYMin, 18, goalH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.strokeRect(MARGIN - 18, goalYMin, 18, goalH);

      // Right Goal
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.fillRect(PITCH_W - MARGIN, goalYMin, 18, goalH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.strokeRect(PITCH_W - MARGIN, goalYMin, 18, goalH);

      const state = latestGameStateRef.current;

      // ==========================================
      // 3. Draw Players & Ball (Live OR Pre-Match)
      // ==========================================
      if (state && state.players && state.players.length > 0) {
        // --- 60 FPS LERP INTERPOLATION ---
        const playerMap = interpPlayersRef.current;

        // Update / Lerp Ball
        const targetBall = state.ball || { x: 500, y: 270, vx: 0, vy: 0, isShot: false, speed: 0 };
        const interpBall = interpBallRef.current;
        interpBall.x += (targetBall.x - interpBall.x) * 0.35;
        interpBall.y += (targetBall.y - interpBall.y) * 0.35;
        interpBall.vx = targetBall.vx;
        interpBall.vy = targetBall.vy;

        // Draw Ball Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(interpBall.x, interpBall.y + 6, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shot tracer line
        if (targetBall.isShot || targetBall.speed > 12) {
          ctx.strokeStyle = "rgba(241, 194, 27, 0.88)";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(interpBall.x, interpBall.y);
          ctx.lineTo(interpBall.x - interpBall.vx * 3.5, interpBall.y - interpBall.vy * 3.5);
          ctx.stroke();
        }

        // Ball Body
        const ballGrad = ctx.createRadialGradient(interpBall.x - 1.5, interpBall.y - 1.5, 1, interpBall.x, interpBall.y, 7.5);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f8fafc");
        ballGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(interpBall.x, interpBall.y, 7.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(interpBall.x, interpBall.y, 3.8, 0, Math.PI * 2);
        ctx.stroke();

        // Resolve effective team colors
        const effectiveHomeColor = state.homeTeam.color || "#0F6B45";
        const effectiveAwayInfo = resolveEffectiveAwayKit(
          effectiveHomeColor,
          state.awayTeam.color || "#DA1E28",
          state.awayTeam.secondaryColor
        );
        const effectiveAwayColor = effectiveAwayInfo.kitColor;

        // Render each player with smooth 60fps position lerping
        state.players.forEach((player) => {
          let interp = playerMap.get(player.id);
          if (!interp) {
            interp = { x: player.x, y: player.y, vx: player.vx || 0, vy: player.vy || 0 };
            playerMap.set(player.id, interp);
          } else {
            // Smooth lerp towards target engine coordinates
            interp.x += (player.x - interp.x) * 0.28;
            interp.y += (player.y - interp.y) * 0.28;
            interp.vx = player.vx || 0;
            interp.vy = player.vy || 0;
          }

          const px = interp.x;
          const py = interp.y;
          const isHome = player.team === "home";
          const isGK = player.role === "GK";
          const teamColor = isHome ? effectiveHomeColor : effectiveAwayColor;
          const playerColor = isGK ? (isHome ? "#F1C21B" : "#8A3FFC") : teamColor;

          // Player Ground Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.beginPath();
          ctx.ellipse(px, py + 11, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Selection / Hover Ring
          if (hoveredPlayer?.id === player.id) {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_RADIUS + 6, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Stamina Ring (Encircling outer circle)
          const staminaAngle = ((player.stamina || 100) / 100) * Math.PI * 2;
          ctx.strokeStyle = player.stamina > 50 ? "rgba(15, 107, 69, 0.95)" : "rgba(218, 30, 40, 0.95)";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS + 3, -Math.PI / 2, -Math.PI / 2 + staminaAngle);
          ctx.stroke();

          // Player Main Node Circle (Compact, balanced size)
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isHome ? "#FFFFFF" : "#161616";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Player Number (Clear, Bold & High Contrast)
          const numberColor = isGK ? "#161616" : getContrastingTextColor(teamColor);
          ctx.fillStyle = numberColor;
          ctx.font = "bold 11.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${player.number}`, px, py);

          // Role + Surname Tag Pill (Below circle in protected dark background)
          const labelText = getPlayerShortLabel(player.name, player.role, player.number);
          const pillW = Math.max(42, labelText.length * 5.8 + 10);
          const pillH = 14;
          const pillX = px - pillW / 2;
          const pillY = py + PLAYER_RADIUS + 5;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, px, pillY + pillH / 2);

          // Tactical State Badge (Above circle if active)
          if (player.state && player.state !== "idle" && player.state !== "running") {
            const stateKey = player.state.toLowerCase();
            let badgeBg = "#0F62FE";
            let badgeLabel = player.state.toUpperCase();

            if (stateKey === "shoot") {
              badgeBg = "#DA1E28";
              badgeLabel = "⚡ SHOOT";
            } else if (stateKey === "save") {
              badgeBg = "#F1C21B";
              badgeLabel = "🧤 SAVE";
            } else if (stateKey === "press") {
              badgeBg = "#0043CE";
              badgeLabel = "⚔️ PRESS";
            } else if (stateKey === "pass") {
              badgeBg = "#0F6B45";
              badgeLabel = "🎯 PASS";
            } else if (stateKey === "tackle") {
              badgeBg = "#FF832B";
              badgeLabel = "🛡️ TACKLE";
            }

            const stateW = Math.max(38, badgeLabel.length * 6 + 8);
            const stateH = 14;
            const stateX = px - stateW / 2;
            const stateY = py - PLAYER_RADIUS - 16;

            ctx.fillStyle = badgeBg;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(stateX, stateY, stateW, stateH, 3);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = stateKey === "save" ? "#161616" : "#FFFFFF";
            ctx.font = "bold 8px 'IBM Plex Sans', -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(badgeLabel, px, stateY + stateH / 2);
          } else if (player.personalityIcon) {
            ctx.font = "10px 'IBM Plex Sans', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(player.personalityIcon, px, py - PLAYER_RADIUS - 8);
          }

          // Active Thought Pulse on Thinking Player
          if (state.activeThought && state.activeThought.playerId === player.id) {
            ctx.strokeStyle = "rgba(15, 107, 69, 0.9)";
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_RADIUS + 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        // Live Agent Thought Top HUD Banner (Clean, centered, unblocking central play)
        if (state.activeThought) {
          const thought = state.activeThought;
          const icon = thought.personalityIcon || "💭";
          const thoughtBannerText = `${icon} ${thought.playerName}: "${thought.text}"`;
          const tbW = Math.min(500, Math.max(240, thoughtBannerText.length * 6.4 + 26));
          const tbH = 24;
          const tbX = PITCH_W / 2 - tbW / 2;
          const tbY = 20;

          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = thought.team === "home" ? (state.homeTeam.color || "#0F6B45") : (state.awayTeam.color || "#DA1E28");
          ctx.lineWidth = 1.6;

          ctx.beginPath();
          ctx.roundRect(tbX, tbY, tbW, tbH, 3.5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "600 10.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(thoughtBannerText, PITCH_W / 2, tbY + tbH / 2);
        }

        // Goal celebration overlay
        if (state.phase === "goal") {
          ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
          ctx.fillRect(0, 0, PITCH_W, PITCH_H);

          ctx.fillStyle = "#F1C21B";
          ctx.font = "900 44px 'IBM Plex Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚽ GOAL! ⚽", PITCH_W / 2, PITCH_H / 2 - 16);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 24px 'IBM Plex Sans', sans-serif";
          ctx.fillText(`${state.score.home}  —  ${state.score.away}`, PITCH_W / 2, PITCH_H / 2 + 24);
        }
      } else {
        // --- PRE-MATCH PERSISTENT STADIUM VIEW ---
        // Place match ball on the center spot
        const ballGrad = ctx.createRadialGradient(PITCH_W / 2 - 1.5, PITCH_H / 2 - 1.5, 1, PITCH_W / 2, PITCH_H / 2, 7.5);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f8fafc");
        ballGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(PITCH_W / 2, PITCH_H / 2, 7.5, 0, Math.PI * 2);
        ctx.fill();

        // Home Team Formation Preview (Left Half)
        const hColor = homeTeam?.color || "#0F6B45";
        const hFormation = homeTeam?.formation || "4-3-3";
        const hAnchors = getPreMatchAnchors(hFormation, true);
        const hPlayers = homeTeam?.starting11 || [];

        hAnchors.forEach((pos, idx) => {
          const pNum = hPlayers[idx]?.number || idx + 1;
          const pRole = hPlayers[idx]?.role || (idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD");
          const pName = hPlayers[idx]?.name || `Player #${pNum}`;
          const isGK = pRole === "GK" || idx === 0;

          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y + 11, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Circle
          ctx.fillStyle = isGK ? "#F1C21B" : hColor;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Number
          ctx.fillStyle = isGK ? "#161616" : getContrastingTextColor(hColor);
          ctx.font = "bold 11.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${pNum}`, pos.x, pos.y);

          // Role Tag Pill
          const labelText = getPlayerShortLabel(pName, pRole, pNum);
          const pillW = Math.max(42, labelText.length * 5.8 + 10);
          const pillH = 14;
          const pillX = pos.x - pillW / 2;
          const pillY = pos.y + PLAYER_RADIUS + 5;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, pos.x, pillY + pillH / 2);
        });

        // Away Team Formation Preview (Right Half)
        const aColorRaw = awayTeam?.color || "#DA1E28";
        const { kitColor: effectiveAwayColor } = resolveEffectiveAwayKit(hColor, aColorRaw);
        const aFormation = awayTeam?.formation || "4-3-3";
        const aAnchors = getPreMatchAnchors(aFormation, false);

        aAnchors.forEach((pos, idx) => {
          const pNum = idx + 1;
          const pRole = idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD";
          const isGK = idx === 0;

          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y + 11, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Circle
          ctx.fillStyle = isGK ? "#8A3FFC" : effectiveAwayColor;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Number
          ctx.fillStyle = isGK ? "#FFFFFF" : getContrastingTextColor(effectiveAwayColor);
          ctx.font = "bold 11.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${pNum}`, pos.x, pos.y);

          // Role Tag Pill
          const labelText = `${pRole} #${pNum}`;
          const pillW = Math.max(42, labelText.length * 5.8 + 10);
          const pillH = 14;
          const pillX = pos.x - pillW / 2;
          const pillY = pos.y + PLAYER_RADIUS + 5;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, pos.x, pillY + pillH / 2);
        });

        // Stadium Center Ready Badge
        ctx.fillStyle = "rgba(15, 107, 69, 0.95)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        const bW = 360;
        const bH = 30;
        ctx.beginPath();
        ctx.roundRect(PITCH_W / 2 - bW / 2, 40, bW, bH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 11px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡ MATCH READY • KICK OFF TO START SIMULATION", PITCH_W / 2, 40 + bH / 2);
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [homeTeam, awayTeam, hoveredPlayer]);

  // Handle canvas mouse move for player tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = PITCH_W / rect.width;
    const scaleY = PITCH_H / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (gameState && gameState.players) {
      const hit = gameState.players.find((p) => Math.hypot(p.x - mouseX, p.y - mouseY) < PLAYER_RADIUS + 6);
      setHoveredPlayer(hit || null);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: "360px",
        aspectRatio: "1000 / 540",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#09311c",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
        border: "1px solid var(--cds-border)",
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
          maxHeight: "360px",
          display: "block",
          borderRadius: "4px",
          cursor: hoveredPlayer ? "pointer" : "default",
        }}
      />

      {/* Hover Card (Clean Carbon Light Style) */}
      {hoveredPlayer && (
        <div
          className="carbon-card"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            padding: "8px 12px",
            fontSize: "12px",
            zIndex: 10,
            maxWidth: "260px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
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
