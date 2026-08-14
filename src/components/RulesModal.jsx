import React from 'react';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="panel modal parchment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="card-title">Rules</div>
          <button className="btn secondary parchment-btn small" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid two rule-row">
          <div className="panel rule-card">
            <div className="card-title">Adjacent Lock</div>
            <ol className="list numbered">
              <li>Place your mark, then choose any two empty spaces that touch horizontally or vertically for your opponent.</li>
              <li>Keep doing this until no adjacent empty pairs remain.</li>
              <li>When no adjacent pairs are left, you instead pick a single empty space after placing your mark.</li>
              <li>Play continues until someone wins or the board has no empty spaces.</li>
            </ol>
          </div>
          <div className="panel rule-card">
            <div className="card-title">Ultimate</div>
            <ol className="list numbered">
              <li>Your move marks a cell inside a mini-board and sends your opponent to the matching mini-board.</li>
              <li>If that target mini-board is full or already won, they may choose any open mini-board instead.</li>
              <li>Win a mini-board to claim its big square; three claimed big squares in a row wins the game.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
