import React, { useState } from 'react';

const EMAIL = 'titas.das+gh@gmail.com';

export default function FeedbackBox({ context = 'app' }) {
  const [message, setMessage] = useState('');
  const [pulse, setPulse] = useState(false);

  const submit = () => {
    if (!message.trim()) {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
      return;
    }
    const subject = encodeURIComponent(`Forced Move feedback (${context})`);
    const body = encodeURIComponent(message.trim());
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`panel feedback-card ${pulse ? 'pulse' : ''}`}>
      <div className="feedback-header">
        <div>
          <div className="pill-badge">Feedback</div>
          <div className="card-title">Tell us what you think</div>
          <div className="subtle">Drops straight into the inbox; no forms to hunt for.</div>
        </div>
      </div>
      <textarea
        className="feedback-input"
        placeholder="I like… I wish… I’m confused by…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <div className="feedback-actions">
        <button className="btn" onClick={submit}>
          Send quick note
        </button>
        <div className="subtle">Adds your note into an email to {EMAIL}.</div>
      </div>
    </div>
  );
}
