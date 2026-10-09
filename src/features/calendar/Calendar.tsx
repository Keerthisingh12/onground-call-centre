import { useState } from 'react';
import {
  IconChevronLeft, IconChevronRight,
  IconClock, IconPlus, IconShare, IconCheck, IconX,
} from '@tabler/icons-react';
import { CALENDAR_EVENTS } from '../../data/callsAndEvents';
import { useApp } from '../../app/AppContext';
import type { CalendarEvent } from '../../types';
import styles from './Calendar.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SHARE_OPTIONS = [
  { id: 'manager', label: 'Sunita Rao', sub: 'Manager · #callcentre-team', icon: '👤' },
  { id: 'team', label: 'Call Centre Team', sub: 'All members · #callcentre-team', icon: '👥' },
  { id: 'landd', label: 'Fahmy', sub: 'L&D Coach', icon: '🎓' },
];

export default function Calendar() {
  const { showToast } = useApp();

  // Current view date: October 2026 as per assignment timeline
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 9)); // Oct 9, 2026
  const [selectedDay, setSelectedDay] = useState<number>(9);
  const [activeTab, setActiveTab] = useState<'day' | 'upcoming'>('day');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShares, setSelectedShares] = useState<string[]>(['team']);
  const [events, setEvents] = useState<CalendarEvent[]>([...CALENDAR_EVENTS]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date(2026, 9, 9));
    setSelectedDay(9);
  }

  // Find events for selected day (in October 2026)
  const dayEvents = (year === 2026 && month === 9)
    ? events.filter((e) => e.day === selectedDay)
    : [];

  const upcomingEvents = events.sort((a, b) => a.day - b.day);

  function toggleShareOption(id: string) {
    setSelectedShares((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSendInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const time = formData.get('time') as string;

    if (!title || !time) return;

    const newEvent: CalendarEvent = {
      day: selectedDay,
      time,
      title,
      meta: `Invited: ${selectedShares.join(', ')}`,
    };

    setEvents((prev) => [...prev, newEvent]);
    setShareModalOpen(false);
    showToast(`Invite created: "${title}" on Oct ${selectedDay}`, 'success');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar & Coaching</h1>
          <div className={styles.subtitle}>Scheduled callbacks, reviews & team sessions</div>
        </div>

        <button className={styles.addBtn} onClick={() => setShareModalOpen(true)}>
          <IconPlus size={16} /> New Invite
        </button>
      </div>

      {/* Month Navigation */}
      <div className={styles.monthNav}>
        <div className={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </div>
        <div className={styles.navControls}>
          <button className={styles.todayBtn} onClick={goToday}>
            Today
          </button>
          <button className={styles.iconBtn} onClick={prevMonth} aria-label="Previous Month">
            <IconChevronLeft size={18} />
          </button>
          <button className={styles.iconBtn} onClick={nextMonth} aria-label="Next Month">
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendarCard}>
        <div className={styles.weekdayRow}>
          {WEEKDAYS.map((wd) => (
            <div key={wd} className={styles.weekday}>
              {wd}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyDay} />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = year === 2026 && month === 9 && dayNum === 9;
            const isSelected = dayNum === selectedDay;
            const hasEvent = year === 2026 && month === 9 && events.some((e) => e.day === dayNum);

            return (
              <button
                key={`day-${dayNum}`}
                className={`
                  ${styles.dayCell}
                  ${isSelected ? styles.daySelected : ''}
                  ${isToday ? styles.dayToday : ''}
                `}
                onClick={() => setSelectedDay(dayNum)}
              >
                <span className={styles.dayNum}>{dayNum}</span>
                {hasEvent && <span className={styles.eventDot} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Tabs */}
      <div className={styles.scheduleSection}>
        <div className={styles.tabToggleRow}>
          <button
            className={`${styles.tabToggle} ${activeTab === 'day' ? styles.tabToggleActive : ''}`}
            onClick={() => setActiveTab('day')}
          >
            Oct {selectedDay} Schedule ({dayEvents.length})
          </button>
          <button
            className={`${styles.tabToggle} ${activeTab === 'upcoming' ? styles.tabToggleActive : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            All Upcoming ({upcomingEvents.length})
          </button>
        </div>

        {activeTab === 'day' ? (
          <div className={styles.eventList}>
            {dayEvents.length > 0 ? (
              dayEvents.map((evt, idx) => (
                <div key={idx} className={styles.eventCard}>
                  <div className={styles.eventTimePill}>
                    <IconClock size={14} /> {evt.time}
                  </div>
                  <div className={styles.eventBody}>
                    <div className={styles.eventTitle}>{evt.title}</div>
                    <div className={styles.eventMeta}>{evt.meta}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noEvents}>
                <div className={styles.noEventsEmoji}>☕</div>
                <div className={styles.noEventsText}>No events scheduled for Oct {selectedDay}</div>
                <button
                  className={styles.quickAddLink}
                  onClick={() => setShareModalOpen(true)}
                >
                  + Add callback or coaching session
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.eventList}>
            {upcomingEvents.map((evt, idx) => (
              <div key={idx} className={styles.eventCard}>
                <div className={styles.eventDateBadge}>
                  <span className={styles.badgeMonth}>OCT</span>
                  <span className={styles.badgeDay}>{evt.day}</span>
                </div>
                <div className={styles.eventBody}>
                  <div className={styles.eventTitle}>{evt.title}</div>
                  <div className={styles.eventMeta}>
                    {evt.time} · {evt.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share / Invite Modal */}
      {shareModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setShareModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Schedule Session / Invite</h2>
              <button className={styles.closeBtn} onClick={() => setShareModalOpen(false)}>
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className={styles.inviteForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Session Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Objections Refresher or Customer Callback"
                  className={styles.formInput}
                  defaultValue="Customer Callback Follow-up"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date</label>
                  <input
                    type="text"
                    readOnly
                    value={`October ${selectedDay}, 2026`}
                    className={`${styles.formInput} ${styles.readOnlyInput}`}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Time</label>
                  <input
                    name="time"
                    type="text"
                    required
                    placeholder="3:30 PM"
                    defaultValue="3:30 PM"
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Invite Participants</label>
                <div className={styles.sharesList}>
                  {SHARE_OPTIONS.map((opt) => {
                    const isChecked = selectedShares.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`${styles.shareItem} ${isChecked ? styles.shareItemChecked : ''}`}
                        onClick={() => toggleShareOption(opt.id)}
                      >
                        <span className={styles.shareIcon}>{opt.icon}</span>
                        <div className={styles.shareText}>
                          <div className={styles.shareName}>{opt.label}</div>
                          <div className={styles.shareSub}>{opt.sub}</div>
                        </div>
                        <div className={styles.checkbox}>
                          {isChecked && <IconCheck size={14} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShareModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  <IconShare size={16} /> Confirm & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
