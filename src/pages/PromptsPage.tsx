import { ChangeEvent, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { parseRichTextValue, richTextToPlainText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { PromptItem } from '../types/bookBuddy';

function wordCount(value = '') {
  return richTextToPlainText(value).split(/\s+/).filter(Boolean).length;
}

function appendAnswerToChapter(chapterContent = '', answerValue = '') {
  const parsedChapter = parseRichTextValue(chapterContent || '');
  const parsedAnswer = parseRichTextValue(answerValue || '');
  const answerText = richTextToPlainText(answerValue || '');

  if (!answerText.trim()) {
    return chapterContent;
  }

  return `<div data-editor-root="true" data-font-family="${parsedChapter.settings.fontFamily || ''}" data-font-size="${parsedChapter.settings.fontSize || ''}" data-line-height="${parsedChapter.settings.lineHeight || ''}" data-text-align="${parsedChapter.settings.textAlign || ''}">${parsedChapter.html || '<p><br></p>'}${parsedAnswer.html || ''}</div>`;
}

export function PromptsPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [savingId, setSavingId] = useState('');
  const [status, setStatus] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { answer: string; assignedChapterId: string }>>({});

  const prompts = useMemo(
    () => (project?.dailyPromptHistory?.length ? project.dailyPromptHistory : project?.prompts ?? []),
    [project],
  );

  function getDraft(prompt: PromptItem) {
    return drafts[prompt.id] || {
      answer: prompt.answer || '',
      assignedChapterId: prompt.assignedChapterId || '',
    };
  }

  function updateDraft(promptId: string, next: Partial<{ answer: string; assignedChapterId: string }>) {
    setDrafts((current) => ({
      ...current,
      [promptId]: {
        answer: current[promptId]?.answer ?? '',
        assignedChapterId: current[promptId]?.assignedChapterId ?? '',
        ...next,
      },
    }));
  }

  async function handleSave(prompt: PromptItem, insertIntoChapter: boolean) {
    if (!project || !session?.user.id) {
      return;
    }

    const draft = getDraft(prompt);
    setSavingId(prompt.id);
    setStatus('');

    try {
      let nextChapters = [...project.chapters];
      const nextPrompts = prompts.map((item) => {
        if (item.id !== prompt.id) {
          return item;
        }

        const answerWords = wordCount(draft.answer);
        return {
          ...item,
          answer: draft.answer,
          assignedChapterId: draft.assignedChapterId,
          insertedWordCount: insertIntoChapter ? answerWords : item.insertedWordCount || 0,
          answerInsertedAt: insertIntoChapter ? new Date().toISOString() : item.answerInsertedAt || '',
          completed: insertIntoChapter ? true : item.completed || false,
        };
      });

      if (insertIntoChapter && draft.assignedChapterId) {
        nextChapters = nextChapters.map((chapter) =>
          chapter.id === draft.assignedChapterId
            ? {
                ...chapter,
                body: appendAnswerToChapter(chapter.body || chapter.content || '', draft.answer),
                content: appendAnswerToChapter(chapter.body || chapter.content || '', draft.answer),
              }
            : chapter,
        );
      }

      await saveNormalizedProject(
        {
          ...project,
          prompts: nextPrompts,
          dailyPromptHistory: nextPrompts,
          chapters: nextChapters,
        },
        session.user.id,
      );
      await reload();
      setStatus(insertIntoChapter ? 'Prompt inserted into chapter.' : 'Prompt response saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save prompt response.');
    } finally {
      setSavingId('');
    }
  }

  return (
    <ProjectGate title="Daily prompts">
      <div style={{ display: 'grid', gap: 14 }}>
        {!prompts.length ? (
          <div
            style={{
              padding: 20,
              borderRadius: 18,
              border: `1px solid ${C.borderSoft}`,
              background: 'rgba(255,255,255,0.86)',
              color: C.inkMuted,
              lineHeight: 1.6,
            }}
          >
            No prompts are stored on this project yet. Desktop-generated challenge history will appear here automatically.
          </div>
        ) : null}

        {prompts.map((prompt, index) => {
          const draft = getDraft(prompt);
          const words = wordCount(draft.answer);
          const required = Number(prompt.requiredWordCount || 0);
          const promptLabel = prompt.title || prompt.plotPoint || `Prompt ${index + 1}`;
          const done = Boolean(prompt.answerInsertedAt);

          return (
            <div
              key={prompt.id}
              style={{
                padding: 18,
                borderRadius: 22,
                border: `1px solid ${C.borderSoft}`,
                background: 'rgba(255,255,255,0.95)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div>
                <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  {done ? 'Completed prompt' : 'Open prompt'}
                </div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{promptLabel}</div>
                <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>
                  {prompt.prompt || prompt.content || 'No prompt text was stored for this entry.'}
                </div>
              </div>

              <select
                value={draft.assignedChapterId}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  updateDraft(prompt.id, { assignedChapterId: event.target.value })
                }
                style={fieldStyle}
              >
                <option value="">Choose chapter</option>
                {project?.chapters.map((chapter, chapterIndex) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title || `Chapter ${chapterIndex + 1}`}
                  </option>
                ))}
              </select>

              <textarea
                value={draft.answer}
                onChange={(event) => updateDraft(prompt.id, { answer: event.target.value })}
                placeholder="Write your response here"
                style={areaStyle}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: C.inkMuted, fontSize: 13 }}>
                <span>{words.toLocaleString()} words</span>
                {required > 0 ? <span>Target {required.toLocaleString()} words</span> : null}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => void handleSave(prompt, false)}
                  disabled={savingId === prompt.id}
                  style={saveButtonStyle}
                >
                  {savingId === prompt.id ? 'Saving...' : 'Save response'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave(prompt, true)}
                  disabled={savingId === prompt.id || !draft.assignedChapterId}
                  style={ghostButtonStyle}
                >
                  Insert into chapter
                </button>
              </div>
            </div>
          );
        })}

        {status ? <div style={{ color: C.coral, fontSize: 13 }}>{status}</div> : null}
      </div>
    </ProjectGate>
  );
}

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
};

const areaStyle = {
  ...fieldStyle,
  minHeight: 150,
  resize: 'vertical' as const,
};

const saveButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 12,
  padding: 14,
  background: C.ink,
  color: 'white',
  fontWeight: 700,
};

const ghostButtonStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 14,
  background: 'white',
  color: C.ink,
  fontWeight: 700,
};
