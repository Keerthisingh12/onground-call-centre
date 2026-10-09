import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard, IconPhone, IconCalendar, IconMessage2, IconMicrophone2,
} from '@tabler/icons-react';
import styles from './BottomNav.module.css';

const ITEMS = [
  { path: '/',         icon: IconLayoutDashboard, label: 'Home',    end: true },
  { path: '/plan/calls', icon: IconPhone,          label: 'Plan',   end: false },
  { path: '/calendar', icon: IconCalendar,          label: 'Calendar', end: true },
  { path: '/pulse',    icon: IconMessage2,           label: 'Pulse',  end: true },
  { path: '/practise', icon: IconMicrophone2,        label: 'Practise', end: true },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <item.icon size={22} />
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
