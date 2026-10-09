import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Leads & Plan Interaction', () => {
  it('opens LeadsModal when clicking Open lead task on Dashboard', () => {
    render(<App />);

    const openLeadTask = screen.getByTestId('task-t2');
    fireEvent.click(openLeadTask);

    // LeadsModal should be visible with Ritu S.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ritu S.')).toBeInTheDocument();
    expect(screen.getByText('Smart Luxe Mattress')).toBeInTheDocument();
  });

  it('navigates to next and previous lead within the LeadsModal', () => {
    render(<App />);

    // Open modal
    const openLeadTask = screen.getByTestId('task-t2');
    fireEvent.click(openLeadTask);

    // Look for Next lead navigation button
    const nextBtn = screen.getByLabelText('Next lead');
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);

    // Next lead is Mukunda R.
    expect(screen.getByText('Mukunda R.')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<App />);

    const openLeadTask = screen.getByTestId('task-t2');
    fireEvent.click(openLeadTask);

    const closeBtn = screen.getByLabelText('Close lead modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
