# ⚽ CAIRN FC — AI Football Championship Manager

> **A next-generation Agentic AI football simulation and management suite built with React 19, TypeScript, Vite, Node.js WebSocket engine, and IBM Carbon Design System.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![IBM Carbon](https://img.shields.io/badge/IBM_Carbon_Design-0F62FE?style=for-the-badge&logo=ibm&logoColor=white)](https://carbondesignsystem.com/)

---

## 🌟 Key Features

### 🧠 1. Agentic AI Tactics & Natural Language Coaching
- **Plain-English Tactical Studio**: Direct your squad using free-form tactical instructions (e.g., *"Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover"*).
- **Real-Time Prompt Quality Analyzer**: Instant heuristic & semantic scoring of your tactical directives with actionable feedback on synergy boosts, resonating traits, and XP growth bonuses.
- **Interactive 11v11 Tactics Board**: Visualized on a realistic pitch with coordinate tokens for all 11 starters across popular formations (`4-3-3`, `4-2-3-1`, `4-4-2`, `3-5-2`).
- **Tactical Sub-Tabs**: Dedicated modules for Formation & Build-up styles, Team Instructions, Individual Player Roles, and Set Piece specialists.

### 👥 2. 14-Player Squad & Player Evolution
- **Complete Squad Management**: Manage your full 14-player roster (11 Starters + 3 Substitutes).
- **Player Personality Traits & Synergy**: Distinct traits including *Creative, Flair, Aggressive, Tenacious, Methodical, and Leader* with trait-specific directive resonance.
- **AI Prompt Mastery & Evolution**: Track player Tactical Mastery %, Growth XP meters, potential ratings, and individual performance dossiers.
- **Dynamic Cartoon Avatars**: Unique procedural visual avatars rendered for every squad member.

### 💰 3. Realistic Transfer Market & Chief Scout Network
- **Tier-Based Scouting Database**: Explore domestic and international targets categorized from Grassroots (Tier 4) to Elite World Class (Tier 1).
- **Chief Scout Dossiers**: Detailed scouting reports analyzing tactical fit, wage demands, release clauses, and personality compatibility.
- **Realistic Signing Realism**: Players evaluate your club's prestige, division tier, and budget constraints before agreeing to negotiate.
- **Youth Academy Recruitment**: Scout promising academy prospects to develop into future stars.

### ⚡ 4. High-Performance 2D Match Simulation Engine
- **30 Ticks/Sec Physics Engine**: Real-time 2D spatial simulation with ball physics, passing vectors, stamina decay, and shot trajectory calculations.
- **Live Touchline Dugout**: Issue real-time tactical shouts, adjust defensive lines, and make impactful substitutions during live matches.
- **Multimodal AI Commentary & Crowd Atmosphere**: Dynamic play-by-play commentary feed, stadium decibel tracking, fan sentiment, and chairperson backing meters.
- **Post-Match Analytics**: Detailed xG charts, possession breakdowns, player ratings, and AI post-match press conferences.

### 🎨 5. IBM Carbon Light Design System
- High-contrast, restrained enterprise aesthetic built with `#FFFFFF` card surfaces, subtle 1px `#E0E0E0` borders, `#0F6B45` Carbon green accents, and `#161616` primary typography.
- Zero illegible dark-on-dark text or neon clutter.

---

## 🏗️ Architecture

```
agentic-football-cup/
├── server/                      # Simulation Backend & API
│   ├── engine/
│   │   ├── PitchEngine.js       # 2D spatial physics & match tick simulation
│   │   └── TacticsInterpreter.js # Natural language prompt to engine weights
│   ├── data/
│   │   ├── championshipTeams.js # Team databases & opponent profiles
│   │   └── transfers.json       # Transfer market scouting database
│   └── index.js                 # Express HTTP + WebSocket Server
├── src/                         # Frontend Application (React 19 + TypeScript)
│   ├── components/              # Carbon UI Components
│   │   ├── DashboardOverview.tsx    # 14-player squad dashboard & club status
│   │   ├── TacticsBoardCarbon.tsx   # 11v11 tactics board & prompt analyzer
│   │   ├── TransferMarket.tsx       # Scouting HUD & market negotiations
│   │   ├── PitchCanvas.tsx          # 2D live pitch rendering
│   │   ├── LiveTacticsDugout.tsx    # Touchline dugout & substitutions
│   │   ├── PlayerDossierModal.tsx   # Deep player inspection & stats
│   │   ├── PromptQualityAnalyzer.tsx # Real-time tactical prompt evaluation
│   │   └── CarbonHeader.tsx         # Top application navigation & search
│   ├── types/                   # TypeScript interfaces & types
│   ├── App.tsx                  # Main application orchestrator
│   └── index.css                # IBM Carbon design tokens & utilities
├── package.json
└── vite.config.ts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` (v9.0 or higher)

### 1. Installation
Clone the repository and install all dependencies:

```bash
git clone https://github.com/cyarwood80/CAIRN_Football_Manager.git
cd CAIRN_Football_Manager
npm install
```

### 2. Development Mode
Run both the backend simulation server and the frontend client concurrently:

```bash
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Simulation Server**: `http://localhost:3001` (WebSocket on `ws://localhost:3001`)

### 3. Running Services Separately
If preferred, you can run the server and client in independent terminals:

```bash
# Terminal 1: Backend Server
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

### 4. Production Build & Linting
Validate TypeScript types and build the production bundle:

```bash
# Build bundle
npm run build

# Run high-performance linter
npm run lint
```

---

## 🐳 Docker Deployment

To build and run using Docker:

```bash
# Build Docker image
docker build -t cairn-football-manager .

# Run container
docker run -p 3001:3001 -p 5173:5173 cairn-football-manager
```

Or using Docker Compose:

```bash
docker-compose up -d
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues](https://github.com/cyarwood80/CAIRN_Football_Manager/issues) page.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
