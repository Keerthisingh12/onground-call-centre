import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconSearch, IconSparkles, IconChevronRight, IconMessageCircle,
  IconTrophy,
} from '@tabler/icons-react';
import { PULSE_THREADS, DIRECT_MESSAGES } from '../../data/pulse';
import styles from './Pulse.module.css';

export default function Pulse() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredThreads = PULSE_THREADS.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.preview ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredDMs = DIRECT_MESSAGES.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.preview ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pulse</h1>
        <div className={styles.subtitle}>Team channels, AI copilot & direct messages</div>
      </div>

      {/* Search Input */}
      <div className={styles.searchBar}>
        <IconSearch size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search channels, people, or discussions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Avani AI Bot Hero */}
      <div className={styles.avaniCard}>
        <div className={styles.avaniHeader}>
          <div className={styles.avaniIconWrap}>
            <IconSparkles size={22} />
          </div>
          <div className={styles.avaniInfo}>
            <div className={styles.avaniTitle}>Avani AI Copilot</div>
            <div className={styles.avaniSub}>
              Instant product specs, objection rebuttals & floor guidance
            </div>
          </div>
        </div>

        <div className={styles.promptChips}>
          <button
            className={styles.chip}
            onClick={() => navigate('/pulse/avani-coaching')}
          >
            🛡️ Ortho GRID 10-Yr Warranty SOP
          </button>
          <button
            className={styles.chip}
            onClick={() => navigate('/pulse/avani-coaching')}
          >
            💳 12-Month Zero-Interest EMI Pitch
          </button>
          <button
            className={styles.chip}
            onClick={() => navigate('/pulse/avani-coaching')}
          >
            🎯 First 10s Greeting Script
          </button>
        </div>
      </div>

      {/* Team Channels */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Channels</div>
        <div className={styles.channelList}>
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className={styles.channelRow}
              onClick={() => navigate(`/pulse/${thread.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.channelIconWrap}>
                <IconMessageCircle size={18} />
              </div>

              <div className={styles.channelContent}>
                <div className={styles.channelHead}>
                  <span className={styles.channelName}>{thread.title}</span>
                  {Boolean(thread.unread && thread.unread > 0) && (
                    <span className={styles.unreadBadge}>{thread.unread}</span>
                  )}
                </div>
                <div className={styles.channelPreview}>{thread.preview}</div>
              </div>

              <IconChevronRight size={16} className={styles.chevron} />
            </div>
          ))}
        </div>
      </div>

      {/* Direct Messages */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Direct Messages</div>
        <div className={styles.dmList}>
          {filteredDMs.map((dm) => (
            <div
              key={dm.id}
              className={styles.dmRow}
              onClick={() => navigate(`/pulse/${dm.id}`)}
              role="button"
              tabIndex={0}
            >
              <div
                className={styles.avatar}
                style={{ background: dm.bg, color: dm.color }}
              >
                {dm.initials}
                <span
                  className={`${styles.statusDot} ${dm.status === 'online' ? styles.dotOnline : styles.dotAway}`}
                />
              </div>

              <div className={styles.dmContent}>
                <div className={styles.dmHead}>
                  <span className={styles.dmName}>{dm.name}</span>
                  <span className={styles.dmTime}>{dm.time}</span>
                </div>
                <div className={styles.dmPreview}>{dm.preview}</div>
              </div>

              <IconChevronRight size={16} className={styles.chevron} />
            </div>
          ))}
        </div>
      </div>

      {/* Kudos Feed */}
      <div className={styles.kudosSection}>
        <div className={styles.kudosHead}>
          <IconTrophy size={18} className={styles.trophyIcon} />
          <span className={styles.kudosTitle}>Kudos & Floor Highlights</span>
        </div>
        <div className={styles.kudosCards}>
          <div className={styles.kudoCard}>
            <span className={styles.kudoIcon}>🌟</span>
            <div className={styles.kudoText}>
              <strong>Arvind R.</strong> closed 3 Smart Luxe sales today with 100% greeting adherence!
            </div>
          </div>
          <div className={styles.kudoCard}>
            <span className={styles.kudoIcon}>🎉</span>
            <div className={styles.kudoText}>
              Call Centre Floor reached <strong>94% CSAT</strong> today — great team execution!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
