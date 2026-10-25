// 검수용 스크린샷. 헤드리스 크롬은 창 너비를 500px 아래로 못 줄이므로 DevTools 프로토콜로 기기 폭을 강제한다.
// 사용: node scripts/shot.mjs <url> <out.png> <width> <height> [fullPage=0|1] [waitMs=9000] [scrollY=0]
// 주의: fullPage=1 은 뷰포트 높이를 늘리므로 100vh 레이아웃이 왜곡된다. 스크롤 구간은 scrollY로 찍는다.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [url, out, w = '390', h = '844', full = '0', waitMs = '9000', scrollY = '0', settled = '0'] = process.argv.slice(2);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--window-size=1200,900', 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(path, opts) { const r = await fetch(`http://127.0.0.1:${port}${path}`, opts); return r.json(); }

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) { try { target = await json('/json/new?about:blank', { method: 'PUT' }); } catch { await sleep(150); } }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

  const evalNum = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 768 });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await sleep(+waitMs);
  // settled=1: 스크롤 연출을 완료 상태로 고정해 레이아웃을 검수한다 (헤드리스는 스크롤 타임라인을 프레임마다 갱신하지 않는다)
  if (settled === '1') await send('Runtime.evaluate', { expression: `document.head.insertAdjacentHTML('beforeend','<style>.trail .rail,.stop .lane .branch path,.stop .lane .xm,.stop .body,.hero .rise{animation:none!important;scale:none!important;stroke-dashoffset:0!important;opacity:1!important;translate:none!important}</style>')` });
  if (+scrollY > 0) { await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${+scrollY})` }); await sleep(600); await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 2); window.scrollBy(0, -2)' }); await sleep(1200); }
  let clip;
  if (full === '1') {
    const hh = await evalNum('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)');
    await send('Emulation.setDeviceMetricsOverride', { width: +w, height: hh, deviceScaleFactor: 1, mobile: +w < 768 });
    await sleep(300);
    clip = { x: 0, y: 0, width: +w, height: hh, scale: 1 };
  }
  const sw = await evalNum('document.documentElement.scrollWidth');
  const shot = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
  if (!shot.result) throw new Error('captureScreenshot: ' + JSON.stringify(shot.error));
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log(`${out} ${w}x${h} scrollWidth=${sw}`);
  ws.close();
} finally { chrome.kill(); }
