import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppFrame } from '../components/AppFrame';
import { useProjects } from '../hooks/useProjects';
import { saveNormalizedProject } from '../lib/community';
import { buttonStyle, cardStyle, inputStyle } from '../lib/ui';
import { useAuth } from '../state/AuthContext';
import { C } from '../styles/tokens';
import { NormalizedProject } from '../types/bookBuddy';

const fallbackGenres = [
  'Fantasy',
  'Romance',
  'Horror',
  'Mystery',
  'Thriller',
  'Science Fiction',
  'Historical Fiction',
  'Memoir',
  'Literary Fiction',
  'Contemporary',
];

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { reload } = useProjects();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [wordCountGoal, setWordCountGoal] = useState(50000);
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedTagList = useMemo(
    () =>
      tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [tags],
  );

  async function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setThumbnail('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setThumbnail(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  function toggleGenre(genre: string) {
    setGenres((current) => {
      if (current.includes(genre)) {
        return current.filter((item) => item !== genre);
      }
      if (current.length >= 2) {
        return current;
      }
      return [...current, genre];
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session?.user.id) {
      setStatus('You need to be signed in to create a project.');
      return;
    }

    if (!title.trim()) {
      setStatus('Add a project title before continuing.');
      return;
    }

    if (!genres.length) {
      setStatus('Choose at least one genre.');
      return;
    }

    setSaving(true);
    setStatus('');

    const timestamp = new Date().toISOString();
    const projectId = `project-${Date.now()}`;
    const nextProject: NormalizedProject = {
      id: projectId,
      title: title.trim(),
      subtitle: subtitle.trim(),
      authorName: authorName.trim(),
      description: '',
      genre: genres.join(' + '),
      genres,
      tags: selectedTagList,
      updatedAt: timestamp,
      raw: {},
      isPublic,
      publishedChapterIds: [],
      wordCountGoal,
      currentWordCount: 0,
      targetCompletionDate,
      thumbnail,
      plotWorkbook: {
        outline: '',
        premise: '',
        stakes: '',
        notes: '',
      },
      chapters: [],
      characters: [],
      plotSections: [],
      locations: [],
      scenes: [],
      prompts: [],
      dailyPromptHistory: [],
      dailyWordHistory: [],
      dailySessionHistory: [],
      editorPreferences: {
        useProfileDefaults: true,
        saveMode: 'autosave',
        fontFamily: 'serif',
        fontSize: 18,
        lineHeight: 1.7,
      },
      streakSettings: {
        mode: 'words',
        target: 100,
        countRevision: true,
      },
      streakState: {
        current: 0,
        best: 0,
        lastQualifiedDate: '',
      },
      lastEditedChapterId: '',
      lastSessionMeta: {},
    };

    try {
      await saveNormalizedProject(nextProject, session.user.id);
      await reload();
      navigate(`/project/${projectId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Project creation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame title="Create project" eyebrow="New story">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 20, display: 'grid', gap: 14 }}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            style={inputStyle}
          />
          <input
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Subtitle or hook"
            style={inputStyle}
          />
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Author name"
            style={inputStyle}
          />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Choose one or two genres</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {fallbackGenres.map((genre) => {
                const active = genres.includes(genre);
                const disabled = !active && genres.length >= 2;
                return (
                  <button
                    key={genre}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleGenre(genre)}
                    style={{
                      border: `1px solid ${active ? C.coral : C.border}`,
                      borderRadius: 999,
                      padding: '10px 14px',
                      background: active ? 'rgba(255,106,90,0.12)' : 'white',
                      color: active ? C.coral : C.inkSoft,
                      fontWeight: 700,
                      opacity: disabled ? 0.45 : 1,
                    }}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags, separated by commas"
            style={inputStyle}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              type="number"
              min={0}
              step={100}
              value={wordCountGoal}
              onChange={(event) => setWordCountGoal(Number(event.target.value) || 0)}
              placeholder="Word count goal"
              style={inputStyle}
            />
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(event) => setTargetCompletionDate(event.target.value)}
              style={inputStyle}
            />
          </div>
          <label
            style={{
              display: 'grid',
              gap: 10,
              padding: 14,
              borderRadius: 18,
              border: `1px dashed ${C.border}`,
              background: C.soft,
            }}
          >
            <span style={{ fontWeight: 700 }}>Cover image</span>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} />
            {thumbnail ? (
              <img
                src={thumbnail}
                alt="Project cover preview"
                style={{ width: '100%', borderRadius: 18, objectFit: 'cover', maxHeight: 180 }}
              />
            ) : null}
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              style={{
                flex: 1,
                borderRadius: 18,
                border: `1px solid ${isPublic ? C.border : C.coral}`,
                padding: '12px 14px',
                background: isPublic ? 'white' : 'rgba(255,106,90,0.12)',
                color: isPublic ? C.inkSoft : C.coral,
                fontWeight: 700,
              }}
            >
              Private
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              style={{
                flex: 1,
                borderRadius: 18,
                border: `1px solid ${isPublic ? C.coral : C.border}`,
                padding: '12px 14px',
                background: isPublic ? 'rgba(255,106,90,0.12)' : 'white',
                color: isPublic ? C.coral : C.inkSoft,
                fontWeight: 700,
              }}
            >
              Public
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Creating project...' : 'Create project'}
        </button>

        {status ? (
          <div style={{ color: C.coral, fontSize: 13 }}>{status}</div>
        ) : null}
      </form>
    </AppFrame>
  );
}
