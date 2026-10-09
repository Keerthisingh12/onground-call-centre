import type { RecentCall, SOPItem, SOPReviewResult, QueueEntry, CalendarEvent } from '../types';

// ─── Recent Calls ────────────────────────────────────────────────────────────
// Sourced from DIALER_RECENT_CALLS in the reference HTML mock.
export const RECENT_CALLS: RecentCall[] = [
  { id: 'rc-1', dir: 'in',     name: 'Mukunda R.', time: '10:42 AM',          duration: '4m 12s' },
  { id: 'rc-2', dir: 'out',    name: 'Kavitha R.', time: 'Yesterday',          duration: '2m 05s' },
  { id: 'rc-3', dir: 'missed', name: 'Unknown',    time: 'Yesterday',          duration: '—' },
  { id: 'rc-4', dir: 'missed', name: 'Ritu S.',    time: 'Today 11:20 AM',     duration: '—' },
  { id: 'rc-5', dir: 'missed', name: 'Faizan A.',  time: 'Today 10:05 AM',     duration: '—' },
  { id: 'rc-6', dir: 'missed', name: 'Kavitha R.', time: 'Yesterday 4:40 PM',  duration: '—' },
  { id: 'rc-7', dir: 'missed', name: 'Divya P.',   time: 'Yesterday 2:15 PM',  duration: '—' },
  { id: 'rc-8', dir: 'out',    name: 'Faizan A.',  time: 'Mon',                duration: '6m 40s' },
];

// ─── SOP Checklist Items ─────────────────────────────────────────────────────
export const SOP_ITEMS: SOPItem[] = [
  { label: 'Opening & Intent Confirm' },
  { label: 'Needs Discovery' },
  { label: 'Product Pitch' },
  { label: 'EMI / Financing Mention' },
  { label: 'Warranty Mention' },
  { label: 'Closing / Callback Booking' },
];

// Four SOP review templates — cycled by call index to produce varied reviews.
const SOP_TEMPLATES: boolean[][] = [
  [true,  true,  true,  true,  false, true ],
  [true,  true,  false, true,  false, false],
  [true,  false, true,  false, false, true ],
  [true,  true,  true,  false, true,  true ],
];

const SOP_EVIDENCE: string[][] = [
  [
    '"This is Aditi calling from The Sleep Company, is now an okay time?"',
    '"Can I ask what matters most to you — firmness or price?"',
    '"The GRID layer gives pressure relief exactly where you need it."',
    '"We do have a 6-month no-cost EMI plan if that helps."',
    'No mention of the warranty period anywhere in the call.',
    '"I\'ll send the quote over and follow up Thursday, does that work?"',
  ],
  [
    '"Hi, calling about your enquiry — good time to talk?"',
    '"So tell me, what are you looking for exactly?"',
    'Jumped to price before confirming the customer\'s actual need.',
    '"There\'s an EMI option starting at ₹1,200/month."',
    'No warranty details were shared.',
    'Call ended without confirming a next step or callback time.',
  ],
  [
    '"This is Aditi, is this an alright time to talk?"',
    'Moved straight to pitching without asking what the customer needs.',
    '"This model is our best-seller for back support."',
    'EMI never came up even though the customer asked about total cost.',
    'No warranty mention.',
    '"I\'ll note this down and call you back tomorrow at the same time."',
  ],
  [
    '"Hello, this is Aditi from The Sleep Company."',
    '"What\'s brought this on — any specific concern with sleep or back pain?"',
    '"Given what you described, the Ortho GRID would be the right fit."',
    'Customer asked about payment plans but it wasn\'t addressed on the call.',
    '"It comes with a 10-year warranty, so you\'re covered either way."',
    '"Let\'s lock in delivery for this Friday, I\'ll send the confirmation."',
  ],
];

export function getSOPReviewForCall(callIndex: number): SOPReviewResult[] {
  const t = SOP_TEMPLATES[callIndex % SOP_TEMPLATES.length];
  const ev = SOP_EVIDENCE[callIndex % SOP_EVIDENCE.length];
  return SOP_ITEMS.map((item, i) => ({
    label: item.label,
    pass: t[i],
    evidence: ev[i],
  }));
}

// ─── Calendar Events ─────────────────────────────────────────────────────────
// Days relative to the current month in the reference (October 2026).
export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    day: 23,
    time: '11:00 AM',
    title: 'SOP coaching session',
    meta: 'With Sunita Rao (Manager) · via #callcentre-team',
  },
  {
    day: 26,
    time: '2:30 PM',
    title: 'Warranty pitch refresher',
    meta: 'With L&D team · flagged from your last 3 calls',
  },
  {
    day: 28,
    time: '10:00 AM',
    title: 'Weekly team huddle',
    meta: 'With Call Centre team · #callcentre-team',
  },
];

// ─── Queue (Who's Waiting on Dashboard) ─────────────────────────────────────
export const CALL_QUEUE: QueueEntry[] = [
  { name: 'Priya Iyer',  wait: '4m 20s', waitLevel: 'hi',  intent: 'Likely billing dispute — flagged before' },
  { name: 'Suresh Nair', wait: '1m 50s', waitLevel: 'mid', intent: 'Plan upgrade enquiry' },
];

// ─── Dashboard Chart Data (7-day calls) ─────────────────────────────────────
export const WEEKLY_CALLS_DATA = [
  { day: 'Mon', calls: 18 },
  { day: 'Tue', calls: 22 },
  { day: 'Wed', calls: 15 },
  { day: 'Thu', calls: 27 },
  { day: 'Fri', calls: 31 },
  { day: 'Sat', calls: 14 },
  { day: 'Sun', calls: 9  },
];

export const CSAT_TREND_DATA = [
  { day: 'Mon', csat: 88 },
  { day: 'Tue', csat: 91 },
  { day: 'Wed', csat: 86 },
  { day: 'Thu', csat: 93 },
  { day: 'Fri', csat: 94 },
  { day: 'Sat', csat: 90 },
  { day: 'Sun', csat: 94 },
];

// ─── Dashboard KPIs (from reference) ─────────────────────────────────────────
export const DASHBOARD_KPIS = {
  ogScore: { value: '76', label: 'OG Score™', trend: '▲13', up: true },
  avgHandleTime: { value: '4m 12s', label: 'Avg Handle Time', trend: '▼8%', up: true },
  csatToday: { value: '94%', label: 'CSAT Today', trend: '▲2pt', up: true },
  inQueue: { value: '2', label: 'In Queue', trend: '● live', up: true, live: true },
};

export const PROGRESS_METRICS = {
  leadsCreated: { value: 3, delta: '+1', good: false },
  leadsCalled:  { value: 2, delta: '+2', good: true  },
};

export const EARNINGS = {
  current: 5200,
  target: 6000,
  slabStart: 800,
  coachedContribution: 1700,
};

// ─── My Tasks (Dashboard task list) ─────────────────────────────────────────
export const MY_TASKS = [
  {
    id: 't1',
    icon: 'ti-phone-call',
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
    label: 'Confirm the 4:30pm callback',
    sub: 'Priya Iyer · billing dispute',
    action: 'pulse:Call Centre Team',
  },
  {
    id: 't2',
    icon: 'ti-user',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    label: 'Open lead: Ritu S.',
    sub: 'Hot lead · Smart Luxe · ₹13,390',
    action: 'lead:lead-ritu',
  },
  {
    id: 't3',
    icon: 'ti-clipboard-check',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    label: 'Review yesterday\'s call SOP',
    sub: 'Kavitha R. — 2m 05s',
    action: 'sop:rc-2',
  },
];
