import { IconBell, IconStar } from '@tabler/icons-react';
import { getGreeting } from '../../utils/format';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.left}>
        {/* Mobile logo */}
        <div className={styles.mobileLogo}>
          <div className={styles.mobileMark}>OG</div>
          <span className={styles.mobileText}>On-Ground.ai</span>
        </div>
        {/* Desktop greeting */}
        <div className={styles.greeting}>{getGreeting()}</div>
      </div>

      <div className={styles.right}>
        {/* OG Score pill */}
        <div className={styles.scorePill} title="OG Score™ — your performance rank">
          <span className={styles.scoreVal}>76</span>
          <span className={styles.scoreLabel}>OG Score™</span>
        </div>

        {/* Rank */}
        <div className={styles.rankPill} title="Rank within RT Nagar">
          <IconStar size={12} />
          <span>#3</span>
        </div>

        {/* Notification bell */}
        <button className={styles.notifBtn} aria-label="Notifications">
          <IconBell size={17} />
          <span className={styles.notifDot} />
        </button>

        {/* Agent badge */}
        <div className={styles.agentBadge} aria-label="Agent: Arvind Rajan">
          <span className={styles.agentEmoji}>🦸‍♂️</span>
          <span className={styles.agentInitials}>AR</span>
        </div>
      </div>
    </header>
  );
}
