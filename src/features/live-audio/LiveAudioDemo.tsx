/**
 * LiveAudioDemo – genuine human-to-human browser audio call via LiveKit Cloud.
 *
 * Uses the LiveKit development token server (enabled in project Settings).
 * VITE_LIVEKIT_TOKEN_SERVER_ID is read from .env.local – never committed.
 *
 * Two participants open this page in separate browser tabs / windows,
 * type the SAME room name, choose their own display names, press "Join".
 * They can hear each other in real-time and mute / hang up independently.
 *
 * Audio fix summary (why audio wasn't working before):
 *  1. RoomEvent.TrackSubscribed now calls track.attach() on every incoming
 *     remote audio track and appends the <audio> element to the DOM.
 *  2. RoomEvent.TrackUnsubscribed / TrackUnpublished call track.detach().
 *  3. RoomEvent.AudioPlaybackStatusChanged surfaces an "Enable Audio" button
 *     that calls room.startAudio() when the browser blocks autoplay.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  createLocalAudioTrack,
  TokenSource,
  Track,
  type LocalAudioTrack,
  type RemoteTrack,
  ParticipantEvent,
} from 'livekit-client';
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconPhone,
  IconUser,
  IconWifi,
  IconWifiOff,
  IconRadio,
  IconAlertTriangle,
  IconCopy,
  IconCheck,
  IconVolume,
} from '@tabler/icons-react';
import styles from './LiveAudioDemo.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CallState = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface ParticipantInfo {
  identity: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

// ---------------------------------------------------------------------------
// Helper – read env variable
// ---------------------------------------------------------------------------
const TOKEN_SERVER_ID = import.meta.env.VITE_LIVEKIT_TOKEN_SERVER_ID as string;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LiveAudioDemo() {
  // --- Form state ----------------------------------------------------------
  const [roomName, setRoomName] = useState('onground-demo-room');
  const [participantName, setParticipantName] = useState('');

  // --- Call state ----------------------------------------------------------
  const [callState, setCallState] = useState<CallState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [muted, setMuted] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<ParticipantInfo[]>([]);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  // audioBlocked = true when the browser's autoplay policy blocks playback.
  // The user must interact (click "Enable Audio") to unblock it.
  const [audioBlocked, setAudioBlocked] = useState(false);

  // --- Refs ----------------------------------------------------------------
  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalAudioTrack | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Container div where <audio> elements are appended (hidden, off-screen)
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // Snapshot of remote participants → state
  // ---------------------------------------------------------------------------
  const syncParticipants = useCallback((room: Room) => {
    const remotes: ParticipantInfo[] = [];
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      remotes.push({
        identity: p.identity,
        isMuted: p.isMicrophoneEnabled === false,
        isSpeaking: p.isSpeaking,
      });
    });
    setRemoteParticipants(remotes);
  }, []);

  // ---------------------------------------------------------------------------
  // Attach a remote audio track to an <audio> element in the DOM.
  // LiveKit's RemoteAudioTrack.attach() creates the HTMLAudioElement and sets
  // its srcObject automatically. We append it to our hidden container so the
  // browser can actually render (play) the audio stream.
  // ---------------------------------------------------------------------------
  const attachRemoteAudio = useCallback((track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    const el = track.attach() as HTMLAudioElement;
    el.autoplay = true;
    // Suppress visual space; audio elements are invisible but must be in DOM
    el.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(el);
    }
    void el.play?.()?.catch(() => {
      // Autoplay was blocked — surfaced via AudioPlaybackStatusChanged
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Detach a remote audio track and remove its element from the DOM.
  // ---------------------------------------------------------------------------
  const detachRemoteAudio = useCallback((track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Audio) return;
    const elements = track.detach();
    elements.forEach((el) => el.parentNode?.removeChild(el));
  }, []);

  // ---------------------------------------------------------------------------
  // Join room
  // ---------------------------------------------------------------------------
  async function handleJoin() {
    if (!participantName.trim()) {
      setErrorMessage('Please enter your display name.');
      return;
    }
    if (!roomName.trim()) {
      setErrorMessage('Please enter a room name.');
      return;
    }
    if (!TOKEN_SERVER_ID) {
      setErrorMessage(
        'VITE_LIVEKIT_TOKEN_SERVER_ID is not set. Add it to .env.local and restart the dev server.',
      );
      return;
    }

    setErrorMessage('');
    setCallState('connecting');
    setElapsed(0);
    setAudioBlocked(false);

    try {
      // 1. Guard: navigator.mediaDevices is only available in secure contexts
      //    (HTTPS or localhost). On plain HTTP from a LAN IP it is undefined.
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Microphone access requires a secure context. ' +
          'Open this page via https:// or use localhost. ' +
          `Current origin: ${window.location.origin}`,
        );
      }

      // 2. Fetch connection credentials from the development token server
      const tokenSource = TokenSource.developmentTokenServer(TOKEN_SERVER_ID);
      const { serverUrl, participantToken } = await tokenSource.fetch({
        roomName: roomName.trim(),
        participantIdentity: participantName.trim(),
        participantName: participantName.trim(),
      });

      // 3. Create and connect Room
      const room = new Room({
        audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true },
        adaptiveStream: true,
        dynacast: true,
      });

      // -----------------------------------------------------------------------
      // Wire events BEFORE connecting
      // -----------------------------------------------------------------------

      room.on(RoomEvent.Disconnected, () => {
        setCallState('disconnected');
        stopTimer();
        setRemoteParticipants([]);
        setAudioBlocked(false);
      });

      // ---- Remote participant presence ----
      room.on(RoomEvent.ParticipantConnected, () => syncParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, () => syncParticipants(room));
      room.on(RoomEvent.TrackMuted, () => syncParticipants(room));
      room.on(RoomEvent.TrackUnmuted, () => syncParticipants(room));

      // ---- THE CRITICAL FIX: attach remote audio when a track is subscribed ----
      // Without this, the remote microphone track is received by the SFU but
      // never rendered to an audio element, so the user hears nothing.
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack) => {
          attachRemoteAudio(track);
          syncParticipants(room);
        },
      );

      // Clean up audio elements when the remote track goes away
      room.on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack) => {
          detachRemoteAudio(track);
          syncParticipants(room);
        },
      );

      room.on(RoomEvent.TrackUnpublished, () => syncParticipants(room));

      // ---- Autoplay / audio playback status ----
      // Browsers (especially Chrome) block audio autoplay until the user
      // interacts. When blocked, canPlaybackAudio is false and we show a
      // prominent "Enable Audio" button that calls room.startAudio().
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setAudioBlocked(!room.canPlaybackAudio);
      });

      // ---- Speaking indicators ----
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const localIsSpeaking = speakers.some(
          (s) => s.identity === room.localParticipant?.identity,
        );
        setLocalSpeaking(localIsSpeaking);
        syncParticipants(room);
      });

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setCallState('connected');
          startTimer();
          syncParticipants(room);
        } else if (state === ConnectionState.Reconnecting) {
          setCallState('connecting');
        } else if (state === ConnectionState.Disconnected) {
          setCallState('disconnected');
          stopTimer();
        }
      });

      await room.connect(serverUrl, participantToken);
      roomRef.current = room;

      // 4. Publish microphone track
      const audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      await room.localParticipant.publishTrack(audioTrack);
      localTrackRef.current = audioTrack;

      // Subscribe to local participant speaking events
      (room.localParticipant as LocalParticipant).on(
        ParticipantEvent.IsSpeakingChanged,
        (speaking: boolean) => setLocalSpeaking(speaking),
      );

      // Check audio playback status right after connecting in case the browser
      // already blocked it before the first AudioPlaybackStatusChanged fires.
      setAudioBlocked(!room.canPlaybackAudio);

      setCallState('connected');
      startTimer();
      syncParticipants(room);

      // Attach audio for any remote tracks that were already in the room
      // before we connected (e.g. participant joined before us).
      room.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((pub) => {
          if (pub.track && pub.track.kind === Track.Kind.Audio) {
            attachRemoteAudio(pub.track as RemoteTrack);
          }
        });
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('secure context')) {
        setErrorMessage(
          '\uD83D\uDD12 Microphone access is blocked on plain HTTP from a network IP. ' +
          'To test from another device: (a) use localhost on the host machine, ' +
          'or (b) serve over HTTPS. See README for details.',
        );
      } else if (message.includes('Permission denied') || message.includes('NotAllowedError') || message.includes('NotAllowed')) {
        setErrorMessage(
          'Microphone permission denied. Click the lock/camera icon in your browser address bar and allow microphone, then try again.',
        );
      } else {
        setErrorMessage(`Failed to join: ${message}`);
      }
      setCallState('error');
    }
  }

  // ---------------------------------------------------------------------------
  // Unblock audio (called when user clicks "Enable Audio" after autoplay block)
  // ---------------------------------------------------------------------------
  async function handleEnableAudio() {
    if (roomRef.current) {
      await roomRef.current.startAudio();
      setAudioBlocked(!roomRef.current.canPlaybackAudio);
    }
  }

  // ---------------------------------------------------------------------------
  // Mute / unmute
  // ---------------------------------------------------------------------------
  async function handleToggleMute() {
    if (!roomRef.current) return;
    const local = roomRef.current.localParticipant;
    const newMuted = !muted;
    await local.setMicrophoneEnabled(!newMuted);
    setMuted(newMuted);
  }

  // ---------------------------------------------------------------------------
  // Hang up
  // ---------------------------------------------------------------------------
  async function handleHangUp() {
    if (roomRef.current) {
      await roomRef.current.disconnect();
    }
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
    // Remove all lingering <audio> elements
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = '';
    }
    roomRef.current = null;
    setCallState('disconnected');
    stopTimer();
    setRemoteParticipants([]);
    setMuted(false);
    setAudioBlocked(false);
  }

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------
  function startTimer() {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleHangUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Format time
  // ---------------------------------------------------------------------------
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  // ---------------------------------------------------------------------------
  // Copy shareable room link
  // ---------------------------------------------------------------------------
  function handleCopyLink() {
    const url = `${window.location.origin}${window.location.pathname}#/live-audio`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      {/* Hidden container for <audio> elements – must be in DOM for playback */}
      <div
        ref={audioContainerRef}
        id="lad-audio-container"
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />

      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <IconRadio size={22} />
        </div>
        <div>
          <h1 className={styles.title}>Live Audio Demo</h1>
          <p className={styles.subtitle}>
            Genuine human‑to‑human browser call · powered by LiveKit WebRTC
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* IDLE / ERROR / DISCONNECTED → show join form                        */}
      {/* ------------------------------------------------------------------ */}
      {(callState === 'idle' || callState === 'error' || callState === 'disconnected') && (
        <div className={styles.card}>
          {callState === 'disconnected' && (
            <div className={styles.infoRow}>
              <IconWifiOff size={16} />
              <span>You have left the room. Join again when ready.</span>
            </div>
          )}

          {/* ── Reviewer instruction panel ── */}
          <div className={styles.reviewPanel} id="lad-reviewer-panel">
            <p className={styles.reviewPanelTitle}>
              <IconRadio size={15} aria-hidden="true" />
              Try the live audio call
            </p>
            <ol className={styles.reviewPanelList}>
              <li>Open this Live Audio Demo page in <strong>two separate browser tabs</strong>, or on two different devices.</li>
              <li>Enter the <strong>same room name</strong> in both tabs.</li>
              <li>Enter a <strong>different display name</strong> in each tab (e.g. &quot;Alice&quot; and &quot;Bob&quot;).</li>
              <li>Click <strong>Join Room</strong> in both tabs and allow microphone access when prompted.</li>
              <li>Speak in one tab / device and confirm the other participant can hear you.</li>
              <li>If a yellow <strong>Enable Audio</strong> banner appears, click it once to unblock browser autoplay.</li>
            </ol>
            <p className={styles.reviewPanelNote}>
              🎧 Headphones recommended to avoid audio feedback between tabs on the same machine.
              No installation required — the call runs entirely in the browser via LiveKit WebRTC.
            </p>
            <div className={styles.reviewPanelActions}>
              <button className={styles.copyBtn} onClick={handleCopyLink} title="Copy link to share">
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                {copied ? 'Copied!' : 'Copy page link to share'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lad-room" className={styles.label}>
              Room Name <span className={styles.hint}>(same name for all participants)</span>
            </label>
            <input
              id="lad-room"
              className={styles.input}
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. onground-demo-room"
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lad-name" className={styles.label}>
              Your Display Name <span className={styles.hint}>(unique per participant)</span>
            </label>
            <input
              id="lad-name"
              className={styles.input}
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="e.g. Alice"
              autoComplete="off"
            />
          </div>

          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              <IconAlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            id="lad-join-btn"
            className={styles.joinBtn}
            onClick={handleJoin}
          >
            <IconPhone size={18} />
            Join Room
          </button>

          <p className={styles.disclaimer}>
            🔒 This uses LiveKit&apos;s development token server. No API secret is exposed to the browser.
            Switch to a backend token endpoint before production.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONNECTING                                                           */}
      {/* ------------------------------------------------------------------ */}
      {callState === 'connecting' && (
        <div className={styles.card}>
          <div className={styles.connectingState}>
            <div className={styles.spinner} aria-label="Connecting…" />
            <div className={styles.connectingText}>
              Connecting to <strong>{roomName}</strong>…
            </div>
            <div className={styles.connectingSubtext}>
              Requesting microphone permission and joining the room
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONNECTED                                                            */}
      {/* ------------------------------------------------------------------ */}
      {callState === 'connected' && (
        <div className={styles.callCard}>
          {/* Autoplay blocked banner – must be clicked to unblock audio */}
          {audioBlocked && (
            <div className={styles.audioBlockedBanner} role="alert">
              <IconVolume size={16} />
              <span>Browser blocked audio autoplay.</span>
              <button
                id="lad-enable-audio-btn"
                className={styles.enableAudioBtn}
                onClick={handleEnableAudio}
              >
                Enable Audio
              </button>
            </div>
          )}

          {/* Status bar */}
          <div className={styles.statusBar}>
            <span className={styles.liveChip}>
              <span className={styles.liveDot} />
              LIVE
            </span>
            <span className={styles.roomLabel}>Room: <strong>{roomName}</strong></span>
            <span className={styles.timer}>
              <IconWifi size={13} />
              {mins}:{secs}
            </span>
          </div>

          {/* Participants grid */}
          <div className={styles.participantsGrid}>
            {/* Local participant */}
            <div className={`${styles.participantTile} ${localSpeaking ? styles.speaking : ''}`}>
              <div className={styles.avatarRing}>
                <div className={styles.avatar}>
                  <IconUser size={22} />
                </div>
              </div>
              <div className={styles.participantName}>{participantName}</div>
              <div className={styles.participantBadge}>You</div>
              <div className={styles.micStatus}>
                {muted
                  ? <><IconMicrophoneOff size={13} /> Muted</>
                  : <><IconMicrophone size={13} /> {localSpeaking ? 'Speaking…' : 'Listening'}</>}
              </div>
            </div>

            {/* Remote participants */}
            {remoteParticipants.length === 0 && (
              <div className={styles.waitingTile}>
                <div className={styles.waitingPulse} />
                <div className={styles.waitingText}>
                  Waiting for others to join…<br />
                  <span className={styles.waitingHint}>Share the room name: <strong>{roomName}</strong></span>
                </div>
              </div>
            )}

            {remoteParticipants.map((p) => (
              <div
                key={p.identity}
                className={`${styles.participantTile} ${p.isSpeaking ? styles.speaking : ''}`}
              >
                <div className={styles.avatarRing}>
                  <div className={styles.avatar}>
                    <IconUser size={22} />
                  </div>
                </div>
                <div className={styles.participantName}>{p.identity}</div>
                <div className={styles.participantBadge}>Remote</div>
                <div className={styles.micStatus}>
                  {p.isMuted
                    ? <><IconMicrophoneOff size={13} /> Muted</>
                    : <><IconMicrophone size={13} /> {p.isSpeaking ? 'Speaking…' : 'Listening'}</>}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              id="lad-mute-btn"
              className={`${styles.controlBtn} ${muted ? styles.mutedBtn : ''}`}
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
              <span>{muted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              id="lad-hangup-btn"
              className={styles.hangupBtn}
              onClick={handleHangUp}
              aria-label="Leave room"
              title="Leave room"
            >
              <IconPhoneOff size={20} />
              <span>Leave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
