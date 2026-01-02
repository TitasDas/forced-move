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
    <div className="accessibility-bar" aria-label="display and sound controls">
      {audioSrc && <AudioToggle src={audioSrc} iconOnly />}
      <button
        className="accessibility-seg"
        onClick={onToggleContrast}
        aria-pressed={contrast}
        aria-label="Toggle light or dark mode"
        title="Theme"
      >
        ☾
      </button>
      <button
        className="accessibility-seg"
        onClick={onTogglePalette}
        aria-pressed={paletteAlt}
        aria-label="Toggle color palette"
        title="Palette"
      >
        🎨
      </button>
    </div>
  );
}
