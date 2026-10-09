import { useState, useEffect } from 'react';
import {
  IconPhoneCall, IconPhoneOff, IconMicrophone, IconMicrophoneOff,
  IconPlayerPause, IconPlayerPlay, IconSparkles, IconCheck,
  IconClock, IconFileDescription, IconX,
} from '@tabler/icons-react';
import { useApp } from '../../app/AppContext';
import { getLeadByName } from '../../data/leads';
import { SOP_ITEMS } from '../../data/callsAndEvents';
import styles from './ActiveCallModal.module.css';

const DEFAULT_TRANSCRIPT = [
  { speaker: 'Agent', text: 'Hello! This is Arvind calling from The Sleep Company. Is now a convenient time to speak?' },
  { speaker: 'Customer', text: 'Hi Arvind, yes I have a couple of minutes. I was browsing your Ortho GRID mattress.' },
  { speaker: 'Agent', text: 'Wonderful! What made you look into it — are you dealing with back pain or looking for better support?' },
  { speaker: 'Customer', text: 'A bit of lower back stiffness in the mornings. Also wanted to know what EMI options you have.' },
  { speaker: 'Agent', text: 'The Ortho GRID is designed specifically for targeted lumbar relief. Plus we have a 12-month zero-interest EMI at just ₹708/month.' },
  { speaker: 'Customer', text: 'That zero-interest option sounds great! What is the trial policy?' },
  { speaker: 'Agent', text: 'You get a 100-night trial at home and a full 10-year warranty. Can I send the quote directly to your WhatsApp?' },
  { speaker: 'Customer', text: 'Yes please, send it over and I will review it today!' },
];

const OUTCOME_OPTIONS = [
  'WhatsApp Quote Sent',
  'Callback Scheduled',
  'Sale Closed',
  'Follow-up Needed',
  'Not Interested',
];

export default function ActiveCallModal() {
  const { state, dispatch, showToast } = useApp();
  const { active, phase, leadName, elapsed, muted, onHold } = state.call;

  const lead = getLeadByName(leadName);

  // SOP check state
  const [sopChecked, setSopChecked] = useState<boolean[]>([true, true, false, false, false, false]);
  const [transcriptIndex, setTranscriptIndex] = useState(2);
  const [selectedOutcome, setSelectedOutcome] = useState('WhatsApp Quote Sent');
  const [wrapNotes, setWrapNotes] = useState('');

  // Call timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (active && phase === 'active' && !onHold) {
      timer = setInterval(() => {
        dispatch({ type: 'CALL_TICK' });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [active, phase, onHold, dispatch]);

  // Dialogue progression simulation
  useEffect(() => {
    let dialogTimer: ReturnType<typeof setInterval> | null = null;
    if (active && phase === 'active' && !onHold) {
      dialogTimer = setInterval(() => {
        setTranscriptIndex((prev) => {
          if (prev < DEFAULT_TRANSCRIPT.length) {
            // Also progress SOP checks automatically
            if (prev === 3) setSopChecked([true, true, true, false, false, false]);
            if (prev === 4) setSopChecked([true, true, true, true, false, false]);
            if (prev === 6) setSopChecked([true, true, true, true, true, true]);
            return prev + 1;
          }
          return prev;
        });
      }, 4000);
    }
    return () => {
      if (dialogTimer) clearInterval(dialogTimer);
    };
  }, [active, phase, onHold]);

  if (!active) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  function handleStartCall() {
    dispatch({ type: 'CALL_PHASE', phase: 'active' });
  }

  function handleEndCall() {
    dispatch({ type: 'CALL_PHASE', phase: 'wrapup' });
  }

  function handleSaveWrapup() {
    dispatch({ type: 'CALL_END', outcome: selectedOutcome });
    showToast(`Call with ${leadName} logged (${selectedOutcome})`, 'success');
  }

  function toggleSop(idx: number) {
    setSopChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        {/* PHASE 1: PRE-CALL */}
        {phase === 'pre' && (
          <div className={styles.preCall}>
            <div className={styles.topRow}>
              <div className={styles.preIcon}>
                <IconPhoneCall size={28} />
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => dispatch({ type: 'CALL_END', outcome: 'Cancelled' })}
              >
                <IconX size={20} />
              </button>
            </div>

            <h2 className={styles.leadTitle}>Ready to Call {leadName}</h2>
            <div className={styles.leadSub}>
              {lead ? `${lead.product} · Score ${lead.attractivenessScore}/100` : 'Enquiry Callback'}
            </div>

            {lead && (
              <div className={styles.preCard}>
                <div className={styles.preItem}>
                  <span className={styles.preLabel}>Target Product:</span>
                  <span className={styles.preVal}>{lead.product}</span>
                </div>
                <div className={styles.preItem}>
                  <span className={styles.preLabel}>Expected Value:</span>
                  <span className={styles.preVal}>₹{lead.expectedValue.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.preItem}>
                  <span className={styles.preLabel}>Financing angle:</span>
                  <span className={styles.preVal}>{lead.emi}</span>
                </div>
                {lead.notes.length > 0 && (
                  <div className={styles.preNotes}>
                    <strong>CRM Insight:</strong> {lead.notes[0]}
                  </div>
                )}
              </div>
            )}

            <div className={styles.sopReminder}>
              <div className={styles.sopReminderHead}>
                <IconFileDescription size={16} /> Objective SOP Checklist
              </div>
              <ul className={styles.sopMiniList}>
                {SOP_ITEMS.map((item, idx) => (
                  <li key={idx}>✓ {item.label}</li>
                ))}
              </ul>
            </div>

            <div className={styles.preActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => dispatch({ type: 'CALL_END', outcome: 'Cancelled' })}
              >
                Cancel
              </button>
              <button className={styles.dialBtn} onClick={handleStartCall}>
                <IconPhoneCall size={18} /> Connect Call Now
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: CONNECTED CALL */}
        {phase === 'active' && (
          <div className={styles.connectedView}>
            {/* Call Header */}
            <div className={styles.callHeader}>
              <div className={styles.callerInfo}>
                <div className={styles.callerName}>{leadName}</div>
                <div className={styles.callStatusRow}>
                  <span className={`${styles.statusPill} ${onHold ? styles.pillHold : muted ? styles.pillMuted : styles.pillLive}`}>
                    <span className={styles.pulseDot} />
                    {onHold ? 'ON HOLD' : muted ? 'MIC MUTED' : 'LIVE CALL'}
                  </span>
                  <span className={styles.timerDisplay}>
                    <IconClock size={14} /> {timeFormatted}
                  </span>
                </div>
              </div>

              {/* Waveform graphic */}
              <div className={styles.waveform}>
                <span className={styles.bar} style={{ height: onHold ? 4 : 14 }} />
                <span className={styles.bar} style={{ height: onHold ? 4 : 24 }} />
                <span className={styles.bar} style={{ height: onHold ? 4 : 18 }} />
                <span className={styles.bar} style={{ height: onHold ? 4 : 30 }} />
                <span className={styles.bar} style={{ height: onHold ? 4 : 16 }} />
                <span className={styles.bar} style={{ height: onHold ? 4 : 22 }} />
              </div>
            </div>

            {/* Split View: Live Transcript & AI Assist + SOP */}
            <div className={styles.callSplit}>
              {/* Left: Transcript stream */}
              <div className={styles.transcriptSection}>
                <div className={styles.sectionHeading}>Live Conversation Stream</div>
                <div className={styles.transcriptBox}>
                  {DEFAULT_TRANSCRIPT.slice(0, transcriptIndex).map((line, idx) => (
                    <div
                      key={idx}
                      className={`${styles.dialogueBubble} ${line.speaker === 'Agent' ? styles.bubbleAgent : styles.bubbleCustomer}`}
                    >
                      <div className={styles.speakerLabel}>{line.speaker}</div>
                      <div className={styles.speechText}>{line.text}</div>
                    </div>
                  ))}
                  {transcriptIndex < DEFAULT_TRANSCRIPT.length && !onHold && (
                    <div className={styles.speakingIndicator}>
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: AI Guidance & SOP compliance */}
              <div className={styles.guidanceSection}>
                {/* AI Suggestions */}
                <div className={styles.aiCard}>
                  <div className={styles.aiHead}>
                    <IconSparkles size={16} /> AI Assist Copilot
                  </div>
                  <div className={styles.aiTip}>
                    <strong>💡 Recommendation:</strong> Mention 12-month zero-interest EMI (₹708/mo) to address upfront price hesitation.
                  </div>
                  <div className={styles.aiTip}>
                    <strong>🛡️ Value Proposition:</strong> Emphasize the 100-night risk-free trial and 10-year warranty.
                  </div>
                </div>

                {/* Live SOP Checklist */}
                <div className={styles.liveSopCard}>
                  <div className={styles.sopCardTitle}>Live SOP Checklist</div>
                  <div className={styles.sopCheckList}>
                    {SOP_ITEMS.map((item, idx) => (
                      <div
                        key={idx}
                        className={`${styles.sopCheckItem} ${sopChecked[idx] ? styles.sopPassed : ''}`}
                        onClick={() => toggleSop(idx)}
                      >
                        <div className={styles.checkbox}>
                          {sopChecked[idx] && <IconCheck size={12} />}
                        </div>
                        <span className={styles.sopItemText}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div className={styles.controlsBar}>
              <button
                className={`${styles.controlBtn} ${muted ? styles.btnActiveAlert : ''}`}
                onClick={() => dispatch({ type: 'CALL_MUTE' })}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
                <span>{muted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                className={`${styles.controlBtn} ${onHold ? styles.btnActiveHold : ''}`}
                onClick={() => dispatch({ type: 'CALL_HOLD' })}
                title={onHold ? 'Resume Call' : 'Hold Call'}
              >
                {onHold ? <IconPlayerPlay size={20} /> : <IconPlayerPause size={20} />}
                <span>{onHold ? 'Resume' : 'Hold'}</span>
              </button>

              <button
                className={styles.endCallBtn}
                onClick={handleEndCall}
              >
                <IconPhoneOff size={20} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: WRAPUP */}
        {phase === 'wrapup' && (
          <div className={styles.wrapupView}>
            <div className={styles.wrapupHead}>
              <h2 className={styles.wrapupTitle}>Call Summary & Wrap-up</h2>
              <div className={styles.wrapupMeta}>
                Call with {leadName} · Duration: {timeFormatted}
              </div>
            </div>

            <div className={styles.outcomeGroup}>
              <div className={styles.wrapLabel}>Call Outcome</div>
              <div className={styles.outcomePills}>
                {OUTCOME_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`${styles.outcomePill} ${selectedOutcome === opt ? styles.outcomePillActive : ''}`}
                    onClick={() => setSelectedOutcome(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.notesGroup}>
              <div className={styles.wrapLabel}>Agent Notes</div>
              <textarea
                className={styles.notesTextarea}
                placeholder="Enter notes about this conversation, follow-up timeline, or next steps..."
                value={wrapNotes}
                onChange={(e) => setWrapNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.wrapupActions}>
              <button className={styles.saveCallBtn} onClick={handleSaveWrapup}>
                <IconCheck size={18} /> Save & Log Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
