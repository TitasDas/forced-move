import React, { useState } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MultiplayerLobby from './components/MultiplayerLobby.jsx';
import { GAME_VERSION } from '../engine/state.js';
import FeedbackBox from './components/FeedbackBox.jsx';

const MODES = [
  {
    id: 'adjacent',
    label: 'Adjacent Lock',
    description: 'Pick your square and any two empty pair of blank spaces to constrain your opponent.',
  },
  {
    id: 'nested',
    label: 'Ultimate Tic-Tac-Toe',
    description: 'Each move locks the next board for your opponent.',
  },
];

function StartScreen({ mode, setMode, setScreen, onShowRules }) {
  const activeMode = MODES.find((m) => m.id === mode);
  const heroStyle = {
    backgroundImage: "url('/910.jpg'), url('/intro.jpg')",
  };
  return (
    <header className="menu-frame parchment">
      <div className="hero-visual banner tall" style={heroStyle} role="img" aria-label="Forced Move chalkboard illustration">
        <div className="hero-overlay vintage">
          <div className="tag ghost">A game of structure, not speed.</div>
          <h1>Forced Move</h1>
          <div className="tag ghost">Every move is a decision for both players.</div>
        </div>
      </div>
      <div className="hero-copy">
        <p className="subtitle vintage-sub helper">Choose how you want to play.</p>
      </div>
      <div className="action-stack wide">
        <button className="btn parchment-btn large" onClick={() => setScreen('solo')}>
          <span aria-hidden="true">👤</span> Single Player
          <span aria-hidden="true" className="chevron">›</span>
        </button>
        <button className="btn parchment-btn large" onClick={() => setScreen('multi')}>
          <span aria-hidden="true">👥</span> Two Players
          <span aria-hidden="true" className="chevron">›</span>
        </button>
        <button className="btn parchment-btn large outlined" onClick={onShowRules}>
          <span aria-hidden="true">📖</span> Rules
        </button>
      </div>
      <div className="mode-selector">
        <span className="tag selector-label">Choose a board type</span>
        <div className="mode-grid compact mode-pills">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mode small segmented ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className="mode-title">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [contrast, setContrast] = useState(false);
  const [paletteAlt, setPaletteAlt] = useState(false);
  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState('adjacent');
  const [showRules, setShowRules] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className={`app ${contrast ? 'high-contrast' : ''} ${paletteAlt ? 'palette-alt' : ''}`}>
      <AccessibilityBar
        contrast={contrast}
        paletteAlt={paletteAlt}
        onToggleContrast={() => setContrast((v) => !v)}
        onTogglePalette={() => setPaletteAlt((v) => !v)}
        audioSrc="/audio/lofi.mp3"
      />
      <div className="shell parchment-shell">
        {screen === 'menu' && (
          <StartScreen mode={mode} setMode={setMode} setScreen={setScreen} onShowRules={() => setShowRules(true)} />
        )}

        {screen === 'solo' && (
          <div className="board-stage" style={{ backgroundImage: "url('/intro.jpg')" }}>
            <SinglePlayerGame
              initialMode={mode}
              onBack={() => setScreen('menu')}
            />
          </div>
        )}
        {screen === 'multi' && (
          <div className="board-stage" style={{ backgroundImage: "url('/intro.jpg')" }}>
            <MultiplayerLobby
              initialMode={mode}
              onBack={() => setScreen('menu')}
            />
          </div>
        )}

        <footer className="footer-tag parchment-footer">
          <div className="mode-pills footer-pills">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode small segmented ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-title">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="footer-right">
            <span className="tag subtle">v{GAME_VERSION}</span>
            <button className="btn parchment-btn small" onClick={() => setShowFeedback(true)}>
              Feedback
            </button>
          </div>
        </footer>
      </div>
      {showRules && (
        <div className="modal-overlay">
          <div className="panel modal parchment">
            <div className="modal-head">
              <div className="card-title">Rules</div>
              <button className="btn secondary parchment-btn small" onClick={() => setShowRules(false)}>
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
      )}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="panel modal parchment">
            <div className="modal-head">
              <div className="card-title">Send feedback</div>
              <button className="btn secondary parchment-btn small" onClick={() => setShowFeedback(false)}>
                Close
              </button>
            </div>
            <FeedbackBox context="menu feedback" />
          </div>
        </div>
      )}
    </div>
  );
}
