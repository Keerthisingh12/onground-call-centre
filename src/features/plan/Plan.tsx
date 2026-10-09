import { useLocation, useNavigate } from 'react-router-dom';
import CallsToMake from './CallsToMake';
import Incoming from './Incoming';
import Recent from './Recent';
import { useApp } from '../../app/AppContext';
import { getPlanOutgoingLeads } from '../../data/leads';
import styles from './Plan.module.css';

export default function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();

  const outgoingCount = getPlanOutgoingLeads().length;
  const incomingCount = state.recentCalls.filter((c) => c.dir === 'missed').length;
  const recentCount = state.recentCalls.length;

  let activeTab: 'calls' | 'incoming' | 'recent' = 'calls';
  if (location.pathname.includes('/incoming')) {
    activeTab = 'incoming';
  } else if (location.pathname.includes('/recent')) {
    activeTab = 'recent';
  }

  function handleTabChange(tab: 'calls' | 'incoming' | 'recent') {
    if (tab === 'calls') navigate('/plan');
    else if (tab === 'incoming') navigate('/plan/incoming');
    else if (tab === 'recent') navigate('/plan/recent');
  }

  return (
    <div className={styles.planContainer}>
      {/* Top Tab Bar */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'calls' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('calls')}
        >
          <span>Calls to Make</span>
          <span className={styles.tabBadge}>{outgoingCount}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'incoming' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('incoming')}
        >
          <span>Incoming</span>
          <span className={`${styles.tabBadge} ${incomingCount > 0 ? styles.badgeWarning : ''}`}>
            {incomingCount}
          </span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'recent' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('recent')}
        >
          <span>Recent</span>
          <span className={styles.tabBadge}>{recentCount}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'calls' && <CallsToMake />}
        {activeTab === 'incoming' && <Incoming />}
        {activeTab === 'recent' && <Recent />}
      </div>
    </div>
  );
}
