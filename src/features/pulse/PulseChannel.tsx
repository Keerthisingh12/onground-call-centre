import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IconArrowLeft, IconSend, IconCheck,
  IconClock, IconCalendarEvent,
} from '@tabler/icons-react';
import { PULSE_THREADS, PINNED_CARD, DIRECT_MESSAGES } from '../../data/pulse';
import { useApp } from '../../app/AppContext';
import type { PulseMessage } from '../../types';
import styles from './PulseChannel.module.css';

export default function PulseChannel() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const thread = PULSE_THREADS.find((t) => t.id === channelId);
  const dm = DIRECT_MESSAGES.find((d) => d.id === channelId);

  const title = thread ? thread.title : dm ? dm.name : `#${channelId}`;
  const dateLabel = thread ? thread.dateLabel : 'Direct Message';

  const initialMessages: PulseMessage[] = thread
    ? [...thread.messages]
    : dm
    ? [
        {
          who: dm.name,
          init: dm.initials,
          bg: dm.bg,
          color: dm.color,
          isBot: dm.isBot,
          text: dm.preview,
          time: dm.time,
        },
      ]
    : [];

  const [messages, setMessages] = useState<PulseMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [pinnedResolved, setPinnedResolved] = useState<'confirmed' | 'rescheduled' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMsg: PulseMessage = {
      who: 'You',
      init: 'AR',
      isMe: true,
      text: trimmed,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // If talking to Avani bot, give smart simulated reply
    if (channelId === 'avani-coaching' || channelId === 'dm-avani') {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            who: 'Avani',
            init: '✨',
            bg: '#e1f5ee',
            color: '#0f6e56',
            isBot: true,
            text: `Got it! Arvind, focusing on early needs discovery will boost your conversion. Let's aim for 90%+ greeting adherence today!`,
            time: 'Just now',
          },
        ]);
      }, 1000);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleResolvePinned(decision: 'confirmed' | 'rescheduled') {
    if (pinnedResolved) return;
    setPinnedResolved(decision);

    const confirmationText =
      decision === 'confirmed'
        ? 'Confirmed the 4:30pm callback with Priya Iyer. I will dial her promptly on schedule.'
        : 'Requested reschedule for Priya Iyer callback to 5:15pm due to active shift queue.';

    const newMsg: PulseMessage = {
      who: 'You',
      init: 'AR',
      isMe: true,
      text: confirmationText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast(
      decision === 'confirmed' ? 'Callback confirmed for 4:30 PM' : 'Callback marked for reschedule',
      'success'
    );
  }

  const isCallCentreTeam = channelId === 'callcentre-team';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/pulse')}>
          <IconArrowLeft size={18} />
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.title}>{title}</div>
          <div className={styles.dateLabel}>{dateLabel}</div>
        </div>
      </div>

      {/* Pinned Card (for #callcentre-team) */}
      {isCallCentreTeam && (
        <div className={styles.pinnedCard}>
          <div className={styles.pinnedHead}>
            <div className={styles.pinnedTag}>
              <IconClock size={14} /> Needs your input
            </div>
            <span className={styles.pinnedFrom}>From {PINNED_CARD.from} · {PINNED_CARD.time}</span>
          </div>

          <div className={styles.pinnedTitle}>{PINNED_CARD.title}</div>
          <div className={styles.pinnedBody}>{PINNED_CARD.body}</div>

          {pinnedResolved ? (
            <div className={styles.resolvedBanner}>
              <IconCheck size={16} />
              <span>
                Resolved: {pinnedResolved === 'confirmed' ? 'Callback Confirmed for 4:30pm' : 'Reschedule Requested'}
              </span>
            </div>
          ) : (
            <div className={styles.pinnedActions}>
              <button
                className={styles.confirmBtn}
                onClick={() => handleResolvePinned('confirmed')}
              >
                <IconCheck size={14} /> Confirmed (4:30pm)
              </button>
              <button
                className={styles.rescheduleBtn}
                onClick={() => handleResolvePinned('rescheduled')}
              >
                <IconCalendarEvent size={14} /> Reschedule
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages Feed */}
      <div className={styles.messagesList}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`${styles.msgRow} ${m.isMe ? styles.msgRowMe : styles.msgRowOther}`}
          >
            {!m.isMe && (
              <div
                className={styles.avatar}
                style={{ background: m.bg || '#f2f2f7', color: m.color || '#1a1a1a' }}
              >
                {m.init}
              </div>
            )}

            <div className={styles.msgCol}>
              <div className={styles.metaLine}>
                <span className={styles.senderName}>{m.who}</span>
                <span className={styles.timestamp}>{m.time}</span>
              </div>
              <div
                className={`${styles.bubble} ${m.isMe ? styles.bubbleMe : styles.bubbleOther}`}
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <div className={styles.composer}>
        <textarea
          className={styles.inputArea}
          placeholder={`Message ${title}... (Enter to send, Shift+Enter for newline)`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          <IconSend size={16} />
        </button>
      </div>
    </div>
  );
}
