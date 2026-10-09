import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './app/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import LeadsModal from './components/leads/LeadsModal';
import ActiveCallModal from './components/calls/ActiveCallModal';
import Dashboard from './features/dashboard/Dashboard';
import Plan from './features/plan/Plan';
import Calendar from './features/calendar/Calendar';
import Pulse from './features/pulse/Pulse';
import PulseChannel from './features/pulse/PulseChannel';
import Practise from './features/practise/Practise';
import './styles/global.css';

function MainLayout() {
  const { state, dispatch } = useApp();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <main className="page-content" id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/plan/calls" element={<Plan />} />
            <Route path="/plan/incoming" element={<Plan />} />
            <Route path="/plan/recent" element={<Plan />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/pulse" element={<Pulse />} />
            <Route path="/pulse/:channelId" element={<PulseChannel />} />
            <Route path="/practise" element={<Practise />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />

      {/* Global Leads Modal */}
      {state.leadsModalOpen && state.leadsModalLeadId && (
        <LeadsModal
          leadId={state.leadsModalLeadId}
          onClose={() => dispatch({ type: 'CLOSE_LEADS_MODAL' })}
        />
      )}

      {/* Simulated Call Modal */}
      <ActiveCallModal />

      {/* Global Toast */}
      {state.toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: state.toast.type === 'error' ? '#ef4444' : '#0f6e56',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            animation: 'slideUp 0.2s ease',
          }}
          role="status"
          aria-live="polite"
        >
          {state.toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
