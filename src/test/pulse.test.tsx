import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Pulse from '../features/pulse/Pulse';
import PulseChannel from '../features/pulse/PulseChannel';
import { AppProvider } from '../app/AppContext';

describe('Pulse Feature', () => {
  it('renders channels and Avani bot card', () => {
    render(
      <MemoryRouter>
        <Pulse />
      </MemoryRouter>
    );

    expect(screen.getByText('Avani AI Copilot')).toBeInTheDocument();
    expect(screen.getByText('#callcentre-team')).toBeInTheDocument();
  });

  it('renders pinned input card in #callcentre-team channel', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/pulse/callcentre-team']}>
          <Routes>
            <Route path="/pulse/:channelId" element={<PulseChannel />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText('Needs your input')).toBeInTheDocument();
    expect(screen.getByText('Confirm the 4:30pm callback')).toBeInTheDocument();
    expect(screen.getByText(/Confirmed \(4:30pm\)/i)).toBeInTheDocument();
  });
});
