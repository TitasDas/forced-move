import React from 'react';
import AudioToggle from './AudioToggle.jsx';

export default function AccessibilityBar({
  contrast,
  onToggleContrast,
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
    </div>
  );
}
