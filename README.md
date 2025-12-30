# Forced Move

A warm, retro take on Ultimate Tic-Tac-Toe (a “forced move” twist). You place an X or O on a mini-board, and that square tells your opponent which mini-board they must play in next. Win mini-boards to claim big-board squares; three in a row takes the match.

## A quick story

I first learned about this variant while reading Ben Orlin’s *Math with Bad Drawings*, where he mentions mathematicians in Berkeley getting hooked on an “ultimate” Tic-Tac-Toe played across nested boards. Forced Move is my homage to that tale: a calm, mobile-friendly way to play the same idea with friends or the computer.

## Play it

- Solo vs CPU: five difficulty levels, from playful to thoughtful.
- With a friend: create a game, share the invite link, and play in real time.
- Accessible controls: keyboard-friendly, high-contrast toggle, clear board labels.

[Play the game](https://example.com/demo) — (link coming soon, for now you have to run it locally :/)

## How it works

- Each big square is its own mini 3×3 board.
- Your move sends your opponent to the matching mini-board.
- If that target board is full or already won, the opponent may choose any open mini-board.
- Win a mini-board to claim its big square; three big squares in a row wins.

## Want to run it locally?

```
npm install
npm run dev   # open http://localhost:5173
```

That’s it! grab a friend or play the CPU, and enjoy the forced-move dance.

## For curious builders

Developer details live in `devnotes/README.md` (architecture, backend, multiplayer flow), and UI/UX choices plus future polish ideas live in `ui-ux-notes/README.md`.
