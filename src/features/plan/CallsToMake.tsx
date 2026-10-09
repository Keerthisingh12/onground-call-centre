import { useState } from 'react';
import {
  IconChevronDown, IconChevronUp, IconPhone,
  IconExternalLink, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';
import { useApp } from '../../app/AppContext';
import { getPlanOutgoingLeads } from '../../data/leads';
import { scoreColor } from '../../utils/format';
import type { Lead } from '../../types';
import styles from './CallsToMake.module.css';

const PER_PAGE = 2;

export default function CallsToMake() {
  const { startCall, openLeadsModal } = useApp();
  const leads = getPlanOutgoingLeads();
  const totalPages = Math.ceil(leads.length / PER_PAGE);

  const [page, setPage]         = useState(0);
  const [expandedIdx, setExpanded] = useState<number | null>(null);

  const pageLeads = leads.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  function navigate(dir: -1 | 1) {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, p + dir)));
    setExpanded(null);
  }

  function toggle(globalIdx: number) {
    setExpanded((prev) => (prev === globalIdx ? null : globalIdx));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Calls to Make</h1>
        <div className={styles.subtitle}>
          {leads.length} leads · ranked by attractiveness score
        </div>
      </div>

      <div className={styles.list}>
        {pageLeads.map((lead) => {
          const globalIdx = leads.indexOf(lead);
          const expanded  = expandedIdx === globalIdx;
          return (
            <LeadRow
              key={lead.id}
              lead={lead}
              rank={globalIdx + 1}
              expanded={expanded}
              onToggle={() => toggle(globalIdx)}
              onCall={() => startCall(lead.name, lead.id)}
              onOpen={() => openLeadsModal(lead.id)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      <div className={styles.pager}>
        <button
          className={styles.pagerBtn}
          onClick={() => navigate(-1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <IconChevronLeft size={15} />
        </button>
        <span className={styles.pagerInfo}>Page {page + 1} of {totalPages}</span>
        <button
          className={styles.pagerBtn}
          onClick={() => navigate(1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
        >
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────
interface RowProps {
  lead: Lead;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
  onCall: () => void;
  onOpen: () => void;
}

function LeadRow({ lead, rank, expanded, onToggle, onCall, onOpen }: RowProps) {
  const sc = scoreColor(lead.attractivenessScore);
  const storySummary = lead.journey.map((j) => j.text).join(' → ');

  return (
    <div className={styles.row} data-testid={`lead-row-${lead.id}`}>
      {/* Head */}
      <div className={styles.rowHead} onClick={onToggle} aria-expanded={expanded}>
        {/* Rank */}
        <span className={styles.rank}>#{rank}</span>

        {/* Avatar */}
        <div
          className={styles.avatar}
          style={{ background: lead.avatarBg, color: lead.avatarColor }}
        >
          {lead.initials}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.name}>{lead.name}</div>
          <div className={styles.interest}>{lead.interest}</div>
        </div>

        {/* Score */}
        <div className={styles.score}>
          <div className={styles.scoreVal} style={{ color: sc }}>
            {lead.attractivenessScore}
          </div>
          <div className={styles.scoreTag}>score</div>
        </div>

        {/* Chevron */}
        <span className={styles.chevron}>
          {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
        </span>
      </div>

      {/* Detail */}
      {expanded && (
        <div className={styles.detail}>
          {/* Story */}
          <div className={styles.sectionLabel}>Story so far</div>
          <div className={styles.story}>{storySummary || 'No prior journey logged.'}</div>

          {/* Product + cross-sell grid */}
          <div className={styles.grid2}>
            <div className={styles.infoBox}>
              <div className={styles.boxLabel}>Preferred product</div>
              <div className={styles.boxVal}>{lead.product}</div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.boxLabel}>Cross-sell</div>
              <div className={styles.boxVal}>{lead.crossSell}</div>
            </div>
          </div>

          {/* EMI */}
          <div className={styles.emiBox}>
            <div className={styles.emiLabel}>EMI / Financing</div>
            <div className={styles.emiText}>{lead.emi}</div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.callBtn} onClick={onCall}>
              <IconPhone size={15} />
              Place call
            </button>
            <button className={styles.openBtn} onClick={onOpen}>
              <IconExternalLink size={14} />
              Open lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
