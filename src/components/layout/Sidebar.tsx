import { NavLink, useLocation } from 'react-router-dom';
import {
  IconLayoutDashboard, IconPhone, IconCalendar, IconMessage2,
  IconChevronDown, IconChevronRight, IconMicrophone2,
  IconPhoneIncoming, IconPhoneOutgoing, IconClockHour4, IconHeadphones,
  IconSparkles,
} from '@tabler/icons-react';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/',         icon: IconLayoutDashboard, label: 'Dashboard' },
  {
    label: 'Plan',
    icon: IconPhone,
    children: [
      { path: '/plan/calls',    icon: IconPhoneOutgoing,  label: 'Calls to Make' },
      { path: '/plan/incoming', icon: IconPhoneIncoming,  label: 'Incoming' },
      { path: '/plan/recent',   icon: IconClockHour4,     label: 'Recent' },
    ],
  },
  { path: '/calendar', icon: IconCalendar,          label: 'Calendar' },
  { path: '/pulse',    icon: IconMessage2,           label: 'Pulse' },
  { path: '/practise', icon: IconMicrophone2,        label: 'Practise' },
  { path: '/ai-call',  icon: IconSparkles,           label: 'Avani AI Call' },
  { path: '/live-audio', icon: IconHeadphones,        label: 'Live Audio Demo' },
];

export default function Sidebar() {
  const location = useLocation();
  const isPlanActive = location.pathname.startsWith('/plan');
  const [planOpen, setPlanOpen] = useState(isPlanActive);

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.logo}>
        <div className={styles.logoMark}>OG</div>
        <span className={styles.logoText}>On-Ground.ai</span>
      </div>

      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  className={`${styles.navItem} ${isPlanActive ? styles.active : ''}`}
                  onClick={() => setPlanOpen((o) => !o)}
                  aria-expanded={planOpen}
                >
                  <span className={styles.navIcon}><item.icon size={18} /></span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.chevron}>
                    {planOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                </button>
                {planOpen && (
                  <div className={styles.subNav}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `${styles.subItem} ${isActive ? styles.subActive : ''}`
                        }
                      >
                        <span className={styles.subIcon}><child.icon size={15} /></span>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.path === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}><item.icon size={18} /></span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className={styles.agentCard}>
        <div className={styles.agentAvatar}>AR</div>
        <div className={styles.agentInfo}>
          <div className={styles.agentName}>Arvind Rajan</div>
          <div className={styles.agentSub}>The Sleep Company</div>
        </div>
        <span className={styles.onlineIndicator} aria-label="Online" />
      </div>
    </nav>
  );
}
