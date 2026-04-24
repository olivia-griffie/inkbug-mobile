import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'
import {
  deleteProject as deleteProjectApi,
  getProjects,
  saveProject,
} from '../lib/api'
import type { Project } from '../lib/api'

type ProjectStoreValue = {
  projects: Project[]
  activeProject: Project | null
  loading: boolean
  loadProjects: (userId: string) => Promise<void>
  setActiveProject: (project: Project | null) => void
  saveActiveProject: (updated: Project, userId: string) => Promise<Project>
  deleteProject: (id: string, userId: string) => Promise<void>
  restoreActiveProject: () => void
}

const ACTIVE_PROJECT_KEY = 'book-buddy-active-project-id'

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null)

export function ProjectStoreProvider({ children }: PropsWithChildren) {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)

  const setActiveProject = useCallback((project: Project | null) => {
    setActiveProjectState(project)

    if (project?.id) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id)
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY)
    }
  }, [])

  const restoreActiveProject = useCallback(() => {
    const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY)

    if (!savedId) return

    setActiveProjectState((currentActive) => {
      if (currentActive?.id === savedId) return currentActive
      return projects.find((project) => project.id === savedId) ?? currentActive ?? null
    })
  }, [projects])

  const loadProjects = useCallback(async (userId: string) => {
    setLoading(true)

    try {
      const nextProjects = await getProjects(userId)
      setProjects(nextProjects)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveCurrentProject = useCallback(
    async (updated: Project, userId: string) => {
      const savedProject = await saveProject(updated, userId)

      setProjects((currentProjects) => {
        const existingIndex = currentProjects.findIndex((project) => project.id === savedProject.id)

        if (existingIndex === -1) {
          return [savedProject, ...currentProjects]
        }

        const nextProjects = [...currentProjects]
        nextProjects[existingIndex] = savedProject
        return nextProjects.sort((a, b) =>
          (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
        )
      })

      setActiveProject(savedProject)
      return savedProject
    },
    [setActiveProject]
  )

  const removeProject = useCallback(
    async (id: string, userId: string) => {
      await deleteProjectApi(id, userId)

      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id))
      setActiveProjectState((currentActive) => (currentActive?.id === id ? null : currentActive))

      if (localStorage.getItem(ACTIVE_PROJECT_KEY) === id) {
        localStorage.removeItem(ACTIVE_PROJECT_KEY)
      }
    },
    []
  )

  useEffect(() => {
    restoreActiveProject()
  }, [restoreActiveProject])

  const value = useMemo(
    () => ({
      projects,
      activeProject,
      loading,
      loadProjects,
      setActiveProject,
      saveActiveProject: saveCurrentProject,
      deleteProject: removeProject,
      restoreActiveProject,
    }),
    [
      projects,
      activeProject,
      loading,
      loadProjects,
      setActiveProject,
      saveCurrentProject,
      removeProject,
      restoreActiveProject,
    ]
  )

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectStoreContext)

  if (!context) {
    throw new Error('useProjects must be used within ProjectStoreProvider')
  }

  return context
}
