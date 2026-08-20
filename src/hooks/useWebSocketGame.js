import { useEffect, useRef, useState } from 'react';

export function useWebSocketGame(gameId, token) {
  const [state, setState] = useState(null);
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState(null);
  const [status, setStatus] = useState('idle');
  const [lastError, setLastError] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    if (!gameId || !token) {
      setState(null);
      setRole(null);
      setPlayers(null);
      setStatus('idle');
      return undefined;
    }
    let closedByUs = false;
    let retryTimer = null;
    let attempts = 0;

    const connect = () => {
      const url = new URL('/ws', window.location.origin.replace('http', 'ws'));
      url.searchParams.set('gameId', gameId);
      url.searchParams.set('token', token);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus(attempts === 0 ? 'connecting' : 'reconnecting');

      ws.onopen = () => {
        attempts = 0;
        setStatus('connected');
      };
      ws.onclose = (event) => {
        if (closedByUs) return;
        if (event.code === 1008) {
          // Server no longer knows this game or token; retrying won't help.
          setStatus('gone');
          return;
        }
        attempts += 1;
        setStatus('reconnecting');
        retryTimer = setTimeout(connect, Math.min(1000 * attempts, 5000));
      };
      ws.onerror = () => {};
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'state') {
          if (payload.youAre) setRole(payload.youAre);
          if (payload.players) setPlayers(payload.players);
          setState(payload.state);
          setLastError('');
        }
        if (payload.type === 'presence' && payload.players) {
          setPlayers(payload.players);
        }
        if (payload.type === 'error') {
          setLastError(payload.message);
        }
      };
    };

    connect();
    return () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [gameId, token]);

  const send = (payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const sendMove = (move) => send({ type: 'move', move });
  const sendReset = () => send({ type: 'reset' });
  const requestState = () => send({ type: 'request_state' });

  return { state, role, status, players, lastError, sendMove, sendReset, requestState };
}
