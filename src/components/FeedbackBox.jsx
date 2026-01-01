import React, { useState } from 'react';

const EMAIL = 'titas.das+gh@gmail.com';

export default function FeedbackBox({ context = 'app' }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const subject = encodeURIComponent(`Forced Move feedback (${context})`);
  const body = encodeURIComponent('Share your thoughts here…');
  const href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  const handleSend = (event) => {
    event.preventDefault();
    setError('');
    try {
      window.location.href = href;
    } catch (err) {
      setError('Could not open your mail app.');
    }
  };

  const handleCopy = async () => {
    setError('');
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(`Email: ${EMAIL}`);
    }
  };

  return (
    <div className="panel feedback-card">
      <div className="feedback-header">
        <div>
          <div className="pill-badge">Feedback</div>
          <div className="card-title">Send us a quick note</div>
          <div className="subtle">Opens your email app so you can message us directly.</div>
        </div>
      </div>
      <div className="feedback-actions">
        <button className="btn" onClick={handleSend}>
          Write email
        </button>
        <button className="btn secondary" onClick={handleCopy}>
          Copy email
        </button>
        {copied && <span className="pill-badge">Copied</span>}
        {error && <span className="pill-badge">{error}</span>}
      </div>
    </div>
  );
}
