/**
 * liveAudioDemo.test.tsx
 *
 * Tests for LiveAudioDemo covering:
 *  1. Join-form validation (no name, no room name).
 *  2. RoomEvent.TrackSubscribed → track.attach() called, element in DOM.
 *  3. RoomEvent.TrackUnsubscribed → track.detach() called.
 *  4. RoomEvent.AudioPlaybackStatusChanged → "Enable Audio" button shown,
 *     clicking it calls room.startAudio().
 *
 * vi.hoisted() is used so shared mutable state (roomHandlers, etc.) is
 * initialised before vi.mock() hoists the factory — otherwise closures
 * over module-scope variables are undefined when the mock runs.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveAudioDemo from '../features/live-audio/LiveAudioDemo';

// ---------------------------------------------------------------------------
// Shared mutable state via vi.hoisted – available inside vi.mock factory
// ---------------------------------------------------------------------------
const {
  roomHandlers,
  mockStartAudio,
  mockDisconnect,
  mockPublishTrack,
  mockCanPlaybackAudio,
} = vi.hoisted(() => {
  const roomHandlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  const mockStartAudio = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockPublishTrack = vi.fn().mockResolvedValue(undefined);
  // Mutable box so tests can flip canPlaybackAudio
  const mockCanPlaybackAudio = { value: true };
  return { roomHandlers, mockStartAudio, mockDisconnect, mockPublishTrack, mockCanPlaybackAudio };
});

// ---------------------------------------------------------------------------
// Mock livekit-client
// ---------------------------------------------------------------------------
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
      get canPlaybackAudio() { return mockCanPlaybackAudio.value; },
      localParticipant: {
        publishTrack: mockPublishTrack,
        setMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
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
    ConnectionState: { Connected: 'connected', Reconnecting: 'reconnecting', Disconnected: 'disconnected' },
    Track: { Kind: { Audio: 'audio', Video: 'video' } },
    ParticipantEvent: { IsSpeakingChanged: 'isSpeakingChanged' },
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

// ---------------------------------------------------------------------------
// Browser API mocks
// ---------------------------------------------------------------------------

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    },
  });
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderComponent() {
  // Reset handlers and state before each test
  Object.keys(roomHandlers).forEach((k) => { roomHandlers[k] = []; });
  mockStartAudio.mockClear();
  mockDisconnect.mockClear();
  mockPublishTrack.mockClear();
  mockCanPlaybackAudio.value = true;

  return render(
    <MemoryRouter>
      <LiveAudioDemo />
    </MemoryRouter>,
  );
}

/** Fill name, click Join, then fire ConnectionState.Connected */
async function joinRoom() {
  fireEvent.change(screen.getByLabelText(/Your Display Name/i), { target: { value: 'Alice' } });
  fireEvent.click(screen.getByRole('button', { name: /Join Room/i }));
  await act(async () => {
    roomHandlers['connectionStateChanged']?.forEach((h) => h('connected'));
  });
  // Verify we're in the connected state
  await waitFor(() => expect(screen.getByText('LIVE')).toBeInTheDocument());
}

// ---------------------------------------------------------------------------
// Tests: join form validation
// ---------------------------------------------------------------------------
describe('LiveAudioDemo – join form', () => {
  it('renders the join form with all required fields', () => {
    renderComponent();
    expect(screen.getByText('Live Audio Demo')).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Display Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Room/i })).toBeInTheDocument();
  });

  it('shows validation error when display name is empty', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Your Display Name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Join Room/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/display name/i),
    );
  });

  it('shows validation error when room name is empty', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Room Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Your Display Name/i), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /Join Room/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/room name/i),
    );
  });

  it('shows the reviewer instruction panel with the correct title', () => {
    renderComponent();
    expect(screen.getByText(/Try the live audio call/i)).toBeInTheDocument();
  });

  it('shows all 6 numbered steps in the reviewer panel', () => {
    renderComponent();
    expect(screen.getByText(/two separate browser tabs/i)).toBeInTheDocument();
    expect(screen.getByText(/same room name/i)).toBeInTheDocument();
    expect(screen.getByText(/different display name/i)).toBeInTheDocument();
    // Step 4 spans <strong>Join Room</strong> + text — match the surrounding text
    expect(screen.getByText(/allow microphone access when prompted/i)).toBeInTheDocument();
    expect(screen.getByText(/Speak in one tab/i)).toBeInTheDocument();
    // Step 6: "Enable Audio" is in a <strong>, match the banner text around it
    expect(screen.getByText(/banner appears, click it once/i)).toBeInTheDocument();
  });

  it('shows the headphones recommendation note', () => {
    renderComponent();
    expect(screen.getByText(/Headphones recommended/i)).toBeInTheDocument();
  });

  it('has a copy-link button', () => {
    renderComponent();
    expect(screen.getByTitle(/Copy link to share/i)).toBeInTheDocument();
  });

});

// ---------------------------------------------------------------------------
// Tests: TrackSubscribed → attach audio to DOM
// ---------------------------------------------------------------------------
describe('LiveAudioDemo – TrackSubscribed attaches audio to DOM', () => {
  it('calls track.attach() and appends element to audio container', async () => {
    renderComponent();
    await joinRoom();

    const audioEl = document.createElement('audio');
    const audioTrack = {
      kind: 'audio',
      attach: vi.fn(() => audioEl),
      detach: vi.fn(() => [audioEl]),
    };

    await act(async () => {
      roomHandlers['trackSubscribed']?.forEach((h) => h(audioTrack));
    });

    expect(audioTrack.attach).toHaveBeenCalledTimes(1);
    const container = document.getElementById('lad-audio-container');
    expect(container?.contains(audioEl)).toBe(true);
  });

  it('does NOT call attach() for non-audio (video) tracks', async () => {
    renderComponent();
    await joinRoom();

    const videoTrack = {
      kind: 'video',
      attach: vi.fn(),
      detach: vi.fn(),
    };

    await act(async () => {
      roomHandlers['trackSubscribed']?.forEach((h) => h(videoTrack));
    });

    expect(videoTrack.attach).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests: TrackUnsubscribed → detach removes element
// ---------------------------------------------------------------------------
describe('LiveAudioDemo – TrackUnsubscribed detaches audio', () => {
  it('calls track.detach() when a remote audio track is unsubscribed', async () => {
    renderComponent();
    await joinRoom();

    const audioEl = document.createElement('audio');
    const audioTrack = {
      kind: 'audio',
      attach: vi.fn(() => audioEl),
      detach: vi.fn(() => [audioEl]),
    };

    // Subscribe first
    await act(async () => {
      roomHandlers['trackSubscribed']?.forEach((h) => h(audioTrack));
    });
    expect(audioTrack.attach).toHaveBeenCalledTimes(1);

    // Unsubscribe
    await act(async () => {
      roomHandlers['trackUnsubscribed']?.forEach((h) => h(audioTrack));
    });
    expect(audioTrack.detach).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: AudioPlaybackStatusChanged → Enable Audio button
// ---------------------------------------------------------------------------
describe('LiveAudioDemo – AudioPlaybackStatusChanged', () => {
  it('shows Enable Audio button when canPlaybackAudio is false', async () => {
    renderComponent();
    await joinRoom();

    await act(async () => {
      mockCanPlaybackAudio.value = false; // Simulate autoplay block
      roomHandlers['audioPlaybackChanged']?.forEach((h) => h());
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enable Audio/i })).toBeInTheDocument(),
    );
  });

  it('calls room.startAudio() when Enable Audio is clicked', async () => {
    renderComponent();
    await joinRoom();

    await act(async () => {
      mockCanPlaybackAudio.value = false;
      roomHandlers['audioPlaybackChanged']?.forEach((h) => h());
    });

    const btn = await screen.findByRole('button', { name: /Enable Audio/i });
    await act(async () => { fireEvent.click(btn); });

    expect(mockStartAudio).toHaveBeenCalledTimes(1);
  });
});
