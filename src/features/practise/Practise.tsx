import { useState, useEffect } from 'react';
import {
  IconHeadphones, IconPlayerPlay, IconPlayerPause, IconRotate,
  IconCheck, IconX, IconSparkles, IconClock, IconUser,
} from '@tabler/icons-react';
import { PRACTISE_SCENARIOS } from '../../data/practise';
import styles from './Practise.module.css';

export default function Practise() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(PRACTISE_SCENARIOS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(1);
  const [completed, setCompleted] = useState(false);

  const scenario =
    PRACTISE_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? PRACTISE_SCENARIOS[0];

  // Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && !completed) {
      timer = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, completed]);

  // Auto step dialogue when playing
  useEffect(() => {
    let dialogTimer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && !completed) {
      dialogTimer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < scenario.dialogue.length) {
            return prev + 1;
          } else {
            setCompleted(true);
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => {
      if (dialogTimer) clearInterval(dialogTimer);
    };
  }, [isPlaying, completed, scenario.dialogue.length]);

  function handleStart() {
    setIsPlaying(true);
    setCompleted(false);
    if (stepIndex === scenario.dialogue.length) {
      setStepIndex(1);
      setElapsed(0);
    }
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleReset() {
    setIsPlaying(false);
    setElapsed(0);
    setStepIndex(1);
    setCompleted(false);
  }

  function handleFinish() {
    setIsPlaying(false);
    setStepIndex(scenario.dialogue.length);
    setCompleted(true);
  }

  const passedCount = scenario.feedbackItems.filter((f) => f.passed).length;
  const scorePct = Math.round((100 * passedCount) / scenario.feedbackItems.length);
  const scoreColor = scorePct >= 80 ? '#0f6e56' : scorePct >= 50 ? '#c8860a' : '#e24b4a';

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerIconWrap}>
          <IconHeadphones size={24} />
        </div>
        <div>
          <h1 className={styles.title}>Practise a Call</h1>
          <div className={styles.subtitle}>
            Interactive scripted customer roleplays with AI scorecard
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className={styles.scenarioTabs}>
        {PRACTISE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`${styles.scenarioTab} ${s.id === scenario.id ? styles.scenarioTabActive : ''}`}
            onClick={() => {
              setSelectedScenarioId(s.id);
              handleReset();
            }}
          >
            <div className={styles.tabTitle}>{s.title}</div>
            <div className={styles.tabProduct}>{s.product}</div>
          </button>
        ))}
      </div>

      {/* Scenario Overview */}
      <div className={styles.overviewCard}>
        <div className={styles.overviewHead}>
          <div className={styles.customerName}>
            <IconUser size={16} /> Customer: <strong>{scenario.customerName}</strong>
          </div>
          <div className={styles.productTag}>{scenario.product}</div>
        </div>
        <p className={styles.description}>{scenario.description}</p>
      </div>

      {/* Practice Simulator */}
      <div className={styles.simulatorCard}>
        {/* Simulator Controls Bar */}
        <div className={styles.simBar}>
          <div className={styles.timer}>
            <IconClock size={16} />
            <span>{timerStr}</span>
            <span className={styles.stepBadge}>
              Turn {Math.min(stepIndex, scenario.dialogue.length)} of {scenario.dialogue.length}
            </span>
          </div>

          <div className={styles.controls}>
            {!isPlaying && !completed && (
              <button className={styles.playBtn} onClick={handleStart}>
                <IconPlayerPlay size={16} /> Start Practice
              </button>
            )}
            {isPlaying && (
              <button className={styles.pauseBtn} onClick={handlePause}>
                <IconPlayerPause size={16} /> Pause
              </button>
            )}
            <button className={styles.resetBtn} onClick={handleReset} title="Reset">
              <IconRotate size={16} />
            </button>
            {!completed && stepIndex > 1 && (
              <button className={styles.finishBtn} onClick={handleFinish}>
                Finish & Review
              </button>
            )}
          </div>
        </div>

        {/* Dialogue Stream */}
        <div className={styles.dialogueBox}>
          {scenario.dialogue.slice(0, stepIndex).map((turn, idx) => (
            <div
              key={idx}
              className={`${styles.bubbleRow} ${turn.speaker === 'agent' ? styles.bubbleAgentRow : styles.bubbleCustomerRow}`}
            >
              <div
                className={`${styles.bubble} ${turn.speaker === 'agent' ? styles.bubbleAgent : styles.bubbleCustomer}`}
              >
                <div className={styles.speakerTag}>
                  {turn.speaker === 'agent' ? 'You (Agent)' : scenario.customerName}
                </div>
                <div className={styles.bubbleText}>{turn.text}</div>
              </div>
            </div>
          ))}

          {isPlaying && stepIndex < scenario.dialogue.length && (
            <div className={styles.typingIndicator}>
              <span>{stepIndex % 2 === 0 ? 'Agent replying...' : 'Customer speaking...'}</span>
            </div>
          )}
        </div>

        {/* Step Forward manually */}
        {!completed && isPlaying && (
          <div className={styles.manualAdvance}>
            <button
              className={styles.nextTurnBtn}
              onClick={() => setStepIndex((prev) => Math.min(scenario.dialogue.length, prev + 1))}
            >
              Next Dialogue Turn →
            </button>
          </div>
        )}
      </div>

      {/* AI Scorecard & Feedback (Visible once completed or reviewed) */}
      {completed && (
        <div className={styles.scorecardCard}>
          <div className={styles.scorecardHead}>
            <div className={styles.scorecardTitle}>
              <IconSparkles size={20} className={styles.sparkleIcon} />
              <span>AI Performance Scorecard</span>
            </div>
            <div className={styles.scoreNumber} style={{ color: scoreColor }}>
              {scorePct}%
            </div>
          </div>

          <div className={styles.scoreBarTrack}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${scorePct}%`, background: scoreColor }}
            />
          </div>

          <div className={styles.feedbackList}>
            {scenario.feedbackItems.map((item, idx) => (
              <div key={idx} className={styles.feedbackItem}>
                <div className={styles.feedbackTop}>
                  <div className={styles.feedbackStatus}>
                    {item.passed ? (
                      <span className={styles.passIcon}>
                        <IconCheck size={14} />
                      </span>
                    ) : (
                      <span className={styles.failIcon}>
                        <IconX size={14} />
                      </span>
                    )}
                    <span className={styles.feedbackLabel}>{item.label}</span>
                  </div>
                  <span
                    className={item.passed ? styles.badgePassed : styles.badgeFailed}
                  >
                    {item.passed ? 'Adhered' : 'Needs Practice'}
                  </span>
                </div>
                <div className={styles.feedbackNote}>{item.note}</div>
              </div>
            ))}
          </div>

          <div className={styles.scorecardFooter}>
            <button className={styles.retryBtn} onClick={handleReset}>
              <IconRotate size={16} /> Practise Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
