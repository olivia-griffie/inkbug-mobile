import { Session } from '@supabase/supabase-js';
import { CommunityProject, NormalizedProject } from '../types/bookBuddy';
import { denormalizeProject } from './projectData';
import { supabase } from './supabase';

const FAVORITES_KEY = 'book-buddy-community-favorites';

export function getFavoriteProjectIds() {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteProjectId(projectId: string) {
  const current = new Set(getFavoriteProjectIds());
  if (current.has(projectId)) {
    current.delete(projectId);
  } else {
    current.add(projectId);
  }
  const next = [...current];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return { favorited: current.has(projectId), favorites: next };
}

export async function saveNormalizedProject(project: NormalizedProject, userId: string) {
  const updatedAt = new Date().toISOString();
  const payload = denormalizeProject({
    ...project,
    updatedAt,
  });

  const { error } = await supabase.from('user_projects').upsert(
    {
      id: project.id,
      user_id: userId,
      data: payload,
      updated_at: updatedAt,
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw error;
  }

  return {
    ...project,
    raw: payload,
    updatedAt,
  };
}

async function upsertCommunityProject(localProjectId: string, userId: string, project: NormalizedProject, isPublic: boolean) {
  const content = denormalizeProject({
    ...project,
    isPublic,
  });

  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('id')
    .eq('local_id', localProjectId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const row = {
    owner_id: userId,
    local_id: localProjectId,
    content,
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('projects')
      .update(row)
      .eq('id', existing.id)
      .select('id')
      .single();
    if (error) {
      throw error;
    }
    return data.id;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...row,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function publishChapterWorkflow(project: NormalizedProject, chapterId: string, session: Session) {
  const chapter = project.chapters.find((entry) => entry.id === chapterId);
  if (!chapter) {
    throw new Error('Chapter not found.');
  }

  let nextProject = project;

  if (!nextProject.isPublic) {
    const confirmed = window.confirm(
      'This story is set to private, and you just tried to publish a chapter. Automatically make project Public?\n\n*Note, only published chapters will be visible.',
    );

    if (!confirmed) {
      throw new Error('Chapter publish canceled.');
    }

    nextProject = await saveNormalizedProject(
      {
        ...nextProject,
        isPublic: true,
      },
      session.user.id,
    );
  }

  const supabaseProjectId = await upsertCommunityProject(nextProject.id, session.user.id, nextProject, true);

  await supabase
    .from('published_chapters')
    .delete()
    .eq('project_id', supabaseProjectId)
    .eq('chapter_id', chapter.id);

  const { error } = await supabase.from('published_chapters').insert({
    project_id: supabaseProjectId,
    chapter_id: chapter.id,
    chapter_title: chapter.title || 'Untitled',
    content: chapter.body || '',
    published_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  const publishedChapterIds = [...new Set([...nextProject.publishedChapterIds, chapter.id])];

  nextProject = await saveNormalizedProject(
    {
      ...nextProject,
      isPublic: true,
      publishedChapterIds,
    },
    session.user.id,
  );

  return nextProject;
}

export async function unpublishChapterWorkflow(project: NormalizedProject, chapterId: string, session: Session) {
  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('id')
    .eq('local_id', project.id)
    .eq('owner_id', session.user.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('published_chapters')
      .delete()
      .eq('project_id', existing.id)
      .eq('chapter_id', chapterId);
    if (error) {
      throw error;
    }
  }

  const publishedChapterIds = project.publishedChapterIds.filter((id) => id !== chapterId);

  return saveNormalizedProject(
    {
      ...project,
      publishedChapterIds,
    },
    session.user.id,
  );
}

export async function syncProjectVisibility(project: NormalizedProject, session: Session, isPublic: boolean) {
  const nextProject = await saveNormalizedProject(
    {
      ...project,
      isPublic,
    },
    session.user.id,
  );

  const supabaseProjectId = await upsertCommunityProject(nextProject.id, session.user.id, nextProject, isPublic);

  if (!isPublic) {
    await supabase.from('published_chapters').delete().eq('project_id', supabaseProjectId);
    return nextProject;
  }

  await supabase.from('published_chapters').delete().eq('project_id', supabaseProjectId);

  const publishedChapters = nextProject.chapters.filter((chapter) =>
    nextProject.publishedChapterIds.includes(chapter.id),
  );

  if (publishedChapters.length) {
    const { error } = await supabase.from('published_chapters').insert(
      publishedChapters.map((chapter) => ({
        project_id: supabaseProjectId,
        chapter_id: chapter.id,
        chapter_title: chapter.title || 'Untitled',
        content: chapter.body || '',
        published_at: new Date().toISOString(),
      })),
    );
    if (error) {
      throw error;
    }
  }

  return nextProject;
}

export async function loadCommunityProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, local_id, owner_id, is_public, updated_at, content, profiles(username, display_name), published_chapters(*)')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CommunityProject[];
}
