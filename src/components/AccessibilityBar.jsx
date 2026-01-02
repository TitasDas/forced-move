import React from 'react';
import AudioToggle from './AudioToggle.jsx';

export default function AccessibilityBar({
  contrast,
  paletteAlt = false,
  onToggleContrast,
  onTogglePalette,
  audioSrc,
}) {
  return (
    <div className="panel settings-panel" aria-label="accessibility and display controls">
      <div className="settings-head">
        <span className="pill-badge">
          <span aria-hidden="true">🎮</span> Controls
        </span>
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
          {contrast ? 'Switch to light' : 'Switch to dark'}
        </button>
        <button
          className="btn secondary"
          onClick={onTogglePalette}
          aria-pressed={paletteAlt}
          aria-label="Toggle color palette"
        >
          {paletteAlt ? 'Classic palette' : 'Alt palette'}
        </button>
        {audioSrc && <AudioToggle src={audioSrc} />}
      </div>
    </div>
  );
}
