# Forced Move
![Intro screen showing the “Enter the game” overlay on a chalkboard illustration](public/intro.jpg)

Forced Move is a take on Tic-Tac-Toe where the rules constrain what comes next. Each move reshapes the space of possible moves that follow, rewarding foresight over fast reactions. Inspired by mathematical game structures, strategy here comes from understanding constraints rather than racing to click.

## A quick story

I first learned about this family of games while reading Ben Orlin’s *Math with Bad Drawings*, where he mentions mathematicians in Berkeley getting hooked on an “ultimate” Tic-Tac-Toe played across nested boards. Forced Move is my homage to that tale: a calm, mobile-friendly way to play the same idea with friends or the computer. ***What's fascinating about this is how simple rules quietly force deep strategy.*** 
 

## Play it

- Solo vs CPU: five difficulty levels per mode, scaling up to hard-to-beat search/rollouts.
- With a friend: create a game, share the invite link, and play in real time.
- Accessible controls: keyboard-friendly, high-contrast toggle, clear board labels.

[Play the game](https://example.com/demo) (link coming soon, for now you have to run it locally)



## How it works


### Adjacent Lock (original remix)
- Play on the classic 3×3 board, but with constraints.
- On your turn, place your mark **and** pick up to two empty squares adjacent to that mark for your opponent’s next move (if only one adjacent empty remains, pick that one; if none are open, they can play anywhere).
- If one target is occupied, they take the other; if both are blocked, they can play anywhere.

### Ultimate
- Each big square is its own mini 3×3 board.
- Your move sends your opponent to the matching mini-board.
- If that target board is full or already won, the opponent may choose any open mini-board.
- Win a mini-board to claim its big square; three big squares in a row wins.

## Want to run it locally?

```
npm install
npm run dev   # open http://localhost:5173
npm run build # output to dist/
```

That’s it! grab a friend or play the CPU, and enjoy the forced-move dance.

### Android (WebView wrapper)
- Build the web app first: `npm run build`
- From `android/`: `./gradlew :app:assembleDebug` (or `assembleRelease`) to produce an APK that loads `dist/` locally. No proprietary SDKs; F-Droid friendly.

## For curious builders

Developer details live in `devnotes/README.md` (architecture, backend, multiplayer flow), and UI/UX choices plus future polish ideas live in `ui-ux-notes/README.md`.
