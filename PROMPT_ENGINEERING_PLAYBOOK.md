# 📖 UEFA Pro AI Prompt Engineering Playbook

> **The definitive operational guide to prompting autonomous agents in the CAIRN FC simulation engine.**

---

## 🏛️ The 6 Pillars of Football Prompt Engineering

### Pillar 1: Persona & Role Conditioning (System Prompts)
In Large Language Models, the system prompt conditions cognitive priors and emotional valence. In CAIRN FC, each player's personality trait acts as a persistent system prompt conditioning how they interpret your coaching instructions:

| Player Trait | Cognitive Prior | Manager Prompt Strategy |
| :--- | :--- | :--- |
| **🧠 Creative** | Seeks high-risk, high-reward passing lanes; low tolerance for rigid micromanagement. | Give positional freedom: *"Drop between lines and thread through balls."* |
| **🛡️ Tenacious** | Thrives on high work-rate, second-ball recovery, and defensive cover. | Direct pressing zones: *"Hunt the opponent pivot within 4 seconds of turnover."* |
| **⚡ Flair** | Prioritizes 1v1 isolation and unpredictable dribbling in the final third. | Encourage direct duels: *"Isolate fullbacks and pull the trigger on sight."* |
| **🧱 Stopper** | Conservative risk profile; prioritizes clearance height and defensive shape. | Anchor the box: *"Hold defensive line depth; clear aerial deliveries with authority."* |
| **👑 Leader** | Rallies teammates during adverse scorelines; high tactical adherence. | Delegate macro organization: *"Organize midfield press and demand 100% work rate."* |

---

### Pillar 2: Zero-Shot vs. Few-Shot In-Context Learning
Zero-shot instructions often lead to stochastic hallucinations. Providing **1–2 concrete scenarios (Few-Shot examples)** within your coaching instruction dramatically improves transition precision:

- ❌ **Zero-Shot (Vague)**:
  > *"Move the ball forward quickly and try to score."*
- ✅ **Few-Shot (Masterclass)**:
  > *"When transitioning into the middle third, execute rapid 1-2 passing combinations. Example: If #6 receives with back to goal, lay off to #8 and burst down the left channel; if closed down, recycle to the CDM."*

---

### Pillar 3: Chain-of-Thought (CoT) Spatial Reasoning
Reasoning models generate internal thought tokens (`<think>` reasoning traces) before committing to a physical action. Prompting players with step-by-step cognitive evaluation prevents turnover panic:

- **Step 1**: Scan for overlapping fullback or central striker in open half-spaces.
- **Step 2**: If primary passing lane is blocked, execute a 1-touch recycle pass to the defensive pivot.
- **Step 3**: If opponent presses aggressively, switch play to the opposite wing.

---

### Pillar 4: Negative Constraints & Guardrails
Setting explicit operational boundaries prevents catastrophic mistakes (reckless fouls, dangerous backpasses, low-probability shots):

- **Trigger**: *"When defending in our defensive third..."*
- **Action**: *"Channel opponent attackers toward the touchlines with disciplined jockeying."*
- **Guardrail**: *"Do NOT commit slide tackles inside the 25-yard danger zone or dive into 1v1 challenges when you are the last defender."*

---

### Pillar 5: Temperature & Stochasticity
- **Low Temperature (0.1–0.3)**: High tactical discipline, rigid formation adherence, conservative pass selection. Ideal for closing out matches with a 1-0 lead.
- **High Temperature (0.7–0.9)**: Creative improvisation, spontaneous long-range shots, unpredictable flair dribbles. Ideal when chasing an equalizer in the 85th minute.

---

### Pillar 6: Context Density & Priority Management
LLMs attend most strongly to the beginning and end of a prompt. Keep coaching directives structured:
1. **Primary Objective**: *"High-tempo central overload."*
2. **Key Spatial Triggers**: *"Middle third turnovers."*
3. **Safety Guardrail**: *"Preserve 2 center-backs behind the ball."*

---

## 🧪 Prompt A/B Testing Methodology
Use the built-in **Prompt A/B Lab** to test formulations before key matchdays:
1. Select a target starter (e.g. Star Striker).
2. Input **Formulation A** (Baseline) vs **Formulation B** (Structured CoT).
3. Inspect model latency (`ms`), generated response tokens, and weight shifts (`pressBias`, `shotBias`, `passBias`).
4. Apply the winning formulation directly to your matchday team instructions.
