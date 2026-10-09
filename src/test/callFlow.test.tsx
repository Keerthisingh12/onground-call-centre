import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Simulated Call Flow', () => {
  it('launches call from Leads modal, transitions to active and wrapup', () => {
    render(<App />);

    // Open lead modal first
    const openLeadTask = screen.getByTestId('task-t2');
    fireEvent.click(openLeadTask);

    // Click "Call Lead" in modal
    const callLeadBtn = screen.getByText('Call Lead');
    fireEvent.click(callLeadBtn);

    // Pre-call view
    expect(screen.getByText('Ready to Call Ritu S.')).toBeInTheDocument();

    // Connect call
    const connectBtn = screen.getByText('Connect Call Now');
    fireEvent.click(connectBtn);

    // Connected view
    expect(screen.getByText('LIVE CALL')).toBeInTheDocument();
    expect(screen.getByText('End Call')).toBeInTheDocument();

    // End Call
    const endCallBtn = screen.getByText('End Call');
    fireEvent.click(endCallBtn);

    // Wrap-up view
    expect(screen.getByText('Call Summary & Wrap-up')).toBeInTheDocument();
    expect(screen.getByText('Save & Log Call')).toBeInTheDocument();

    // Save Call
    const saveBtn = screen.getByText('Save & Log Call');
    fireEvent.click(saveBtn);

    // Should close modal and show toast
    expect(screen.queryByText('Call Summary & Wrap-up')).not.toBeInTheDocument();
  });
});
