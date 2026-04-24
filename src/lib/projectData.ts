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
import { richTextToPlainText } from './richText';

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? (value as JsonRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
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
      title: asString(item.title || item.label, `Section Target ${index + 1}`),
      summary: asString(item.summary || item.description || item.notes),
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
    isPublic: Boolean(raw.isPublic),
    publishedChapterIds: asStringArray(raw.publishedChapterIds),
    chapters,
    characters,
    plotSections,
    locations,
    scenes,
    prompts,
  };
}

export function denormalizeProject(project: NormalizedProject): JsonRecord {
  return {
    ...project.raw,
    title: project.title,
    description: project.description,
    genre: project.genre,
    isPublic: project.isPublic,
    publishedChapterIds: project.publishedChapterIds,
    chapters: project.chapters.map((chapter) => ({
      ...asRecord(
        pickArray(project.raw, ['chapters', 'chapter_list']).find((item) => asRecord(item).id === chapter.id),
      ),
      id: chapter.id,
      title: chapter.title,
      content: chapter.body || '',
      body: chapter.body || '',
      summary: chapter.summary || '',
      status: chapter.status || '',
    })),
    characters: project.characters.map((character) => ({
      ...asRecord(
        pickArray(project.raw, ['characters', 'characterProfiles']).find(
          (item) => asRecord(item).id === character.id,
        ),
      ),
      id: character.id,
      name: character.name,
      role: character.role || '',
      description: character.description || '',
    })),
    plotSections: project.plotSections.map((section) => ({
      ...asRecord(
        pickArray(project.raw, ['plotSections', 'plot', 'story_beats']).find(
          (item) => asRecord(item).id === section.id,
        ),
      ),
      id: section.id,
      title: section.title,
      label: section.title,
      summary: section.summary || '',
      description: section.summary || '',
      status: section.status || '',
    })),
    locations: project.locations.map((location) => ({
      ...asRecord(
        pickArray(project.raw, ['locations', 'settingLocations']).find(
          (item) => asRecord(item).id === location.id,
        ),
      ),
      id: location.id,
      name: location.name,
      description: location.description || '',
    })),
    scenes: project.scenes.map((scene) => ({
      ...asRecord(
        pickArray(project.raw, ['scenes', 'sceneCards']).find((item) => asRecord(item).id === scene.id),
      ),
      id: scene.id,
      title: scene.title,
      summary: scene.summary || '',
      chapterId: scene.chapterId || '',
      chapter_id: scene.chapterId || '',
    })),
    prompts: project.prompts.map((prompt) => ({
      ...asRecord(
        pickArray(project.raw, ['dailyPrompts', 'prompts']).find((item) => asRecord(item).id === prompt.id),
      ),
      id: prompt.id,
      title: prompt.title,
      content: prompt.content || '',
      prompt: prompt.content || '',
      completed: prompt.completed || false,
    })),
  };
}

export function findChapter(project: NormalizedProject, chapterId: string) {
  return project.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function summarizeWordCount(project: NormalizedProject) {
  return project.chapters.reduce((sum, chapter) => sum + richTextToPlainText(chapter.body || '').split(/\s+/).filter(Boolean).length, 0);
}
