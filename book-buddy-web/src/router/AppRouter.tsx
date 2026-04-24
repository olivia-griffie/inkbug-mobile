import { Navigate, Route, Routes } from 'react-router-dom'
import { AccountPage } from '../pages/AccountPage'
import { ChapterEditorPage } from '../pages/ChapterEditorPage'
import { ChaptersPage } from '../pages/ChaptersPage'
import { CharactersPage } from '../pages/CharactersPage'
import { CommunityPage } from '../pages/CommunityPage'
import { ConversationPage } from '../pages/ConversationPage'
import { HomePage } from '../pages/HomePage'
import { InboxPage } from '../pages/InboxPage'
import { LocationsPage } from '../pages/LocationsPage'
import { LoginPage } from '../pages/LoginPage'
import { PlotPage } from '../pages/PlotPage'
import { ProjectDashboardPage } from '../pages/ProjectDashboardPage'
import { PromptsPage } from '../pages/PromptsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ScenesPage } from '../pages/ScenesPage'
import { ProtectedRoute } from './ProtectedRoute'

function CreateProjectPlaceholderPage() {
  return <div style={{ padding: 16 }}>Create project placeholder</div>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/home/create" element={<CreateProjectPlaceholderPage />} />
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
        <Route path="/inbox/:conversationId" element={<ConversationPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
    </Routes>
  )
}
