import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Navigation & Layout', () => {
  it('renders On-Ground.ai branding and main topbar', () => {
    render(<App />);
    expect(screen.getAllByText('On-Ground.ai').length).toBeGreaterThan(0);
    expect(screen.getAllByText('OG Score™').length).toBeGreaterThan(0);
  });

  it('renders navigation links for core screens', () => {
    render(<App />);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calendar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pulse').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Practise').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Avani AI Call').length).toBeGreaterThan(0);
  });

  it('displays the Dashboard hero and metrics by default', () => {
    render(<App />);
    expect(screen.getAllByText('Arvind Rajan').length).toBeGreaterThan(0);
    expect(screen.getByText('The Sleep Company · Call Centre')).toBeInTheDocument();
    expect(screen.getByText("Who's waiting")).toBeInTheDocument();
  });

  it('provides an accessible mobile drawer toggle with open/close and Escape behavior', () => {
    render(<App />);
    const openBtn = screen.getByRole('button', { name: 'Open menu' });
    expect(openBtn).toBeInTheDocument();
    expect(openBtn).toHaveAttribute('aria-expanded', 'false');
    expect(openBtn).toHaveAttribute('aria-controls', 'main-sidebar');

    // Click to open drawer
    fireEvent.click(openBtn);
    const closeBtn = screen.getByRole('button', { name: 'Close menu' });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close sidebar' })).toBeInTheDocument();

    // Press Escape key to close drawer
    fireEvent.keyDown(window, { key: 'Escape' });
    const reopenedBtn = screen.getByRole('button', { name: 'Open menu' });
    expect(reopenedBtn).toBeInTheDocument();
    expect(reopenedBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open drawer again and close via close sidebar button
    fireEvent.click(reopenedBtn);
    const closeSidebarBtn = screen.getByRole('button', { name: 'Close sidebar' });
    fireEvent.click(closeSidebarBtn);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');

    // Open drawer and close via clicking a link
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const calendarLink = screen.getAllByRole('link', { name: /calendar/i })[0];
    fireEvent.click(calendarLink);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders across multiple device viewport widths without errors', () => {
    const viewports = [320, 375, 390, 768, 1280];
    for (const width of viewports) {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));
      const { unmount } = render(<App />);
      expect(screen.getAllByText('On-Ground.ai').length).toBeGreaterThan(0);
      unmount();
    }
  });
});
