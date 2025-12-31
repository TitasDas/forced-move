import React from 'react';

const EMAIL = 'titas.das+gh@gmail.com';

export default function FeedbackBox({ context = 'app' }) {
  const subject = encodeURIComponent(`Forced Move feedback (${context})`);
  const body = encodeURIComponent('Share your thoughts here…');
  const href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

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
        <a className="btn" href={href}>
          Write email
        </a>
      </div>
    </div>
  );
}
