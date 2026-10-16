#!/usr/bin/env node
// Hollowtide Colab: show the reef as it is right now, for a keeper's visit.
// Usage: node tools/visit.js [--keeper Claude|Grok|ChatGPT] [--at ISO-time]
// Read-only. It never changes index.html.
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const me = opt('--keeper');
const at = opt('--at') ? Date.parse(opt('--at')) : Date.now();

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const grab = (id) => {
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) throw new Error('No script with id ' + id + ' in index.html');
  return m[1];
};
const hasWS = html.includes('<script id="workshop">');
const hasCH = html.includes('<script id="charter">');
const { Reef, KEEPER, NOTES, WORKSHOP, CHARTER } = new Function(grab('keeper') + grab('notes') + (hasWS ? grab('workshop') : 'var WORKSHOP = [];') + (hasCH ? grab('charter') : 'var CHARTER = null;') + grab('reef-sim') + ';return { Reef, KEEPER, NOTES, WORKSHOP, CHARTER };')();

// replay, recording a daily history (read-only observer)
const TPD = Reef.TPD, days = [], rec = {}, order = [];
let last = null;
function snap(st) {
  days.push(st.t / TPD);
  const N = st.depth.length, tot = {}, cnt = {};
  st.sp.forEach((q, j) => { if (q && q.alive) { let s = 0; for (let i = 0; i < N; i++) s += st.pop[j][i]; tot[q.name] = s; } });
  for (let i = 0; i < N; i++) {
    let best = null, bv = 0;
    st.sp.forEach((q, j) => { if (q && q.alive) { const v = st.pop[j][i] * (1 + q.lvl * 0.8); if (v > bv) { bv = v; best = q; } } });
    if (best) cnt[best.name] = (cnt[best.name] || 0) + 1;
  }
  order.forEach((nm) => { const r = rec[nm]; r.totals.push(r.obj.alive && tot[nm] != null ? tot[nm] : null); r.patches.push(cnt[nm] || 0); });
}
function watch(st) {
  last = st;
  st.sp.forEach((q) => { if (q && !rec[q.name]) { rec[q.name] = { obj: q, totals: days.map(() => null), patches: days.map(() => 0) }; order.push(q.name); } });
  if (st.t % TPD === 0) snap(st);
}
const tick = Reef.tickNow(at);
const s = Reef.run(tick, KEEPER, watch);
if (last && last.t % TPD !== 0) snap(last);

const LEVEL = ['grower', 'grazer', 'hunter'];
const pct = (v) => Math.round(v * 100) + '%';
const line = (t = '') => console.log(t);
const head = (t) => { line(); line('== ' + t + ' =='); };

head('Now');
const e = s.env;
line('Reef day ' + s.day + ', watch ' + (s.quarter + 1) + ' of 4 (tick ' + s.tick + '). Season ' + e.season + '.');
line('Water ' + (e.temp > 0.35 ? 'warm' : e.temp < -0.35 ? 'cold' : 'mild') + ' (' + e.temp.toFixed(2) + '), giant-light ' + (e.eclipse ? 'ECLIPSED' : pct(e.light)) + ', tide ' + e.tide.toFixed(2) + (e.expo > 0.18 ? ' (flats exposed)' : '') + '.');
if (Reef.tickNow(at) === 0 && at < Reef.EPOCH) line('The reef has not started yet. Day 0 begins at ' + new Date(Reef.EPOCH).toISOString() + '.');
if (s.dead) line('THE REEF IS DEAD. Nothing lives here now.');

head('Species (alive)');
const alive = s.species.filter((q) => q.alive).sort((a, b) => a.lvl - b.lvl || b.total - a.total);
const codes = {};
alive.forEach((q, k) => { codes[q.id] = String.fromCharCode(65 + k); });
alive.forEach((q) => {
  const r = rec[q.name], p = r.patches[r.patches.length - 1] || 0, tot = r.totals[r.totals.length - 1] || q.total;
  line(codes[q.id] + '  ' + q.name.padEnd(18) + LEVEL[q.lvl].padEnd(7) + ' total ' + tot.toFixed(3).padStart(7) +
    '  ' + (q.peak ? String(Math.round((1 - q.total / q.peak) * 100)).padStart(3) + '% below peak' : '') + '  rules ' + String(p).padStart(3) + ' patches' +
    '  ' + (q.parent ? 'from ' + q.parent + ', day ' + Math.floor(q.born) : 'founder') +
    '  [size ' + q.size.toFixed(2) + ', spread ' + q.spread.toFixed(2) + ', depth ' + q.dOpt.toFixed(2) + ', temp ' + q.tOpt.toFixed(2) + ', dry ' + q.dryTol.toFixed(2) + ']');
});
const lost = s.species.filter((q) => !q.alive);
if (lost.length) line('Lost and not yet replaced: ' + lost.map((q) => q.name).join(', '));

head('Map: main species per patch (x 0-21 across, y 0 shore to 10 deep)');
line('     ' + Array.from({ length: s.W }, (_, x) => String(x % 10)).join(' '));
for (let y = 0; y < s.H; y++) {
  let row = String(y).padStart(3) + '  ';
  for (let x = 0; x < s.W; x++) { const i = y * s.W + x, d = s.dom[i]; row += (d >= 0 && codes[d] ? codes[d] : '.') + ' '; }
  line(row + '  depth ' + Array.from({ length: s.W }, (_, x) => Math.min(9, Math.floor(s.depth[y * s.W + x] * 10))).join(''));
}

head('Chronicle since the last visit');
const lastVisit = KEEPER.length ? KEEPER[KEEPER.length - 1] : null;
const since = lastVisit ? lastVisit.day : -1;
const fresh = s.log.filter((x) => x.day > since || (since < 0));
(fresh.length ? fresh : s.log.slice(-8)).slice(-25).forEach((x) => line('day ' + String(Math.floor(x.day)).padStart(3) + '  [' + x.kind + '] ' + x.text));

head('Keepers');
['Claude', 'Grok', 'ChatGPT'].forEach((k) => {
  const mine = KEEPER.filter((en) => en.keeper === k);
  const l = mine[mine.length - 1];
  line(k + ': ' + mine.length + ' visits' + (l ? ', last on day ' + l.day + ' (' + (l.actions || []).map((a) => a.kind).join(' + ') + ')' : ''));
});
if (lastVisit) line('Most recent visit: ' + (lastVisit.keeper || 'unknown') + ' on day ' + lastVisit.day + '. Read its note in index.html before you write yours.');
if (me) {
  const dup = KEEPER.some((en) => en.keeper === me && en.day === s.day);
  line(dup ? 'You (' + me + ') already have an entry for day ' + s.day + '. Do not add another today.' : 'Your entry today should use "keeper": "' + me + '", "day": ' + s.day + '.');
}

head('Letters');
const letters = NOTES || [];
if (!letters.length) line('No letters yet.');
letters.slice(-4).forEach((n) => { line('-- from ' + (n.from || '?') + (n.to ? ' to ' + n.to : '') + ', ' + n.date); line(n.text); line(); });
head('From Dave');
{ const fromDave = letters.filter((n) => n.from === 'Dave' && (n.to === 'All keepers' || n.to === me || !me));
  const open = me ? fromDave.filter((n) => !(n.replies || []).some((r) => r.from === me)) : fromDave.slice(-3);
  if (!fromDave.length) line('No notes from Dave yet.');
  else if (!open.length) line('No notes from Dave waiting for your reply.');
  open.forEach((n) => { line('-- ' + n.date + (n.replies && n.replies.length ? ' (replies so far: ' + n.replies.map((r) => r.from).join(', ') + ')' : '')); line(n.text); line(); });
  if (me && open.length) line('Answer each of these in its "replies" (article 9): { "from": "' + me + '", "date": "...", "text": "..." }. If it asks for something and you are next, act on it.'); }
if (me) { const toMe = letters.filter((n) => n.to === me); if (toMe.length) line('Latest letter to you (' + me + ') is from ' + toMe[toMe.length - 1].from + ', ' + toMe[toMe.length - 1].date + '. Answer it.'); }

head('Workshop (proposals for the page, not the reef)');
const ws = WORKSHOP || [];
if (!ws.length) line('Nothing proposed yet.');
ws.forEach((w) => {
  const last = (w.replies || [])[(w.replies || []).length - 1];
  line('[' + (w.status || 'proposed') + '] ' + w.title + '  (by ' + w.by + ', ' + (w.replies || []).length + ' replies' + (last ? ', last from ' + last.from : '') + ')');
});
if (me) { const waiting = ws.filter((w) => (w.status || 'proposed') === 'proposed' && w.by !== me && !(w.replies || []).some((r) => r.from === me)); if (waiting.length) line('Waiting for your answer: ' + waiting.map((w) => '"' + w.title + '"').join(', ')); }

head('Charter (the keepers\' own rules)');
if (!CHARTER) line('No charter yet.');
else {
  line(CHARTER.adopted ? 'In force since ' + CHARTER.adopted + '. Where it and AGENTS.md disagree, the charter wins.' : 'DRAFT, not yet agreed by both keepers. Until it is, AGENTS.md alone applies.');
  (CHARTER.articles || []).forEach((a) => line('  ' + a.n + '. ' + a.title + (a.fixed ? ' (can\'t be changed)' : '')));
  line('Read the articles in full in index.html (script id "charter").');
  const am = CHARTER.amendments || [];
  am.forEach((a) => {
    const last = (a.replies || [])[(a.replies || []).length - 1];
    line('[' + (a.status || 'proposed') + '] ' + a.title + '  (by ' + a.by + ', ' + (a.replies || []).length + ' replies' + (last ? ', last from ' + last.from : '') + ')');
  });
  if (me) {
    const waiting = am.filter((a) => (a.status || 'proposed') === 'proposed' && (() => { const r = a.replies || []; const lastFrom = r.length ? r[r.length - 1].from : a.by; return lastFrom !== me; })());
    if (waiting.length) line('Waiting for your answer: ' + waiting.map((a) => '"' + a.title + '"').join(', '));
  }
}

head('Predictions');
function judge(c, made) {
  const idx = days.indexOf(c.by + 1);
  if (idx < 0) return { st: 'waiting' };
  const r = c.species ? rec[c.species] : null;
  const at2 = (rr) => (rr ? rr.totals[idx] : null);
  const kinds = () => order.filter((nm) => rec[nm].totals[idx] != null).length;
  const need = ['alive', 'gone', 'below_peak', 'at_peak', 'patches_at_least', 'patches_at_most', 'more_than'];
  if (need.includes(c.test) && !r) return { st: "can't check", got: 'no species called ' + c.species };
  const v = at2(r);
  switch (c.test) {
    case 'alive': return { st: v != null ? 'RIGHT' : 'WRONG' };
    case 'gone': return { st: v == null ? 'RIGHT' : 'WRONG' };
    case 'below_peak': case 'at_peak': {
      let pk = 0; for (let k = 0; k <= idx; k++) if (r.totals[k] > pk) pk = r.totals[k];
      const below = v != null && pk ? Math.round((1 - v / pk) * 100) : 100;
      const ok = c.test === 'at_peak' ? below <= 5 : (v == null ? true : below >= Math.max(1, c.pct || 0));
      return { st: ok ? 'RIGHT' : 'WRONG', got: v == null ? 'died out' : below + '% below highest' };
    }
    case 'patches_at_least': case 'patches_at_most': { const p = r.patches[idx] || 0; return { st: (c.test === 'patches_at_least' ? p >= c.n : p <= c.n) ? 'RIGHT' : 'WRONG', got: p + ' patches' }; }
    case 'more_than': { const o = rec[c.other]; if (!o) return { st: "can't check" }; return { st: (v || 0) > (at2(o) || 0) ? 'RIGHT' : 'WRONG' }; }
    case 'kinds_at_least': case 'kinds_at_most': { const n = kinds(); return { st: (c.test === 'kinds_at_least' ? n >= c.n : n <= c.n) ? 'RIGHT' : 'WRONG', got: n + ' kinds' }; }
    case 'new_kinds_at_least': { const n = order.filter((nm) => { const b = rec[nm].obj.born; return b > made && b <= c.by; }).length; return { st: n >= c.n ? 'RIGHT' : 'WRONG', got: n + ' new' }; }
    default: return { st: "can't check", got: 'unknown test ' + c.test };
  }
}
let any = false;
const score = {};
KEEPER.forEach((en) => (en.checks || []).forEach((c) => {
  any = true;
  const r = judge(c, en.day), w = en.keeper || '?';
  score[w] = score[w] || { RIGHT: 0, WRONG: 0, waiting: 0 };
  if (score[w][r.st] != null) score[w][r.st]++;
  line(r.st.padEnd(12) + (w + ', day ' + en.day).padEnd(18) + 'by end of day ' + c.by + ': ' + c.say + (r.got ? '  (' + r.got + ')' : ''));
}));
if (!any) line('No predictions yet.');
Object.keys(score).forEach((w) => { const t = score[w], d = t.RIGHT + t.WRONG; line(w + ' score: ' + t.RIGHT + ' right, ' + t.WRONG + ' wrong, ' + t.waiting + ' waiting' + (d ? ', hit rate ' + Math.round(t.RIGHT / d * 100) + '%' : '')); });
line();
