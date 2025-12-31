import React, { useState } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MultiplayerLobby from './components/MultiplayerLobby.jsx';
import AudioToggle from './components/AudioToggle.jsx';
import { GAME_VERSION } from '../engine/state.js';

const FEEDBACK_MAILTO = 'mailto:titas.das+gh@gmail.com?subject=Forced%20Move%20feedback';

const MODES = [
  {
    id: 'adjacent',
    label: 'Adjacent Lock',
    description: 'Pick your square and two neighbors to constrain your opponent.',
  },
  {
    id: 'nested',
    label: 'Ultimate Tic-Tac-Toe',
    description: 'Each move locks the next board for your opponent.',
  },
];

function StartScreen({ mode, setMode, setScreen }) {
  const activeMode = MODES.find((m) => m.id === mode);
  const heroStyle = {
    backgroundImage: "url('/intro.jpg')",
  };
  return (
    <header className="hero panel intro">
      <div className="hero-visual" style={heroStyle} role="img" aria-label="Forced Move chalkboard illustration">
        <div className="hero-overlay">
          <div className="tag ghost">A game of structure, not speed.</div>
          <h1>Forced Move</h1>
          <p>Win the small boards to claim the big board.</p>
        </div>
      </div>
      <h1>Choose your board, then hit start.</h1>
      <p>
        Tic-Tac-Toe with a twist. Pick your board style, go solo against the CPU, or
        send an invite link to a friend. Built for quick play on any device.
      </p>
      <div className="grid two">
        <div className="panel start-card">
          <div className="card-title">Choose your board</div>
          <div className="mode-grid">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-title">{m.label}</span>
                <span className="mode-desc">{m.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel start-card">
          <div className="card-title">Pick how you play</div>
          <div className="control-row pill-row">
            <button className="btn" onClick={() => setScreen('solo')}>
              Start solo vs CPU
            </button>
            <button className="btn secondary" onClick={() => setScreen('multi')}>
              Start with a friend
            </button>
          </div>
          <div className="tag">Current board: {activeMode.label}</div>
          <div className="control-row">
            <a className="btn secondary" href={FEEDBACK_MAILTO}>
              Send feedback
            </a>
          </div>
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
  const [intro, setIntro] = useState(true);

  return (
    <div className={`app ${contrast ? 'high-contrast' : ''} ${paletteAlt ? 'palette-alt' : ''}`}>
      <div className="sound-corner">
        <AudioToggle src="/audio/lofi.mp3" />
        <button
          className="btn secondary palette-toggle"
          onClick={() => setPaletteAlt((v) => !v)}
          aria-label="Toggle color palette"
          title="Switch color palette"
        >
          {paletteAlt ? '🎨' : '◐'}
        </button>
      </div>
      {intro ? (
        <div
          className="intro-screen"
          role="dialog"
          aria-label="Forced Move intro"
          style={{ backgroundImage: "url('/intro.jpg')" }}
        >
          <div className="intro-overlay panel">
            <button className="btn" onClick={() => setIntro(false)}>
              Enter the game
            </button>
            <div className="tag ghost">A game where each move limits the choices that follow.</div>
          </div>
        </div>
      ) : (
        <div className="shell">
          {screen === 'menu' && <StartScreen mode={mode} setMode={setMode} setScreen={setScreen} />}

          <AccessibilityBar
            contrast={contrast}
            onToggleContrast={() => setContrast((v) => !v)}
          />

          {screen === 'menu' && (
            <div className="panel grid two">
              <div className="panel rule-card">
                <div className="card-title">Ultimate rules</div>
                <div className="list">
                  <div className="rule-line">Your move marks a cell inside a mini-board and sends your opponent to the matching mini-board.</div>
                  <div className="rule-line">If that target mini-board is full or already won, they may choose any open mini-board instead.</div>
                  <div className="rule-line">Win a mini-board to claim its big square; three claimed big squares in a row wins the game.</div>
                </div>
              </div>
              <div className="panel rule-card">
                <div className="card-title">Adjacent Lock rules</div>
                <div className="list">
                  <div className="rule-line">On your turn, place your mark and choose up to two adjacent empty squares for your opponent to play next.</div>
                  <div className="rule-line">If only one adjacent empty exists, pick that one; if none exist, they may play anywhere.</div>
                  <div className="rule-line">If one chosen square is blocked, your opponent takes the other; if both are blocked, they can play any open square.</div>
                </div>
              </div>
            </div>
          )}

          {screen === 'solo' && (
            <SinglePlayerGame
              initialMode={mode}
              onBack={() => setScreen('menu')}
            />
          )}
          {screen === 'multi' && (
            <MultiplayerLobby
              initialMode={mode}
              onBack={() => setScreen('menu')}
            />
          )}

          <footer className="footer-tag">
            <span className="tag">Forced Move · v{GAME_VERSION}</span>
          </footer>
        </div>
      )}
    </div>
  );
}
