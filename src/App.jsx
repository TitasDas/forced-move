import React, { useState } from 'react';
import AccessibilityBar from './components/AccessibilityBar.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MultiplayerLobby from './components/MultiplayerLobby.jsx';
import { GAME_VERSION } from '../engine/state.js';

export default function App() {
  const [contrast, setContrast] = useState(false);

  return (
    <div className={`app ${contrast ? 'high-contrast' : ''}`}>
      <div className="shell">
        <header className="hero panel">
          <div className="tag">
            <span aria-hidden="true">◻︎</span>
            Forced Move · v{GAME_VERSION}
          </div>
          <h1>Calm, authoritative Tic-Tac-Toe.</h1>
          <p>
            Learn React, game theory, and multiplayer sync. Play solo against scaling AI or invite a
            friend with a secure tokenized link. Minimalist math lounge vibes; built for phones
            first.
          </p>
          <div className="control-row">
            <div className="tag">Deterministic engine</div>
            <div className="tag">Server-side validation</div>
            <div className="tag">Replay friendly</div>
          </div>
        </header>

        <AccessibilityBar
          contrast={contrast}
          onToggleContrast={() => setContrast((v) => !v)}
        />

        <SinglePlayerGame />
        <MultiplayerLobby />

        <section className="panel grid two">
          <div>
            <div className="card-title">Architecture sketch</div>
            <div className="list">
              <div>Pure game engine shared by client + server with versioned state.</div>
              <div>Authoritative WebSocket server validates turns, moves, and winners.</div>
              <div>Difficulty ladder: random → heuristics → minimax (classic) → constrained heuristics.</div>
              <div>Replay support via stored history; serialization hooks ready for persistence.</div>
            </div>
          </div>
          <div>
            <div className="card-title">Next steps</div>
            <div className="list">
              <div>Add persistence for replays and reconnects (Redis/Durable store).</div>
              <div>Harden rate limiting and token TTLs; rotate tokens on reconnect.</div>
              <div>Ship a spectate-only mode that streams state without a token.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
