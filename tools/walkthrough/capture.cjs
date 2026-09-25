// Play Forced Move on the live site and capture each step with the click position.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = require('path').join(__dirname, 'caps');
const steps = [];
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
  const page = await b.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(30000);
  await page.goto('' + (process.env.WALKTHROUGH_URL || 'https://forced-move.onrender.com/') + '', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(800);
  async function shot(name, click) {
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    steps.push({ name, click: click || null });
    console.log('shot', name, click ? click.map(Math.round) : '');
  }
  async function center(locator) {
    const box = await locator.boundingBox();
    return [box.x + box.width / 2, box.y + box.height / 2];
  }
  async function clickCell(n) {
    // n is 1-based cell number; capture the state before the click completes (cursor target) and after
    const cell = page.locator(`button[aria-label^="Cell ${n} "]`).first();
    const c = await center(cell);
    await cell.click();
    return c;
  }
  await shot('01-home');
  const rules = page.getByRole('button', { name: /Rules/ }).first();
  const rc = await center(rules); await rules.click(); await page.waitForTimeout(300);
  await shot('02-rules', rc);
  await page.getByRole('button', { name: /^Close$/ }).first().click(); await page.waitForTimeout(200);
  const single = page.getByRole('button', { name: /Single Player/ });
  const sc = await center(single); await single.click(); await page.waitForTimeout(500);
  await shot('03-solo-start', sc);
  // Adjacent Lock: origin, then two adjacent cells
  let c = await clickCell(5); await page.waitForTimeout(200); await shot('04-origin', c);
  c = await clickCell(1); await page.waitForTimeout(200); await shot('05-first-allowed', c);
  c = await clickCell(2); await page.waitForTimeout(1200); await shot('06-committed-ai-replied', c);
  // second turn: the constraint the computer left us (must-play cells highlighted)
  const must = page.locator('button.cell.must-play');
  const mustCount = await must.count();
  let target = mustCount ? must.first() : page.locator('button.cell:not(.locked)').first();
  c = await center(target); await target.click(); await page.waitForTimeout(200); await shot('07-turn2-origin', c);
  // pick two allowed cells from the highlighted choices
  let choices = page.locator('button.cell.pending-choice');
  let n = await choices.count();
  if (n >= 1) { c = await center(choices.first()); await choices.first().click(); await page.waitForTimeout(150); await shot('08-turn2-first', c); }
  choices = page.locator('button.cell.pending-choice');
  n = await choices.count();
  if (n >= 1) { c = await center(choices.first()); await choices.first().click(); await page.waitForTimeout(1200); await shot('09-turn2-done', c); }
  // one more turn to show flow
  const must2 = page.locator('button.cell.must-play');
  if (await must2.count()) {
    c = await center(must2.first()); await must2.first().click(); await page.waitForTimeout(200);
    let ch = page.locator('button.cell.pending-choice');
    if (await ch.count()) { await ch.first().click(); await page.waitForTimeout(150); }
    ch = page.locator('button.cell.pending-choice');
    if (await ch.count()) { await ch.first().click(); await page.waitForTimeout(1200); }
    await shot('10-turn3', c);
  }
  // difficulty select
  const sel = page.locator('select');
  await sel.selectOption('5'); await page.waitForTimeout(200); await shot('11-difficulty', await center(sel));
  // back to menu, switch to Ultimate
  await page.getByRole('button', { name: /Back/ }).first().click(); await page.waitForTimeout(400);
  const ult = page.getByRole('button', { name: /Ultimate/ }).first();
  const uc = await center(ult); await ult.click(); await page.waitForTimeout(200); await shot('12-mode-ultimate', uc);
  await page.getByRole('button', { name: /Single Player/ }).click(); await page.waitForTimeout(500);
  await shot('13-ultimate-start');
  // nested board: click a cell in the centre mini-board
  const nestedCells = page.locator('.board-wrap.nested button:not([disabled])');
  const count = await nestedCells.count();
  const pick = nestedCells.nth(Math.min(40, count - 1));
  c = await center(pick); await pick.click(); await page.waitForTimeout(1300); await shot('14-ultimate-move', c);
  const nc2 = page.locator('.board-wrap.nested button:not([disabled])');
  if (await nc2.count()) { const p2 = nc2.nth(Math.min(2, (await nc2.count()) - 1)); c = await center(p2); await p2.click(); await page.waitForTimeout(1300); await shot('15-ultimate-move2', c); }
  const nc3 = page.locator('.board-wrap.nested button:not([disabled])');
  if (await nc3.count()) { const p3 = nc3.nth(Math.min(4, (await nc3.count()) - 1)); c = await center(p3); await p3.click(); await page.waitForTimeout(1300); await shot('16-ultimate-move3', c); }
  // two players lobby
  await page.getByRole('button', { name: /Back/ }).first().click(); await page.waitForTimeout(400);
  const two = page.getByRole('button', { name: /Two Players/ });
  const tc = await center(two); await two.click(); await page.waitForTimeout(600); await shot('17-lobby', tc);
  await page.getByRole('button', { name: /Back/ }).first().click(); await page.waitForTimeout(400);
  // dark mode
  const dark = page.getByRole('button', { name: 'Toggle light or dark mode' });
  const dc = await center(dark); await dark.click(); await page.waitForTimeout(400); await shot('18-dark', dc);
  await page.getByRole('button', { name: /Single Player/ }).click(); await page.waitForTimeout(500); await shot('19-dark-game');
  fs.writeFileSync(`${OUT}/steps.json`, JSON.stringify(steps, null, 1));
  await b.close();
})().catch((e) => { console.error('ERR', e.message.slice(0, 400)); fs.writeFileSync(`${OUT}/steps.json`, JSON.stringify(steps, null, 1)); process.exit(1); });
