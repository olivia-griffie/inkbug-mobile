import {
  Chapter,
  Character,
  DailySessionHistoryEntry,
  DailyWordHistoryEntry,
  EditorPreferences,
  JsonRecord,
  LocationItem,
  NormalizedProject,
  PlotWorkbook,
  PlotSection,
  PromptItem,
  Scene,
  StreakSettings,
  StreakState,
  UserProjectRow,
} from '../types/bookBuddy';
import { richTextToPlainText } from './richText';

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? (value as JsonRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
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
      content: asString(item.content || item.body),
      summary: asString(item.summary),
      status: asString(item.status),
      sectionId: asString(item.sectionId || item.section_id) || null,
      targetWords: asNumber(item.targetWords || item.target_words),
      currentWords: asNumber(item.currentWords || item.current_words),
    }),
  );

  const characters = normalizeCollection<Character>(
    pickArray(raw, ['characters', 'characterProfiles']),
    (item, index) => ({
      id: asString(item.id, `character-${index}`),
      name: asString(item.name, `Character ${index + 1}`),
      role: asString(item.role || item.type),
      description: asString(item.description || item.notes),
      age: asString(item.age),
      physicalDescription: asString(item.physicalDescription || item.physical_description),
      backstory: asString(item.backstory),
      motivations: asString(item.motivations),
      typeTags: asStringArray(item.typeTags || item.type_tags),
      narrativeTags: asStringArray(item.narrativeTags || item.narrative_tags),
      sectionIds: asStringArray(item.sectionIds || item.section_ids || item.sectionId),
    }),
  );

  const plotSections = normalizeCollection<PlotSection>(
    pickArray(raw, ['plotSections', 'plot', 'story_beats']),
    (item, index) => ({
      id: asString(item.id, `plot-${index}`),
      title: asString(item.title || item.label, `Section Target ${index + 1}`),
      name: asString(item.name || item.title || item.label, `Section Target ${index + 1}`),
      label: asString(item.label || item.title, `Section Target ${index + 1}`),
      summary: asString(item.summary || item.description || item.notes),
      description: asString(item.description || item.summary),
      notes: asString(item.notes),
      status: asString(item.status),
      targetWords: asNumber(item.targetWords || item.target_words),
      type: asString(item.type, 'Section'),
    }),
  );

  const locations = normalizeCollection<LocationItem>(
    pickArray(raw, ['locations', 'settingLocations']),
    (item, index) => ({
      id: asString(item.id, `location-${index}`),
      name: asString(item.name, `Location ${index + 1}`),
      description: asString(item.description || item.notes),
      associatedChapters: asStringArray(item.associatedChapters || item.associated_chapters),
      sectionIds: asStringArray(item.sectionIds || item.section_ids || item.sectionId),
    }),
  );

  const scenes = normalizeCollection<Scene>(
    pickArray(raw, ['scenes', 'sceneCards']),
    (item, index) => ({
      id: asString(item.id, `scene-${index}`),
      title: asString(item.title, `Scene ${index + 1}`),
      summary: asString(item.summary || item.description),
      chapterId: asString(item.chapterId || item.chapter_id),
      charactersInvolved: asStringArray(item.charactersInvolved || item.characters_involved),
      location: asString(item.location),
      status: asString(item.status),
      tags: asStringArray(item.tags),
      sectionIds: asStringArray(item.sectionIds || item.section_ids || item.sectionId),
    }),
  );

  const prompts = normalizeCollection<PromptItem>(
    pickArray(raw, ['dailyPrompts', 'prompts']),
    (item, index) => ({
      id: asString(item.id, `prompt-${index}`),
      title: asString(item.title, `Prompt ${index + 1}`),
      content: asString(item.content || item.prompt),
      completed: Boolean(item.completed || item.done),
      prompt: asString(item.prompt || item.content),
      answer: asString(item.answer),
      assignedChapterId: asString(item.assignedChapterId || item.assigned_chapter_id),
      answerInsertedAt: asString(item.answerInsertedAt || item.answer_inserted_at),
      requiredWordCount: asNumber(item.requiredWordCount || item.required_word_count),
      insertedWordCount: asNumber(item.insertedWordCount || item.inserted_word_count),
      plotPoint: asString(item.plotPoint || item.plot_point),
    }),
  );

  const dailyPromptHistory = normalizeCollection<PromptItem>(
    pickArray(raw, ['dailyPromptHistory']),
    (item, index) => ({
      id: asString(item.id, `daily-prompt-${index}`),
      title: asString(item.title || item.plotPoint || `Prompt ${index + 1}`),
      content: asString(item.content || item.prompt),
      completed: Boolean(item.completed || item.done),
      prompt: asString(item.prompt || item.content),
      answer: asString(item.answer),
      assignedChapterId: asString(item.assignedChapterId || item.assigned_chapter_id),
      answerInsertedAt: asString(item.answerInsertedAt || item.answer_inserted_at),
      requiredWordCount: asNumber(item.requiredWordCount || item.required_word_count),
      insertedWordCount: asNumber(item.insertedWordCount || item.inserted_word_count),
      plotPoint: asString(item.plotPoint || item.plot_point),
    }),
  );

  const dailyWordHistory = normalizeCollection<DailyWordHistoryEntry>(
    pickArray(raw, ['dailyWordHistory']),
    (item) => ({
      date: asString(item.date),
      wordsWritten: asNumber(item.wordsWritten || item.words_written),
    }),
  );

  const dailySessionHistory = normalizeCollection<DailySessionHistoryEntry>(
    pickArray(raw, ['dailySessionHistory']),
    (item) => ({
      date: asString(item.date),
      chapterIds: asStringArray(item.chapterIds || item.chapter_ids),
      wordsWritten: asNumber(item.wordsWritten || item.words_written),
    }),
  );

  const plotWorkbook: PlotWorkbook = asRecord(raw.plotWorkbook);
  const editorPreferences: EditorPreferences = asRecord(raw.editorPreferences);
  const streakSettings: StreakSettings = asRecord(raw.streakSettings);
  const streakState: StreakState = asRecord(raw.streakState);
  const genres = asStringArray(raw.genres);
  const tags = asStringArray(raw.tags);
  const genre = asString(raw.genre, genres.join(' + ') || 'Uncategorized');

  return {
    id: row.id,
    title:
      asString(raw.title) ||
      asString(raw.projectTitle) ||
      asString(raw.name) ||
      'Untitled Project',
    subtitle: asString(raw.subtitle),
    authorName: asString(raw.authorName || raw.author_name),
    description:
      asString(raw.description) ||
      asString(raw.logline) ||
      'Your synced writing workspace on the go.',
    genre,
    genres,
    tags,
    updatedAt: row.updated_at,
    raw,
    isPublic: Boolean(raw.isPublic),
    publishedChapterIds: asStringArray(raw.publishedChapterIds),
    wordCountGoal: asNumber(raw.wordCountGoal || raw.word_count_goal),
    currentWordCount: asNumber(raw.currentWordCount || raw.current_word_count || summarizeChapters(chapters)),
    targetCompletionDate: asString(raw.targetCompletionDate || raw.target_completion_date),
    thumbnail: asString(raw.thumbnail),
    plotWorkbook,
    chapters,
    characters,
    plotSections,
    locations,
    scenes,
    prompts,
    dailyPromptHistory,
    dailyWordHistory,
    dailySessionHistory,
    editorPreferences,
    streakSettings,
    streakState,
    lastEditedChapterId: asString(raw.lastEditedChapterId || raw.last_edited_chapter_id),
    lastSessionMeta: asRecord(raw.lastSessionMeta),
  };
}

export function denormalizeProject(project: NormalizedProject): JsonRecord {
  return {
    ...project.raw,
    title: project.title,
    subtitle: project.subtitle,
    authorName: project.authorName,
    description: project.description,
    genre: project.genre,
    genres: project.genres,
    tags: project.tags,
    isPublic: project.isPublic,
    publishedChapterIds: project.publishedChapterIds,
    wordCountGoal: project.wordCountGoal,
    currentWordCount: project.currentWordCount || summarizeChapters(project.chapters),
    targetCompletionDate: project.targetCompletionDate,
    thumbnail: project.thumbnail,
    plotWorkbook: project.plotWorkbook,
    dailyWordHistory: project.dailyWordHistory,
    dailySessionHistory: project.dailySessionHistory,
    editorPreferences: project.editorPreferences,
    streakSettings: project.streakSettings,
    streakState: project.streakState,
    lastEditedChapterId: project.lastEditedChapterId,
    lastSessionMeta: project.lastSessionMeta,
    chapters: project.chapters.map((chapter) => ({
      ...asRecord(
        pickArray(project.raw, ['chapters', 'chapter_list']).find((item) => asRecord(item).id === chapter.id),
      ),
      id: chapter.id,
      title: chapter.title,
      content: chapter.body || chapter.content || '',
      body: chapter.body || chapter.content || '',
      summary: chapter.summary || '',
      status: chapter.status || '',
      sectionId: chapter.sectionId || '',
      section_id: chapter.sectionId || '',
      targetWords: chapter.targetWords || 0,
      currentWords: chapter.currentWords || 0,
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
      age: character.age || '',
      physicalDescription: character.physicalDescription || '',
      physical_description: character.physicalDescription || '',
      backstory: character.backstory || '',
      motivations: character.motivations || '',
      typeTags: character.typeTags || [],
      narrativeTags: character.narrativeTags || [],
      sectionIds: character.sectionIds || [],
    })),
    plotSections: project.plotSections.map((section) => ({
      ...asRecord(
        pickArray(project.raw, ['plotSections', 'plot', 'story_beats']).find(
          (item) => asRecord(item).id === section.id,
        ),
      ),
      id: section.id,
      title: section.title || section.name || section.label || '',
      name: section.name || section.title || '',
      label: section.label || section.title || '',
      summary: section.summary || '',
      description: section.description || section.summary || '',
      notes: section.notes || '',
      status: section.status || '',
      targetWords: section.targetWords || 0,
      type: section.type || 'Section',
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
      associatedChapters: location.associatedChapters || [],
      sectionIds: location.sectionIds || [],
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
      charactersInvolved: scene.charactersInvolved || [],
      location: scene.location || '',
      status: scene.status || '',
      tags: scene.tags || [],
      sectionIds: scene.sectionIds || [],
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
    dailyPromptHistory: project.dailyPromptHistory.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content || '',
      prompt: prompt.prompt || prompt.content || '',
      completed: prompt.completed || false,
      answer: prompt.answer || '',
      assignedChapterId: prompt.assignedChapterId || '',
      answerInsertedAt: prompt.answerInsertedAt || '',
      requiredWordCount: prompt.requiredWordCount || 0,
      insertedWordCount: prompt.insertedWordCount || 0,
      plotPoint: prompt.plotPoint || '',
    })),
  };
}

export function findChapter(project: NormalizedProject, chapterId: string) {
  return project.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

export function summarizeWordCount(project: NormalizedProject) {
  return summarizeChapters(project.chapters);
}

function summarizeChapters(chapters: Chapter[]) {
  return chapters.reduce(
    (sum, chapter) =>
      sum + richTextToPlainText(chapter.body || chapter.content || '').split(/\s+/).filter(Boolean).length,
    0,
  );
}
