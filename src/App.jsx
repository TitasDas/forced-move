import React, { useEffect, useState } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MultiplayerLobby from './components/MultiplayerLobby.jsx';
import { GAME_VERSION } from '../engine/state.js';
import FeedbackBox from './components/FeedbackBox.jsx';
import RulesModal from './components/RulesModal.jsx';
import { loadSession } from './lib/mpSession.js';

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

function readJoinRequest() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('gameId');
  const invite = params.get('invite');
  return gameId && invite ? { gameId, invite } : null;
}

export default function App() {
  const [contrast, setContrast] = useState(false);
  const [joinRequest] = useState(readJoinRequest);
  // Land straight back in the game after an invite link or a mid-game refresh.
  const [screen, setScreen] = useState(joinRequest || loadSession() ? 'multi' : 'menu');
  const [mode, setMode] = useState('adjacent');

  useEffect(() => {
    // The invite params are consumed on load; keep the URL clean so a refresh
    // resumes via the stored session instead of re-joining.
    if (joinRequest) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [joinRequest]);
  const [showRules, setShowRules] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className={`app ${contrast ? 'high-contrast' : ''}`}>
      <AccessibilityBar
        contrast={contrast}
        onToggleContrast={() => setContrast((v) => !v)}
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
              joinRequest={joinRequest}
              onBack={() => setScreen('menu')}
            />
          </div>
        )}

        <footer className="footer-tag parchment-footer">
          <button className="btn parchment-btn small" onClick={() => setShowFeedback(true)}>
            Feedback
          </button>
          <span className="music-credit">
            Music: “Lobby Time” by{' '}
            <a href="https://incompetech.com" target="_blank" rel="noreferrer">Kevin MacLeod</a>{' '}
            (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>)
          </span>
        </footer>
      </div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
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
            <div className="credits">
              Music: <a href="https://incompetech.com" target="_blank" rel="noreferrer">"Lobby Time" by Kevin MacLeod</a>{' '}
              (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>).
              Win sound: public domain. Artwork: original to this project (CC0).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
