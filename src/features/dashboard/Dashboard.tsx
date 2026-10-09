import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  IconTrendingUp, IconTrendingDown, IconCircleFilled,
  IconArrowRight,
} from '@tabler/icons-react';
import { useApp } from '../../app/AppContext';
import { getGreeting, shortINR } from '../../utils/format';
import {
  DASHBOARD_KPIS, PROGRESS_METRICS, EARNINGS,
  WEEKLY_CALLS_DATA, CSAT_TREND_DATA, MY_TASKS, CALL_QUEUE,
} from '../../data/callsAndEvents';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { openLeadsModal, dispatch, state } = useApp();
  const navigate = useNavigate();

  function handleTask(action: string) {
    if (action.startsWith('lead:')) {
      openLeadsModal(action.replace('lead:', ''));
    } else if (action.startsWith('pulse:')) {
      navigate('/pulse');
    } else if (action.startsWith('sop:')) {
      const callId = action.replace('sop:', '');
      const idx = state.recentCalls.findIndex((c) => c.id === callId);
      dispatch({ type: 'OPEN_SOP_REVIEW', callIndex: Math.max(0, idx) });
      navigate('/plan/recent');
    }
  }

  const earnPct = Math.min(
    100,
    Math.round(((EARNINGS.current - EARNINGS.slabStart) / (EARNINGS.target - EARNINGS.slabStart)) * 100),
  );

  return (
    <div className={styles.dashboard}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <div className={styles.greeting}>{getGreeting()}</div>
            <div className={styles.agentName}>Arvind Rajan</div>
            <div className={styles.agentSub}>The Sleep Company · Call Centre</div>
          </div>
          <div className={styles.heroRight}>
            <span className={styles.onQueuePill}>
              <span className={styles.liveDot} />
              On Queue
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div className={styles.kpiRow}>
          <KpiCard
            value={DASHBOARD_KPIS.ogScore.value}
            label={DASHBOARD_KPIS.ogScore.label}
            trend={DASHBOARD_KPIS.ogScore.trend}
            up
          />
          <KpiCard
            value={DASHBOARD_KPIS.avgHandleTime.value}
            label={DASHBOARD_KPIS.avgHandleTime.label}
            trend={DASHBOARD_KPIS.avgHandleTime.trend}
            up
          />
          <KpiCard
            value={DASHBOARD_KPIS.csatToday.value}
            label={DASHBOARD_KPIS.csatToday.label}
            trend={DASHBOARD_KPIS.csatToday.trend}
            up
          />
          <KpiCard
            value={DASHBOARD_KPIS.inQueue.value}
            label={DASHBOARD_KPIS.inQueue.label}
            trend={DASHBOARD_KPIS.inQueue.trend}
            live
            onClick={() => navigate('/plan/incoming')}
          />
        </div>
      </div>

      {/* Main grid */}
      <div className={styles.mainGrid}>
        {/* Left column */}
        <div className={styles.col}>
          {/* Progress */}
          <div className={styles.card}>
            <div className={styles.cardEyebrow}>
              <span className={styles.eyeDot} />
              My Progress · today
            </div>
            <div className={styles.progGrid}>
              <ProgMetric value={PROGRESS_METRICS.leadsCreated.value} delta={PROGRESS_METRICS.leadsCreated.delta} label="Leads Created" good={false} />
              <ProgMetric value={PROGRESS_METRICS.leadsCalled.value} delta={PROGRESS_METRICS.leadsCalled.delta} label="Leads Called" good />
            </div>
          </div>

          {/* Who's waiting */}
          <div>
            <div className={styles.sectionHead}>
              <span>Who's waiting</span>
              <button className={styles.sectionLink} onClick={() => navigate('/plan/incoming')}>
                Open planner <IconArrowRight size={13} />
              </button>
            </div>
            <div className={styles.queueList}>
              {CALL_QUEUE.map((q) => {
                const colorMap = { hi: '#e24b4a', mid: '#c8860a', lo: '#0f6e56' };
                const bgMap    = { hi: '#fdecec',  mid: '#fff3d6', lo: '#e1f5ee' };
                return (
                  <div key={q.name} className={styles.queueRow}>
                    <div className={styles.queueAvatar}>
                      <span>👤</span>
                    </div>
                    <div className={styles.queueBody}>
                      <div className={styles.queueName}>{q.name}</div>
                      <div className={styles.queueIntent}>{q.intent}</div>
                    </div>
                    <span
                      className={styles.waitBadge}
                      style={{ color: colorMap[q.waitLevel], background: bgMap[q.waitLevel] }}
                    >
                      {q.wait}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.col}>
          {/* Earnings */}
          <div className={styles.earningsCard}>
            <div className={styles.earningsHeader}>
              <span className={styles.earningsTitle}>💰 My earnings this month</span>
              <span className={styles.earningsSlab}>
                {shortINR(EARNINGS.slabStart)} to {shortINR(EARNINGS.target)} slab
              </span>
            </div>
            <div className={styles.earningsRow}>
              <span className={styles.earningsValue}>{shortINR(EARNINGS.current)}</span>
              <span className={styles.earningsCoached}>
                {shortINR(EARNINGS.coachedContribution)} from coached moves
              </span>
            </div>
            <div className={styles.earningsBarBg}>
              <div className={styles.earningsBarFill} style={{ width: `${earnPct}%` }} />
            </div>
          </div>

          {/* My Tasks */}
          <div className={styles.tasksCard}>
            <div className={styles.tasksHeader}>
              <span className={styles.tasksIcon}>📋</span>
              <span className={styles.tasksTitle}>My Tasks</span>
              <span className={styles.tasksBadge}>{MY_TASKS.length}</span>
            </div>
            <div className={styles.tasksList}>
              {MY_TASKS.map((t) => (
                <button
                  key={t.id}
                  className={styles.taskItem}
                  onClick={() => handleTask(t.action)}
                  data-testid={`task-${t.id}`}
                >
                  <div
                    className={styles.taskIconWrap}
                    style={{ background: t.iconBg }}
                  >
                    <i className={`ti ${t.icon}`} style={{ color: t.iconColor, fontSize: 15 }} />
                  </div>
                  <div className={styles.taskBody}>
                    <div className={styles.taskLabel}>{t.label}</div>
                    <div className={styles.taskSub}>{t.sub}</div>
                  </div>
                  <IconChevronRight size={14} className={styles.taskArrow} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Calls this week</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={WEEKLY_CALLS_DATA} barSize={22} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5ea', padding: '4px 10px' }}
                cursor={{ fill: 'rgba(29,158,117,0.08)' }}
              />
              <Bar dataKey="calls" fill="#1d9e75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>CSAT trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={CSAT_TREND_DATA} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5ea', padding: '4px 10px' }}
              />
              <Line
                type="monotone"
                dataKey="csat"
                stroke="#185fa5"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#185fa5', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function KpiCard({
  value, label, trend, up, live, onClick,
}: {
  value: string; label: string; trend: string; up?: boolean; live?: boolean; onClick?: () => void;
}) {
  return (
    <div
      className={`${styles.kpiCard} ${onClick ? styles.kpiClickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.kpiVal}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={`${styles.kpiTrend} ${live ? styles.kpiLive : up ? styles.kpiUp : styles.kpiDown}`}>
        {live ? (
          <><IconCircleFilled size={7} style={{ marginRight: 3 }} />live</>
        ) : (
          <>{up ? <IconTrendingUp size={11} /> : <IconTrendingDown size={11} />}{trend}</>
        )}
      </div>
    </div>
  );
}

function ProgMetric({ value, delta, label, good }: { value: number; delta: string; label: string; good: boolean }) {
  return (
    <div className={styles.progMetric}>
      <div className={styles.progVal}>{value}</div>
      <div className={`${styles.progDelta} ${good ? styles.progGood : styles.progWarn}`}>▲ {delta}</div>
      <div className={styles.progLabel}>{label}</div>
    </div>
  );
}

// Re-export icon used in tasks
function IconChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
