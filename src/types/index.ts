// ─── Shared TypeScript interfaces for the On-Ground.ai Call Centre App ───────

export interface SubScore {
  label: string;
  pct: number;
  color: string;
}

export interface JourneyStep {
  date: string;
  channel: string;
  icon: string;
  color: string;
  text: string;
}

export interface ProblemBucket {
  cat: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  interest: string;
  product: string;
  crossSell: string;
  emi: string;
  attractivenessScore: number;
  expectedValue: number;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  statusLabel: string;
  statusColor: string;
  quoteOn: boolean;
  icp: number;
  icpColor: string;
  intentScore: number;
  subscores: SubScore[];
  slaNote: string | null;
  notes: string[];
  problemBuckets: ProblemBucket[];
  journey: JourneyStep[];
  phone: string;
  actions: 'open' | 'ageing';
}

export type CallDirection = 'in' | 'out' | 'missed';

export interface RecentCall {
  id: string;
  dir: CallDirection;
  name: string;
  time: string;
  duration: string;
  outcome?: string;
}

export interface SOPItem {
  label: string;
}

export interface SOPReviewResult {
  label: string;
  pass: boolean;
  evidence: string;
}

export interface CalendarEvent {
  day: number;
  time: string;
  title: string;
  meta: string;
}

export interface PulseMessage {
  who: string;
  init: string;
  bg?: string;
  color?: string;
  isBot?: boolean;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface PulseThread {
  id: string;
  title: string;
  dateLabel: string;
  messages: PulseMessage[];
  unread?: number;
  preview?: string;
}

export interface DirectMessage {
  id: string;
  name: string;
  initials: string;
  bg: string;
  color: string;
  isBot?: boolean;
  status: 'online' | 'away' | 'offline';
  preview: string;
  time: string;
  unread?: number;
}

export interface QueueEntry {
  name: string;
  wait: string;
  waitLevel: 'hi' | 'mid' | 'lo';
  intent: string;
}

export interface Notification {
  id: string;
  needsAction: boolean;
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
}

export interface CallState {
  active: boolean;
  leadName: string;
  leadId: string | null;
  phase: 'pre' | 'active' | 'wrapup' | 'idle';
  elapsed: number;
  muted: boolean;
  onHold: boolean;
  outcome: string;
  notes: string;
}

export type PractisePhase = 'idle' | 'active' | 'done';

export interface PractiseScenario {
  id: string;
  title: string;
  product: string;
  customerName: string;
  description: string;
  dialogue: { speaker: 'agent' | 'customer'; text: string }[];
  feedbackItems: { label: string; passed: boolean; note: string }[];
}
