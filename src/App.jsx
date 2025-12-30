import React, { useState } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MultiplayerLobby from './components/MultiplayerLobby.jsx';
import AudioToggle from './components/AudioToggle.jsx';
import { GAME_VERSION } from '../engine/state.js';

const MODES = [
  { id: 'classic', label: 'Classic 3x3', description: 'Fast rounds with clear wins.' },
  {
    id: 'nested',
    label: 'Ultimate Tic-Tac-Toe',
    description: 'Each move locks the next board for your opponent.',
  },
];

function StartScreen({ mode, setMode, setScreen }) {
  const activeMode = MODES.find((m) => m.id === mode);
  return (
    <header className="hero panel intro">
      <h1>Choose your board, then hit start.</h1>
      <p>
        Retro-tinted Tic-Tac-Toe with a twist. Pick your board style, go solo against the CPU, or
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
        </div>
      </div>
      <div className="grid two rule-row">
        <div className="panel rule-card">
          <div className="card-title">Ultimate rules at a glance</div>
          <div className="list">
            <div className="rule-line">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <rect x="5" y="5" width="80" height="80" fill="none" stroke="currentColor" />
                {[30, 60].map((p) => (
                  <line key={p} x1={p} y1="5" x2={p} y2="85" stroke="currentColor" />
                ))}
                {[30, 60].map((p) => (
                  <line key={p} x1="5" y1={p} x2="85" y2={p} stroke="currentColor" />
                ))}
                <rect x="8" y="8" width="24" height="24" fill="rgba(255,77,109,0.18)" stroke="var(--accent)" />
                <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--mark-x)">
                  X
                </text>
                <rect x="34" y="34" width="24" height="24" fill="rgba(47,128,237,0.15)" stroke="var(--mark-o)" />
                <text x="46" y="50" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--mark-o)">
                  O
                </text>
                <line x1="32" y1="32" x2="34" y2="34" stroke="var(--accent)" strokeWidth="3" />
                <line x1="24" y1="24" x2="34" y2="34" stroke="var(--accent)" strokeWidth="2" />
              </svg>
              <span>Your move decides which mini-board your opponent must play next.</span>
            </div>
            <div className="rule-line">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <rect x="5" y="5" width="80" height="80" fill="none" stroke="currentColor" />
                <rect x="5" y="5" width="80" height="80" fill="rgba(47,128,237,0.08)" />
                <text x="45" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink)">
                  Target full?
                </text>
                <rect x="16" y="44" width="58" height="18" rx="6" fill="#fff" stroke="var(--mark-o)" />
                <text x="45" y="57" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--mark-o)">
                  Choose any board
                </text>
              </svg>
              <span>If that target board is full or won, you can choose any open mini-board.</span>
            </div>
            <div className="rule-line">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <rect x="5" y="5" width="80" height="80" fill="none" stroke="currentColor" />
                {[30, 60].map((p) => (
                  <line key={p} x1={p} y1="5" x2={p} y2="85" stroke="currentColor" />
                ))}
                {[30, 60].map((p) => (
                  <line key={p} x1="5" y1={p} x2="85" y2={p} stroke="currentColor" />
                ))}
                <rect x="6" y="6" width="24" height="24" fill="rgba(255,77,109,0.15)" />
                <text x="18" y="24" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--mark-x)">
                  X
                </text>
                <rect x="34" y="34" width="24" height="24" fill="rgba(47,128,237,0.15)" />
                <text x="46" y="52" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--mark-o)">
                  O
                </text>
                <rect x="62" y="62" width="24" height="24" fill="rgba(255,77,109,0.15)" />
                <text x="74" y="80" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--mark-x)">
                  X
                </text>
                <line x1="10" y1="10" x2="80" y2="80" stroke="var(--mark-x)" strokeWidth="4" strokeLinecap="round" />
                <line x1="10" y1="80" x2="80" y2="10" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
              </svg>
              <span>Win a mini-board to claim that cell on the main board. Three claimed cells wins.</span>
            </div>
          </div>
        </div>
        <div className="panel rule-card">
          <div className="card-title">Quick tips</div>
          <div className="list">
            <div>Look ahead: where you play sends your opponent next.</div>
            <div>If stuck with a bad target, aim for a block and force flexibility.</div>
            <div>Claim corners and center mini-boards to set up main-board lines.</div>
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
  const [mode, setMode] = useState('nested');

  return (
    <div className={`app ${contrast ? 'high-contrast' : ''} ${paletteAlt ? 'palette-alt' : ''}`}>
      <div className="shell">
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
        {screen === 'menu' && <StartScreen mode={mode} setMode={setMode} setScreen={setScreen} />}

        <AccessibilityBar
          contrast={contrast}
          onToggleContrast={() => setContrast((v) => !v)}
        />

        {screen === 'menu' && (
          <div className="panel">
            <div className="card-title">How to play</div>
            <div className="list">
              <div>Tap a square to place your mark. Three in a row wins.</div>
              <div>Nested mode: your move decides which mini-board your opponent must play next.</div>
              <div>Shareable links let friends join instantly.</div>
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
    </div>
  );
}
