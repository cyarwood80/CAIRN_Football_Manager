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

// Logical simulation coordinate bounds (matches PitchEngine)
const PITCH_ENGINE_W = 1000;
const PITCH_ENGINE_H = 680;
const PLAYER_RADIUS = 9.5; // Compact, perfectly circular nodes (19px diameter)

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
    { x: 50, y: 340 },   // 1: GK
    { x: 220, y: 565 },  // 2: RB
    { x: 180, y: 245 },  // 3: CB_L
    { x: 180, y: 435 },  // 4: CB_R
    { x: 220, y: 115 },  // 5: LB
    { x: 380, y: 340 },  // 6: CDM
    { x: 720, y: 565 },  // 7: RW
    { x: 550, y: 435 },  // 8: CAM
    { x: 780, y: 340 },  // 9: ST
    { x: 550, y: 245 },  // 10: CM
    { x: 720, y: 115 },  // 11: LW
  ],
  "4-4-2": [
    { x: 50, y: 340 },   // 1: GK
    { x: 220, y: 565 },  // 2: RB
    { x: 180, y: 245 },  // 3: CB_L
    { x: 180, y: 435 },  // 4: CB_R
    { x: 220, y: 115 },  // 5: LB
    { x: 520, y: 565 },  // 6: RM
    { x: 480, y: 435 },  // 7: CM_R
    { x: 480, y: 245 },  // 8: CM_L
    { x: 760, y: 435 },  // 9: ST_R
    { x: 760, y: 245 },  // 10: ST_L
    { x: 520, y: 115 },  // 11: LM
  ],
  "3-5-2": [
    { x: 50, y: 340 },   // 1: GK
    { x: 190, y: 475 },  // 2: CB_R
    { x: 170, y: 340 },  // 3: CB_C
    { x: 190, y: 205 },  // 4: CB_L
    { x: 420, y: 585 },  // 5: RWB
    { x: 360, y: 340 },  // 6: CDM
    { x: 520, y: 435 },  // 7: CM_R
    { x: 600, y: 340 },  // 8: CAM
    { x: 770, y: 435 },  // 9: ST_R
    { x: 770, y: 245 },  // 10: ST_L
    { x: 420, y: 95 },   // 11: LWB
  ],
  "5-3-2": [
    { x: 50, y: 340 },   // 1: GK
    { x: 250, y: 575 },  // 2: RWB
    { x: 180, y: 460 },  // 3: CB_R
    { x: 160, y: 340 },  // 4: CB_C
    { x: 180, y: 220 },  // 5: CB_L
    { x: 250, y: 105 },  // 6: LWB
    { x: 380, y: 340 },  // 7: CDM
    { x: 500, y: 435 },  // 8: CM_R
    { x: 770, y: 435 },  // 9: ST_R
    { x: 770, y: 245 },  // 10: ST_L
    { x: 500, y: 245 },  // 11: CM_L
  ],
  "4-2-3-1": [
    { x: 50, y: 340 },   // 1: GK
    { x: 220, y: 565 },  // 2: RB
    { x: 180, y: 435 },  // 3: CB_R
    { x: 180, y: 245 },  // 4: CB_L
    { x: 220, y: 115 },  // 5: LB
    { x: 360, y: 435 },  // 6: CDM_R
    { x: 650, y: 565 },  // 7: RM
    { x: 360, y: 245 },  // 8: CDM_L
    { x: 800, y: 340 },  // 9: ST
    { x: 600, y: 340 },  // 10: CAM
    { x: 650, y: 115 },  // 11: LM
  ],
  "3-4-3": [
    { x: 50, y: 340 },   // 1: GK
    { x: 190, y: 475 },  // 2: CB_R
    { x: 170, y: 340 },  // 3: CB_C
    { x: 190, y: 205 },  // 4: CB_L
    { x: 480, y: 570 },  // 5: RM
    { x: 450, y: 420 },  // 6: CM_R
    { x: 760, y: 555 },  // 7: RW
    { x: 450, y: 260 },  // 8: CM_L
    { x: 820, y: 340 },  // 9: ST
    { x: 480, y: 110 },  // 10: LM
    { x: 760, y: 125 },  // 11: LW
  ],
};

function getPreMatchAnchors(formation = "4-3-3", isHome = true): { x: number; y: number }[] {
  const template = DEFAULT_ANCHORS_HOME[formation] || DEFAULT_ANCHORS_HOME["4-3-3"];
  return template.map((pos) => {
    const scaledX = isHome
      ? Math.min(460, pos.x * 0.52 + 25)
      : Math.max(540, PITCH_ENGINE_W - (pos.x * 0.52 + 25));
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
  const interpBallRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 500, y: 340, vx: 0, vy: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Keep latest game snapshot in ref for the 60fps RAF render loop
  const latestGameStateRef = useRef<GameSnapshot | null>(gameState);
  latestGameStateRef.current = gameState;

  // Goal confetti trigger
  useEffect(() => {
    if (gameState?.phase === "goal" && prevPhaseRef.current !== "goal") {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.55 },
        colors: [gameState.homeTeam.color, gameState.awayTeam.color, "#0F6B45", "#FFFFFF", "#F1C21B"],
      });
    }
    if (gameState) {
      prevPhaseRef.current = gameState.phase;
    }
  }, [gameState?.phase, gameState?.homeTeam?.color, gameState?.awayTeam?.color]);

  // Main 60 FPS RequestAnimationFrame Canvas Render Loop with 1:1 Pixel-Perfect Aspect Ratio
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

      // High DPI scaling (1:1 aspect ratio mapping)
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      // Scale uniformly by DPR so drawing coordinates match CSS pixels (rect.width x rect.height)
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      const margin = 14;

      // Coordinate transform helpers (maps 1000x680 engine space -> W x H screen space)
      const toScreenX = (x: number) => (x / PITCH_ENGINE_W) * W;
      const toScreenY = (y: number) => (y / PITCH_ENGINE_H) * H;

      // ==========================================
      // 1. Draw Pitch Turf & Alternating Grass Stripes
      // ==========================================
      const stripeCount = 14;
      const stripeW = W / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#0d3c22" : "#09311c";
        ctx.fillRect(i * stripeW, 0, stripeW, H);
      }

      // Subtle pitch vignette
      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.6);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.38)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // ==========================================
      // 2. Draw Crisp White Pitch Markings (1:1 Non-Stretched)
      // ==========================================
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;

      // Outer boundary line
      ctx.strokeRect(margin, margin, W - 2 * margin, H - 2 * margin);

      // Halfway line
      ctx.beginPath();
      ctx.moveTo(W / 2, margin);
      ctx.lineTo(W / 2, H - margin);
      ctx.stroke();

      // Center circle (Perfect Circle)
      const centerCircleRadius = H * 0.17;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, centerCircleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center spot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Area Dimensions
      const penBoxW = W * 0.155;
      const penBoxH = H * 0.46;
      const penBoxY = (H - penBoxH) / 2;

      const sixYardW = W * 0.055;
      const sixYardH = H * 0.28;
      const sixYardY = (H - sixYardH) / 2;

      const penSpotDist = W * 0.11;
      const penArcRadius = H * 0.15;

      // Left Penalty Area (Home)
      ctx.strokeRect(margin, penBoxY, penBoxW, penBoxH);
      // Left 6-Yard Box
      ctx.strokeRect(margin, sixYardY, sixYardW, sixYardH);
      // Left Penalty Spot
      ctx.beginPath();
      ctx.arc(margin + penSpotDist, H / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Left Penalty Arc
      ctx.beginPath();
      ctx.arc(margin + penSpotDist, H / 2, penArcRadius, -0.65, 0.65);
      ctx.stroke();

      // Right Penalty Area (Away)
      ctx.strokeRect(W - margin - penBoxW, penBoxY, penBoxW, penBoxH);
      // Right 6-Yard Box
      ctx.strokeRect(W - margin - sixYardW, sixYardY, sixYardW, sixYardH);
      // Right Penalty Spot
      ctx.beginPath();
      ctx.arc(W - margin - penSpotDist, H / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // Right Penalty Arc
      ctx.beginPath();
      ctx.arc(W - margin - penSpotDist, H / 2, penArcRadius, Math.PI - 0.65, Math.PI + 0.65);
      ctx.stroke();

      // Corner Arcs
      const cornerR = 12;
      ctx.beginPath();
      ctx.arc(margin, margin, cornerR, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(margin, H - margin, cornerR, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W - margin, margin, cornerR, Math.PI / 2, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W - margin, H - margin, cornerR, Math.PI, -Math.PI / 2);
      ctx.stroke();

      // Goals & Net
      const goalH = H * 0.22;
      const goalY = (H - goalH) / 2;

      // Left Goal
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.fillRect(margin - 12, goalY, 12, goalH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(margin - 12, goalY, 12, goalH);

      // Right Goal
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.fillRect(W - margin, goalY, 12, goalH);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(W - margin, goalY, 12, goalH);

      const state = latestGameStateRef.current;

      // ==========================================
      // 3. Draw Players & Ball (Live OR Pre-Match)
      // ==========================================
      if (state && state.players && state.players.length > 0) {
        // --- 60 FPS LERP INTERPOLATION ---
        const playerMap = interpPlayersRef.current;

        // Update / Lerp Ball
        const targetBall = state.ball || { x: 500, y: 340, vx: 0, vy: 0, isShot: false, speed: 0 };
        const interpBall = interpBallRef.current;
        interpBall.x += (targetBall.x - interpBall.x) * 0.35;
        interpBall.y += (targetBall.y - interpBall.y) * 0.35;
        interpBall.vx = targetBall.vx;
        interpBall.vy = targetBall.vy;

        const bx = toScreenX(interpBall.x);
        const by = toScreenY(interpBall.y);

        // Draw Ball Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(bx, by + 4, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shot tracer line
        if (targetBall.isShot || targetBall.speed > 12) {
          ctx.strokeStyle = "rgba(241, 194, 27, 0.88)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - toScreenX(interpBall.vx) * 3, by - toScreenY(interpBall.vy) * 3);
          ctx.stroke();
        }

        // Ball Body (Perfect Circle)
        const ballGrad = ctx.createRadialGradient(bx - 1, by - 1, 0.8, bx, by, 5);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f8fafc");
        ballGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
        ctx.stroke();

        // Resolve effective team colors
        const effectiveHomeColor = state.homeTeam.color || "#0F6B45";
        const effectiveAwayInfo = resolveEffectiveAwayKit(
          effectiveHomeColor,
          state.awayTeam.color || "#DA1E28",
          state.awayTeam.secondaryColor
        );
        const effectiveAwayColor = effectiveAwayInfo.kitColor;

        // Render each player with smooth 60fps position lerping and 1:1 circular aspect ratio
        state.players.forEach((player) => {
          let interp = playerMap.get(player.id);
          if (!interp) {
            interp = { x: player.x, y: player.y, vx: player.vx || 0, vy: player.vy || 0 };
            playerMap.set(player.id, interp);
          } else {
            interp.x += (player.x - interp.x) * 0.28;
            interp.y += (player.y - interp.y) * 0.28;
            interp.vx = player.vx || 0;
            interp.vy = player.vy || 0;
          }

          const px = toScreenX(interp.x);
          const py = toScreenY(interp.y);
          const isHome = player.team === "home";
          const isGK = player.role === "GK";
          const teamColor = isHome ? effectiveHomeColor : effectiveAwayColor;
          const playerColor = isGK ? (isHome ? "#F1C21B" : "#8A3FFC") : teamColor;

          // Player Ground Shadow (1:1 proportioned)
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
          ctx.beginPath();
          ctx.ellipse(px, py + 7, 9.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Selection / Hover Ring (1:1 Perfect Circle)
          if (hoveredPlayer?.id === player.id) {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_RADIUS + 3.5, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Stamina Ring (Encircling outer circle)
          const staminaAngle = ((player.stamina || 100) / 100) * Math.PI * 2;
          ctx.strokeStyle = player.stamina > 50 ? "rgba(15, 107, 69, 0.95)" : "rgba(218, 30, 40, 0.95)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS + 1.8, -Math.PI / 2, -Math.PI / 2 + staminaAngle);
          ctx.stroke();

          // Player Main Node Circle (Compact 9.5px radius, Perfect Circle)
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isHome ? "#FFFFFF" : "#161616";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Player Number (1:1 Non-Stretched Typography)
          const numberColor = isGK ? "#161616" : getContrastingTextColor(teamColor);
          ctx.fillStyle = numberColor;
          ctx.font = "bold 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${player.number}`, px, py);

          // Role + Surname Tag Pill (Below circle in protected dark background, scaled with measureText)
          const labelText = getPlayerShortLabel(player.name, player.role, player.number);
          ctx.font = "600 7.5px 'IBM Plex Sans', -apple-system, sans-serif";
          const labelMetrics = ctx.measureText(labelText);
          const pillW = Math.round(labelMetrics.width + 8);
          const pillH = 11;
          const pillX = Math.round(px - pillW / 2);
          const pillY = Math.round(py + PLAYER_RADIUS + 2.5);

          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
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

            ctx.font = "bold 7px 'IBM Plex Sans', -apple-system, sans-serif";
            const badgeMetrics = ctx.measureText(badgeLabel);
            const stateW = Math.round(badgeMetrics.width + 6);
            const stateH = 11;
            const stateX = Math.round(px - stateW / 2);
            const stateY = Math.round(py - PLAYER_RADIUS - 12);

            ctx.fillStyle = badgeBg;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.roundRect(stateX, stateY, stateW, stateH, 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = stateKey === "save" ? "#161616" : "#FFFFFF";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(badgeLabel, px, stateY + stateH / 2);
          } else if (player.personalityIcon) {
            ctx.font = "8.5px 'IBM Plex Sans', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(player.personalityIcon, px, py - PLAYER_RADIUS - 6);
          }

          // Active Thought Pulse on Thinking Player
          if (state.activeThought && state.activeThought.playerId === player.id) {
            ctx.strokeStyle = "rgba(15, 107, 69, 0.9)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2.5, 2.5]);
            ctx.beginPath();
            ctx.arc(px, py, PLAYER_RADIUS + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        // Live Agent Thought Top HUD Banner (Clean, centered, 1:1 non-stretched)
        if (state.activeThought) {
          const thought = state.activeThought;
          const icon = thought.personalityIcon || "💭";
          const thoughtBannerText = `${icon} ${thought.playerName}: "${thought.text}"`;
          ctx.font = "600 9px 'IBM Plex Sans', -apple-system, sans-serif";
          const thoughtMetrics = ctx.measureText(thoughtBannerText);
          const tbW = Math.min(W * 0.72, Math.max(160, Math.round(thoughtMetrics.width + 16)));
          const tbH = 18;
          const tbX = Math.round(W / 2 - tbW / 2);
          const tbY = margin + 4;

          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = thought.team === "home" ? (state.homeTeam.color || "#0F6B45") : (state.awayTeam.color || "#DA1E28");
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          ctx.roundRect(tbX, tbY, tbW, tbH, 2.5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(thoughtBannerText, W / 2, tbY + tbH / 2);
        }

        // Goal celebration overlay
        if (state.phase === "goal") {
          ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
          ctx.fillRect(0, 0, W, H);

          ctx.fillStyle = "#F1C21B";
          ctx.font = "900 32px 'IBM Plex Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚽ GOAL! ⚽", W / 2, H / 2 - 12);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 18px 'IBM Plex Sans', sans-serif";
          ctx.fillText(`${state.score.home}  —  ${state.score.away}`, W / 2, H / 2 + 18);
        }
      } else {
        // --- PRE-MATCH PERSISTENT STADIUM VIEW (1:1 Non-Stretched) ---
        const bx = toScreenX(500);
        const by = toScreenY(340);

        const ballGrad = ctx.createRadialGradient(bx - 1, by - 1, 0.8, bx, by, 5);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f8fafc");
        ballGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();

        // Home Team Formation Preview (Left Half)
        const hColor = homeTeam?.color || "#0F6B45";
        const hFormation = homeTeam?.formation || "4-3-3";
        const hAnchors = getPreMatchAnchors(hFormation, true);
        const hPlayers = homeTeam?.starting11 || [];

        hAnchors.forEach((pos, idx) => {
          const px = toScreenX(pos.x);
          const py = toScreenY(pos.y);
          const pNum = hPlayers[idx]?.number || idx + 1;
          const pRole = hPlayers[idx]?.role || (idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD");
          const pName = hPlayers[idx]?.name || `Player #${pNum}`;
          const isGK = pRole === "GK" || idx === 0;

          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(px, py + 7, 9.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Circle (1:1 Perfect Circle)
          ctx.fillStyle = isGK ? "#F1C21B" : hColor;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Number
          ctx.fillStyle = isGK ? "#161616" : getContrastingTextColor(hColor);
          ctx.font = "bold 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${pNum}`, px, py);

          // Role Tag Pill
          const labelText = getPlayerShortLabel(pName, pRole, pNum);
          ctx.font = "600 7.5px 'IBM Plex Sans', -apple-system, sans-serif";
          const labelMetrics = ctx.measureText(labelText);
          const pillW = Math.round(labelMetrics.width + 8);
          const pillH = 11;
          const pillX = Math.round(px - pillW / 2);
          const pillY = Math.round(py + PLAYER_RADIUS + 2.5);

          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, px, pillY + pillH / 2);
        });

        // Away Team Formation Preview (Right Half)
        const aColorRaw = awayTeam?.color || "#DA1E28";
        const { kitColor: effectiveAwayColor } = resolveEffectiveAwayKit(hColor, aColorRaw);
        const aFormation = awayTeam?.formation || "4-3-3";
        const aAnchors = getPreMatchAnchors(aFormation, false);

        aAnchors.forEach((pos, idx) => {
          const px = toScreenX(pos.x);
          const py = toScreenY(pos.y);
          const pNum = idx + 1;
          const pRole = idx === 0 ? "GK" : idx < 5 ? "DEF" : idx < 8 ? "MID" : "FWD";
          const isGK = idx === 0;

          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(px, py + 7, 9.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Circle (1:1 Perfect Circle)
          ctx.fillStyle = isGK ? "#8A3FFC" : effectiveAwayColor;
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Number
          ctx.fillStyle = isGK ? "#FFFFFF" : getContrastingTextColor(effectiveAwayColor);
          ctx.font = "bold 8.5px 'IBM Plex Sans', -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${pNum}`, px, py);

          // Role Tag Pill
          const labelText = `${pRole} #${pNum}`;
          ctx.font = "600 7.5px 'IBM Plex Sans', -apple-system, sans-serif";
          const labelMetrics = ctx.measureText(labelText);
          const pillW = Math.round(labelMetrics.width + 8);
          const pillH = 11;
          const pillX = Math.round(px - pillW / 2);
          const pillY = Math.round(py + PLAYER_RADIUS + 2.5);

          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, px, pillY + pillH / 2);
        });

        // Stadium Center Ready Badge
        ctx.fillStyle = "rgba(15, 107, 69, 0.95)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.2;
        const bW = Math.min(280, W * 0.52);
        const bH = 22;
        ctx.beginPath();
        ctx.roundRect(W / 2 - bW / 2, margin + 6, bW, bH, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 9px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡ MATCH READY • KICK OFF TO START SIMULATION", W / 2, margin + 6 + bH / 2);
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
    const W = rect.width;
    const H = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState && gameState.players) {
      const hit = gameState.players.find((p) => {
        const px = (p.x / PITCH_ENGINE_W) * W;
        const py = (p.y / PITCH_ENGINE_H) * H;
        return Math.hypot(px - mouseX, py - mouseY) < PLAYER_RADIUS + 5;
      });
      setHoveredPlayer(hit || null);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxHeight: "460px",
        minHeight: "340px",
        aspectRatio: "1.47 / 1",
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
