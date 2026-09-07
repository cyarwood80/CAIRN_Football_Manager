# ⚽ CAIRN FC — AI Football Championship Manager

> **A next-generation Agentic AI football simulation, club management suite, and interactive prompt engineering laboratory built with React 19, TypeScript, Vite, Node.js WebSocket engine, and IBM Carbon Design System.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![IBM Carbon](https://img.shields.io/badge/IBM_Carbon_Design-0F62FE?style=for-the-badge&logo=ibm&logoColor=white)](https://carbondesignsystem.com/)
[![Ollama Local AI](https://img.shields.io/badge/Ollama-Local_LLM-black?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com/)

---

## 🌟 Key Highlights & Features

### 🎓 1. Educational Prompt Engineering Masterclass & Lab
CAIRN FC is built as an interactive learning laboratory for **AI prompt engineering and multi-agent coordination**.
- **The 6 Pillars Masterclass**:
  1. **Persona & Role Conditioning**: System prompt conditioning via player personality traits (*Creative, Tenacious, Aggressive, Methodical, Flair, Leader*).
  2. **Zero-Shot vs. Few-Shot In-Context Learning**: Providing concrete spatial examples to guide player decisions without stochastic hallucinations.
  3. **Chain-of-Thought (CoT) Reasoning**: Guiding step-by-step pitch analysis with visible `<think>` token traces and internal agent monologues.
  4. **Negative Constraints & Guardrails**: Defining explicit boundary conditions (e.g., *"Do NOT commit slide tackles in the 25-yard danger zone"*).
  5. **Temperature & Stochasticity**: Balancing tactical discipline vs creative flair in model outputs.
  6. **Context Density & Attention Management**: Crafting high-impact concise prompts that maximize LLM adherence.
- **⚡ 1-Click AI Prompt Optimizer**: Upgrades casual coaching shouts into structured UEFA Pro prompt engineering patterns via local Ollama `/api/llm/optimize`.
- **🧪 Prompt A/B Testing Sandbox Lab**: Pits Formulation A vs Formulation B side-by-side on any squad player to compare latency (`ms`), reasoning traces, and behavioral weight shifts (`Press %`, `Shot %`, `Pass %`).
- **🏆 Skill Badges & Achievements**: 6 unlockable badges tracking prompt engineering mastery throughout your managerial career.

---

### 🧠 2. Agentic AI Tactics & Natural Language Coaching
- **Plain-English Tactical Studio**: Direct your squad using free-form tactical instructions (e.g., *"Relentless high pressing, suffocate opponent in their half, blitz vertical counter-attacks immediately on turnover"*).
- **Prompt-to-Pitch Real-Time Causality**: Manager prompts dynamically adjust player weights in real time (`Press: 95% (+35%)`, `Shot Greed: 90% (+40%)`, `Pass Direct: 25%`).
- **Live Event Attribution**: Match events triggered directly by prompts are attributed in the commentary ticker with `[⚡ +40% Shot Greed]` and `[⚡ +35% Press Aggression]` badges.
- **Interactive 11v11 Tactics Board**: Coordinate tokens for all 11 starters across popular formations (`4-3-3`, `4-2-3-1`, `4-4-2`, `3-5-2`) with live prompt optimization directly inside the instructions tab.

---

### 🏆 3. Four-Tier English Football League Pyramid
- **Grassroots to Glory**: Start at the bottom of the English pyramid and fight for promotion:
  - **Tier 4**: National League (Grassroots starting division — 24 clubs)
  - **Tier 3**: Division Two (24 clubs)
  - **Tier 2**: Championship (24 clubs)
  - **Tier 1**: Premier League (20 elite clubs)
- **38-Gameweek Season Calendar**: Realistic round-robin fixture generation, home/away scheduling, daily calendar progression, and matchday kickoff alerts.
- **Promotion & Relegation Engine**: Automatic season conclusion evaluation, playoff resolution, trophy celebrations, and Boardroom funding bonuses.

---

### ⚡ 4. High-Performance 2D Match Simulation Arena
- **30 Ticks/Sec Spatial Physics Engine**: Real-time 2D simulation with ball trajectory physics, player passing vectors, stamina decay, and collision detection.
- **Dynamic 2/3 & 1/3 Split Layout**:
  - **Left Column**: Responsive pitch canvas, kickoff controls, starting XI tokens, and 4 tactical substitutes bench (`GK`, `DEF`, `MID`, `FWD`).
  - **Right Column**: Live scoreboard, match pace controls (`1x`, `2x`, `4x`), Opta stats, live dugout tactical shouts, 1-on-1 touchline chat with live reasoning traces, and commentary feed.
- **Multimodal Atmosphere**: Crowd decibel meters, stadium atmosphere audio hooks, fan sentiment, and chairperson confidence tracking.

---

### 💼 5. Complete Club Management Suite
- **Club Inbox**: Interactive message center receiving official board mandates, chief scout alerts, physio fitness reports, and media interview requests.
- **Scouting Hub & Transfer Market**: Tier-based scouting database (Tier 1 to Tier 4) with realistic signing feasibility, personality compatibility ratings, and youth academy trials.
- **Finances & Board Room**: Financial Fair Play (FFP) tracking, weekly wage bill breakdown, matchday ticket revenue, prize money, and warchest management.
- **AI Assistant Coach (Roy Evans)**: On-demand tactical debriefs and opposition scouting briefings.

---

### 🎨 6. IBM Carbon Design System
- Restrained, high-contrast enterprise aesthetic built with `#FFFFFF` card surfaces, subtle 1px `#E0E0E0` borders, `#0F6B45` Carbon green accents, and `#161616` primary typography.
- High-contrast visual tokens, responsive scaling, and zero illegible dark-on-dark text.

---

## 🏗️ Architecture

```
agentic-football-cup/
├── server/                           # Simulation Backend & AI Services
│   ├── engine/
│   │   ├── PitchEngine.js            # 30Hz 2D spatial physics & match tick engine
│   │   ├── TacticsCompiler.js        # Natural language prompt to engine weights
│   │   ├── cmDatabase.js             # 4-tier club rosters, players & scouting data
│   │   ├── calendarEngine.js         # Season calendar, gameweeks & daily progression
│   │   └── promotionEngine.js        # Season conclusion & promotion/relegation logic
│   ├── services/
│   │   └── llmService.js             # Ollama local LLM connector, prompt optimizer & A/B lab
│   └── index.js                      # Express HTTP + WebSocket Server
├── src/                              # Frontend Client (React 19 + TypeScript)
│   ├── components/
│   │   ├── PromptMasterclassModal.tsx # 4-tab interactive prompt engineering masterclass
│   │   ├── TacticsBoardCarbon.tsx    # 11v11 tactics board & inline 1-click optimizer
│   │   ├── PitchCanvas.tsx           # Scaled 2D live pitch canvas
│   │   ├── MatchHUD.tsx              # Scoreboard, clock, pace & Opta stats
│   │   ├── LiveTacticsDugout.tsx     # Touchline dugout & macro tactical shouts
│   │   ├── EmbeddedPlayerChat.tsx    # 1-on-1 player chat with local LLM reasoning
│   │   ├── TransferMarket.tsx        # 4-tier scouting hub & contract negotiations
│   │   ├── DashboardOverview.tsx     # Club overview, starting XI & next fixture
│   │   ├── ClubInbox.tsx             # Interactive club message center
│   │   ├── FinancesOverview.tsx      # Balance sheet, wage bill & FFP compliance
│   │   ├── SeasonCalendar.tsx        # 38-game schedule & calendar progression
│   │   └── CarbonHeader.tsx          # Top navigation, search & AI model badge
│   ├── types/                        # TypeScript interfaces & types
│   ├── App.tsx                       # Main application orchestrator
│   └── index.css                     # IBM Carbon styling & design tokens
├── package.json
└── vite.config.ts
```

---

## 🦙 Local AI Models (Ollama) & Setup

CAIRN FC automatically discovers and connects to your local Ollama instance on `http://localhost:11434` with zero configuration.

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com/).

### 2. Pull a Recommended Model
Open your terminal and run:

```bash
# Recommended ultra-fast lightweight model (1.3GB):
ollama run llama3.2:1b

# Or higher-parameter reasoning models:
ollama pull deepseek-r1:8b
ollama pull qwen2.5:7b
ollama pull mistral
```

### 3. Start CAIRN FC
Launch `npm run dev`. The top application bar will automatically display:
`🟢 AI: llama3.2:1b (Connected)`

*(Note: If Ollama is not running, CAIRN FC gracefully falls back to its deterministic heuristic cognitive engine, ensuring 100% functionality at all times).*

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` (v9.0 or higher)

### 1. Clone & Install
```bash
git clone https://github.com/cyarwood80/CAIRN_Football_Manager.git
cd CAIRN_Football_Manager
npm install
```

### 2. Run in Development Mode
Run both backend simulation server and frontend client concurrently:
```bash
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Simulation Server**: [http://localhost:3001](http://localhost:3001) (WebSocket on `ws://localhost:3001`)

### 3. Production Build & Verification
Validate TypeScript types and build the production bundle:
```bash
# Production bundle build
npm run build

# High-performance linter
npm run lint
```

---

## 🐳 Docker Deployment

To run containerized via Docker:

```bash
# Build and run with Docker Compose
docker compose up -d --build
```

Access the app on `http://localhost:5173` (or `http://localhost:3001` in production).

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
