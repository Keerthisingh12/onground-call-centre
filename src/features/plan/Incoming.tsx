import {
  IconPhoneCall, IconExternalLink, IconCheck, IconPhoneX,
} from '@tabler/icons-react';
import { useApp } from '../../app/AppContext';
import { getLeadByName } from '../../data/leads';
import styles from './Incoming.module.css';

export default function Incoming() {
  const { state, startCall, openLeadsModal, dispatch } = useApp();

  const missedCalls = state.recentCalls
    .filter((c) => c.dir === 'missed')
    .map((c) => {
      const lead = getLeadByName(c.name);
      return {
        call: c,
        lead,
        value: lead ? lead.expectedValue : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalValue = missedCalls.reduce((sum, item) => sum + item.value, 0);

  function handleCallback(name: string, leadId?: string | null, callId?: string) {
    if (callId) {
      dispatch({ type: 'CALLBACK_DONE', callId });
    }
    startCall(name, leadId);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Incoming & Missed Calls</h1>
        <div className={styles.subtitle}>
          Ranked by expected customer value at stake
        </div>
      </div>

      {missedCalls.length > 0 ? (
        <>
          {/* Summary Box */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryVal}>{missedCalls.length}</div>
              <div className={styles.summaryLabel}>Missed Today</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryVal} ${styles.valGreen}`}>
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div className={styles.summaryLabel}>Expected Value at Stake</div>
            </div>
          </div>

          {/* List of Missed Calls */}
          <div className={styles.list}>
            {missedCalls.map(({ call, lead }) => {
              const isDone = state.callbackDone.has(call.id);

              return (
                <div key={call.id} className={`${styles.card} ${isDone ? styles.cardDone : ''}`}>
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.avatar}
                      style={{
                        background: lead ? lead.avatarBg : '#fee2e2',
                        color: lead ? lead.avatarColor : '#dc2626',
                      }}
                    >
                      {lead ? lead.initials : <IconPhoneX size={18} />}
                    </div>

                    <div className={styles.info}>
                      <div className={styles.nameRow}>
                        <span className={styles.name}>{call.name}</span>
                        {lead && (
                          <span
                            className={styles.valueBadge}
                            style={{ background: lead.badgeBg, color: lead.badgeColor }}
                          >
                            ₹{lead.expectedValue.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div className={styles.timeMeta}>
                        Missed · {call.time}
                      </div>
                      {lead && (
                        <div className={styles.productMeta}>
                          {lead.product} · Score {lead.attractivenessScore}/100
                        </div>
                      )}
                    </div>
                  </div>

                  {lead && lead.notes.length > 0 && (
                    <div className={styles.noteSnippet}>
                      💡 {lead.notes[0]}
                    </div>
                  )}

                  <div className={styles.actions}>
                    {isDone ? (
                      <div className={styles.doneBadge}>
                        <IconCheck size={14} /> Callback Initiated
                      </div>
                    ) : (
                      <button
                        className={styles.callBtn}
                        onClick={() => handleCallback(call.name, lead?.id, call.id)}
                      >
                        <IconPhoneCall size={15} /> Call Back
                      </button>
                    )}

                    {lead && (
                      <button
                        className={styles.openBtn}
                        onClick={() => openLeadsModal(lead.id)}
                      >
                        <IconExternalLink size={14} /> Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✅</div>
          <div className={styles.emptyTitle}>No missed calls pending</div>
          <div className={styles.emptySub}>All callbacks have been handled for this shift.</div>
        </div>
      )}
    </div>
  );
}
