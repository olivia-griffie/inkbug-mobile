import { Link } from 'react-router-dom';
import { AppFrame, EmptyState, ListCard, StatChip } from '../components/AppFrame';
import { useProjects } from '../hooks/useProjects';
import { summarizeWordCount } from '../lib/projectData';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';

export function HomePage() {
  const { projects, loading, error } = useProjects();
  const wordCount = projects.reduce((sum, project) => sum + summarizeWordCount(project), 0);

  return (
    <AppFrame title="Your writing desk" eyebrow="Synced projects">
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <StatChip label="Projects" value={projects.length} />
        <StatChip label="Words" value={wordCount.toLocaleString()} tone="mint" />
        <StatChip
          label="Chapters"
          value={projects.reduce((sum, item) => sum + item.chapters.length, 0)}
          tone="pink"
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            padding: 18,
            borderRadius: 24,
            background: `linear-gradient(135deg, rgba(255,106,90,0.14) 0%, rgba(255,138,61,0.08) 100%)`,
            flex: 1,
          }}
        >
          <div style={{ color: C.inkMuted, fontSize: 13, marginBottom: 8 }}>Jump back in</div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 26, marginBottom: 8 }}>
            Pick up your latest chapter from anywhere.
          </div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>
            Everything below comes straight from your cloud workspace, not a separate mobile copy.
          </div>
        </div>

        <Link
          to="/home/create"
          style={{
            alignSelf: 'stretch',
            minWidth: 112,
            display: 'grid',
            placeItems: 'center',
            padding: '18px 14px',
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            background: 'white',
            fontWeight: 700,
            color: C.ink,
            textAlign: 'center',
          }}
        >
          New
          <br />
          Project
        </Link>
      </div>

      <div
        style={{
          padding: 18,
          borderRadius: 24,
          background: 'rgba(255,255,255,0.72)',
          border: `1px solid ${C.borderSoft}`,
          marginBottom: 18,
        }}
      >
        <div style={{ color: C.inkMuted, fontSize: 13, marginBottom: 8 }}>Create and plan</div>
        <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>
          Mobile can now start a fresh Inkbug project with genres, tags, goals, cover art, and visibility baked in from the beginning.
        </div>
      </div>

      {loading ? <p>Loading projects...</p> : null}
      {error ? <p style={{ color: C.coral }}>{error}</p> : null}

      {!loading && !projects.length ? (
        <EmptyState
          title="No projects yet"
          description="Once your Inkbug projects are saved to the cloud, they'll show up here automatically."
        />
      ) : null}

      {projects.map((project) => (
        <ListCard
          key={project.id}
          href={`/project/${project.id}`}
          title={project.title}
          subtitle={`${project.genre} • ${project.chapters.length} chapters`}
          body={excerptText(project.description, 'Your synced writing workspace on the go.', 160)}
        />
      ))}

      <div style={{ padding: '8px 4px 0', color: C.inkMuted, fontSize: 13 }}>
        Looking for your social feed?{' '}
        <Link to="/community" style={{ color: C.coral }}>
          Open community
        </Link>
      </div>
    </AppFrame>
  );
}
