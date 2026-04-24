import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRouter } from './router/AppRouter'
import { AuthStoreProvider } from './store/useAuthStore'
import { ProjectStoreProvider } from './store/useProjectStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthStoreProvider>
      <ProjectStoreProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ProjectStoreProvider>
    </AuthStoreProvider>
  </StrictMode>,
)
