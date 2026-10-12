"""
main.py — On-Ground.ai AI Voice Agent

A real LiveKit voice agent using the livekit-agents Python SDK (>=1.0).
Uses an STT → LLM → TTS pipeline via LiveKit Inference:
  STT: deepgram/nova-3 (streaming speech recognition)
  LLM: openai/gpt-4o-mini (streaming conversational response)
  TTS: cartesia/sonic-3 (streaming ultra-low latency speech synthesis)
  VAD & Turn Detection: Silero VAD + LiveKit TurnDetector

Agent persona: On-Ground call centre assistant for retail (The Sleep Company context).
Greets on join, supports interruptions, shuts down gracefully when human leaves.

Dispatch: explicit agent_name="onground-assistant" — the backend calls
RoomConfiguration(agents=[RoomAgentDispatch(agentName='onground-assistant')]) via the token endpoint.

Environment variables:
  LIVEKIT_URL         — wss://your-project.livekit.cloud
  LIVEKIT_API_KEY     — LiveKit API key
  LIVEKIT_API_SECRET  — LiveKit API secret
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    TurnHandlingOptions,
    WorkerOptions,
    cli,
    inference,
)
from livekit.agents.voice.turn import EndpointingOptions, InterruptionOptions
from livekit.agents.voice.events import (
    AgentStateChangedEvent,
    MetricsCollectedEvent,
    UserStateChangedEvent,
)
from livekit.agents.metrics import (
    InterruptionMetrics,
    LLMMetrics,
    STTMetrics,
    TTSMetrics,
)
from livekit.plugins import silero

# ---------------------------------------------------------------------------
# Load root .env.local for local development (ignored in production)
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=ROOT_DIR / ".env.local", override=False)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger("onground-agent")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
)

# ---------------------------------------------------------------------------
# Agent identity
# ---------------------------------------------------------------------------
AGENT_NAME = "onground-assistant"

# ---------------------------------------------------------------------------
# Persona
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Avani, an AI call centre agent for On-Ground.ai, \
assisting retail customers of The Sleep Company.

Your role:
- Greet the customer warmly and introduce yourself as Avani.
- Listen carefully to their enquiry — mattresses, sleep products, orders, \
  delivery, or general support.
- Provide helpful, concise, friendly responses.
- If you don't know something, say so honestly and offer to connect them with a \
  human agent.
- Keep responses brief (1-3 sentences) for a natural phone-call feel.
- You are an AI — if asked directly, confirm this honestly.

Always begin by greeting the customer and asking how you can help them today."""


# ---------------------------------------------------------------------------
# Entrypoint — called for each dispatched job
# ---------------------------------------------------------------------------
async def entrypoint(ctx: JobContext) -> None:
    """Main agent entrypoint. Runs once per dispatched room."""
    room_name = ctx.room.name
    logger.info("[%s] Agent job started", room_name)

    # Connect to the LiveKit room (no auto-subscribe — agent controls this)
    await ctx.connect()
    logger.info("[%s] Connected to room", room_name)

    # STT -> LLM -> TTS pipeline via LiveKit Inference:
    # Authenticated via existing LIVEKIT_API_KEY / LIVEKIT_API_SECRET in root .env.local
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=inference.STT(model="deepgram/nova-3", language="en"),
        llm=inference.LLM(model="openai/gpt-4o-mini"),
        tts=inference.TTS(model="cartesia/sonic-3"),
        turn_handling=TurnHandlingOptions(
            turn_detection=inference.TurnDetector(),
            endpointing=EndpointingOptions(
                min_delay=0.5,
                max_delay=3.0,
            ),
            interruption=InterruptionOptions(
                enabled=True,
                min_duration=0.5,
                resume_false_interruption=True,
                false_interruption_timeout=2.0,
            ),
        ),
    )

    # Timing and Latency Logging: STT duration, LLM TTFT, TTS TTFB, and interruptions.
    # Never logs private conversation content, tokens, or credentials.
    @session.on("metrics_collected")
    def on_metrics_collected(ev: MetricsCollectedEvent) -> None:
        m = ev.metrics
        if isinstance(m, STTMetrics):
            logger.info(
                "[%s] [timing] STT transcribed in %.3fs (audio duration: %.3fs)",
                room_name,
                m.duration,
                m.audio_duration,
            )
        elif isinstance(m, LLMMetrics):
            logger.info(
                "[%s] [timing] LLM TTFT: %.3fs (total generation: %.3fs, speed: %.1f tokens/s)",
                room_name,
                m.ttft if m.ttft is not None else 0.0,
                m.duration,
                m.tokens_per_second if m.tokens_per_second is not None else 0.0,
            )
        elif isinstance(m, TTSMetrics):
            logger.info(
                "[%s] [timing] TTS TTFB: %.3fs (synthesis duration: %.3fs, chars: %d)",
                room_name,
                m.ttfb if m.ttfb is not None else 0.0,
                m.duration,
                m.characters_count,
            )
        elif isinstance(m, InterruptionMetrics):
            logger.info(
                "[%s] [timing] Interruption event: count=%d, detection delay: %.3fs",
                room_name,
                m.num_interruptions,
                m.detection_delay,
            )

    @session.on("user_state_changed")
    def on_user_state_changed(ev: UserStateChangedEvent) -> None:
        if ev.old_state == "speaking" and ev.new_state == "listening":
            logger.info(
                "[%s] [timing] User speech ended at timestamp %.3f",
                room_name,
                time.time(),
            )

    @session.on("agent_state_changed")
    def on_agent_state_changed(ev: AgentStateChangedEvent) -> None:
        if ev.new_state == "thinking":
            logger.info(
                "[%s] [timing] Agent thinking started at timestamp %.3f",
                room_name,
                time.time(),
            )
        elif ev.new_state == "speaking":
            logger.info(
                "[%s] [timing] Agent first audio playback frame at timestamp %.3f",
                room_name,
                time.time(),
            )

    # Create the agent with persona instructions
    agent = Agent(instructions=SYSTEM_PROMPT)

    # Start the session
    await session.start(agent=agent, room=ctx.room)
    logger.info("[%s] Agent session started with STT->LLM->TTS pipeline", room_name)

    # Greet the participant immediately on join
    await session.generate_reply(
        instructions="Greet the customer warmly as Avani from On-Ground.ai and ask how you can help them today."
    )
    logger.info("[%s] Initial greeting sent", room_name)


# ---------------------------------------------------------------------------
# Worker entry — run with: python main.py dev  (or  python main.py start)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name=AGENT_NAME,  # explicit dispatch by name from backend
        )
    )
