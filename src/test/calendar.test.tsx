import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Calendar from '../features/calendar/Calendar';
import { AppProvider } from '../app/AppContext';

describe('Calendar Feature', () => {
  it('renders calendar month navigation and days grid', () => {
    render(
      <AppProvider>
        <Calendar />
      </AppProvider>
    );

    expect(screen.getByText('Calendar & Coaching')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('displays scheduled coaching and team huddle events', () => {
    render(
      <AppProvider>
        <Calendar />
      </AppProvider>
    );

    expect(screen.getByText(/All Upcoming/i)).toBeInTheDocument();
  });
});
