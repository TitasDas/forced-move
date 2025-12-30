import React, { useEffect, useRef, useState } from 'react';

export default function AudioToggle({ src = '/audio/lofi.mp3' }) {
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

  return (
    <div className="sound-toggle">
      <audio ref={audioRef} src={src} preload="none" loop />
      <button className="btn secondary" onClick={() => setEnabled((v) => !v)}>
        {enabled ? '🔊 On' : '🔇 Off'}
      </button>
    </div>
  );
}
