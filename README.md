# On-Ground.ai — Agentic Call Centre Frontend

**Hiring Assignment Submission | Forward Deployed Engineer / Agentic Engineer**

| Detail | Information |
|---|---|
| Candidate | Keerthi G Singh |
| Company | On-Ground.ai |
| Target Sector | Retail |
| Reference Brand | The Sleep Company |
| Project Type | Interactive Frontend Demonstration |

## 🌟 Project Overview

This project is a responsive frontend reconstruction of the On-Ground.ai Call Centre application, developed using the supplied reference mock.

The application demonstrates how retail call centre agents can manage customer enquiries, prioritize follow-ups, inspect lead information, review call quality, coordinate with teammates, and practise structured customer conversations.

Built with React, TypeScript, and Vite, the application brings together dashboard analytics, lead management, call workflows, calendar views, and team collaboration in a unified interface.

The project uses sample data and simulated interactions to demonstrate the workflows. It is a frontend assignment implementation, not a production call centre system.

## 🚀 Live Demo and Repository

- **Live Demo:** [https://keerthisingh12.github.io/onground-call-centre/](https://keerthisingh12.github.io/onground-call-centre/)
- **GitHub Repository:** [https://github.com/Keerthisingh12/onground-call-centre](https://github.com/Keerthisingh12/onground-call-centre)

## ✨ Features

### 1. Executive Dashboard

The dashboard presents a consolidated view of agent activity and performance.

- Agent profile, shift status, and greeting.
- Performance KPI cards, including OG Score, average handle time, customer satisfaction, and queue count.
- Lead activity and incentive progress indicators.
- Waiting-call queue with priority and customer-intent information.
- Weekly call-volume and customer-satisfaction charts using Recharts.
- Task cards linking to relevant leads, collaboration threads, and call reviews.
- Date-range selection for the reporting period.

All performance metrics and charts use demonstration data rather than live production analytics.

### 2. Planner and Call Management

The Planner organizes calling workflows into three views.

#### Calls to Make

- Paginated lead list ordered by attractiveness score.
- Expandable lead rows containing customer context, budget fit, need match, decision stage, and notes.
- Actions to initiate a simulated call or inspect a lead in detail.

#### Incoming and Missed Calls

- List of missed customer enquiries.
- Customer-value indicators based on sample data.
- Callback actions that initiate the simulated calling workflow.
- Visual feedback for callback interactions.

#### Recent Call Review

- Call history with incoming, outgoing, and missed-call categories.
- Call outcomes, timestamps, and duration information.
- Interactive SOP adherence review for selected calls.
- Criteria covering greeting, needs discovery, product pitch, EMI financing, warranty, and closing.
- Adherence indicators and supporting call evidence where provided by the sample data.

### 3. Lead Inspection

The lead-inspection modal brings customer information together in one place.

- Customer profile and journey timeline.
- Attractiveness, intent, and ideal-customer-profile indicators.
- Budget fit, need match, and decision-stage breakdowns.
- Customer signals and contextual notes.
- Previous/next lead navigation.
- Keyboard navigation and modal dismissal where implemented.
- Actions for available lead-management and simulated calling workflows.

### 4. Calendar and Coaching

The Calendar provides a navigable monthly view of scheduled demonstration events.

- Month navigation and a Today action.
- Selected-day event listings.
- Visual indicators for scheduled events.
- Callback and coaching-session information.
- Invite-sharing interactions for relevant team members and collaborators.

Calendar events use local demonstration data and are not synchronized with an external calendar service.

### 5. Pulse — Team Collaboration

Pulse demonstrates communication and coaching workflows for a call centre team.

- Channel and conversation navigation.
- Team discussion and coaching threads.
- AvaniBot demonstration prompts for product knowledge and SOP guidance.
- Pinned callback decision cards with confirmation and rescheduling interactions.
- Message composer with keyboard support.
- Sample team achievements and recognition content.

Messages and coaching responses are part of the frontend demonstration. The application is not connected to a production messaging service or live AI inference backend.

### 6. Simulated Call Workflow

The call interface demonstrates a possible end-to-end agent workflow.

- Pre-call briefing with lead context and notes.
- Simulated call connection and active-call timer.
- Transcript-style conversation display.
- Demonstration prompts for product information, EMI, and objection handling.
- Mute, hold, and end-call controls where implemented.
- Post-call outcome selection and notes.
- Local call-history updates after completing the workflow.

The call, transcript, and assistance prompts are simulated. No real customer is contacted.

### 7. Practice Call

The practice workflow demonstrates structured customer-conversation training.

- Scripted customer scenarios.
- Step-by-step dialogue progression.
- Practice timer controls.
- Demonstration scorecard based on call-handling criteria.
- Feedback associated with the selected scenario.

The practice scorecard is a demonstration feature, not a validated production AI assessment.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Typed application development |
| Vite | Development server and production bundling |
| React Router | Client-side navigation |
| Tabler Icons | Interface icons |
| Recharts | Dashboard charts |
| Vitest | Automated testing |
| React Testing Library | Component and interaction testing |
| oxlint | Code linting |
| CSS and CSS Modules | Styling and component layouts |

The exact dependency versions are maintained in `package.json` and `package-lock.json`.

## 🏗️ Project Structure

```text
onground-call-centre/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   └── AppContext.tsx
│   ├── assets/
│   ├── components/
│   │   ├── calls/
│   │   ├── layout/
│   │   └── leads/
│   ├── data/
│   │   ├── callsAndEvents.ts
│   │   ├── leads.ts
│   │   ├── practise.ts
│   │   └── pulse.ts
│   ├── features/
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── plan/
│   │   ├── practise/
│   │   └── pulse/
│   ├── styles/
│   │   └── global.css
│   ├── test/
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── format.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
└── README.md
```

## 💻 Local Development

### Prerequisites

- Node.js compatible with the project's Vite and TypeScript dependencies.
- npm.

### 1. Clone the repository

```bash
git clone https://github.com/Keerthisingh12/onground-call-centre.git
cd onground-call-centre
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal, typically:

`http://localhost:5173`

### 4. Run automated tests

```bash
npm run test
```

### 5. Run linting

```bash
npm run lint
```

### 6. Create a production build

```bash
npm run build
```

The build script runs TypeScript project checks before generating the Vite production bundle.

## 🧪 Testing

The repository includes a Vitest and React Testing Library setup.

The test suite is intended to cover areas such as:

- Application navigation and dashboard rendering.
- Lead inspection and navigation.
- Simulated calling workflows.
- Calendar navigation and event display.
- Pulse channels, messages, and callback interactions.
- Component interactions covered by the available test files.

Run `npm run test` to execute the current suite. Test counts and successful build results should be reported only after verification against the submitted version.

## 📱 Responsive Interface

The application includes responsive styling intended to support desktop, tablet, and mobile layouts.

Navigation, content sections, and modal layouts adapt to available screen space. Final rendering and interaction behaviour may vary by viewport and browser.

## 🤖 AI Tools and Development Disclosure

AI-assisted development tools were used during the development and refinement of this assignment.

The application demonstrates AI-oriented workflows through scripted assistance prompts, sample coaching content, and simulated practice scenarios. These features should not be interpreted as a deployed production AI model.

The project does not claim to provide live telephony, production CRM integration, external calendar synchronization, or a production backend.

## 👤 Author

**Keerthi G Singh**

Candidate — Forward Deployed Engineer / Agentic Engineer

## 📄 Assignment Note

This project was developed as a frontend hiring assignment based on the reference materials supplied by On-Ground.ai. Customer records, performance indicators, call transcripts, coaching content, and workflow outcomes are demonstration data.
