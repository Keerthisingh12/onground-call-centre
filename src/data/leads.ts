import type { Lead } from '../types';

// Canonical retail leads — sourced directly from the OnGround_CallCentre_App_Mock.html
// reference. IDs are stable; do not change them across components.
// Sorted in display order (by attractiveness score descending):
//   Ritu S. (96) → Mukunda (90) → Faizan A. (88) → Kavitha R. (55) → Divya P. (38)

export const LEADS: Lead[] = [
  {
    id: 'lead-ritu',
    name: 'Ritu S.',
    initials: 'RS',
    avatarBg: '#fdf1e0',
    avatarColor: '#c2410c',
    interest: 'Interested: Smart Luxe Mattress · ₹13,390',
    product: 'Smart Luxe Mattress',
    crossSell: 'Mattress Protector · ₹1,999',
    emi: 'Not yet discussed — surface it early, she asked about total cost',
    attractivenessScore: 96,
    expectedValue: 13390,
    badge: 'Hot lead',
    badgeBg: '#e1f5ee',
    badgeColor: '#0f6e56',
    statusLabel: 'Open',
    statusColor: '#1d9e75',
    quoteOn: true,
    icp: 94,
    icpColor: '#1d9e75',
    intentScore: 96,
    subscores: [
      { label: 'Budget Fit', pct: 90, color: '#1d9e75' },
      { label: 'Need Match', pct: 88, color: '#1d9e75' },
      { label: 'Decision Stage', pct: 85, color: '#1d9e75' },
    ],
    slaNote: null,
    notes: [
      'Asked "how soon can this be delivered" — very high buying signal, close fast.',
      'Already visited the RT Nagar store last week.',
      'Has this lead in CRM from a prior visit — high expected value.',
    ],
    problemBuckets: [
      {
        cat: 'Quotation Demanded',
        text: 'Asked for delivery timeline immediately — ready to commit once price is confirmed',
      },
    ],
    journey: [
      {
        date: '28 May',
        channel: 'Store Visit',
        icon: '🏬',
        color: '#0f6e56',
        text: 'Visited RT Nagar store, tried the Smart Luxe in person',
      },
      {
        date: '30 May',
        channel: 'Missed Call',
        icon: '📵',
        color: '#e24b4a',
        text: 'Called back after store visit, missed — needs a callback',
      },
    ],
    phone: '+91 98450 00001',
    actions: 'open',
  },
  {
    id: 'lead-mukunda',
    name: 'Mukunda R.',
    initials: 'MK',
    avatarBg: '#e1f5ee',
    avatarColor: '#0f6e56',
    interest: 'Interested: Ortho GRID · ₹8,490',
    product: 'Ortho GRID Mattress',
    crossSell: 'Mattress Protector · ₹1,999',
    emi: 'Asked about EMI — quote the 12-month zero-interest plan',
    attractivenessScore: 90,
    expectedValue: 8490,
    badge: '2h left',
    badgeBg: '#e1f5ee',
    badgeColor: '#0f6e56',
    statusLabel: 'Open',
    statusColor: '#1d9e75',
    quoteOn: true,
    icp: 87,
    icpColor: '#1d9e75',
    intentScore: 91,
    subscores: [
      { label: 'Budget Fit', pct: 87, color: '#1d9e75' },
      { label: 'Need Match', pct: 72, color: '#c8860a' },
      { label: 'Decision Stage', pct: 60, color: '#7c3aed' },
    ],
    slaNote: null,
    notes: [
      'Asked about EMI on the Ortho GRID — lead with the 12-month zero-interest plan.',
      'Price-sensitive — compared us with a competitor, so mention the 100-night trial to reduce risk.',
      'Prefers evening calls, after 6pm.',
    ],
    problemBuckets: [
      {
        cat: 'Financing Related',
        text: 'Asked specifically about EMI options on the Ortho GRID — budget is a live concern, not a blocker',
      },
      {
        cat: 'Quotation Demanded',
        text: 'Compared pricing with a competitor before reaching out — price-anchored, expects a competitive number',
      },
      {
        cat: 'Warranty Related',
        text: "Hasn't raised this yet — worth proactively mentioning the 100-night trial to reduce perceived risk",
      },
    ],
    journey: [
      {
        date: '18 May',
        channel: 'Meta Ad',
        icon: '📢',
        color: '#1877f2',
        text: 'Clicked our "0% EMI on Ortho GRID" retargeting ad — first touch',
      },
      {
        date: '20 May',
        channel: 'AI Agent',
        icon: '🤖',
        color: '#7c3aed',
        text: 'WhatsApp opt-in — shared preferred size',
      },
      {
        date: '22 May',
        channel: 'Voice AI',
        icon: '🎙️',
        color: '#7c3aed',
        text: '4m 12s qualifying call — asked if pillows come bundled',
      },
      {
        date: '24 May',
        channel: 'WhatsApp',
        icon: '💬',
        color: '#25D366',
        text: 'Asked for a quote with pillows bundled in',
      },
    ],
    phone: '+91 98765 43210',
    actions: 'open',
  },
  {
    id: 'lead-faizan',
    name: 'Faizan A.',
    initials: 'FA',
    avatarBg: '#e8f0fe',
    avatarColor: '#185fa5',
    interest: 'Interested: Tranquo Massager Chair · ₹24,990',
    product: 'Tranquo Massager Chair',
    crossSell: 'Ergo Seat Cushion · ₹1,299',
    emi: 'Confirmed he wants the 6-month no-cost EMI plan',
    attractivenessScore: 88,
    expectedValue: 24990,
    badge: 'Confirmed date',
    badgeBg: '#e1f5ee',
    badgeColor: '#0f6e56',
    statusLabel: 'Open',
    statusColor: '#1d9e75',
    quoteOn: true,
    icp: 82,
    icpColor: '#1d9e75',
    intentScore: 85,
    subscores: [
      { label: 'Budget Fit', pct: 82, color: '#1d9e75' },
      { label: 'Need Match', pct: 78, color: '#1d9e75' },
      { label: 'Decision Stage', pct: 70, color: '#c8860a' },
    ],
    slaNote: null,
    notes: [
      "Confirmed Monday as the day he'll decide — call back then, don't let this go quiet.",
      'Wants the 6-month no-cost EMI plan — have the paperwork ready.',
      'Already compared with a competitor and preferred our warranty terms.',
    ],
    problemBuckets: [
      {
        cat: 'Financing Related',
        text: 'Explicitly asked for the no-cost EMI plan — ready to commit if financing is confirmed',
      },
      {
        cat: 'Warranty Related',
        text: 'Compared warranty terms with a competitor and preferred ours — reinforce this on the call',
      },
    ],
    journey: [
      {
        date: '2 Jun',
        channel: 'Store Visit',
        icon: '🏬',
        color: '#0f6e56',
        text: 'Tried the chair in-store, asked detailed questions on massage programs',
      },
      {
        date: '4 Jun',
        channel: 'Call',
        icon: '📞',
        color: '#185fa5',
        text: '6m 40s call — confirmed budget and asked about EMI',
      },
    ],
    phone: '+91 96543 21098',
    actions: 'open',
  },
  {
    id: 'lead-kavitha',
    name: 'Kavitha R.',
    initials: 'KR',
    avatarBg: '#fff8e1',
    avatarColor: '#c8860a',
    interest: 'Interested: SmartGRID Hybrid · ₹24,990',
    product: 'SmartGRID Hybrid Mattress',
    crossSell: 'Cooling Pillow Set · ₹2,499',
    emi: 'Budget borderline — a payment plan could tip this',
    attractivenessScore: 55,
    expectedValue: 24990,
    badge: '+3d ageing',
    badgeBg: '#fff8e1',
    badgeColor: '#c8860a',
    statusLabel: 'Ageing',
    statusColor: '#c8860a',
    quoteOn: false,
    icp: 61,
    icpColor: '#c8860a',
    intentScore: 63,
    subscores: [
      { label: 'Budget Fit', pct: 61, color: '#c8860a' },
      { label: 'Need Match', pct: 42, color: '#e24b4a' },
      { label: 'Decision Stage', pct: 35, color: '#7c3aed' },
    ],
    slaNote: 'SLA missed — 5 days grace left to close',
    notes: [
      'SLA already missed — open with an apology for the delay, not a sales pitch.',
      'Low Need Match (42%) — re-confirm the SmartGRID Hybrid is still the right fit before pushing further.',
      "Hasn't responded to the last 2 WhatsApp messages — try a call instead.",
    ],
    problemBuckets: [
      {
        cat: 'Product Related',
        text: 'Uncertain whether SmartGRID Hybrid actually fits her need — Need Match score is low (42%), worth re-confirming fit before pushing further',
      },
      {
        cat: 'In-Store Experience Needed',
        text: "Hasn't responded to WhatsApp — may prefer to see/feel the product before deciding, worth inviting her back in",
      },
      {
        cat: 'Financing Related',
        text: 'Budget fit is borderline (61%) — a payment plan or bundle discount could tip this',
      },
    ],
    journey: [
      {
        date: '12 May',
        channel: 'Google Ad',
        icon: '🔍',
        color: '#ea4335',
        text: 'Searched "cooling gel mattress bangalore", clicked our top search ad',
      },
      {
        date: '15 May',
        channel: 'AI Agent',
        icon: '🤖',
        color: '#7c3aed',
        text: 'WhatsApp auto-reply engaged — confirmed interest in the cooling gel layer',
      },
      {
        date: '19 May',
        channel: 'WhatsApp',
        icon: '💬',
        color: '#25D366',
        text: 'Asked to hold the price for 2 days, went quiet since',
      },
    ],
    phone: '+91 97654 32109',
    actions: 'ageing',
  },
  {
    id: 'lead-divya',
    name: 'Divya P.',
    initials: 'DP',
    avatarBg: '#f2f2f7',
    avatarColor: '#404040',
    interest: 'Browsing: Aura Executive Chair · ₹18,490',
    product: 'Aura Executive Chair',
    crossSell: 'Ergo Seat Cushion · ₹1,299',
    emi: 'Not discussed — low priority to raise financing yet',
    attractivenessScore: 38,
    expectedValue: 18490,
    badge: 'Low signal',
    badgeBg: '#f2f2f7',
    badgeColor: '#404040',
    statusLabel: 'Cold',
    statusColor: '#404040',
    quoteOn: false,
    icp: 34,
    icpColor: '#e24b4a',
    intentScore: 38,
    subscores: [
      { label: 'Budget Fit', pct: 40, color: '#e24b4a' },
      { label: 'Need Match', pct: 35, color: '#e24b4a' },
      { label: 'Decision Stage', pct: 20, color: '#e24b4a' },
    ],
    slaNote: null,
    notes: [
      'Gave one-word replies on the last call — low engagement.',
      "Said she's \"just looking around\" — treat as low priority this week.",
    ],
    problemBuckets: [
      {
        cat: 'In-Store Experience Needed',
        text: 'Vague, non-committal answers — may need to see the product before engaging further',
      },
    ],
    journey: [
      {
        date: '1 Jun',
        channel: 'Website',
        icon: '🌐',
        color: '#404040',
        text: 'Browsed chair category, no form filled',
      },
    ],
    phone: '+91 90000 44556',
    actions: 'ageing',
  },
];

/** Returns leads sorted by attractiveness score descending (plan outgoing order). */
export function getPlanOutgoingLeads(): Lead[] {
  return [...LEADS].sort((a, b) => b.attractivenessScore - a.attractivenessScore);
}

/** Returns missed calls derived from RECENT_CALLS, matched with lead data, sorted by expected value. */
export function getLeadById(id: string): Lead | undefined {
  return LEADS.find((l) => l.id === id);
}

export function getLeadByName(name: string): Lead | undefined {
  return LEADS.find((l) => name.startsWith(l.name.split(' ')[0]) || name === l.name);
}
