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

  const items = [
    {
      label: contrast ? 'Light mode' : 'Dark mode',
      icon: '🌙',
      action: onToggleContrast,
      aria: 'Toggle light or dark mode',
    },
    {
      label: paletteAlt ? 'Classic palette' : 'Alt palette',
      icon: '🎨',
      action: onTogglePalette,
      aria: 'Toggle color palette',
    },
  ];

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
        ☰
      </button>
      <div className="settings-head">
        <div className="settings-title">Quick settings</div>
        <div className="tag">
          <span aria-hidden="true">♿</span>
          Accessible play
        </div>
      </div>
      <nav className="settings-list">
        {items.map((item) => (
          <button
            key={item.label}
            className="settings-item"
            onClick={item.action}
            aria-label={item.aria}
          >
            <span className="icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="label">{item.label}</span>
          </button>
        ))}
        {audioSrc && (
          <div className="settings-item sound">
            <AudioToggle src={audioSrc} />
          </div>
        )}
      </nav>
    </aside>
  );
}
