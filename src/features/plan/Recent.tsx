import { useState, useEffect } from 'react';
import {
  IconPhoneIncoming, IconPhoneOutgoing, IconPhoneX,
  IconChevronRight, IconCheck, IconX,
} from '@tabler/icons-react';
import { useApp } from '../../app/AppContext';
import { getSOPReviewForCall } from '../../data/callsAndEvents';
import styles from './Recent.module.css';

export default function Recent() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'out' | 'in' | 'missed'>('all');

  const filteredCalls = state.recentCalls.filter((c) => {
    if (filter === 'all') return true;
    return c.dir === filter;
  });

  const selectedCall = state.sopReviewOpen ? state.recentCalls[state.sopReviewCallIndex] : null;
  const sopResults = selectedCall ? getSOPReviewForCall(state.sopReviewCallIndex) : [];
  const passCount = sopResults.filter((r) => r.pass).length;
  const scorePct = sopResults.length ? Math.round((100 * passCount) / sopResults.length) : 0;
  const scoreColor = scorePct >= 80 ? '#0f6e56' : scorePct >= 50 ? '#c8860a' : '#e24b4a';

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && state.sopReviewOpen) {
        dispatch({ type: 'CLOSE_SOP_REVIEW' });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.sopReviewOpen, dispatch]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recent Calls</h1>
        <div className={styles.subtitle}>
          Tap any call to review SOP adherence & compliance
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filters}>
        {(['all', 'out', 'in', 'missed'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.filterBtn} ${filter === tab ? styles.filterActive : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' ? 'All' : tab === 'out' ? 'Outgoing' : tab === 'in' ? 'Incoming' : 'Missed'}
          </button>
        ))}
      </div>

      {/* Call List */}
      <div className={styles.list}>
        {filteredCalls.map((call) => {
          const originalIndex = state.recentCalls.indexOf(call);
          const iconType = call.dir === 'in' ? (
            <div className={`${styles.iconWrap} ${styles.iconIn}`}><IconPhoneIncoming size={16} /></div>
          ) : call.dir === 'missed' ? (
            <div className={`${styles.iconWrap} ${styles.iconMissed}`}><IconPhoneX size={16} /></div>
          ) : (
            <div className={`${styles.iconWrap} ${styles.iconOut}`}><IconPhoneOutgoing size={16} /></div>
          );

          return (
            <div
              key={call.id}
              className={styles.row}
              onClick={() => dispatch({ type: 'OPEN_SOP_REVIEW', callIndex: originalIndex })}
              role="button"
              tabIndex={0}
            >
              {iconType}
              <div className={styles.callInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{call.name}</span>
                  {call.outcome && (
                    <span className={styles.outcomeTag}>{call.outcome}</span>
                  )}
                </div>
                <div className={styles.metaRow}>
                  {call.time} · {call.duration}
                </div>
              </div>
              <div className={styles.reviewPrompt}>
                <span className={styles.reviewLabel}>SOP Review</span>
                <IconChevronRight size={16} className={styles.chevron} />
              </div>
            </div>
          );
        })}
      </div>

      {/* SOP Review Modal */}
      {state.sopReviewOpen && selectedCall && (
        <div className={styles.modalOverlay} onClick={() => dispatch({ type: 'CLOSE_SOP_REVIEW' })}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>Call with {selectedCall.name}</h2>
                <div className={styles.modalMeta}>
                  {selectedCall.time} · {selectedCall.duration} · {selectedCall.dir.toUpperCase()}
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => dispatch({ type: 'CLOSE_SOP_REVIEW' })}
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Score Bar */}
            <div className={styles.scoreBarContainer}>
              <div className={styles.scoreBarInfo}>
                <span className={styles.scoreTitle}>SOP Adherence on this call</span>
                <div className={styles.scoreTrack}>
                  <div
                    className={styles.scoreFill}
                    style={{ width: `${scorePct}%`, background: scoreColor }}
                  />
                </div>
              </div>
              <div className={styles.scorePctText} style={{ color: scoreColor }}>
                {scorePct}%
              </div>
            </div>

            {/* Criteria List */}
            <div className={styles.sopList}>
              {sopResults.map((item, i) => (
                <div key={i} className={styles.sopItem}>
                  <div className={styles.sopItemTop}>
                    <div className={styles.sopStatus}>
                      {item.pass ? (
                        <div className={styles.passIcon}><IconCheck size={14} /></div>
                      ) : (
                        <div className={styles.missIcon}><IconX size={14} /></div>
                      )}
                      <span className={`${styles.sopLabel} ${!item.pass ? styles.labelMissed : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.pass ? (
                      <span className={styles.badgePassed}>Adhered</span>
                    ) : (
                      <span className={styles.badgeMissed}>Missed</span>
                    )}
                  </div>
                  {item.evidence && (
                    <div className={styles.sopEvidence}>
                      {item.evidence}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.doneBtn}
                onClick={() => dispatch({ type: 'CLOSE_SOP_REVIEW' })}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
