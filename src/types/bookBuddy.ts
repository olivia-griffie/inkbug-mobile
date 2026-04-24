export type JsonRecord = Record<string, unknown>;

export type Profile = {
  username: string | null;
  display_name: string | null;
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
  summary?: string;
  status?: string;
};

export type Character = {
  id: string;
  name: string;
  role?: string;
  description?: string;
};

export type PlotSection = {
  id: string;
  title: string;
  summary?: string;
  status?: string;
};

export type LocationItem = {
  id: string;
  name: string;
  description?: string;
};

export type Scene = {
  id: string;
  title: string;
  summary?: string;
  chapterId?: string;
};

export type PromptItem = {
  id: string;
  title: string;
  content?: string;
  completed?: boolean;
};

export type NormalizedProject = {
  id: string;
  title: string;
  description: string;
  genre: string;
  updatedAt: string;
  raw: JsonRecord;
  chapters: Chapter[];
  characters: Character[];
  plotSections: PlotSection[];
  locations: LocationItem[];
  scenes: Scene[];
  prompts: PromptItem[];
};
