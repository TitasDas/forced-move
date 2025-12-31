import React, { useState } from 'react';

const EMAIL = 'titas.das+gh@gmail.com';

export default function FeedbackBox({ context = 'app' }) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [pulse, setPulse] = useState(false);

  const submit = () => {
    const trimmed = message.trim();
    const contactLine = contact.trim() ? `\n\nContact: ${contact.trim()}` : '';
    if (!trimmed) {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
      return;
    }
    const subject = encodeURIComponent(`Forced Move feedback (${context})`);
    const body = encodeURIComponent(`${trimmed}${contactLine}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`panel feedback-card ${pulse ? 'pulse' : ''}`}>
      <div className="feedback-header">
        <div>
          <div className="pill-badge">Feedback</div>
          <div className="card-title">Tell us what you think</div>
        </div>
      </div>
      <textarea
        className="feedback-input"
        placeholder="I like… I wish… I’m confused by…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <input
        className="feedback-input contact"
        placeholder="Optional contact (email or handle)"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
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
