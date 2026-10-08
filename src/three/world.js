// v3: the fly-through. Scroll drives a camera along a spline through seven voxel dioramas, one per project.
// Built live with three.js (instanced voxels, ~4 draw calls). Falls back to the static rows without WebGL or with reduced motion.
// Ported as-is from the static site: geometry, seeds, island builders, camera path, easing and timing are unchanged.
// initWorld() returns a dispose function that tears down the renderer, scene, ScrollTrigger, panels and listeners.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initWorld(flight, { getLenis } = {}) {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const capture = /[?&]capture/.test(location.search);
  let disposed = false;
  const cleanups = [];
  const dispose = () => {
    disposed = true;
    cleanups.splice(0).reverse().forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
  };

  async function initFlight(){
  if (reduce || !flight) return;
  let THREE;
  try { THREE = await import('three'); } catch (e) { return; }
  if (disposed) return;
  const mobile = matchMedia('(max-width: 640px)').matches;
  const canvas = flight.querySelector('#world');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' }); }
  catch (e) { return; }
  cleanups.push(() => renderer.dispose());
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  const BG = 0x0e0e0d;
  renderer.setClearColor(BG, 1);

  /* ---------- seeded helpers ---------- */
  let seed = 7;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const col = (hex, j = 0) => new THREE.Color(hex).offsetHSL(0, 0, (rand() - .5) * j);
  const STEP = mobile ? 2 : 1;            // island voxel size: fewer, bigger voxels on phones
  const LIT = [], GLOW = [];              // [cx, cy, cz, sx, sy, sz, color]
  // box with its base at y (local to a station origin o)
  const box = (o, x, y, z, sx, sy, sz, c, list = LIT) => list.push([o.x + x, o.y + y + sy / 2, o.z + z, sx, sy, sz, c instanceof THREE.Color ? c : col(c)]);
  const vox = (o, x, y, z, c, size = .94, list = LIT) => box(o, x, y, z, size, size, size, c, list);

  /* ---------- stations ---------- */
  const ST = [
    new THREE.Vector3(0, 0, 0),        // Motto Archery
    new THREE.Vector3(34, 4, -36),     // Stock-Web
    new THREE.Vector3(0, 6, -72),      // Antifta Studio
    new THREE.Vector3(34, 8, -108),    // Meowdo   (from here on, same relative layout as before Antifta was added)
    new THREE.Vector3(0, 3, -144),     // Vestige
    new THREE.Vector3(34, -2, -180),   // DarkArise
    new THREE.Vector3(66, 6, -216)     // BlueMoon
  ];

  function island(o, topFn, side, w = 16, d = 16){
    const hw = w / 2, hd = d / 2;
    for (let x = -hw + STEP / 2; x < hw; x += STEP) for (let z = -hd + STEP / 2; z < hd; z += STEP){
      const ex = Math.abs(x) / hw, ez = Math.abs(z) / hd;
      if (ex > .8 && ez > .8 && (ex + ez) > 1.72) continue;          // rounded corners
      box(o, x, -STEP, z, STEP * .96, STEP * .96, STEP * .96, topFn(x, z));
      const r = Math.max(ex, ez), n = Math.max(1, Math.round((1 - r) * 5 * (.55 + rand() * .7)));
      box(o, x, -STEP - n * STEP, z, STEP * .96, n * STEP - .04, STEP * .96, col(side, .05));   // one tall column underneath
    }
  }
  const line = (o, a, b, n, size, c, list) => { for (let i = 0; i <= n; i++){ const t = i / n; vox(o, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, c, size, list); } };

  // 1 · Motto Archery: the red stand holding a compound bow, and a target
  (o => {
    island(o, () => col('#2b2a27', .06), '#1a1918');
    // target face: archery rings, built from small voxels
    const tc = [3.2, 6.2, -4];
    for (let xi = -6; xi <= 6; xi++) for (let yi = -6; yi <= 6; yi++){
      const r = Math.hypot(xi, yi) / 6.2; if (r > 1) continue;
      const c = r < .2 ? '#f2c230' : r < .4 ? '#e23b2e' : r < .6 ? '#3a7bd5' : r < .8 ? '#1c1c1a' : '#e8e4da';
      vox(o, tc[0] + xi * .7, tc[1] + yi * .7 - .33, tc[2], col(c, .04), .66);
    }
    box(o, tc[0], 2, tc[2] - .5, 9.6, .6, 1.2, '#5a3d26');              // stand under the face
    box(o, tc[0] - 3.6, 0, tc[2] - .2, .6, 2.4, .6, '#5a3d26'); box(o, tc[0] + 3.6, 0, tc[2] - .2, .6, 2.4, .6, '#5a3d26');
    box(o, tc[0] + .3, tc[1] + .2, tc[2] + 1.3, .14, .14, 2.6, '#d9d5cb');   // arrow in the gold
    box(o, tc[0] + .3, tc[1] + .1, tc[2] + 2.5, .4, .35, .5, '#c8f03c', GLOW);
    // the stand (brand red): A-frame legs, cross bar, T head
    const red = '#d4241c';
    line(o, [-6.6, 0, .6], [-4.6, 3.4, .6], 8, .62, red); line(o, [-1.6, 0, .6], [-3.6, 3.4, .6], 8, .62, red);
    box(o, -4.1, 1.5, .6, 3.6, .5, .6, red);
    box(o, -4.1, 3.6, .6, 3.4, .5, 1.6, red);
    box(o, -6.6, 0, .6, .8, .35, 2.6, red); box(o, -1.6, 0, .6, .8, .35, 2.6, red);
    // compound bow resting on the T, in the y–z plane
    for (let t = -1; t <= 1.0001; t += .08){ vox(o, -4.1, 8.6 + t * 4.6, .6 + 2 * (1 - t * t), col('#2e2d2a', .05), .46); }
    box(o, -4.1, 7, 2.5, .55, 3, .7, '#141413');
    box(o, -4.1, 3.95, .45, .07, 9.3, .07, '#ebe7de', GLOW);                  // string
    vox(o, -4.1, 3.7, .6, '#c8f03c', .8, GLOW); vox(o, -4.1, 12.8, .6, '#c8f03c', .8, GLOW);   // cams
  })(ST[0]);

  // 2 · Stock-Web: racks of spare parts, one box lit up = the part you searched for
  (o => {
    island(o, () => col('#3a3a36', .05), '#1c1c1a');
    const metal = '#5c5952', cards = ['#9c7448', '#86643f', '#b08a58', '#7a5a38'];
    [[-3.6, -2.2], [3.6, -2.2]].forEach(([x0, z0], ri) => {
      [[-3.1, -1.1], [3.1, -1.1], [-3.1, 1.1], [3.1, 1.1]].forEach(([dx, dz]) => box(o, x0 + dx, 0, z0 + dz, .32, 7.4, .32, metal));
      [.3, 2.7, 5.1, 7.3].forEach((y, si) => {
        box(o, x0, y, z0, 6.6, .22, 2.6, '#47453f');
        if (si === 3) return;
        let x = x0 - 2.9;
        while (x < x0 + 2.4){
          const w = .9 + rand() * .9, h = .8 + rand() * 1, d = 1.2 + rand() * .9;
          const lit = ri === 1 && si === 1 && x > x0 - 1 && x < x0 + .6;
          box(o, x + w / 2, y + .22, z0, w * .94, h, d, lit ? new THREE.Color('#c8f03c') : col(cards[(rand() * 4) | 0], .05), lit ? GLOW : LIT);
          x += w + .15;
        }
      });
    });
    box(o, 4.2, 0, 4, 2.8, .35, 2.4, '#6b5236');                     // pallet with boxes
    box(o, 3.7, .35, 3.7, 1.4, 1.2, 1.4, '#9c7448'); box(o, 5, .35, 4.4, 1.1, .9, 1.1, '#86643f'); box(o, 4.2, 1.55, 3.9, 1, .8, 1, '#b08a58');
    box(o, 3.6, 8.6, -2.2, .4, .4, .4, '#c8f03c', GLOW);              // search pin above the found part
    box(o, 3.6, 8.1, -2.2, .12, .5, .12, '#c8f03c', GLOW);
  })(ST[1]);

  // 3 · Antifta Studio: wig busts in a cosplay studio. The pink wig with braids fading to green (the site's
  // hero photo; the tips glow in the accent), a burgundy one, and a vanity mirror ringed with bulbs.
  (o => {
    const seed0 = seed;   // restore the seed afterwards so the islands after this one keep their exact look
    island(o, () => col('#3d2530', .06), '#1f1218');
    const s = mobile ? .7 : .5, skin = '#e8d5bf';
    // ellipsoid shell of small voxels around c with radii r; keep(xr,yr,zr) filters, paint() colours
    const shell = (c, r, thick, keep, paint, list = LIT) => {
      for (let x = -r[0]; x <= r[0] + 1e-6; x += s) for (let y = -r[1]; y <= r[1] + 1e-6; y += s) for (let z = -r[2]; z <= r[2] + 1e-6; z += s){
        const xr = x / r[0], yr = y / r[1], zr = z / r[2], d = Math.hypot(xr, yr, zr);
        if (d > 1.04 || d < 1 - thick || !keep(xr, yr, zr)) continue;
        vox(o, c[0] + x, c[1] + y - s / 2, c[2] + z, paint(xr, yr, zr), s * .97, list);
      }
    };
    // a display bust on a pedestal; returns the head centre and the wig radii
    const bust = (x0, z0, k, hair, tip) => {
      box(o, x0, 0, z0, 2.2 * k, .5, 2.2 * k, '#2a1a21');
      box(o, x0, .5, z0, 4.2 * k, 1.6 * k, 2 * k, skin);
      box(o, x0, .5 + 1.6 * k, z0, 1.1 * k, 1.2 * k, 1.1 * k, skin);
      const hc = [x0, .5 + 2.8 * k + 1.7 * k, z0], R = [1.6 * k, 2.05 * k, 1.7 * k];
      shell(hc, [1.35 * k, 1.75 * k, 1.45 * k], .3, (xr, yr, zr) => zr > .2 && yr < .3, () => col(skin, .03));   // the face
      shell(hc, R, .28, (xr, yr, zr) => yr > .05 || zr < -.05, (xr, yr, zr) => zr > .35 && yr < .4 ? col(tip, .05) : col(hair, .07));
      box(o, x0, .5 + 1.6 * k, z0 - 1.05 * k, 2.6 * k, 2.9 * k, .6 * k, col(hair, .05));                          // hair falling down the back
      return { hc, R };
    };
    // main bust: pink wig, twin braids that fade into the accent green, pearls on the crown
    const m = bust(1, -1, 1, '#ff8fbf', '#f7a6cc');
    [-1, 1].forEach(side => {
      for (let j = 0; j <= 10; j++){
        const t = j / 10, c = new THREE.Color('#ff8fbf').lerp(new THREE.Color('#c8f03c'), Math.min(1, Math.max(0, (t - .35) / .5)));
        const sz = .66 - t * .14;
        vox(o, 1 + side * (1.5 + (j % 2 ? .1 : -.06)), 4.4 - j * .4, -1 + 1.25, c, sz, j >= 8 ? GLOW : LIT);
      }
    });
    for (let a = -2; a <= 2; a++){
      const xr = a * .26, zr = .42, yr = Math.sqrt(1 - xr * xr - zr * zr);
      vox(o, m.hc[0] + xr * m.R[0] * 1.03, m.hc[1] + yr * m.R[1] * 1.03 - .14, m.hc[2] + zr * m.R[2] * 1.03, '#f8f3ee', .28, GLOW);
    }
    // a white faux-fur rug under it, like in the photos
    for (let i = 0, n = mobile ? 16 : 34; i < n; i++){ const a = rand() * 6.28, r = 1.7 + rand() * 1.5, w = .5 + rand() * .3; box(o, 1 + Math.cos(a) * r, 0, -1 + Math.sin(a) * r * .8, w, .18 + rand() * .16, w, col('#f1ebe4', .04)); }
    // second bust: burgundy wig with long straight side locks
    bust(-4.3, -3.4, .8, '#8a2346', '#7b2442');
    [-1, 1].forEach(side => box(o, -4.3 + side * 1.2, 1.3, -3.4 + .2, .5, 2.4, .7, col('#8a2346', .05)));
    // vanity: table, mirror, a ring of bulbs (the accent glow), spools of fibre in the brand colours
    const vx = 4.5;
    box(o, vx, 0, -4.4, 3.8, 2.1, 2, '#4a2c38');
    box(o, vx, 2.1, -5.2, 3.3, 4, .3, '#2a1a21'); box(o, vx, 2.4, -5.02, 2.6, 3.4, .1, '#b8a6b1');
    for (let k = 0; k < 5; k++){ vox(o, vx - 1.68, 2.5 + k * .8, -5.0, '#fff1d6', .32, GLOW); vox(o, vx + 1.68, 2.5 + k * .8, -5.0, '#fff1d6', .32, GLOW); }
    for (let k = 0; k < 4; k++) vox(o, vx - .96 + k * .64, 6.04, -5.0, '#fff1d6', .32, GLOW);
    ['#ff8fbf', '#c9738d', '#7b2442', '#f1d6dc', '#b08a5b'].forEach((c, k) => box(o, vx - 1.4 + k * .62, 2.1, -3.8, .44, .6, .44, c));
    box(o, 3.4, 0, 3.4, 1.6, .5, 1.2, '#7b2442'); box(o, 3.4, .5, 3.4, 1.2, .14, .9, '#f8f3ee');                     // a wine stool with a cushion
    seed = seed0;
  })(ST[2]);

  // 4 · Meowdo: a cork board with sticky notes, a pile of coins, and the cat comes to sit here
  (o => {
    island(o, () => col('#4a3626', .06), '#21180f');
    box(o, -4.6, 0, -3, .45, 3, .45, '#3e2a1a'); box(o, 4.6, 0, -3, .45, 3, .45, '#3e2a1a');
    box(o, 0, 2.6, -3.15, 10.8, 7.2, .5, '#5a3d26');
    for (let x = -4.5; x <= 4.51; x += 1) for (let y = 0; y < 6; y++) box(o, x, 3.1 + y, -2.85, .96, .96, .3, col('#b98a56', .09));
    const notes = [[-3.1, 7, '#ff8fa3'], [-.8, 7.4, '#ffd166'], [1.7, 6.9, '#7ed6b3'], [3.6, 7.5, '#6b9cff'], [-2.3, 4.2, '#ffd166'], [.6, 4.6, '#ff8fa3'], [3.1, 4.1, '#7ed6b3']];
    notes.forEach(([x, y, c]) => { box(o, x, y, -2.6, 1.7, 1.7, .14, c); box(o, x, y + 1.35, -2.45, .28, .28, .28, '#e23b2e');
      box(o, x - .1, y + .9, -2.52, 1.1, .1, .04, '#3a3530'); box(o, x - .25, y + .55, -2.52, .8, .1, .04, '#3a3530'); });
    for (let k = 0; k < 6; k++) box(o, 4.2 + (k % 2) * .08, k * .3, 2.2, 1, .26, 1, col('#f2c230', .05));
    for (let k = 0; k < 3; k++) box(o, 5.5, k * .3, 1.1, 1, .26, 1, col('#f2c230', .05));
    box(o, -5.4, 0, 2.6, 1.1, 1.1, 1.1, '#6b4a32'); box(o, -5.4, 1.1, 2.6, .9, .9, .9, '#5f9a52');   // little plant, like in the app
  })(ST[3]);

  // 5 · Vestige: one floor, two times. Peaceful puzzle half, apocalyptic half.
  (o => {
    island(o, (x) => x < 0 ? col('#5d8a4a', .08) : col('#2e2522', .06), '#1f1814');
    // peaceful: tree, flowers, a puzzle of pressure plates
    box(o, -5, 0, -3.5, .8, 3, .8, '#6b4a32');
    for (let i = 0; i < 26; i++){ const a = rand() * 6.28, r = rand() * 1.8; vox(o, -5 + Math.cos(a) * r, 2.6 + rand() * 2.6, -3.5 + Math.sin(a) * r, col('#4d7a3a', .1), 1); }
    for (let i = 0; i < 14; i++) vox(o, -7 + rand() * 6.2, 0, -6 + rand() * 12, ['#ff8fa3', '#ffd166', '#ebe7de'][i % 3], .34);
    [[-3.6, 1], [-2.4, 1], [-3.6, 2.2], [-2.4, 2.2]].forEach(([x, z], i) => box(o, x, 0, z, 1, .14, 1, i === 1 ? '#c8f03c' : '#cfc9bc', i === 1 ? GLOW : LIT));
    // apocalyptic: dead tree, broken pillars, glowing cracks, embers
    box(o, 5, 0, -3.5, .6, 3.6, .6, '#241c1a'); line(o, [5, 3, -3.5], [6.6, 4.6, -3.5], 4, .4, '#241c1a'); line(o, [5, 2.4, -3.5], [3.8, 3.6, -3.2], 3, .36, '#241c1a');
    box(o, 2.8, 0, 1, 1.2, 1.4, 1.2, '#4a3a36'); box(o, 6.2, 0, -.6, 1.2, 2.4, 1.2, '#4a3a36'); box(o, 6.2, 2.4, -.2, .9, .5, .9, '#3a2e2a');
    let cx = .6, cz = -5;
    for (let i = 0; i < 26; i++){ box(o, cx, -.02, cz, .5, .08, .5, '#ff5a1f', GLOW); cx += (rand() - .3) * .8; cz += .45 + rand() * .2; cx = Math.min(7, Math.max(.4, cx)); }
    for (let i = 0; i < 9; i++) vox(o, .8 + rand() * 6, 1 + rand() * 4, -5 + rand() * 9, '#ff7a2f', .2, GLOW);
  })(ST[4]);

  // 6 · DarkArise: dark pixel ruins with violet torches
  (o => {
    island(o, () => col('#24212b', .06), '#16141b');
    const stone = '#3b3548';
    [-3, 3].forEach(x => { for (let y = 0; y < 7; y++){ if (y > 3 && rand() < .16) continue; vox(o, x, y, -3, col(stone, .1), .96); } });
    for (let x = -3; x <= 3; x++){ if (x === 1 || x === 2) continue; vox(o, x, 7, -3, col(stone, .1), .96); }
    for (let y = 0; y < 3; y++) vox(o, 5.6, y, 1, col(stone, .1), .96);
    for (let y = 0; y < 2; y++) vox(o, -5.6, y, .4, col(stone, .1), .96);
    for (let x = -6.5; x <= -1; x++){ const h = 1 + ((rand() * 3) | 0); for (let y = 0; y < h; y++) vox(o, x, y, -5.6, col('#322d3d', .1), .96); }
    for (let i = 0; i < 16; i++) vox(o, -6 + rand() * 12, 0, -2 + rand() * 7, col(stone, .12), .3 + rand() * .3);
    [-1.8, 1.8].forEach(x => { box(o, x, 0, -1.6, .26, 1.9, .26, '#2a2530'); box(o, x, 1.9, -1.6, .42, .62, .42, '#b18cff', GLOW); });
  })(ST[5]);

  // 7 · BlueMoon: a small island under a big voxel moon
  (o => {
    island(o, () => col('#24324f', .07), '#141b2a');
    const R = mobile ? 4 : 5.5, mc = [2.5, 13, -7], s = mobile ? 1.2 : 1;
    const craters = [[.5, .6, .62], [-.6, .2, .77], [.1, -.7, .7], [-.3, .9, .3]].map(v => new THREE.Vector3(...v).normalize());
    const n = new THREE.Vector3();
    for (let x = -R; x <= R; x += s) for (let y = -R; y <= R; y += s) for (let z = -R; z <= R; z += s){
      const d = Math.hypot(x, y, z); if (d > R + .3 || d < R - 1.1) continue;
      n.set(x, y, z).normalize();
      const crater = craters.some(c => c.distanceTo(n) < .32);
      vox(o, mc[0] + x, mc[1] + y, mc[2] + z, col(crater ? '#a9b6cf' : '#dfe7f7', .05), s * .97, GLOW);
    }
    box(o, -3, 0, 2.4, .6, 1.1, .5, '#c8f03c', GLOW); box(o, -3, 1.15, 2.4, .5, .5, .5, '#c8f03c', GLOW);   // the little figure from the poster
    [[4, -2, 2.2], [5.2, 1, 1.4], [-5, -3, 1.6]].forEach(([x, z, h]) => box(o, x, 0, z, .7, h, .7, '#6f8fd0'));
    for (let i = 0; i < 10; i++) vox(o, -6 + rand() * 12, 0, -5 + rand() * 10, col('#3a4d78', .1), .4 + rand() * .4);
  })(ST[6]);

  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 42, 130);
  scene.add(new THREE.HemisphereLight(0xf2efe6, 0x1a1916, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-30, 50, 30); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8f03c, .45); rim.position.set(30, -10, -30); scene.add(rim);

  const unit = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), P = new THREE.Vector3(), Sc = new THREE.Vector3();
  function instanced(list, mat){
    const m = new THREE.InstancedMesh(unit, mat, list.length);
    list.forEach((v, i) => { m4.compose(P.set(v[0], v[1], v[2]), q0, Sc.set(v[3], v[4], v[5])); m.setMatrixAt(i, m4); m.setColorAt(i, v[6]); });
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; m.frustumCulled = false;
    scene.add(m); return m;
  }
  instanced(LIT, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88, metalness: 0, flatShading: true }));
  instanced(GLOW, new THREE.MeshBasicMaterial({ color: 0xffffff }));

  // stars
  const NS = mobile ? 340 : 980, sp = new Float32Array(NS * 3);
  for (let i = 0; i < NS; i++){ sp[i * 3] = -110 + rand() * 260; sp[i * 3 + 1] = -50 + rand() * 140; sp[i * 3 + 2] = 60 - rand() * 360; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x8b877e, size: mobile ? .5 : .32, sizeAttenuation: true, fog: false })));

  /* ---------- the cat (voxel, its own small instanced mesh) ---------- */
  const CAT = [];  // [x,y,z,sx,sy,sz,color,role]
  const cream = '#e6e2d8';
  for (let x = -1; x <= 1; x++) for (let y = 1; y <= 2; y++) for (let z = -2; z <= 1; z++) CAT.push([x, y, z, .96, .96, .96, col(cream, .05), 'b']);
  [[-1, -2], [1, -2], [-1, 1], [1, 1]].forEach(([x, z]) => CAT.push([x, 0, z, .8, .96, .8, col(cream, .05), 'b']));
  for (let x = -1; x <= 1; x++) for (let y = 2; y <= 4; y++) for (let z = 2; z <= 3; z++) CAT.push([x, y, z, .96, .96, .96, col(cream, .05), 'b']);
  CAT.push([-1, 5, 2.5, .8, .9, .6, col('#cfcabf'), 'b'], [1, 5, 2.5, .8, .9, .6, col('#cfcabf'), 'b']);
  CAT.push([-.55, 3.3, 3.52, .5, .5, .1, new THREE.Color('#c8f03c'), 'e'], [.55, 3.3, 3.52, .5, .5, .1, new THREE.Color('#c8f03c'), 'e']);
  CAT.push([0, 2.7, 3.52, .4, .3, .1, new THREE.Color('#77736b'), 'b']);
  for (let k = 0; k < 4; k++) CAT.push([0, 2.4 + k * .8, -2.9, .5, .8, .5, col(cream, .05), 't' + k]);
  const catMesh = new THREE.InstancedMesh(unit, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8, flatShading: true }), CAT.length);
  CAT.forEach((v, i) => catMesh.setColorAt(i, v[6])); catMesh.instanceColor.needsUpdate = true; catMesh.frustumCulled = false;
  const cat = new THREE.Group(); cat.add(catMesh); cat.scale.setScalar(.44); scene.add(cat);
  function poseCat(t, blink, wag){
    CAT.forEach((v, i) => {
      let x = v[0], y = v[1] + .5, z = v[2], sy = v[4];
      if (v[7] === 'e') sy *= blink;
      if (v[7][0] === 't'){ const k = +v[7][1], a = wag; x = Math.sin(a) * k * .7; y = 2.4 + .5 + k * .78 * Math.cos(a * .5); z = -2.9 - k * .12; }
      m4.compose(P.set(x, y, z), q0, Sc.set(v[3], sy, v[5])); catMesh.setMatrixAt(i, m4);
    });
    catMesh.instanceMatrix.needsUpdate = true;
  }
  const CATSPOT = [[-.6, 0, 4.2], [-1.2, 0, 4.6], [-2.6, 0, 3.8], [-1.6, 0, 2.4], [0, 0, 3.4], [.6, 0, 3.8], [-1.4, 0, 3.6]].map((c, i) => ST[i].clone().add(new THREE.Vector3(...c)));

  /* ---------- camera rail ---------- */
  const VIEW = mobile
    ? [[8, 11, 29], [-7, 10, 26], [6, 10, 25], [6, 10, 25], [-7, 10, 26], [7, 9, 25], [-6, 5, 40]]
    : [[12, 9.5, 25], [-10, 8, 21], [9, 7, 18], [9, 7.5, 20], [-9, 9, 21], [10, 7, 20], [-8, 6, 31]];
  const LOOKY = [5.4, 3.4, 3.4, 4, 2.4, 3, 7];
  const V = ST.map((s, i) => s.clone().add(new THREE.Vector3(...VIEW[i])));
  const L = ST.map((s, i) => s.clone().add(new THREE.Vector3(0, LOOKY[i], 0)));
  const camPts = [V[0].clone().add(new THREE.Vector3(-6, 26, 34))], lookPts = [L[0].clone().add(new THREE.Vector3(0, -2, -6))];
  for (let i = 0; i < ST.length; i++){
    camPts.push(V[i]); lookPts.push(L[i]);
    if (i < ST.length - 1){
      // gentle rise-and-dive between islands: low peak, look target turns over the whole hop
      const lift = mobile ? 4.5 : 6;
      camPts.push(V[i].clone().lerp(V[i + 1], .5).add(new THREE.Vector3(0, lift, -3.5)));
      lookPts.push(L[i].clone().lerp(L[i + 1], .62));
    }
  }
  camPts.push(V[ST.length - 1].clone().add(new THREE.Vector3(4, 8, 22))); lookPts.push(L[ST.length - 1].clone().add(new THREE.Vector3(0, 3, 0)));
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'centripetal');
  const LAST = camPts.length - 1;

  // scroll progress → position on the rail, with a dwell at each project.
  // Budget in screens of scroll: intro, dwell per stop, transit between stops, outro.
  // 7 stops: one more dwell + transit than the 6-stop version, so every hop keeps the same pacing
  const SCREENS = mobile ? 9.3 : 10.5;
  const BUDGET = mobile ? { intro: .4, dwell: .55, outro: .4 } : { intro: .5, dwell: .6, outro: .5 };
  const N = ST.length;
  const TRANSIT = (SCREENS - BUDGET.intro - BUDGET.outro - N * BUDGET.dwell) / (N - 1);   // ≈ .88 desktop, .78 mobile (same as with 6 stops)
  const D = BUDGET.dwell / 2 / SCREENS;
  const C = ST.map((_, i) => (BUDGET.intro + BUDGET.dwell / 2 + i * (BUDGET.dwell + TRANSIT)) / SCREENS);
  const SHOW = D + .2 / SCREENS;                                                         // panel stays up a bit past the dwell
  const ease = u => .5 - .5 * Math.cos(Math.PI * u);                                    // sine in-out: peak speed 1.57× vs 3× for cubic
  function rail(p){
    if (p <= C[0] - D) return { idx: ease(Math.max(0, p) / (C[0] - D)), s: 0, t: 0, dwell: false };
    for (let i = 0; i < N; i++){
      if (p <= C[i] + D) return { idx: 1 + 2 * i, s: i, t: 0, dwell: true };
      if (i < N - 1 && p < C[i + 1] - D){ const u = (p - C[i] - D) / (C[i + 1] - D - C[i] - D); return { idx: 1 + 2 * i + 2 * ease(u), s: i, t: u, dwell: false }; }
    }
    const u = Math.min(1, (p - C[N - 1] - D) / (1 - C[N - 1] - D));
    return { idx: LAST - 1 + ease(u), s: N - 1, t: 0, dwell: false };
  }

  const camera = new THREE.PerspectiveCamera(mobile ? 52 : 40, 1, .1, 400);
  function resize(){
    const w = flight.clientWidth, h = flight.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // push the diorama away from the text panel: right on desktop, up on phones
    camera.setViewOffset(w, h, mobile ? 0 : -w * .17, mobile ? h * .2 : 0, w, h);
    camera.updateProjectionMatrix();
  }
  cleanups.push(() => scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); if (o.isInstancedMesh) o.dispose(); }));

  /* ---------- editorial panels (built from the rows, so the copy stays identical) ---------- */
  const rows = [...document.querySelectorAll('.work [data-row]')];
  const WEB = document.querySelector('.work .rows').querySelectorAll('[data-row]').length;   // rows in the "Web y apps" group
  const wrap = document.getElementById('flPanels'), ticks = document.getElementById('flTicks');
  const panels = rows.map((row, i) => {
    const h3 = row.querySelector('h3');
    const el = document.createElement('article'); el.className = 'fl-panel';
    el.innerHTML = '<div class="fl-top"><span>' + String(i + 1).padStart(2, '0') + ' / ' + String(rows.length).padStart(2, '0') + '<span class="fl-grp"> · ' + (i < WEB ? 'Web y apps' : 'Videojuegos') + '</span></span><span>' + (h3.querySelector('sup') ? h3.querySelector('sup').textContent : '') + '</span></div>' +
      '<h3 class="display"><span class="line"><span>' + h3.childNodes[0].textContent.trim() + '</span></span></h3>';
    const meta = row.querySelector('.meta').cloneNode(true);
    [meta, ...meta.querySelectorAll('[style]')].forEach(n => n.removeAttribute('style'));   // drop GSAP inline state copied from the rows
    el.appendChild(meta);
    wrap.appendChild(el);
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.innerHTML = '<span>' + h3.childNodes[0].textContent.trim() + '</span><i></i>';
    b.addEventListener('click', () => goTo(i)); li.appendChild(b); ticks.appendChild(li);
    return el;
  });
  cleanups.push(() => { panels.forEach(el => { gsap.killTweensOf(el); gsap.killTweensOf(el.querySelectorAll('*')); }); wrap.replaceChildren(); ticks.replaceChildren(); });
  const tickBtns = [...ticks.querySelectorAll('button')];
  const groupEl = document.getElementById('flGroup'), countEl = document.getElementById('flCount');
  let shown = -1;
  function show(i){
    if (i === shown) return;
    const prev = panels[shown];
    if (prev){ gsap.killTweensOf(prev); gsap.to(prev, { autoAlpha: 0, y: -14, duration: .3, ease: 'power2.in' }); }
    shown = i;
    tickBtns.forEach((b, k) => b.classList.toggle('on', k === i));
    if (i < 0) return;
    countEl.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(panels.length).padStart(2, '0');
    groupEl.innerHTML = i < WEB ? '<b>(02)</b> Web y apps' : (mobile ? '<b>(02)</b> Videojuegos' : '<b>(02)</b> Videojuegos · la parte divertida');
    const el = panels[i];
    gsap.killTweensOf(el);
    gsap.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'expo.out' });
    gsap.fromTo(el.querySelector('h3 .line > span'), { yPercent: 110 }, { yPercent: 0, duration: .9, ease: 'expo.out', delay: .05 });
    gsap.fromTo(el.querySelectorAll('.fl-top, .meta > *'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, ease: 'power3.out', stagger: .05, delay: .12 });
  }

  /* ---------- turn it on ---------- */
  root.classList.add('flight-on');
  cleanups.push(() => root.classList.remove('flight-on'));
  resize(); const ro = new ResizeObserver(resize); ro.observe(flight);
  cleanups.push(() => ro.disconnect());
  let target = 0, cur = 0;
  const DAMP = mobile ? 3.6 : 5.5;   // 1/s → time constant ≈ 280 ms phone, 180 ms desktop
  const st = ScrollTrigger.create({
    trigger: flight, start: 'top top', end: () => '+=' + Math.round(innerHeight * SCREENS),
    pin: true, scrub: true, onUpdate: s => { target = s.progress; kick(); }
  });
  cleanups.push(() => st.kill(true));
  function goTo(i){
    const y = st.start + C[i] * (st.end - st.start);
    const lenis = getLenis && getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 2.4 }); else scrollTo({ top: y, behavior: 'smooth' });
  }
  ScrollTrigger.refresh();
  // In the static site the page 'load' refresh usually ran after this one (three.js came from a CDN). With the bundled
  // three.js the flight is built after 'load', so refresh once more on the next frame to land on the same positions.
  if (document.readyState === 'complete') document.fonts.ready.then(() => requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); }));

  /* ---------- loop: renders only while the section is on screen and the tab is visible ---------- */
  let visible = false, raf = 0, last = performance.now(), mx = 0, my = 0, smx = 0, smy = 0;
  let yaw = 0, nextBlink = 2000, blinkUntil = 0;
  const stats = window.__flightStats = { frames: 0, ms: [] };
  const onMove = e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; };
  if (!mobile) addEventListener('pointermove', onMove, { passive: true });
  cleanups.push(() => removeEventListener('pointermove', onMove));
  const look = new THREE.Vector3(), catPos = new THREE.Vector3();
  function frame(now){
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    stats.frames++; stats.ms.push(dt * 1000); if (stats.ms.length > 240) stats.ms.shift();
    // frame-rate-independent exponential damping towards the scroll position. Lenis already smooths
    // the wheel on desktop, so damping is lighter there; touch flicks on phones get more. Snaps when settled.
    if (capture) cur = target;
    else { cur += (target - cur) * (1 - Math.exp(-dt * DAMP)); if (Math.abs(target - cur) < 1e-5) cur = target; }
    const r = rail(cur), u = r.idx / LAST, time = now / 1000;
    camCurve.getPoint(u, camera.position); lookCurve.getPoint(u, look);
    smx += (mx - smx) * .05; smy += (my - smy) * .05;
    const sway = r.dwell ? 1 : .3;
    camera.position.x += Math.sin(time * .5) * .35 * sway + smx * 1.2;
    camera.position.y += Math.cos(time * .4) * .25 * sway - smy * .7;
    camera.lookAt(look);

    // the cat leads: it leaves first and lands before the camera arrives
    const a = CATSPOT[r.s], b = CATSPOT[Math.min(N - 1, r.s + 1)];
    const f = r.t <= 0 ? 0 : Math.min(1, r.t / .82), fe = f * f * (3 - 2 * f);
    catPos.copy(a).lerp(b, fe); catPos.y += 4 * 6.5 * fe * (1 - fe);
    const hopping = f > 0 && f < 1;
    if (!hopping) catPos.y += Math.abs(Math.sin(time * 2.2)) * .12;
    cat.position.copy(catPos);
    const wantYaw = hopping ? Math.atan2(b.x - a.x, b.z - a.z) : Math.atan2(camera.position.x - catPos.x, camera.position.z - catPos.z) - .6;   // three-quarter pose, so the tail shows
    let dy = wantYaw - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); yaw += dy * Math.min(1, dt * 6);
    cat.rotation.set(hopping ? (fe - .5) * .45 : 0, yaw, 0);
    if (now > nextBlink){ blinkUntil = now + 130; nextBlink = now + 2400 + Math.random() * 2600; }
    poseCat(time, now < blinkUntil ? .15 : 1, Math.sin(time * (hopping ? 6 : 3.2)) * (hopping ? .42 : .32));

    // which project is on screen
    let best = -1; C.forEach((c, i) => { if (Math.abs(cur - c) < SHOW) best = i; });
    show(best);

    renderer.render(scene, camera);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick(){ if (!disposed && !raf && visible && !document.hidden){ last = performance.now(); raf = requestAnimationFrame(frame); } }
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }); io.observe(flight);
  document.addEventListener('visibilitychange', kick);
  cleanups.push(() => { io.disconnect(); document.removeEventListener('visibilitychange', kick); if (raf) cancelAnimationFrame(raf); raf = 0; });
  window.__flight = { st, C, instances: LIT.length + GLOW.length + CAT.length, drawCalls: () => renderer.info.render.calls };
  cleanups.push(() => { delete window.__flight; delete window.__flightStats; });
  }

  initFlight();
  return dispose;
}
