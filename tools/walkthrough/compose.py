"""Compose the Forced Move walkthrough from Playwright captures.

Scenes are sequences of (capture, click) pairs. A cursor glides to each click
point and taps; captions double as VTT cues and chapter titles.
Output: frames/NNNNN.png (25 fps, 1280x960), usage-demo.vtt, transcript, chapters.json
"""
import json, math, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import captions as CAP
from PIL import Image, ImageDraw, ImageFilter, ImageFont

CAPS = 'caps'; OUT = 'frames'
W, H, FPS = 1280, 960, 25
FONTS = os.environ.get('WALKTHROUGH_FONTS', os.path.expanduser('~/.claude/skills/canvas-design/canvas-fonts/'))
DARK = (26, 40, 34); ACCENT = (176, 74, 40); CREAM = (243, 232, 210)
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
STEPS = {s['name']: s['click'] for s in json.load(open(f'{CAPS}/steps.json'))}


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)

F_TITLE = font('InstrumentSerif-Regular.ttf', 96)
F_SUB = font('InstrumentSerif-Italic.ttf', 40)
F_BODY = font('InstrumentSans-Regular.ttf', 40)
F_CAP = font('InstrumentSans-Bold.ttf', 50)
F_SMALL = font('InstrumentSans-Regular.ttf', 22)

_bg = None
def background():
    global _bg
    if _bg is None:
        img = Image.new('RGB', (W, H)); px = img.load()
        for y in range(H):
            for x in range(W):
                t = x / W * 0.5 + y / H * 0.5
                px[x, y] = tuple(int(DARK[i] + (ACCENT[i] - DARK[i]) * t * 0.45) for i in range(3))
        _bg = img
    return _bg.copy()


def rounded(im, radius=16):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius=radius, fill=255)
    o = im.convert('RGBA'); o.putalpha(mask); return o


def with_shadow(canvas, im, pos, radius=16):
    sh = Image.new('RGBA', (im.width + 100, im.height + 100), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((50, 60, im.width + 50, im.height + 50), radius=radius, fill=(0, 0, 0, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    canvas.paste(sh, (pos[0] - 50, pos[1] - 50), sh)
    canvas.paste(im, pos, im)


def ease(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


BOX_W = 1180
SCALE = BOX_W / 1280
OFF = ((W - BOX_W) // 2, 40)


def to_canvas(pt):
    return (OFF[0] + pt[0] * SCALE, OFF[1] + pt[1] * SCALE)


def draw_cursor(canvas, pt, press=0.0):
    x, y = pt
    d = ImageDraw.Draw(canvas, 'RGBA')
    if press > 0:
        r = 14 + 34 * press
        d.ellipse((x - r, y - r, x + r, y + r), outline=(255, 214, 120, int(220 * (1 - press))), width=4)
    # arrow cursor
    pts = [(x, y), (x, y + 24), (x + 6, y + 18), (x + 11, y + 28), (x + 15, y + 26), (x + 10, y + 16), (x + 18, y + 16)]
    d.polygon(pts, fill=(255, 255, 255, 245), outline=(20, 20, 20, 255))


def app_frame(cap, caption='', cursor=None, press=0.0, zoom=1.0, focus=(0.5, 0.5)):
    shot = Image.open(f'{CAPS}/{cap}.png').convert('RGB')
    shot = shot.resize((BOX_W, int(960 * SCALE)), Image.LANCZOS)
    shot = rounded(shot, 16)
    canvas = background()
    with_shadow(canvas, shot, OFF, 16)
    if cursor is not None:
        draw_cursor(canvas, to_canvas(cursor), press)
    if zoom > 1.0:
        cw, ch = int(W / zoom), int(H / zoom)
        cx, cy = int(W * focus[0]), int(H * focus[1])
        x0 = min(max(cx - cw // 2, 0), W - cw); y0 = min(max(cy - ch // 2, 0), H - ch)
        canvas = canvas.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.LANCZOS)
    if caption:
        canvas = CAP.caption(canvas, caption, F_CAP, accent=(226, 160, 90))
    return canvas


def card(title, sub, lines=(), small=None, bg_image=None, image_has_title=False):
    canvas = background()
    if bg_image:
        im = Image.open(bg_image).convert('RGB')
        ratio = max(W / im.width, H / im.height)
        im = im.resize((int(im.width * ratio), int(im.height * ratio)), Image.LANCZOS)
        im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
        canvas = Image.blend(im, Image.new('RGB', (W, H), DARK), 0.25)
    d = ImageDraw.Draw(canvas, 'RGBA')
    if image_has_title:
        # the artwork already carries the title; the tagline goes in the caption style
        return CAP.caption(canvas, ' '.join(lines), F_CAP, accent=(226, 160, 90))
    else:
        y = H // 2 - 120 - 22 * len(lines)
        tw = d.textlength(title, font=F_TITLE); d.text(((W - tw) / 2, y), title, font=F_TITLE, fill=CREAM); y += 120
        tw = d.textlength(sub, font=F_SUB); d.text(((W - tw) / 2, y), sub, font=F_SUB, fill=(230, 210, 170)); y += 70
    for line in lines:
        tw = d.textlength(line, font=F_BODY); d.text(((W - tw) / 2, y), line, font=F_BODY, fill=CREAM); y += 44
    if small:
        tw = d.textlength(small, font=F_SMALL); d.text(((W - tw) / 2, H - 80), small, font=F_SMALL, fill=(200, 190, 170))
    return canvas


# ---- storyboard ---------------------------------------------------------------
SCENES = [
    ('card', 3.4, dict(title='Forced Move', sub='A game of structure, not speed.', lines=['Tic-tac-toe where your move limits theirs.'], bg_image=os.environ.get('WALKTHROUGH_INTRO', '/home/td/work/forced-move/public/intro.jpg'), image_has_title=True), 'Forced Move'),
    ('seq', 3.8, dict(seq=[('01-home', None)], caption='Plays in your browser. Nothing to install.', zoom=(1.0, 1.06), focus=(0.5, 0.75)), 'Pick a board'),
    ('seq', 3.6, dict(seq=[('01-home', STEPS['02-rules']), ('02-rules', None)], caption='Two rule sets. Both make you think ahead.'), 'Two rule sets'),
    ('seq', 3.0, dict(seq=[('01-home', STEPS['03-solo-start']), ('03-solo-start', None)], caption='Play the computer at five levels.'), 'Solo mode'),
    ('seq', 3.0, dict(seq=[('03-solo-start', STEPS['04-origin']), ('04-origin', None)], caption='Adjacent Lock: place your mark.'), 'Place your mark'),
    ('seq', 4.6, dict(seq=[('04-origin', STEPS['05-first-allowed']), ('05-first-allowed', STEPS['06-committed-ai-replied']), ('06-committed-ai-replied', None)], caption='Then pick the two squares your opponent must use.'), 'Choose their squares'),
    ('seq', 3.4, dict(seq=[('06-committed-ai-replied', STEPS['07-turn2-origin']), ('07-turn2-origin', None)], caption='Now the computer boxes you in.'), 'Boxed in'),
    ('seq', 4.6, dict(seq=[('07-turn2-origin', STEPS['08-turn2-first']), ('08-turn2-first', STEPS['09-turn2-done']), ('09-turn2-done', STEPS['10-turn3']), ('10-turn3', None)], caption='Each move narrows the next one.'), 'Every turn is a trade'),
    ('seq', 2.8, dict(seq=[('10-turn3', STEPS['11-difficulty']), ('11-difficulty', None)], caption='Level 5 does not forgive.', zoom=(1.0, 1.08), focus=(0.62, 0.2)), 'Five levels'),
    ('seq', 3.0, dict(seq=[('01-home', STEPS['12-mode-ultimate']), ('12-mode-ultimate', None)], caption='Ultimate: nine boards in one.', zoom=(1.0, 1.06), focus=(0.55, 0.9)), 'Ultimate'),
    ('seq', 6.2, dict(seq=[('13-ultimate-start', STEPS['14-ultimate-move']), ('14-ultimate-move', STEPS['15-ultimate-move2']), ('15-ultimate-move2', STEPS['16-ultimate-move3']), ('16-ultimate-move3', None)], caption='Where you play picks their board. Win small boards to win the big one.'), 'Nested boards'),
    ('seq', 3.6, dict(seq=[('01-home', STEPS['17-lobby']), ('17-lobby', None)], caption='Or send a friend a link and play live.'), 'Play a friend'),
    ('seq', 3.4, dict(seq=[('01-home', STEPS['18-dark']), ('18-dark', None), ('19-dark-game', None)], caption='Light or dark. Works with a keyboard and screen readers.'), 'Light or dark'),
    ('card', 4.6, dict(title='Forced Move', sub='Free. In your browser.', lines=['forced-move.onrender.com', 'implantintelligence.com/p/forced-move'], small='Open source, GPL-3.0. Music: Lobby Time by Kevin MacLeod, CC BY 4.0.'), 'Play now'),
]
XFADE = 0.6


def seq_frame(args, t, dur):
    seq = args['seq']; caption = args['caption']
    z0, z1 = args.get('zoom', (1.0, 1.0)); focus = args.get('focus', (0.5, 0.5))
    p = t / dur; zoom = z0 + (z1 - z0) * ease(p)
    # each item gets an equal slice; within a slice: move cursor (0-45%), press (45-60%), hold; next item's capture shows after the press
    n = len(seq); slice_len = dur / n
    k = min(n - 1, int(t / slice_len)); local = (t - k * slice_len) / slice_len
    cap, click = seq[k]
    prev_click = None
    for j in range(k - 1, -1, -1):
        if seq[j][1]: prev_click = seq[j][1]; break
    if click is None:
        return app_frame(cap, caption, zoom=zoom, focus=focus)
    start = prev_click or (640, 480)
    if local < 0.45:
        e = ease(local / 0.45)
        cur = (start[0] + (click[0] - start[0]) * e, start[1] + (click[1] - start[1]) * e)
        return app_frame(cap, caption, cursor=cur, zoom=zoom, focus=focus)
    if local < 0.62:
        press = (local - 0.45) / 0.17
        shown = seq[k + 1][0] if k + 1 < n and press > 0.5 else cap
        return app_frame(shown, caption, cursor=click, press=press, zoom=zoom, focus=focus)
    shown = seq[k + 1][0] if k + 1 < n else cap
    return app_frame(shown, caption, cursor=click, zoom=zoom, focus=focus)


def scene_frame(kind, args, t, dur):
    if kind == 'card':
        return card(**args)
    return seq_frame(args, t, dur)


frame_idx = 0; prev_tail = []
for si, (kind, dur, args, chapter) in enumerate(SCENES):
    n = int(round(dur * FPS)); xf = int(round(XFADE * FPS))
    frames = [scene_frame(kind, args, i / FPS, dur) for i in range(n)]
    if si > 0:
        for j in range(xf):
            Image.blend(prev_tail[j], frames[j], ease((j + 1) / xf)).save(f'{OUT}/{frame_idx:05d}.png'); frame_idx += 1
        body = frames[xf:]
    else:
        body = frames
    keep = body[:-xf] if si < len(SCENES) - 1 else body
    for fr in keep:
        fr.save(f'{OUT}/{frame_idx:05d}.png'); frame_idx += 1
    prev_tail = body[-xf:]
    print('scene', si, chapter, frame_idx)

duration = frame_idx / FPS
def ts(s): return '%02d:%02d:%06.3f' % (int(s // 3600), int(s % 3600 // 60), s % 60)
starts = []; c = 0.0
for i, (_, dur, _, _) in enumerate(SCENES):
    starts.append(c); c += dur - (XFADE if i < len(SCENES) - 1 else 0)
vtt = ['WEBVTT', '']; chapters = []; transcript = ['Forced Move: a walkthrough', 'Recorded from the live game at forced-move.onrender.com, solo mode against the computer.', '']
for i, (kind, dur, args, chapter) in enumerate(SCENES):
    s = starts[i]; e = starts[i + 1] if i + 1 < len(starts) else duration
    text = args.get('caption') or ' '.join([args.get('title', ''), args.get('sub', '')] + list(args.get('lines', ()))).strip()
    vtt += [f'{ts(s)} --> {ts(e)}', text, '']
    chapters.append({'title': chapter, 'start': round(s, 3), 'time': '%d:%02d' % (int(s // 60), int(s % 60))})
    transcript.append(text)
open('usage-demo.vtt', 'w').write('\n'.join(vtt))
open('chapters.json', 'w').write(json.dumps(chapters, indent=1))
open('usage-demo-transcript.txt', 'w').write('\n'.join(transcript) + '\n\nMusic: Lobby Time by Kevin MacLeod (incompetech.com), CC BY 4.0. Excerpt with volume adjusted, fades and transition sounds added.\n')
json.dump({'durs': [d for _, d, _, _ in SCENES], 'xfade': XFADE, 'duration': duration}, open('timing.json', 'w'))
print('frames', frame_idx, 'duration', duration)
