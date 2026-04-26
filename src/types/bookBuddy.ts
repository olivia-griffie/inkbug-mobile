export type JsonRecord = Record<string, unknown>;

export type Profile = {
  username: string | null;
  display_name: string | null;
  user_preferences?: Record<string, unknown> | null;
};

export type UserProjectRow = {
  id: string;
  user_id: string;
  data: JsonRecord | null;
  updated_at: string;
};

export type Chapter = {
  id: string;
  title: string;
  body?: string;
  content?: string;
  summary?: string;
  status?: string;
  sectionId?: string | null;
  targetWords?: number;
  currentWords?: number;
};

export type Character = {
  id: string;
  name: string;
  role?: string;
  description?: string;
  age?: string;
  physicalDescription?: string;
  backstory?: string;
  motivations?: string;
  typeTags?: string[];
  narrativeTags?: string[];
  sectionIds?: string[];
};

export type PlotSection = {
  id: string;
  title: string;
  name?: string;
  label?: string;
  summary?: string;
  description?: string;
  notes?: string;
  status?: string;
  targetWords?: number;
  type?: string;
};

export type LocationItem = {
  id: string;
  name: string;
  description?: string;
  associatedChapters?: string[];
  sectionIds?: string[];
};

export type Scene = {
  id: string;
  title: string;
  summary?: string;
  chapterId?: string;
  charactersInvolved?: string[];
  location?: string;
  status?: string;
  tags?: string[];
  sectionIds?: string[];
};

export type PromptItem = {
  id: string;
  title: string;
  content?: string;
  completed?: boolean;
  prompt?: string;
  answer?: string;
  assignedChapterId?: string;
  answerInsertedAt?: string;
  requiredWordCount?: number;
  insertedWordCount?: number;
  plotPoint?: string;
};

export type DailyWordHistoryEntry = {
  date: string;
  wordsWritten: number;
};

export type DailySessionHistoryEntry = {
  date: string;
  chapterIds?: string[];
  wordsWritten?: number;
};

export type EditorPreferences = {
  useProfileDefaults?: boolean;
  saveMode?: 'autosave' | 'manual';
  fontFamily?: 'serif' | 'sans';
  fontSize?: number;
  lineHeight?: number;
};

export type PlotWorkbook = {
  outline?: string;
  premise?: string;
  stakes?: string;
  notes?: string;
};

export type StreakSettings = {
  mode?: 'words' | 'time';
  target?: number;
  countRevision?: boolean;
};

export type StreakState = {
  current?: number;
  best?: number;
  lastQualifiedDate?: string;
};

export type NormalizedProject = {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  description: string;
  genre: string;
  genres: string[];
  tags: string[];
  updatedAt: string;
  raw: JsonRecord;
  isPublic: boolean;
  publishedChapterIds: string[];
  wordCountGoal: number;
  currentWordCount: number;
  targetCompletionDate: string;
  thumbnail: string;
  plotWorkbook: PlotWorkbook;
  chapters: Chapter[];
  characters: Character[];
  plotSections: PlotSection[];
  locations: LocationItem[];
  scenes: Scene[];
  prompts: PromptItem[];
  dailyPromptHistory: PromptItem[];
  dailyWordHistory: DailyWordHistoryEntry[];
  dailySessionHistory: DailySessionHistoryEntry[];
  editorPreferences: EditorPreferences;
  streakSettings: StreakSettings;
  streakState: StreakState;
  lastEditedChapterId: string;
  lastSessionMeta: JsonRecord;
};

export type CommunityProject = {
  id: string;
  local_id: string;
  owner_id: string;
  is_public: boolean;
  updated_at: string;
  content: JsonRecord | null;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
  } | null;
  published_chapters?: PublishedChapterRow[];
};

export type PublishedChapterRow = {
  id: string;
  project_id: string;
  chapter_id: string;
  chapter_title: string | null;
  content: string | null;
  published_at: string;
};
