import { C } from './tokens';

export function injectGlobalStyles() {
  if (document.getElementById('book-buddy-global-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'book-buddy-global-styles';
  style.textContent = `
    :root {
      color-scheme: light;
      --cream: ${C.cream};
      --ink: ${C.ink};
      --ink-soft: ${C.inkSoft};
      --ink-muted: ${C.inkMuted};
      --coral: ${C.coral};
      --orange: ${C.orange};
      --pink: ${C.pink};
      --mint: ${C.mint};
      --border: ${C.border};
      --border-soft: ${C.borderSoft};
      --card: ${C.card};
      --soft: ${C.soft};
      --shadow: 0 18px 50px rgba(255, 106, 90, 0.12);
      --radius-lg: 28px;
      --radius-md: 22px;
      --radius-sm: 16px;
    }

    * {
      box-sizing: border-box;
    }

    html, body, #root {
      margin: 0;
      min-height: 100%;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      background:
        radial-gradient(circle at top left, rgba(255, 126, 184, 0.15), transparent 30%),
        radial-gradient(circle at top right, rgba(79, 242, 201, 0.2), transparent 28%),
        linear-gradient(180deg, ${C.cream} 0%, ${C.soft} 100%);
      color: ${C.ink};
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    button, input, textarea, select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }
  `;

  document.head.appendChild(style);
}
