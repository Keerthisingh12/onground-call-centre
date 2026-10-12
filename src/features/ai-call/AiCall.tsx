/**
 * AiCall.tsx — Realtime conversation with Avani, the On-Ground.ai voice assistant.
 *
 * Architecture:
 * 1. Requests short-lived room token from backend (POST /api/token, mode: "ai")
 *    or falls back to development token server if no API server configured.
 * 2. Connects to LiveKit room via WebRTC using livekit-client.
 * 3. Dispatches and interacts with the 'onground-assistant' agent using
 *    Google Gemini Realtime.
 * 4. Renders live audio tracks, handles mute/unmute, autoplay permissions, and call duration.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  ConnectionState,
  createLocalAudioTrack,
  TokenSource,
  Track,
  type LocalAudioTrack,
  type RemoteTrack,
} from 'livekit-client';
import {
  IconSparkles,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconPhone,
  IconAlertTriangle,
  IconVolume,
  IconHeadset,
} from '@tabler/icons-react';
import styles from './AiCall.module.css';

type CallState = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface TokenResponse {
  token: string;
  url: string;
  room: string;
  identity: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';
const TOKEN_SERVER_ID = (import.meta.env.VITE_LIVEKIT_TOKEN_SERVER_ID as string) || '';

export default function AiCall() {
  const [userName, setUserName] = useState('Customer');
  const [callState, setCallState] = useState<CallState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [roomName, setRoomName] = useState('');
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalAudioTrack | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    stopTimer();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  }

  useEffect(() => {
    return () => {
      stopTimer();
      if (localTrackRef.current) {
        localTrackRef.current.stop();
        localTrackRef.current = null;
      }
      if (roomRef.current) {
        void roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const attachRemoteAudio = useCallback((track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    const el = track.attach() as HTMLAudioElement;
    el.autoplay = true;
    el.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(el);
    }
    void el.play?.()?.catch(() => {
      // Surfaced via AudioPlaybackStatusChanged
    });
  }, []);

  const detachRemoteAudio = useCallback((track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    const elements = track.detach();
    elements.forEach((el) => el.parentNode?.removeChild(el));
  }, []);

  async function fetchTokenCredentials(displayName: string): Promise<{ url: string; token: string; room: string }> {
    // 1. If backend API base URL is defined or relative /api/token is available
    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/token` : '/api/token';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ai', displayName }),
      });

      if (res.ok) {
        const data = (await res.json()) as TokenResponse;
        return { url: data.url, token: data.token, room: data.room };
      }
    } catch {
      // Fallback below if serverless endpoint is not running locally
    }

    // 2. Fallback to development token server if VITE_LIVEKIT_TOKEN_SERVER_ID is provided
    if (TOKEN_SERVER_ID) {
      const generatedRoom = `ai-${Math.random().toString(36).slice(2, 10)}`;
      const tokenSource = TokenSource.developmentTokenServer(TOKEN_SERVER_ID);
      const { serverUrl, participantToken } = await tokenSource.fetch({
        roomName: generatedRoom,
        participantIdentity: `user-${Math.random().toString(36).slice(2, 8)}`,
        participantName: displayName,
      });
      return { url: serverUrl, token: participantToken, room: generatedRoom };
    }

    throw new Error(
      'LiveKit credentials unavailable. Set VITE_API_BASE_URL (or VITE_LIVEKIT_TOKEN_SERVER_ID) in .env.local.',
    );
  }

  async function handleStartCall() {
    if (!userName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setErrorMessage('');
    setCallState('connecting');
    setElapsed(0);
    setAudioBlocked(false);
    setAgentConnected(false);
    setAgentSpeaking(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Microphone access requires a secure context (HTTPS or localhost). ' +
          `Current origin: ${window.location.origin}`,
        );
      }

      const { url, token, room: currentRoom } = await fetchTokenCredentials(userName.trim());
      setRoomName(currentRoom);

      const room = new Room({
        audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true },
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Disconnected, () => {
        setCallState('disconnected');
        stopTimer();
        setAgentSpeaking(false);
        setAgentConnected(false);
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        setAgentConnected(true);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        if (room.remoteParticipants.size === 0) {
          setAgentConnected(false);
          setAgentSpeaking(false);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        attachRemoteAudio(track);
        setAgentConnected(true);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        detachRemoteAudio(track);
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setAudioBlocked(!room.canPlaybackAudio);
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const agentIsSpeaking = speakers.some(
          (s) => s.identity !== room.localParticipant?.identity,
        );
        setAgentSpeaking(agentIsSpeaking);
      });

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setCallState('connected');
          startTimer();
          if (room.remoteParticipants.size > 0) {
            setAgentConnected(true);
          }
        } else if (state === ConnectionState.Reconnecting) {
          setCallState('connecting');
        } else if (state === ConnectionState.Disconnected) {
          setCallState('disconnected');
          stopTimer();
        }
      });

      await room.connect(url, token);
      roomRef.current = room;

      const micTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      localTrackRef.current = micTrack;
      await room.localParticipant.publishTrack(micTrack);
      setMuted(false);
    } catch (err) {
      setCallState('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
      stopTimer();
    }
  }

  async function handleToggleMute() {
    if (!roomRef.current?.localParticipant) return;
    const next = !muted;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!next);
      setMuted(next);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleEndCall() {
    stopTimer();
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setCallState('disconnected');
    setAgentSpeaking(false);
    setAgentConnected(false);
  }

  async function handleEnableAudio() {
    if (roomRef.current) {
      await roomRef.current.startAudio();
      setAudioBlocked(!roomRef.current.canPlaybackAudio);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.page}>
      <div ref={audioContainerRef} aria-hidden="true" style={{ display: 'none' }} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <IconSparkles size={26} />
        </div>
        <div>
          <h1 className={styles.title}>AI Voice Call — Avani</h1>
          <p className={styles.subtitle}>
            Direct speech-to-speech interaction powered by Google Gemini Realtime & LiveKit
          </p>
        </div>
      </div>

      {callState === 'connected' ? (
        <div className={styles.callCard}>
          {audioBlocked && (
            <div className={styles.audioBlockedBanner}>
              <IconAlertTriangle size={18} />
              <span>Browser blocked autoplay. Click to enable incoming speech audio.</span>
              <button className={styles.enableAudioBtn} onClick={handleEnableAudio}>
                <IconVolume size={14} /> Enable Audio
              </button>
            </div>
          )}

          <div className={styles.statusBar}>
            <div className={styles.liveChip}>
              <span className={styles.liveDot} />
              LIVE
            </div>
            <div className={styles.roomLabel}>
              Room: <strong>{roomName}</strong>
            </div>
            <div className={styles.timer}>{formatTime(elapsed)}</div>
          </div>

          <div className={styles.stage}>
            <div className={styles.agentOrbWrapper}>
              {agentSpeaking && <div className={styles.pulseWave} />}
              <div
                className={`${styles.agentOrb} ${agentSpeaking ? styles.agentOrbSpeaking : ''}`}
                aria-label="Avani Voice Agent"
              >
                A
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className={styles.callStatusText}>
                {agentSpeaking
                  ? 'Avani is speaking...'
                  : agentConnected
                  ? 'Avani is listening...'
                  : 'Waiting for Avani to join...'}
              </div>
              <div className={styles.callStatusSubtext}>
                {agentConnected
                  ? 'Natural conversation with interruptibility active'
                  : 'Start your local agent worker (agent/.venv/bin/python agent/main.py dev) if waiting'}
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <button
              className={`${styles.controlBtn} ${muted ? styles.mutedBtn : ''}`}
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {muted ? <IconMicrophoneOff size={22} /> : <IconMicrophone size={22} />}
              <span>{muted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              className={styles.endCallBtn}
              onClick={handleEndCall}
              aria-label="End Call"
            >
              <IconPhoneOff size={22} />
              <span>End Call</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.agentIntro}>
            <div className={styles.agentAvatarLarge}>AV</div>
            <div className={styles.agentDetails}>
              <div className={styles.agentName}>Avani — Retail Voice Assistant</div>
              <div className={styles.agentRole}>On-Ground.ai & The Sleep Company</div>
              <div className={styles.agentCapability}>
                Speech-to-speech consultation for mattresses, orders, delivery & store guidance.
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="userName">
              Your Name <span className={styles.hint}>(used to greet you)</span>
            </label>
            <input
              id="userName"
              className={styles.input}
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Arvind, Priya"
              disabled={callState === 'connecting'}
            />
          </div>

          {errorMessage && (
            <div className={styles.errorBanner}>
              <IconAlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            className={styles.startBtn}
            onClick={handleStartCall}
            disabled={callState === 'connecting'}
          >
            <IconPhone size={20} />
            <span>{callState === 'connecting' ? 'Connecting to Avani...' : 'Start Voice Call with Avani'}</span>
          </button>

          <div className={styles.infoPanel}>
            <div className={styles.infoTitle}>
              <IconHeadset size={16} /> How it works
            </div>
            <ul className={styles.infoList}>
              <li>Connecting requests a secure token from the backend and opens a private WebRTC session.</li>
              <li>Avani runs using Google Gemini Realtime (voice: Puck) and greets you immediately.</li>
              <li>You can speak naturally and interrupt at any time without waiting for long turn transitions.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
