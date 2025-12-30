import { useEffect, useRef, useState } from 'react';

export function useWebSocketGame(gameId, token) {
  const [state, setState] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState('idle');
  const wsRef = useRef(null);

  useEffect(() => {
    if (!gameId || !token) return undefined;
    const url = new URL('/ws', window.location.origin.replace('http', 'ws'));
    url.searchParams.set('gameId', gameId);
    url.searchParams.set('token', token);
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'state') {
        if (payload.youAre) setRole(payload.youAre);
        setState(payload.state);
      }
      if (payload.type === 'error') {
        setStatus(`error: ${payload.message}`);
      }
    };

    return () => {
      ws.close();
    };
  }, [gameId, token]);

  const sendMove = (move) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'move', move }));
    }
  };

  const requestState = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'request_state' }));
    }
  };

  return { state, role, status, sendMove, requestState };
}
