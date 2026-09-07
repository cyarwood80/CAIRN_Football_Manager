# 🏗️ CAIRN FC — System Architecture & Technical Specification

## 1. High-Level Architecture Overview

CAIRN FC combines a **React 19 single-page application** styled with IBM Carbon Design tokens and a **Node.js Express + WebSocket server** executing a deterministic 30Hz 2D match simulation engine with direct bindings to local Large Language Models via Ollama.

```
+-------------------------------------------------------------------------+
|                              Frontend Client                            |
|                          (React 19 + TypeScript)                        |
|                                                                         |
|  [Tactics Board]      [Matchday Arena]      [Prompt Masterclass Lab]    |
|   - 11v11 Tokens       - 2D Canvas (30fps)   - 6 Pillars Curriculum     |
|   - Prompt Optimizer   - Dugout Shouts       - A/B Dual Inference       |
|   - Quality Analyzer   - Touchline Chat      - Skill Badges Tracker     |
+--------------------+--------------------------------+-------------------+
                     |                                |
        REST API (HTTP / 3001)             WebSocket (ws://3001)
                     |                                |
+--------------------+--------------------------------+-------------------+
|                              Backend Server                             |
|                           (Node.js + Express)                           |
|                                                                         |
|  [REST Endpoints]          [WebSocket Hub]       [Pitch Engine (30Hz)]  |
|   - /api/llm/optimize       - Room State          - Spatial 2D Physics  |
|   - /api/llm/compare        - Client Sync         - Ball Trajectory     |
|   - /api/cm/market          - State Broadcast     - Prompt Causality    |
|   - /api/calendar           - Event Telemetry     - Fatigue & Stamina   |
+--------------------+----------------------------------------------------+
                     |
         Ollama REST API (http://localhost:11434)
                     |
+--------------------+----------------------------------------------------+
|                         Local LLM Engine                                |
|             (Llama 3.2:1b, DeepSeek-R1:8b, Qwen 2.5:7b)                 |
|                                                                         |
|  - Real-Time Touchline Shouts Reasoning (<think>)                       |
|  - UEFA Pro 1-Click Prompt Engineering Compiler                         |
|  - Assistant Coach Opposition Briefings                                 |
+-------------------------------------------------------------------------+
```

---

## 2. Match Simulation & Physics Engine (`PitchEngine.js`)

- **Tick Rate**: Executes at 30 ticks/sec (33.3ms intervals).
- **Coordinate Space**: Pitch dimensions mapped to 100x100 relative percentages.
- **Player State Machine**:
  - `IDLE` $\rightarrow$ Position retention based on formation anchor.
  - `CHASE_BALL` $\rightarrow$ Vector acceleration toward ball position governed by sprint velocity and `pressBias`.
  - `DRIBBLE` $\rightarrow$ Ball retention with directional heading toward opponent goal.
  - `PASS` $\rightarrow$ Raycast pass candidate evaluation, weighted by vision and teammate openness.
  - `SHOOT` $\rightarrow$ Trajectory vector calculation toward goal posts, modified by goalkeeper positioning and `shotBias`.
- **Real-Time Prompt-to-Pitch Causality**:
  - Manager prompts modify player weight matrices dynamically:
    $$\text{Effective Press} = \text{Base Press} + \Delta_{\text{prompt}}(\text{Aggression})$$
    $$\text{Effective Shot Greed} = \text{Base Shot} + \Delta_{\text{prompt}}(\text{Shot Directness})$$
  - Event triggers log attribution tags (`⚡ +40% Shot Greed`, `⚡ +35% Press Aggression`) directly to the commentary feed.

---

## 3. Four-Tier League Pyramid & Calendar System

- **Divisions**:
  - `tier_4`: National League (24 clubs)
  - `tier_3`: Division Two (24 clubs)
  - `tier_2`: Championship (24 clubs)
  - `tier_1`: Premier League (20 clubs)
- **Round-Robin Scheduling**: Symmetrical round-robin engine producing 38 gameweeks with home/away reversal.
- **Daily Calendar Progression**:
  - Day-by-day progression simulates training mastery gains and scout discovery events.
  - Advance to Next Matchday skips intermediate rest days directly to the fixture kickoff.
- **Promotion & Relegation**: Automatically resolves at the end of Gameweek 38, promoting top-performing clubs and awarding Boardroom capital injections.

---

## 4. Local LLM Service Layer (`llmService.js`)

- **Discovery**: Probes `http://localhost:11434/api/tags` on startup to detect installed models.
- **Model Switching**: Supports dynamic runtime switching between `llama3.2:1b`, `deepseek-r1:8b`, `qwen2.5:7b`, etc.
- **Graceful Heuristic Fallback**: If Ollama is offline, deterministic heuristic cognitive engines ensure 100% functionality without service interruption.
