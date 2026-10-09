import { useEffect, useCallback } from 'react';
import {
  IconX, IconChevronLeft, IconChevronRight, IconChevronDown, IconChevronUp,
} from '@tabler/icons-react';
import { useState } from 'react';
import { LEADS, getPlanOutgoingLeads } from '../../data/leads';
import { shortINR, scoreColor } from '../../utils/format';
import { useApp } from '../../app/AppContext';
import styles from './LeadsModal.module.css';

interface Props {
  leadId: string;
  onClose: () => void;
}

const ORDERED_LEADS = getPlanOutgoingLeads();

export default function LeadsModal({ leadId, onClose }: Props) {
  const { startCall } = useApp();
  const [currentId, setCurrentId] = useState(leadId);
  const [signalsOpen, setSignalsOpen] = useState(false);

  const lead = LEADS.find((l) => l.id === currentId) ?? LEADS[0];
  const idx  = ORDERED_LEADS.findIndex((l) => l.id === currentId);
  const total = ORDERED_LEADS.length;

  const goTo = (id: string) => {
    setCurrentId(id);
    setSignalsOpen(false);
  };

  const prev = () => { if (idx > 0) goTo(ORDERED_LEADS[idx - 1].id); };
  const next = () => { if (idx < total - 1) goTo(ORDERED_LEADS[idx + 1].id); };

  // Keyboard: Escape closes, arrow keys navigate
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Synchronize currentId when parent leadId prop changes
  const [prevLeadId, setPrevLeadId] = useState(leadId);
  if (leadId !== prevLeadId) {
    setPrevLeadId(leadId);
    setCurrentId(leadId);
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leads-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div
              className={styles.avatar}
              style={{ background: lead.avatarBg, color: lead.avatarColor }}
            >
              {lead.initials}
            </div>
            <div>
              <h2 id="leads-modal-title" className={styles.leadName}>{lead.name}</h2>
              <div className={styles.leadSub}>Lead {idx + 1} of {total}</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.navBtn}
              onClick={prev}
              disabled={idx === 0}
              aria-label="Previous lead"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              className={styles.navBtn}
              onClick={next}
              disabled={idx === total - 1}
              aria-label="Next lead"
            >
              <IconChevronRight size={16} />
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Status + badge */}
          <div className={styles.statusRow}>
            <span
              className={styles.statusBadge}
              style={{ background: lead.badgeBg, color: lead.badgeColor }}
            >
              {lead.badge}
            </span>
            <span
              className={styles.statusLabel}
              style={{ color: lead.statusColor }}
            >
              {lead.statusLabel}
            </span>
          </div>

          {/* Interest */}
          <div className={styles.interest}>{lead.interest}</div>

          {/* SLA note */}
          {lead.slaNote && (
            <div className={styles.slaNote}>{lead.slaNote}</div>
          )}

          {/* Scores row */}
          <div className={styles.scoresGrid}>
            <ScoreCard label="Attractiveness" value={lead.attractivenessScore} />
            <ScoreCard label="ICP Score" value={lead.icp} />
            <ScoreCard label="Lead Intent" value={lead.intentScore} />
          </div>

          {/* Sub-scores */}
          <div className={styles.subScores}>
            {lead.subscores.map((s) => (
              <div key={s.label} className={styles.subScoreRow}>
                <span className={styles.subScoreLabel}>{s.label}</span>
                <div className={styles.subScoreBar}>
                  <div
                    className={styles.subScoreBarFill}
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
                <span className={styles.subScorePct} style={{ color: s.color }}>
                  {s.pct}
                </span>
              </div>
            ))}
          </div>

          {/* Product & cross-sell */}
          <div className={styles.productGrid}>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Preferred product</div>
              <div className={styles.infoBoxVal}>{lead.product}</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxLabel}>Cross-sell</div>
              <div className={styles.infoBoxVal}>{lead.crossSell}</div>
            </div>
          </div>

          {/* EMI */}
          <div className={styles.emiBox}>
            <div className={styles.emiLabel}>EMI / Financing</div>
            <div className={styles.emiText}>{lead.emi}</div>
          </div>

          {/* Buying signals — collapsible */}
          <button
            className={styles.signalsToggle}
            onClick={() => setSignalsOpen((o) => !o)}
            aria-expanded={signalsOpen}
          >
            <span>Buying signals & problems ({lead.problemBuckets.length})</span>
            {signalsOpen ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
          </button>
          {signalsOpen && (
            <div className={styles.signalsList}>
              {lead.problemBuckets.map((b, i) => (
                <div key={i} className={styles.signalItem}>
                  <div className={styles.signalCat}>{b.cat}</div>
                  <div className={styles.signalText}>{b.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Journey */}
          <div className={styles.sectionHead}>Journey</div>
          <div className={styles.journey}>
            {lead.journey.map((step, i) => (
              <div key={i} className={styles.journeyStep}>
                <div className={styles.journeyDot} style={{ background: step.color }} />
                <div className={styles.journeyBody}>
                  <div className={styles.journeyDate}>{step.date} · {step.channel}</div>
                  <div className={styles.journeyText}>{step.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {lead.notes.length > 0 && (
            <>
              <div className={styles.sectionHead}>Notes</div>
              <ul className={styles.notesList}>
                {lead.notes.map((note, i) => (
                  <li key={i} className={styles.noteItem}>{note}</li>
                ))}
              </ul>
            </>
          )}

          {/* Expected value */}
          <div className={styles.valueRow}>
            <span className={styles.valueLabel}>Expected value</span>
            <span className={styles.valueAmount}>{shortINR(lead.expectedValue)}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              style={{ flex: 1, background: '#0f6e56', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { startCall(lead.name, lead.id); onClose(); }}
            >
              Call Lead
            </button>
            <button
              style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              onClick={onClose}
              aria-label="Close lead modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className={styles.scoreCard}>
      <div className={styles.scoreVal} style={{ color }}>{value}</div>
      <div className={styles.scoreLabel}>{label}</div>
    </div>
  );
}
