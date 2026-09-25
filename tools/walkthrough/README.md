# Walkthrough video

Regenerates the 45-second walkthrough on implantintelligence.com/p/forced-move and the GIF teaser in the README. Playwright plays the live game with the system Chrome and captures each step with its click position; the composer adds a gliding cursor, captions and crossfades; ffmpeg adds the soundtrack.

```bash
pip install pillow
NODE_PATH=../../node_modules node capture.cjs          # caps/*.png and caps/steps.json
WALKTHROUGH_INTRO=../../public/intro.jpg python3 compose.py   # frames/, captions, transcript, chapters
./encode.sh "Lobby Time.mp3" 8 330                     # music, whooshes, MP4, poster, teaser.gif
```

Music is "Lobby Time" by Kevin MacLeod (CC BY 4.0), the same track the game plays; download it from incompetech.com (`mp3-royaltyfree/Lobby Time.mp3`). Fonts come from the canvas-design skill's `canvas-fonts` directory; set `WALKTHROUGH_FONTS` to another directory with Instrument Serif and Instrument Sans if needed. The storyboard is the `SCENES` list in `compose.py`.

## Narration

`narration.json` holds the spoken script, one line per scene. `narrate.py` voices it with Kokoro-82M (Apache 2.0, runs on CPU: `pip install torch --index-url https://download.pytorch.org/whl/cpu kokoro soundfile`), and `mix.py` stretches nothing itself: render with `NARRATION_LENS=<key>-lens.json` so each scene holds long enough for its line, then run `mix.py <key>` to lay the voice in, duck the music under it with a sidechain compressor, and write captions and a transcript that follow the narration. Paths in `mix.py` point at the working folder used to build the published video; adjust them to yours. The video pages label the narration as a synthetic voice.
