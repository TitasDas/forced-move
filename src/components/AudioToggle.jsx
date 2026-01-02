import React, { useEffect, useRef, useState } from 'react';

export default function AudioToggle({ src = '/audio/lofi.mp3', iconOnly = false }) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.35;
    if (enabled) {
      audio
        .play()
        .catch(() => {
          // Browser blocked autoplay; keep toggle off.
          setEnabled(false);
        });
    } else {
      audio.pause();
    }
  }, [enabled]);

  const label = enabled ? 'Sound on' : 'Sound off';
  const glyph = enabled ? '🔊' : '🔇';

  return (
    <div className="sound-toggle">
      <audio ref={audioRef} src={src} preload="none" loop />
      <button
        className="accessibility-seg"
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        aria-label={label}
        title={label}
      >
        {iconOnly ? glyph : `${glyph} ${enabled ? 'On' : 'Off'}`}
      </button>
    </div>
  );
}
