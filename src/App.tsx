import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import { Settings } from './pages/Settings';
import { Kanban } from './pages/Kanban';
import { ClosedProjectView } from './pages/ClosedProjectView';
import { NavVisibilityProvider, useNavVisibility } from './features/navigation/NavVisibilityProvider';
import { NAV_ITEMS } from './layout/Sidebar';

export const DEFAULT_PAGE_KEY = 'default-page';

function RootRoute() {
  const hasChecked = sessionStorage.getItem('default-page-checked');
  if (!hasChecked) {
    sessionStorage.setItem('default-page-checked', '1');
    const pref = localStorage.getItem(DEFAULT_PAGE_KEY);
    if (pref && pref !== '/') {
      return <Navigate to={pref} replace />;
    }
  }
  return <Dashboard />;
}

function RedirectIfHidden() {
  const location = useLocation();
  const navigate = useNavigate();
  const { visibility } = useNavVisibility();

  useEffect(() => {
    const isNavPath = NAV_ITEMS.some(item => item.path === location.pathname);
    if (isNavPath && visibility[location.pathname] === false) {
      const firstVisible = NAV_ITEMS.find(item => visibility[item.path] !== false);
      navigate(firstVisible?.path ?? '/inbox', { replace: true });
    }
  }, [location.pathname, visibility, navigate]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <NavVisibilityProvider>
        <BrowserRouter>
          <RedirectIfHidden />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<RootRoute />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/anytime" element={<Anytime />} />
              <Route path="/someday" element={<Someday />} />
              <Route path="/logbook" element={<Logbook />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/briefing" element={<AIBriefing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/project/:id/closed" element={<ClosedProjectView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </NavVisibilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;
