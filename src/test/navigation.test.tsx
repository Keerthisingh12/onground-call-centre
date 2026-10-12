import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
