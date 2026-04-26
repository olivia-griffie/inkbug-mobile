import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { useAuth } from './state/AuthContext';
import { AccountPage } from './pages/AccountPage';
import { ChapterEditorPage } from './pages/ChapterEditorPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { CharactersPage } from './pages/CharactersPage';
import { CommunityPage } from './pages/CommunityPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { HomePage } from './pages/HomePage';
import { InboxPage } from './pages/InboxPage';
import { LocationsPage } from './pages/LocationsPage';
import { LoginPage } from './pages/LoginPage';
import { PlotPage } from './pages/PlotPage';
import { ProjectDashboardPage } from './pages/ProjectDashboardPage';
import { PromptsPage } from './pages/PromptsPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScenesPage } from './pages/ScenesPage';

function RootRedirect() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading Inkbug Beta...</div>;
  }

  return <Navigate to={session ? '/home' : '/login'} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/home/create" element={<CreateProjectPage />} />
        <Route path="/project/:id" element={<ProjectDashboardPage />} />
        <Route path="/project/:id/chapters" element={<ChaptersPage />} />
        <Route path="/project/:id/chapters/:cid" element={<ChapterEditorPage />} />
        <Route path="/project/:id/characters" element={<CharactersPage />} />
        <Route path="/project/:id/plot" element={<PlotPage />} />
        <Route path="/project/:id/locations" element={<LocationsPage />} />
        <Route path="/project/:id/scenes" element={<ScenesPage />} />
        <Route path="/project/:id/prompts" element={<PromptsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
