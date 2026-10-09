# On-Ground.ai — Agentic Call Centre Frontend

> **Hiring Assignment Submission**  
> **Role:** Forward Deployed Engineer / Agentic Engineer — Intern + Full-Time  
> **Candidate:** Keerthi G Singh  
> **Company:** On-Ground.ai, Bengaluru  
> **Target Sector Implementation:** Retail (The Sleep Company)

---

## 🌟 Executive Summary

This repository contains a high-fidelity, responsive frontend reconstruction of the **On-Ground.ai Call Centre Application**. Built from ground up using **React 19**, **TypeScript** (strict mode), **Vite**, **Tabler Icons**, and **Recharts**, the application empowers call centre floor agents with agentic workflows, dynamic call queues, objective SOP compliance auditing, calendar scheduling, team collaboration via Pulse, and deterministic call simulation and practice modes.

---

## 🚀 Live Demo & Repository

- **Public Live Demo:** [https://onground-call-centre.vercel.app](https://onground-call-centre.vercel.app) *(or Vercel deployed instance)*
- **GitHub Repository:** [https://github.com/Keerthisingh12/onground-call-centre](https://github.com/Keerthisingh12/onground-call-centre)

---

## 📦 Key Features & Screen Breakdown

### 1. 📊 Executive Dashboard (`/` & `/dashboard`)
- **Agent Hero & Status:** Real-time shift status ("On Queue"), shift greeting, agent persona ("Arvind Rajan · The Sleep Company").
- **Live Performance KPIs:** OG Score™ (76, ▲13), Avg Handle Time (4m 12s, ▼8%), CSAT Today (94%), Live Queue counter (2 waiting).
- **Interactive Progress & Earnings:** Daily leads created/called delta tracking, monthly incentive slab tracker (₹5,200 earned toward ₹6,000 target with coached move breakdown).
- **Priority Call Queue ("Who's Waiting"):** Direct queue inspection with urgency badges (High / Medium / Low wait times) and intent summary.
- **Weekly Activity & CSAT Charts:** Recharts bar chart showing 7-day call volume and line chart tracking CSAT trend.
- **Agent Tasks Checklist:** Quick actions opening leads, Pulse threads, or SOP reviews.

### 2. 📞 Planner (`/plan`)
A unified tabbed calling center with three distinct perspectives:
- **Calls to Make (`/plan/calls`):**
  - Paginated lead queue sorted by **Attractiveness Score** descending.
  - Expandable lead row revealing customer story, budget fit, need match, decision stage subscores, and CRM notes.
  - Direct actions to initiate simulated call or open full modal inspection.
- **Incoming & Missed Calls (`/plan/incoming`):**
  - Identifies missed customer enquiries ranked by **Expected Customer Value at Stake** (e.g., ₹35,270 total value).
  - One-click callback action with visual confirmation tracking.
- **Recent Call Review (`/plan/recent`):**
  - Comprehensive call log filtered by All, Outgoing, Incoming, or Missed.
  - Direction badges, call outcome tags, and timestamp/duration details.
  - **Interactive SOP Adherence Review:** Tap any call to inspect compliance across 6 objective criteria (Greeting, Needs Discovery, Product Pitch, EMI Financing, Warranty, Closing) complete with quoted call evidence and adherence percentages.

### 3. 👤 Deep Lead Inspection Modal
- Full customer journey timeline (store visits, website visits, missed calls).
- AI Signal breakdown: Attractiveness Score, Intent Score, ICP Match.
- Subscore progress meters (Budget Fit, Need Match, Decision Stage).
- Keyboard shortcuts: `ArrowLeft` / `ArrowRight` to cycle leads, `Escape` to close.
- Direct "Call Lead" action initiating the call simulation.

### 4. 🗓️ Dynamic Calendar & Coaching (`/calendar`)
- **Pure JavaScript Date Engine:** Dynamic month grid with leap year calculation, weekday offsets, and navigation across months.
- **Date Status Indicators:** Highlights today, selected day, and visual indicator dots for days with scheduled events.
- **Schedule Tabs:** Toggle between day-specific callbacks and full upcoming session list (SOP coaching, warranty refresher, team huddles).
- **Invite & Share Sheet:** Interactive modal to schedule callbacks and share invites with managers, L&D coaches, or the floor team.

### 5. 💬 Pulse — Floor Collaboration & AI Knowledge (`/pulse`)
- **Searchable Channel Directory:** Direct navigation into `#callcentre-team`, `#all-stores`, `#avani-coaching`, and `#manage-shipment`.
- **Avani AI Copilot Card:** Interactive prompt chips for instant SOP guidance, warranty details, and EMI tables.
- **Pinned Decision Card:** In `#callcentre-team`, agents can interactively **Confirm (4:30pm)** or **Reschedule** customer callback requests (Priya Iyer dispute), updating state and posting real-time confirmations to the thread.
- **Message Composer:** Supports Enter to send, Shift+Enter for newline, autoscroll to latest message, and automated AI coaching responses.
- **Kudos & Recognition Wall:** Displays floor achievements and CSAT milestones.

### 6. 🎧 Simulated Live Call Flow (Deterministic Bonus)
- **Pre-Call Briefing:** Lead summary, target product, expected value, financing notes, and SOP reminder checklist before dialing.
- **Active Call Interface:** Real-time ticking call timer, voice waveform animation, and live transcript stream between Agent and Customer.
- **AI Assist Copilot:** Real-time prompts suggesting EMI angles and objection rebuttals.
- **Interactive Controls:** Toggle Microphone Mute, Call Hold, and End Call.
- **Post-Call Wrap-up:** Outcome selection (Sale Closed, WhatsApp Quote Sent, Callback Scheduled, etc.), agent notes, and persistent logging to Recent Calls.

### 7. 🎯 Practise a Call (Bonus)
- Scripted customer scenarios (e.g. *Ortho GRID — EMI Enquiry*, *Ageing Lead Recovery*).
- Start / pause / step timer and turn-by-turn dialogue progression.
- Automated AI scorecard grading performance against 6 criteria with specific feedback notes.

---

## 🛠️ Architecture & Tech Stack

```
onground-call-centre/
├── src/
│   ├── app/
│   │   └── AppContext.tsx        # Centralized state (active call, recent calls, modals, toasts)
│   ├── assets/                   # Static media and logos
│   ├── components/
│   │   ├── calls/                # ActiveCallModal & in-call simulation
│   │   ├── layout/               # TopBar, Sidebar, BottomNav
│   │   └── leads/                # LeadsModal inspection
│   ├── data/
│   │   ├── callsAndEvents.ts     # KPIs, queue, recent calls, SOP templates, calendar events
│   │   ├── leads.ts              # Canonical lead database (scores, journey, notes)
│   │   ├── practise.ts           # Scripted training scenarios & scorecards
│   │   └── pulse.ts              # Pulse threads, pinned decision cards, DMs
│   ├── features/
│   │   ├── calendar/             # Calendar month grid & invite sheet
│   │   ├── dashboard/            # Dashboard KPIs, Recharts charts, tasks
│   │   ├── plan/                 # Calls to Make, Incoming, Recent & SOP Review
│   │   ├── practise/             # Practice simulator & feedback scorecard
│   │   └── pulse/                # Pulse channels & message threads
│   ├── styles/
│   │   └── global.css            # Design tokens, reset, typography, and responsive layout
│   ├── test/                     # Vitest + React Testing Library test suite
│   ├── types/
│   │   └── index.ts              # Strict TypeScript definitions
│   ├── utils/
│   │   └── format.ts             # Currency (INR), dates, score colors
│   ├── App.tsx                   # Main SPA router & global modal mounts
│   └── main.tsx                  # React DOM root
├── vercel.json                   # SPA rewrite fallback configuration
├── vite.config.ts                # Vite & Vitest configuration
└── package.json
```

- **Framework:** React 19 + TypeScript (Strict)
- **Bundler:** Vite 8
- **Routing:** React Router v7
- **Icons:** `@tabler/icons-react`
- **Charts:** `recharts`
- **Linter:** `oxlint`
- **Testing:** `vitest` + `@testing-library/react` + `@testing-library/jest-dom`

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Keerthisingh12/onground-call-centre.git
cd onground-call-centre

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### Running Tests
```bash
# Run automated Vitest test suite
npm run test
```

### Linting & Build
```bash
# Run oxlint
npm run lint

# Compile TypeScript and generate production bundle
npm run build
```

---

## 🧪 Testing Coverage

The automated test suite verifies:
1. **App Navigation & Shell:** Branding, TopBar OG score, desktop Sidebar, mobile BottomNav, and Dashboard rendering.
2. **Leads Modal Workflow:** Opening leads from dashboard tasks, inspecting lead details, cycling next/previous leads, and closing.
3. **End-to-End Call Flow Simulation:** Transition from pre-call preview -> connecting call -> active timer -> ending call -> selecting outcome wrap-up -> saving and appending to recent calls.
4. **Calendar Navigation:** Month generation, weekday headers, and upcoming coaching events.
5. **Pulse & Collaborative Decisioning:** Channel listing, message threads, and resolving the pinned callback decision card.

---

## 📱 Responsive Design

- **Desktop (>= 1024px):** Fixed navigation sidebar (224px), comprehensive topbar, multi-column dashboard grid, side-by-side call simulator.
- **Tablet / Laptop (768px - 1023px):** Fluid layout, stacked KPI cards, scrollable tables.
- **Mobile (< 768px):** Automatic sidebar hiding, fixed native-style bottom navigation bar, touch-friendly tap targets, and full-screen modals.

---

## 👤 Author

**Keerthi G Singh**  
Candidate for Forward Deployed Engineer / Agentic Engineer  
On-Ground.ai, Bengaluru
