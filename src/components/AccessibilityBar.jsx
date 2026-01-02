import React, { useState } from 'react';
import AudioToggle from './AudioToggle.jsx';

export default function AccessibilityBar({
  contrast,
  paletteAlt = false,
  onToggleContrast,
  onTogglePalette,
  audioSrc,
}) {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`panel settings-panel ${open ? 'open' : 'closed'}`}
      aria-label="display and sound controls"
    >
      <button
        className="settings-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Collapse settings' : 'Expand settings'}
      >
        {open ? '⬅' : '➡'}
      </button>
      <div className="settings-head">
        <div className="tag">
          <span aria-hidden="true">♿</span>
          Accessible play
        </div>
      </div>
      <div className="settings-grid">
        <button
          className="btn secondary"
          onClick={onToggleContrast}
          aria-pressed={contrast}
          aria-label="Toggle light or dark mode"
        >
          {contrast ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
        <button
          className="btn secondary"
          onClick={onTogglePalette}
          aria-pressed={paletteAlt}
          aria-label="Toggle color palette"
        >
          {paletteAlt ? '🎨 Classic palette' : '🎨 Alt palette'}
        </button>
        {audioSrc && <AudioToggle src={audioSrc} />}
      </div>
    </aside>
  );
}
