import {
  Chapter,
  Character,
  JsonRecord,
  LocationItem,
  NormalizedProject,
  PlotSection,
  PromptItem,
  Scene,
  UserProjectRow,
} from '../types/bookBuddy';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? (value as JsonRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function pickArray(raw: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function normalizeCollection<T>(
  items: unknown[],
  mapper: (item: JsonRecord, index: number) => T,
): T[] {
  return items.map((item, index) => mapper(asRecord(item), index));
}

export function normalizeProject(row: UserProjectRow): NormalizedProject {
  const raw = asRecord(row.data);
  const chapters = normalizeCollection<Chapter>(
    pickArray(raw, ['chapters', 'chapter_list']),
    (item, index) => ({
      id: asString(item.id, `chapter-${index}`),
      title: asString(item.title, `Chapter ${index + 1}`),
      body: asString(item.body || item.content),
      summary: asString(item.summary),
      status: asString(item.status),
    }),
  );

  const characters = normalizeCollection<Character>(
    pickArray(raw, ['characters', 'characterProfiles']),
    (item, index) => ({
      id: asString(item.id, `character-${index}`),
      name: asString(item.name, `Character ${index + 1}`),
      role: asString(item.role || item.type),
      description: asString(item.description || item.notes),
    }),
  );

  const plotSections = normalizeCollection<PlotSection>(
    pickArray(raw, ['plotSections', 'plot', 'story_beats']),
    (item, index) => ({
      id: asString(item.id, `plot-${index}`),
      title: asString(item.title, `Beat ${index + 1}`),
      summary: asString(item.summary || item.description),
      status: asString(item.status),
    }),
  );

  const locations = normalizeCollection<LocationItem>(
    pickArray(raw, ['locations', 'settingLocations']),
    (item, index) => ({
      id: asString(item.id, `location-${index}`),
      name: asString(item.name, `Location ${index + 1}`),
      description: asString(item.description || item.notes),
    }),
  );

  const scenes = normalizeCollection<Scene>(
    pickArray(raw, ['scenes', 'sceneCards']),
    (item, index) => ({
      id: asString(item.id, `scene-${index}`),
      title: asString(item.title, `Scene ${index + 1}`),
      summary: asString(item.summary || item.description),
      chapterId: asString(item.chapterId || item.chapter_id),
    }),
  );

  const prompts = normalizeCollection<PromptItem>(
    pickArray(raw, ['dailyPrompts', 'prompts']),
    (item, index) => ({
      id: asString(item.id, `prompt-${index}`),
      title: asString(item.title, `Prompt ${index + 1}`),
      content: asString(item.content || item.prompt),
      completed: Boolean(item.completed || item.done),
    }),
  );

  return {
    id: row.id,
    title:
      asString(raw.title) ||
      asString(raw.projectTitle) ||
      asString(raw.name) ||
      'Untitled Project',
    description:
      asString(raw.description) ||
      asString(raw.logline) ||
      'Your synced writing workspace on the go.',
    genre: asString(raw.genre, 'Uncategorized'),
    updatedAt: row.updated_at,
    raw,
    chapters,
    characters,
    plotSections,
    locations,
    scenes,
    prompts,
  };
}

export function findChapter(project: NormalizedProject, chapterId: string) {
  return project.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function summarizeWordCount(project: NormalizedProject) {
  return project.chapters.reduce((sum, chapter) => {
    const body = chapter.body ?? '';
    return sum + body.split(/\s+/).filter(Boolean).length;
  }, 0);
}
