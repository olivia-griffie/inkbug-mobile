import { supabase } from './supabase'

export type Project = {
  id: string
  title?: string
  chapters?: Chapter[]
  characters?: Character[]
  plotSections?: PlotSection[]
  locations?: LocationItem[]
  scenes?: Scene[]
  dailyPromptHistory?: DailyPromptHistoryEntry[]
  wordCountGoal?: number
  currentWordCount?: number
  updatedAt?: string
  [key: string]: unknown
}

export type Chapter = {
  id: string
  title?: string
  content?: string
  wordCount?: number
  section?: string
  [key: string]: unknown
}

export type Character = {
  id: string
  name?: string
  role?: string
  age?: string
  physicalDescription?: string
  backstory?: string
  motivations?: string
  [key: string]: unknown
}

export type PlotSection = {
  id: string
  name?: string
  type?: string
  summary?: string
  targetWords?: number
  status?: string
  [key: string]: unknown
}

export type LocationItem = {
  id: string
  name?: string
  description?: string
  associatedChapters?: string[]
  [key: string]: unknown
}

export type Scene = {
  id: string
  title?: string
  summary?: string
  charactersInvolved?: string[]
  location?: string
  status?: string
  [key: string]: unknown
}

export type DailyPromptHistoryEntry = {
  date: string
  prompt: string
  answer: string
  wordCount: number
  answeredAt: string
  [key: string]: unknown
}

export type Profile = {
  id: string
  username?: string | null
  display_name?: string | null
  streak_count?: number | null
  tier?: string | null
  [key: string]: unknown
}

type UserProjectRow = {
  id: string
  data: Omit<Project, 'id' | 'updatedAt'> | null
  updated_at: string
}

function ensureProjectShape(row: UserProjectRow): Project {
  return {
    ...(row.data ?? {}),
    id: row.id,
    updatedAt: row.updated_at,
  }
}

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('user_projects')
    .select('id, data, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ensureProjectShape(row as UserProjectRow))
}

export async function saveProject(project: Project, userId: string): Promise<Project> {
  const now = new Date().toISOString()
  const payload = {
    ...project,
    updatedAt: now,
  }

  const { error } = await supabase
    .from('user_projects')
    .upsert(
      {
        id: project.id,
        user_id: userId,
        data: payload,
        updated_at: now,
      },
      { onConflict: 'id' }
    )

  if (error) throw error

  return payload
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return data as Profile | null
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error

  return data as Profile
}
