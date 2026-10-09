import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { CallState, RecentCall } from '../types';
import { RECENT_CALLS } from '../data/callsAndEvents';

// ─── State shape ────────────────────────────────────────────────────────────
interface AppState {
  // Active call flow
  call: CallState;
  // Recent calls (mutable — updated when a call completes)
  recentCalls: RecentCall[];
  // Callback tracking: set of call IDs that have been actioned
  callbackDone: Set<string>;
  // Modal open state
  leadsModalOpen: boolean;
  leadsModalLeadId: string | null;
  // SOP review
  sopReviewOpen: boolean;
  sopReviewCallIndex: number;
  // Toast
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
}

const INITIAL_CALL: CallState = {
  active: false,
  leadName: '',
  leadId: null,
  phase: 'idle',
  elapsed: 0,
  muted: false,
  onHold: false,
  outcome: '',
  notes: '',
};

const INITIAL_STATE: AppState = {
  call: INITIAL_CALL,
  recentCalls: [...RECENT_CALLS],
  callbackDone: new Set(),
  leadsModalOpen: false,
  leadsModalLeadId: null,
  sopReviewOpen: false,
  sopReviewCallIndex: 0,
  toast: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'CALL_START'; leadName: string; leadId: string | null }
  | { type: 'CALL_PHASE'; phase: CallState['phase'] }
  | { type: 'CALL_TICK' }
  | { type: 'CALL_MUTE' }
  | { type: 'CALL_HOLD' }
  | { type: 'CALL_SET_OUTCOME'; outcome: string }
  | { type: 'CALL_SET_NOTES'; notes: string }
  | { type: 'CALL_END'; outcome: string }
  | { type: 'CALLBACK_DONE'; callId: string }
  | { type: 'OPEN_LEADS_MODAL'; leadId: string }
  | { type: 'CLOSE_LEADS_MODAL' }
  | { type: 'OPEN_SOP_REVIEW'; callIndex: number }
  | { type: 'CLOSE_SOP_REVIEW' }
  | { type: 'SHOW_TOAST'; message: string; toastType: 'success' | 'info' | 'error' }
  | { type: 'CLEAR_TOAST' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CALL_START':
      return {
        ...state,
        call: {
          ...INITIAL_CALL,
          active: true,
          leadName: action.leadName,
          leadId: action.leadId,
          phase: 'pre',
        },
      };
    case 'CALL_PHASE':
      return { ...state, call: { ...state.call, phase: action.phase } };
    case 'CALL_TICK':
      return { ...state, call: { ...state.call, elapsed: state.call.elapsed + 1 } };
    case 'CALL_MUTE':
      return { ...state, call: { ...state.call, muted: !state.call.muted } };
    case 'CALL_HOLD':
      return { ...state, call: { ...state.call, onHold: !state.call.onHold } };
    case 'CALL_SET_OUTCOME':
      return { ...state, call: { ...state.call, outcome: action.outcome } };
    case 'CALL_SET_NOTES':
      return { ...state, call: { ...state.call, notes: action.notes } };
    case 'CALL_END': {
      const { elapsed, leadName } = state.call;
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      const durationStr = `${min}m ${sec.toString().padStart(2, '0')}s`;
      const newCall: RecentCall = {
        id: `rc-new-${Date.now()}`,
        dir: 'out',
        name: leadName,
        time: 'Just now',
        duration: durationStr,
        outcome: action.outcome || undefined,
      };
      return {
        ...state,
        call: { ...INITIAL_CALL },
        recentCalls: [newCall, ...state.recentCalls],
      };
    }
    case 'CALLBACK_DONE': {
      const next = new Set(state.callbackDone);
      next.add(action.callId);
      return { ...state, callbackDone: next };
    }
    case 'OPEN_LEADS_MODAL':
      return { ...state, leadsModalOpen: true, leadsModalLeadId: action.leadId };
    case 'CLOSE_LEADS_MODAL':
      return { ...state, leadsModalOpen: false, leadsModalLeadId: null };
    case 'OPEN_SOP_REVIEW':
      return { ...state, sopReviewOpen: true, sopReviewCallIndex: action.callIndex };
    case 'CLOSE_SOP_REVIEW':
      return { ...state, sopReviewOpen: false };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startCall: (leadName: string, leadId?: string | null) => void;
  openLeadsModal: (leadId: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const startCall = useCallback((leadName: string, leadId?: string | null) => {
    dispatch({ type: 'CALL_START', leadName, leadId: leadId ?? null });
  }, []);

  const openLeadsModal = useCallback((leadId: string) => {
    dispatch({ type: 'OPEN_LEADS_MODAL', leadId });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    dispatch({ type: 'SHOW_TOAST', message, toastType: type });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, startCall, openLeadsModal, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
