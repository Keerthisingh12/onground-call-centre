# On-Ground.ai — Agentic Call Centre

**Interactive Frontend & Realtime Voice Demonstration**  
Hiring Assignment Submission | Forward Deployed Engineer / Agentic Engineer

| Detail | Information |
|---|---|
| **Author** | Keerthi G Singh |
| **Target Sector** | Retail Call Centre |
| **Reference Brand** | The Sleep Company |
| **Live Demo** | [https://keerthisingh12.github.io/onground-call-centre/](https://keerthisingh12.github.io/onground-call-centre/) |
| **GitHub Repository** | [https://github.com/Keerthisingh12/onground-call-centre](https://github.com/Keerthisingh12/onground-call-centre) |

---

## 🌟 Project Overview

On-Ground.ai Call Centre is a high-performance, responsive web application and real-time voice system designed for retail customer support agents. Inspired by The Sleep Company's retail call workflows, it enables agents to manage customer enquiries, prioritize high-value leads, inspect customer profiles, review SOP adherence, collaborate with teammates, and test both human-to-human WebRTC audio and AI voice agents.

The project demonstrates:
1. **Interactive Agent Workflows**: Executive analytics, lead queues, SOP scorecards, scheduling calendar, team collaboration ("Pulse"), and simulated call coaching.
2. **Genuine Human-to-Human Audio Calling (`/live-audio`)**: Browser-to-browser WebRTC two-way voice call powered by LiveKit Cloud.
3. **Avani AI Voice Assistant (`/ai-call`)**: Bidirectional streaming voice agent using the LiveKit Agents framework with an ultra-low latency STT → LLM → TTS pipeline.
4. **Responsive & Accessible UI**: Mobile drawer navigation, mobile bottom bar with safe-area spacing, and high-contrast typography compliant with WCAG standards.

---

## 🚀 Live Demo & Key Routes

The application is deployed on GitHub Pages with client-side SPA routing:

- **Main Dashboard**: [https://keerthisingh12.github.io/onground-call-centre/](https://keerthisingh12.github.io/onground-call-centre/)
- **Live Audio Demo (Human-to-Human)**: [https://keerthisingh12.github.io/onground-call-centre/live-audio](https://keerthisingh12.github.io/onground-call-centre/live-audio)
- **Avani AI Voice Call**: [https://keerthisingh12.github.io/onground-call-centre/ai-call](https://keerthisingh12.github.io/onground-call-centre/ai-call)
- **Planner & Leads**: [https://keerthisingh12.github.io/onground-call-centre/plan](https://keerthisingh12.github.io/onground-call-centre/plan)
- **Calendar**: [https://keerthisingh12.github.io/onground-call-centre/calendar](https://keerthisingh12.github.io/onground-call-centre/calendar)
- **Pulse Team Collaboration**: [https://keerthisingh12.github.io/onground-call-centre/pulse](https://keerthisingh12.github.io/onground-call-centre/pulse)
- **Practice Call**: [https://keerthisingh12.github.io/onground-call-centre/practise](https://keerthisingh12.github.io/onground-call-centre/practise)

*(Note: No external video demonstration link is provided; test the live deployment directly via the URLs above).*

---

## ✨ Features & Modules

### 1. Executive Dashboard
- **Agent Shift Overview**: Active agent identity, shift duration, and operational status.
- **KPI Metrics**: Real-time performance indicators including OG Score (Adherence), Average Handle Time (AHT), Customer Satisfaction (CSAT), and Waiting Queue.
- **Charts & Visualizations**: Interactive weekly call volume and customer sentiment charts built with Recharts.
- **Waiting Queue**: Live triage of pending callers categorized by urgency and intent.

### 2. Planner & Lead Management
- **Calls to Make**: Prioritized lead queue ranked by customer attractiveness score, purchasing stage, and budget fit.
- **Incoming & Missed**: Callback queue with urgency indicators and one-click callback action.
- **Recent Call Review & SOP Adherence**: Post-call evaluation examining greeting, needs discovery, mattress product pitch, EMI financing options, warranty disclosure, and closing etiquette.

### 3. Lead 360° Inspection Modal
- Comprehensive customer profile, journey timeline, product preferences, and budget fit.
- Attractiveness score and buying signals.
- Contextual agent notes with quick actions to initiate calls.

### 4. Calendar & Scheduling
- Monthly and daily calendar views for customer follow-up calls and supervisor coaching sessions.
- Callback scheduling with team invite actions.

### 5. Pulse — Team Collaboration
- Department channels and direct messaging for call centre floor communication.
- Coaching threads and automated objection-handling suggestions.
- Pinned callback decision cards with snooze and reschedule actions.

### 6. Simulated Call & Practice Workflows
- **Simulated Call**: Realistic agent call screen with live timer, dynamic transcript feed, objection handling prompts, hold/mute controls, and post-call disposition logging.
- **Practice Sandbox**: Interactive training scenarios with automated dialogue progression and scoring.

---

## 🎙️ Realtime Voice Architecture

The project features two distinct real-time calling systems:

### A. Genuine Human-to-Human Audio Calling (`/live-audio`)
- **Technology**: LiveKit WebRTC client (`livekit-client`).
- **Functionality**: Full-duplex two-way audio between two browser participants in any room.
- **How to verify**:
  1. Open the [Live Audio Demo](https://keerthisingh12.github.io/onground-call-centre/live-audio) in Tab 1 (or Device 1) with display name `Agent Alice` and room `Support-Room-1`.
  2. Open the same link in Tab 2 (or Device 2) with display name `Customer Bob` and room `Support-Room-1`.
  3. Click **Connect**. Audio is transmitted bi-directionally in real time with mute, device selection, and room status indicators.

### B. Avani AI Voice Assistant (`/ai-call`)
- **Technology**: LiveKit Agents Python SDK 1.8.6 + LiveKit Inference.
- **Pipeline Architecture**:
  - **Speech-to-Text (STT)**: Deepgram Nova-3 (`deepgram/nova-3`) streaming speech recognition.
  - **Large Language Model (LLM)**: OpenAI GPT-4o-mini (`openai/gpt-4o-mini`) streaming conversational generation.
  - **Text-to-Speech (TTS)**: Cartesia Sonic-3 (`cartesia/sonic-3`) streaming low-latency voice synthesis.
  - **Turn Detection & VAD**: Silero VAD + LiveKit `inference.TurnDetector` with smooth endpointing (`min_delay=0.5s`) and natural interruption handling.
  - **Agent Dispatch**: Automatic dispatch via backend token endpoint (`POST /api/token`) with room configuration targeting `onground-assistant`.
- **Persona**: Avani, empathetic retail voice assistant for The Sleep Company assisting customers with mattress queries, delivery, and sleep accessories.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Routing & State** | React Router (with base path support), React Context (`AppContext`) |
| **Styling & Design** | Pure CSS Modules, Mobile Safe-Area Insets, WCAG High-Contrast Tokens |
| **Icons & Charts** | Tabler Icons React, Recharts |
| **Testing & Linting** | Vitest, React Testing Library, oxlint |
| **Realtime WebRTC** | LiveKit Client SDK (`livekit-client`) |
| **AI Agent Worker** | Python 3.11+, `livekit-agents` 1.8.6, `livekit-plugins-silero` |
| **Inference Models** | Deepgram Nova-3 (STT), OpenAI GPT-4o-mini (LLM), Cartesia Sonic-3 (TTS) |
| **Serverless Backend** | Vercel Serverless Functions (`api/token.ts`, `api/health.ts`), `livekit-server-sdk`, Zod |
| **Deployment** | GitHub Actions & GitHub Pages |

---

## 🔒 Environment Variables & Security

Sensitive credentials (such as API keys and secrets) are **never** committed to version control. The repository includes `.env.example` as a template.

### 1. Frontend Environment Variables (`.env.local`)
Create `.env.local` in the project root for local development (strictly gitignored):

```env
# Public development token server ID for human-to-human live audio testing (non-secret identifier)
VITE_LIVEKIT_TOKEN_SERVER_ID=your-token-server-id-here

# Optional: URL of deployed backend serverless API for token generation
VITE_API_BASE_URL=https://your-vercel-deployment.vercel.app
```

### 2. Backend & Agent Environment Variables (`.env.local` or Cloud Secrets)
Used by the serverless token API (`api/token.ts`) and the Python voice agent (`agent/main.py`):

```env
# LiveKit Cloud Project Configuration (from LiveKit Cloud Console)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=API_xxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-livekit-api-secret-here

# Production Allowed Origin for CORS
ALLOWED_ORIGIN=https://keerthisingh12.github.io
```

> **Security Note:**
> - `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` must **never** be included in frontend code or client bundles.
> - `VITE_LIVEKIT_TOKEN_SERVER_ID` is a non-secret project identifier used by LiveKit's sandbox token server.

---

## 💻 Local Setup & Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.11 or higher (for the AI voice worker)

### 1. Clone & Install Frontend
```bash
git clone https://github.com/Keerthisingh12/onground-call-centre.git
cd onground-call-centre

# Install frontend dependencies
npm ci
```

### 2. Start the Frontend Development Server
```bash
npm run dev
```
Open `https://localhost:5173/` in your browser. (The local server runs over HTTPS via `@vitejs/plugin-basic-ssl` to enable local microphone access across test devices).

### 3. Start the Python AI Voice Agent (Optional for `/ai-call`)
To test the AI voice agent locally with your LiveKit credentials:

```bash
# Set up Python virtual environment
cd agent
python3 -m venv .venv
source .venv/bin/activate

# Install agent dependencies
pip install -r requirements.txt

# Start the agent worker in dev mode
python main.py dev
```
The worker registers the `onground-assistant` agent name and listens for dispatched rooms.

---

## 🧪 Testing & Code Quality

The project includes unit tests, integration tests, lint checks, and Python agent smoke tests.

### Run Frontend Unit & Integration Tests (Vitest)
```bash
npm run test
```
*Current test suite: 9 test files, 50/50 passing tests covering navigation, dashboard, leads modal, call workflows, calendar, pulse, live audio, and token endpoints.*

### Run Linter (oxlint)
```bash
npm run lint
```
*Runs static analysis across all TypeScript/TSX source files with 0 errors.*

### Validate TypeScript & Production Build
```bash
npm run build
```
*Executes `tsc -b` and builds the optimized Vite bundle with zero type or bundling errors.*

### Run Python Voice Agent Smoke Tests (pytest)
```bash
agent/.venv/bin/pytest agent/smoke_test.py -v
```
*Validates agent dispatch configuration, system prompts, entrypoint signatures, and pipeline initialization.*

---

## 📱 Responsive Design & Accessibility Improvements

Recent enhancements have optimized the application across mobile, tablet, and desktop displays:

1. **Collapsible Mobile Navigation Drawer**:
   - Touch-friendly hamburger menu toggle on mobile screens (`< 768px`).
   - Automatically closes on route navigation, backdrop tap, or pressing the `Escape` key.
   - Prevents horizontal viewport overflow.
2. **Fixed Bottom Navigation with Safe Clearance**:
   - Fixed mobile bottom navigation with iOS safe-area inset support (`env(safe-area-inset-bottom)`).
   - Dynamic main content padding (`padding-bottom: calc(72px + env(...))`) across all pages (Dashboard, Plan, Calendar, Pulse, Practise, AI Call, Live Audio) to ensure no dashboard content is obscured.
3. **WCAG-Compliant Text Contrast**:
   - Primary text, headings, form labels, and instructions upgraded to high-contrast tones (`#111111`, `#171717`, `#262626`).
   - Secondary metadata and helper labels set to readable slate greys (`#404040` / `#525252`), completely eliminating washed-out or low-contrast text on white/light backgrounds.
   - Brand emerald green (`#059669`, `#10b981`) preserved for primary actions, active navigation states, and status badges with verified button text contrast.

---

## ⚠️ Known Limitations & Roadmap

1. **PSTN / SIP Telephony Calling**:
   - **Status**: Pending / Roadmap.
   - Real inbound and outbound calling to traditional cellular and landline phone numbers (PSTN via SIP trunking) requires configured Twilio/carrier SIP trunks and verified E.164 caller IDs.
   - Current active calling features operate via **browser WebRTC** (human-to-human and AI voice agent).
2. **Static GitHub Pages Deployment Scope**:
   - The public demo on GitHub Pages is a static client bundle.
   - The `/live-audio` route functions live via LiveKit's token server.
   - The `/ai-call` route requires either running the local agent worker (`agent/main.py dev`) or hosting the Python worker via LiveKit Cloud Agent Hosting / container service with valid `LIVEKIT_URL` credentials.

---

## 📄 License & Attribution

Developed for the **On-Ground.ai** Forward Deployed Engineer hiring assignment.  
Customer records, performance indicators, call transcripts, and coaching scenarios are demonstration data modeled for The Sleep Company retail context.
