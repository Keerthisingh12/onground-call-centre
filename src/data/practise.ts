import type { PractiseScenario } from '../types';

export const PRACTISE_SCENARIOS: PractiseScenario[] = [
  {
    id: 'scenario-ortho-emi',
    title: 'Ortho GRID — EMI Enquiry',
    product: 'Ortho GRID Mattress · ₹8,490',
    customerName: 'Arjun M.',
    description: 'Customer is interested in the Ortho GRID but concerned about the upfront cost. Navigate the EMI conversation and close.',
    dialogue: [
      { speaker: 'customer', text: 'Hi, I saw your ad for the Ortho GRID. What EMI options do you have?' },
      { speaker: 'agent',    text: 'Hello Arjun! Great timing — the Ortho GRID starts at ₹8,490 and we have a 12-month zero-interest EMI plan, so that\'s just ₹708 per month. Is that within your budget?' },
      { speaker: 'customer', text: 'That sounds reasonable. But what if I don\'t like it? It\'s still a big purchase.' },
      { speaker: 'agent',    text: 'Totally understand. Every mattress comes with a 100-night trial — if it\'s not for you, we pick it up and refund you completely, no questions asked.' },
      { speaker: 'customer', text: 'Oh wow, I didn\'t know that. Can I also get a pillow included?' },
      { speaker: 'agent',    text: 'We have a Mattress Protector for ₹1,999 that pairs really well with it. I can bundle it in and share a quote on WhatsApp — should I do that?' },
      { speaker: 'customer', text: 'Yes please, that would be great.' },
    ],
    feedbackItems: [
      { label: 'Opened with greeting and intent check', passed: true, note: 'Good — greeted warmly and identified purpose immediately.' },
      { label: 'Confirmed customer need before pitching', passed: false, note: 'Could have asked about sleep concerns before jumping to price.' },
      { label: 'Mentioned EMI plan clearly', passed: true, note: 'Clear quote: ₹708/month over 12 months.' },
      { label: 'Covered 100-night trial / warranty', passed: true, note: 'Proactively mentioned the trial — reduced perceived risk.' },
      { label: 'Offered cross-sell naturally', passed: true, note: 'Suggested Mattress Protector in context.' },
      { label: 'Confirmed next step (quote / callback)', passed: true, note: 'Closed by sending WhatsApp quote — clear next action.' },
    ],
  },
  {
    id: 'scenario-sla-missed',
    title: 'Kavitha R. — Ageing Lead Recovery',
    product: 'SmartGRID Hybrid · ₹24,990',
    customerName: 'Kavitha R.',
    description: 'SLA was missed 3 days ago. Kavitha has gone quiet. Open with empathy, re-qualify the need, and salvage the lead.',
    dialogue: [
      { speaker: 'agent',    text: 'Good afternoon Kavitha, this is Arvind from The Sleep Company. I wanted to apologise for not following up sooner — things got away from us this week. Are you free for a moment?' },
      { speaker: 'customer', text: 'Oh, okay. I\'d kind of given up to be honest.' },
      { speaker: 'agent',    text: 'Completely understandable. I\'d like to make that right. You were looking at the SmartGRID Hybrid — is that still something you\'re considering, or has anything changed?' },
      { speaker: 'customer', text: 'I\'m not sure anymore. I wasn\'t sure if it was really the right one for me.' },
      { speaker: 'agent',    text: 'Let me ask — what were the main things you were hoping a mattress would solve for you?' },
      { speaker: 'customer', text: 'I wanted something that stays cool. I tend to overheat at night.' },
      { speaker: 'agent',    text: 'Perfect — the SmartGRID Hybrid has a cooling gel layer specifically for that. Would you want to come into the store and try it, or I can arrange a home demo in your area?' },
      { speaker: 'customer', text: 'A store visit might work. When can I come?' },
    ],
    feedbackItems: [
      { label: 'Opened with apology — not a pitch', passed: true, note: 'Started with empathy before any product mention. Well done.' },
      { label: 'Re-qualified the need before pushing product', passed: true, note: 'Asked "has anything changed?" — good reset.' },
      { label: 'Addressed cooling concern specifically', passed: true, note: 'Linked product feature directly to customer\'s stated need.' },
      { label: 'Offered in-store or home demo', passed: true, note: 'Gave the customer options rather than insisting.' },
      { label: 'Mentioned financing', passed: false, note: 'EMI/financing wasn\'t raised — budget is borderline for this lead.' },
      { label: 'Booked a clear next step', passed: true, note: 'Store visit confirmed — concrete next action.' },
    ],
  },
];
