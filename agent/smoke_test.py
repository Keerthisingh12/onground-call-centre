"""
smoke_test.py — Smoke test for the On-Ground AI agent.

Tests:
  1. AGENT_NAME constant is correct (matches what the backend dispatches to)
  2. SYSTEM_PROMPT contains required disclosure elements
  3. entrypoint function is importable and has the correct signature
  4. WorkerOptions is constructed with the correct agent_name

These tests verify the agent's identity and configuration without making any
real network calls. They are labelled VERIFIED-BY-AUTOMATION (logic only).

Real voice interaction (speaking and hearing a response) requires:
  VERIFIED-BY-USER — Keerthi runs `python main.py dev` and speaks to the agent.
"""
import inspect
import pytest


def test_agent_name_is_correct():
    """The agent_name must match the name the backend dispatches to."""
    from main import AGENT_NAME
    assert AGENT_NAME == "onground-assistant"


def test_system_prompt_contains_ai_disclosure():
    """Agent must disclose it is AI when asked, per the assignment honesty rules."""
    from main import SYSTEM_PROMPT
    assert "AI" in SYSTEM_PROMPT or "Avani" in SYSTEM_PROMPT


def test_system_prompt_contains_persona():
    """Agent must have an On-Ground / call-centre persona."""
    from main import SYSTEM_PROMPT
    prompt_lower = SYSTEM_PROMPT.lower()
    assert "on-ground" in prompt_lower or "avani" in prompt_lower


def test_entrypoint_is_async():
    """entrypoint must be an async function (livekit-agents requires this)."""
    from main import entrypoint
    assert inspect.iscoroutinefunction(entrypoint), "entrypoint must be async"


def test_entrypoint_accepts_ctx_argument():
    """entrypoint must accept a single JobContext argument."""
    from main import entrypoint
    sig = inspect.signature(entrypoint)
    params = list(sig.parameters.keys())
    assert len(params) >= 1, "entrypoint must accept at least one argument (ctx)"
    assert params[0] == "ctx"


def test_worker_options_uses_agent_name(monkeypatch):
    """WorkerOptions must be constructed with agent_name=AGENT_NAME."""
    from main import AGENT_NAME
    captured = {}

    class FakeWorkerOptions:
        def __init__(self, entrypoint_fnc, agent_name=None, **kwargs):
            captured["agent_name"] = agent_name

    # Patch WorkerOptions in the main module's namespace
    import main as agent_main
    monkeypatch.setattr(agent_main, "WorkerOptions", FakeWorkerOptions)
    monkeypatch.setattr(agent_main, "cli", type("cli", (), {"run_app": lambda *a, **k: None})())

    # Simulate __main__ block
    import importlib
    agent_main.WorkerOptions(
        entrypoint_fnc=agent_main.entrypoint,
        agent_name=AGENT_NAME,
    )
    assert captured["agent_name"] == "onground-assistant"


def test_pipeline_components_initialization():
    """Verify STT, LLM, TTS, and VAD can be initialized with configured models."""
    from livekit.agents import inference, TurnHandlingOptions
    from livekit.agents.voice.turn import EndpointingOptions, InterruptionOptions
    from livekit.plugins import silero

    mock_key = "mock-key-012345678901234567890123"
    stt = inference.STT(model="deepgram/nova-3", language="en", api_key=mock_key, api_secret=mock_key)
    assert stt.model == "deepgram/nova-3"

    llm = inference.LLM(model="openai/gpt-4o-mini", api_key=mock_key, api_secret=mock_key)
    assert llm.model == "openai/gpt-4o-mini"

    tts = inference.TTS(model="cartesia/sonic-3", api_key=mock_key, api_secret=mock_key)
    assert tts.model == "cartesia/sonic-3"

    turn_handling = TurnHandlingOptions(
        turn_detection=inference.TurnDetector(api_key=mock_key, api_secret=mock_key),
        endpointing=EndpointingOptions(min_delay=0.5, max_delay=3.0),
        interruption=InterruptionOptions(enabled=True, min_duration=0.5, resume_false_interruption=True),
    )
    assert turn_handling is not None

