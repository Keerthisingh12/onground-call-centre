import type { PulseThread, DirectMessage } from '../types';

// Pulse channel threads — sourced from PULSE_INTERNAL_THREADS in the mock.
export const PULSE_THREADS: PulseThread[] = [
  {
    id: 'callcentre-team',
    title: '#callcentre-team',
    dateLabel: 'Today · Call Centre Team',
    unread: 2,
    preview: 'Great attitude Arvind 🌟',
    messages: [
      {
        who: 'Sunita Rao',
        init: 'SR',
        bg: '#faeeda',
        color: '#854f0b',
        text: '👥 <b>STAKEHOLDERS:</b> <b style="color:#854f0b">@You (Arvind R.)</b>, whole call centre shift',
        time: '2:05pm',
      },
      {
        who: 'Sunita Rao',
        init: 'SR',
        bg: '#faeeda',
        color: '#854f0b',
        text: '📋 <b>ISSUE DEFINITION:</b> Greeting-in-first-10s QA score is at 71% this week, below our 85% target.',
        time: '2:05pm',
      },
      {
        who: 'Sunita Rao',
        init: 'SR',
        bg: '#faeeda',
        color: '#854f0b',
        text: "➡️ <b>SUGGESTED RESOLUTION:</b> Let's push that up 💪 — open every call with the greeting script. I'll check back Friday.",
        time: '2:05pm',
      },
      {
        who: 'You',
        init: 'AR',
        isMe: true,
        text: 'On it! Will make sure I open every call with the greeting script 🙌',
        time: '2:10pm',
      },
      {
        who: 'Sunita Rao',
        init: 'SR',
        bg: '#faeeda',
        color: '#854f0b',
        text: 'Great attitude Arvind 🌟',
        time: '2:14pm',
      },
    ],
  },
  {
    id: 'all-stores',
    title: '#all-stores',
    dateLabel: 'Today · All Stores',
    unread: 1,
    preview: 'New Ortho Grid campaign live from 1 June',
    messages: [
      {
        who: 'Manager Helper',
        init: '📢',
        bg: '#e8f0fe',
        color: '#1d4ed8',
        isBot: true,
        text: 'New Ortho Grid campaign live from 1 June — ask customers about the bundled EMI offer!',
        time: '10:22am',
      },
    ],
  },
  {
    id: 'avani-coaching',
    title: '#avani-coaching',
    dateLabel: 'Today · Avani AI Coaching',
    unread: 0,
    preview: 'Your average handle time is up 8% this week',
    messages: [
      {
        who: 'Avani',
        init: '✨',
        bg: '#e1f5ee',
        color: '#0f6e56',
        isBot: true,
        text: "Your average handle time is up 8% this week — try confirming the customer's need in your first question instead of after the pitch.",
        time: '9:01am',
      },
    ],
  },
  {
    id: 'manage-shipment',
    title: '#manage-shipment',
    dateLabel: 'Today · Manage Shipment',
    unread: 0,
    preview: 'Ortho Grid Pro, King — Ready for delivery',
    messages: [
      {
        who: 'Shipping Agent',
        init: '📦',
        bg: '#e8f0fe',
        color: '#185fa5',
        isBot: true,
        text: '📦 Shipping update: Ortho Grid Pro, King | Tracking: 4RS4DDF6549B4 | Destination: RT Nagar, Bengaluru — Ready for delivery ✓',
        time: '10:05am',
      },
    ],
  },
];

// Direct messages
export const DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm-sunita',
    name: 'Sunita Rao',
    initials: 'SR',
    bg: '#faeeda',
    color: '#854f0b',
    status: 'online',
    preview: 'Great attitude Arvind 🌟',
    time: '2:14pm',
    unread: 1,
  },
  {
    id: 'dm-avani',
    name: 'Avani (AI)',
    initials: '✨',
    bg: '#e1f5ee',
    color: '#0f6e56',
    isBot: true,
    status: 'online',
    preview: 'Your handle time improved 8% this week!',
    time: '9:01am',
    unread: 0,
  },
  {
    id: 'dm-priya',
    name: 'Priya Iyer',
    initials: 'PI',
    bg: '#f2f2f7',
    color: '#404040',
    status: 'away',
    preview: 'Can you confirm the callback at 4:30?',
    time: 'Yesterday',
    unread: 0,
  },
];

// The pinned "Needs your input" card for #callcentre-team channel
export const PINNED_CARD = {
  channelId: 'callcentre-team',
  id: 'pin-callback',
  title: 'Confirm the 4:30pm callback',
  body: "Priya Iyer called in about a billing dispute. She's requested a callback at 4:30pm today. Can you confirm or reschedule?",
  from: 'Sunita Rao',
  time: '2:01pm',
  options: ['Confirmed', 'Reschedule'],
};
