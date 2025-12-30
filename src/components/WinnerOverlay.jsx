import React, { useEffect, useRef } from 'react';

export default function WinnerOverlay({ message, subText, onAction, actionLabel = 'Play again' }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  return (
    <div className="winner-overlay" role="alert">
      <audio ref={audioRef} src="/audio/cheer.mp3" preload="auto" />
      <div className="confetti">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={`flake f-${i % 6}`} />
        ))}
      </div>
      <div className="winner-card panel">
        <div className="card-title">{message}</div>
        <p>{subText}</p>
        <button className="btn secondary overlay-action" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
