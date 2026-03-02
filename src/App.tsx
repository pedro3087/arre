import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import { Upcoming } from './pages/Upcoming';
import { Anytime } from './pages/Anytime';
import { Someday } from './pages/Someday';
import { Logbook } from './pages/Logbook';
import { ThemeProvider } from './features/theme/ThemeProvider';
import './styles/global.css';

import { AuthProvider } from './lib/auth/AuthContext';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { AIBriefing } from './pages/AIBriefing';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/anytime" element={<Anytime />} />
              <Route path="/someday" element={<Someday />} />
              <Route path="/logbook" element={<Logbook />} />
              <Route path="/briefing" element={<AIBriefing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;
