// ─── Formatting utilities ─────────────────────────────────────────────────

/** Format a number as Indian Rupees using Intl.NumberFormat */
export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Short Indian currency format: ₹8,490 */
export function shortINR(value: number): string {
  return '₹' + value.toLocaleString('en-IN');
}

/** Format seconds elapsed as m:ss */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Get time-of-day greeting */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

/** Score colour based on value */
export function scoreColor(score: number): string {
  if (score >= 80) return '#1d9e75';
  if (score >= 55) return '#c8860a';
  return '#e24b4a';
}

/** Truncate text to max length */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

/** Format date for display */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/** Return days in a month */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Return weekday offset (0=Sun) for first day of month */
export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Check if a date is today */
export function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}
