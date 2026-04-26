# Inkbug Desktop-to-Mobile Parity Audit

Compared against `C:\Users\oewhe\book-buddy-beta`.

## Implemented in mobile

- Project creation with title, subtitle, author, genres, tags, goal, target date, cover image, and public/private state
- Writable story-bible pages for:
  - plot section targets
  - characters
  - locations
  - scenes
- Prompt response workflow:
  - save prompt answers
  - assign prompt answers to chapters
  - insert saved answers into chapter content
- Expanded mobile project normalization so the mobile app preserves the desktop project shape more faithfully

## Still not at full desktop parity

- Chapter editor parity is partial:
  - mobile still lacks the full desktop rich-text editor toolbar and preference controls
  - autosave/manual save preference behavior is not yet mirrored
  - chapter context panels, section linking controls, and prompt side panels are not yet ported
- Plot workflow parity is partial:
  - mobile can now edit section targets, but the desktop `plotWorkbook` experience is still richer
  - outline, premise, stakes, and notes editing UI is not yet fully ported
- Home/dashboard parity is partial:
  - desktop has richer project-card actions including cover changes, title editing, export, backup, delete, and dashboard widgets
- Settings parity is partial:
  - desktop has global/project writing preferences, theme controls, and tablet mode
  - mobile account/settings UI has not been fully upgraded yet
- Prompt generation parity is partial:
  - desktop has fuller prompt-generation logic, context shaping, and progress tracking
  - mobile currently supports stored prompt completion, but not the full desktop prompt orchestration flow
- Community and inbox are still simplified compared with the desktop workflows

## Next priority port targets

1. Full chapter editor parity
2. Plot workbook parity
3. Settings and editor preference parity
4. Home/project management parity
5. Full prompt generation parity
