import React from 'react';

export default function AccessibilityBar({ contrast, onToggleContrast }) {
  return (
    <div className="panel control-row" aria-label="accessibility controls">
      <div className="tag">
        <span aria-hidden="true">♿</span>
        Accessible play
      </div>
      <button className="btn secondary" onClick={onToggleContrast} aria-pressed={contrast}>
        {contrast ? 'Disable high contrast' : 'Enable high contrast'}
      </button>
    </div>
  );
}
