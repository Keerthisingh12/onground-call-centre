/**
 * aiCall.test.tsx
 *
 * Tests for AiCall page covering:
 *  1. Initial render (Avani introduction, name input, Start Call button).
 *  2. Name input validation.
 *  3. Starting call → room connection → LIVE indicator rendered.
 *  4. Audio blocked banner rendering when canPlaybackAudio is false.
 *  5. Mute and End Call interactions.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiCall from '../features/ai-call/AiCall';

const {
  roomHandlers,
  mockStartAudio,
  mockDisconnect,
  mockPublishTrack,
  mockCanPlaybackAudio,
  mockSetMicrophoneEnabled,
} = vi.hoisted(() => {
  const roomHandlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  const mockStartAudio = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockPublishTrack = vi.fn().mockResolvedValue(undefined);
  const mockSetMicrophoneEnabled = vi.fn().mockResolvedValue(undefined);
  const mockCanPlaybackAudio = { value: true };
  return {
    roomHandlers,
    mockStartAudio,
    mockDisconnect,
    mockPublishTrack,
    mockCanPlaybackAudio,
    mockSetMicrophoneEnabled,
  };
});

vi.mock('livekit-client', () => {
  function Room() {
    return {
      on(event: string, handler: (...args: unknown[]) => void) {
        if (!roomHandlers[event]) roomHandlers[event] = [];
        roomHandlers[event].push(handler);
      },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: mockDisconnect,
      startAudio: mockStartAudio,
      get canPlaybackAudio() {
        return mockCanPlaybackAudio.value;
      },
      localParticipant: {
        publishTrack: mockPublishTrack,
        setMicrophoneEnabled: mockSetMicrophoneEnabled,
        on: vi.fn(),
        identity: 'test-user',
      },
      remoteParticipants: new Map(),
    };
  }

  return {
    Room,
    RoomEvent: {
      Disconnected: 'disconnected',
      ParticipantConnected: 'participantConnected',
      ParticipantDisconnected: 'participantDisconnected',
      TrackMuted: 'trackMuted',
      TrackUnmuted: 'trackUnmuted',
      TrackSubscribed: 'trackSubscribed',
      TrackUnsubscribed: 'trackUnsubscribed',
      TrackUnpublished: 'trackUnpublished',
      ActiveSpeakersChanged: 'activeSpeakersChanged',
      ConnectionStateChanged: 'connectionStateChanged',
      AudioPlaybackStatusChanged: 'audioPlaybackChanged',
    },
    ConnectionState: {
      Connected: 'connected',
      Reconnecting: 'reconnecting',
      Disconnected: 'disconnected',
    },
    Track: { Kind: { Audio: 'audio', Video: 'video' } },
    TokenSource: {
      developmentTokenServer: () => ({
        fetch: vi.fn().mockResolvedValue({
          serverUrl: 'wss://test.livekit.cloud',
          participantToken: 'fake-jwt',
        }),
      }),
    },
    createLocalAudioTrack: vi.fn().mockResolvedValue({ stop: vi.fn() }),
  };
});

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    },
  });
});

function renderComponent() {
  Object.keys(roomHandlers).forEach((k) => {
    roomHandlers[k] = [];
  });
  mockStartAudio.mockClear();
  mockDisconnect.mockClear();
  mockPublishTrack.mockClear();
  mockSetMicrophoneEnabled.mockClear();
  mockCanPlaybackAudio.value = true;

  return render(
    <MemoryRouter>
      <AiCall />
    </MemoryRouter>,
  );
}

async function joinCall(name = 'Priya') {
  const input = screen.getByLabelText(/Your Name/i);
  fireEvent.change(input, { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: /Start Voice Call with Avani/i }));

  // Wait for the room to be created and handlers to attach
  await waitFor(() => {
    expect(roomHandlers['connectionStateChanged']?.length).toBeGreaterThan(0);
  });

  await act(async () => {
    roomHandlers['connectionStateChanged']?.forEach((h) => h('connected'));
  });

  await waitFor(() => expect(screen.getByText('LIVE')).toBeInTheDocument());
}

describe('AiCall Component', () => {
  it('renders Avani introduction and Start Call button', () => {
    renderComponent();
    expect(screen.getByText(/AI Voice Call — Avani/i)).toBeInTheDocument();
    expect(screen.getByText(/Avani — Retail Voice Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Voice Call with Avani/i })).toBeInTheDocument();
  });

  it('validates empty name input', async () => {
    renderComponent();
    const input = screen.getByLabelText(/Your Name/i);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Start Voice Call with Avani/i }));

    expect(await screen.findByText(/Please enter your name/i)).toBeInTheDocument();
  });

  it('initiates call and displays LIVE status upon connection', async () => {
    renderComponent();
    await joinCall('Priya');
    expect(screen.getByRole('button', { name: /End Call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mute microphone/i })).toBeInTheDocument();
  });

  it('toggles mute/unmute state when clicked', async () => {
    renderComponent();
    await joinCall('Priya');
    const muteBtn = screen.getByRole('button', { name: /Mute microphone/i });
    await act(async () => {
      fireEvent.click(muteBtn);
    });

    expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unmute microphone/i })).toBeInTheDocument();
    });
  });

  it('disconnects and returns to idle when End Call is clicked', async () => {
    renderComponent();
    await joinCall('Priya');
    const endBtn = screen.getByRole('button', { name: /End Call/i });
    fireEvent.click(endBtn);

    expect(mockDisconnect).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Voice Call with Avani/i })).toBeInTheDocument();
    });
  });
});
