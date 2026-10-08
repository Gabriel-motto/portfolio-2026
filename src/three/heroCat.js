// The 3D piece in the hero: a voxel version of the pixel cat. Discreet, reacts to mouse and scroll, pauses off-screen.
// Ported as-is from the static site. init() returns a dispose function.
import { CAT_MAP } from '../data/projects.js';

export function initHeroCat(art, canvas) {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let disposed = false;
  const cleanups = [];
  const dispose = () => {
    disposed = true;
    cleanups.splice(0).reverse().forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
  };

  async function start() {
    if (reduce) return;                       // static SVG cat stays
    let THREE;
    try { THREE = await import('three'); } catch (e) { return; }
    if (disposed) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch (e) { return; }                     // no WebGL: keep the fallback
    cleanups.push(() => { renderer.dispose(); });

    const mobile = matchMedia('(max-width: 640px)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    camera.position.set(0, 0, 34);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2925, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-8, 10, 14); scene.add(key);
    const rim = new THREE.DirectionalLight(0xc8f03c, 0.7); rim.position.set(8, -4, -10); scene.add(rim);

    const MAP = CAT_MAP, W = MAP[0].length, H = MAP.length;
    const depth = mobile ? 2 : 3;
    const bodyCells = [], accCells = [];
    MAP.forEach((row, y) => row.split('').forEach((c, x) => {
      if (c === '.') return;
      const ear = y < 3;
      const layers = ear ? Math.max(1, depth - 1) : depth;
      for (let z = 0; z < layers; z++) {
        const cell = { x: x - W / 2 + .5, y: H / 2 - y - .5, z: -z + (depth - 1) / 2 };
        const r = () => Math.random() * 2 - 1;
        cell.dir = new THREE.Vector3(r(), r(), r() * .6 + .4).normalize().multiplyScalar(6 + Math.random() * 10);
        cell.spin = new THREE.Vector3(r(), r(), r());
        (c === 'E' && z === 0 ? accCells : bodyCells).push(Object.assign(cell, { nose: c === 'N' && z === 0 }));
      }
    }));

    const geo = new THREE.BoxGeometry(.94, .94, .94);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: .85, metalness: 0, flatShading: true, vertexColors: false });
    const accMat = new THREE.MeshStandardMaterial({ color: 0xc8f03c, emissive: 0x6f8a12, emissiveIntensity: .6, roughness: .5 });
    const body = new THREE.InstancedMesh(geo, bodyMat, bodyCells.length);
    const acc = new THREE.InstancedMesh(geo, accMat, accCells.length);
    cleanups.push(() => { geo.dispose(); bodyMat.dispose(); accMat.dispose(); body.dispose(); acc.dispose(); });
    const noseColor = new THREE.Color(0x77736b), bodyColor = new THREE.Color(0xe6e2d8);
    const tmp = new THREE.Color();
    bodyCells.forEach((c, i) => body.setColorAt(i, c.nose ? noseColor : tmp.copy(bodyColor).offsetHSL(0, 0, (Math.random() - .5) * .06)));
    const group = new THREE.Group(); group.add(body, acc); scene.add(group);

    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    function layout(mesh, cells, scatter, eyeScaleY) {
      cells.forEach((c, i) => {
        p.set(c.x + c.dir.x * scatter, c.y + c.dir.y * scatter, c.z + c.dir.z * scatter);
        e.set(c.spin.x * scatter * 3, c.spin.y * scatter * 3, c.spin.z * scatter * 3); q.setFromEuler(e);
        s.set(1, eyeScaleY || 1, 1);
        m4.compose(p, q, s); mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    function resize() {
      const w = art.clientWidth, h = art.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h;
      // keep the whole head in frame whatever the aspect
      const fit = Math.max(H * 1.4, (W * 1.4) / camera.aspect);
      camera.position.z = fit / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize); ro.observe(art); resize();
    cleanups.push(() => ro.disconnect());

    let assemble = 0; const t0 = performance.now();
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = ev => { mx = ev.clientX / innerWidth * 2 - 1; my = ev.clientY / innerHeight * 2 - 1; };
    addEventListener('pointermove', onMove, { passive: true });
    cleanups.push(() => removeEventListener('pointermove', onMove));

    let visible = true, raf = 0, blinkUntil = 0, nextBlink = 2500;
    function frame(now) {
      raf = 0;
      const t = (now - t0) / 1000;
      assemble = Math.min(1, t / 1.6); const ease = 1 - Math.pow(1 - assemble, 4);
      const heroH = art.parentElement.offsetHeight || innerHeight;
      const explode = Math.min(1, Math.max(0, scrollY / heroH));
      const scatter = (1 - ease) * 1.2 + explode * explode * .9;
      if (now - t0 > nextBlink) { blinkUntil = now + 140; nextBlink = now - t0 + 2600 + Math.random() * 3000; }
      layout(body, bodyCells, scatter);
      layout(acc, accCells, scatter, now < blinkUntil ? .15 : 1);
      const tx = mobile ? Math.sin(t * .5) * .35 : mx * .55, ty = mobile ? 0 : my * .3;
      rx += (tx - rx) * .06; ry += (ty - ry) * .06;
      group.rotation.y = -.38 + rx + Math.sin(t * .6) * .08 + explode * .9;
      group.rotation.x = .14 + ry + Math.cos(t * .5) * .04;
      group.position.y = Math.sin(t * 1.1) * .25 + explode * 3;
      renderer.render(scene, camera);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!disposed && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }); io.observe(art);
    document.addEventListener('visibilitychange', kick);
    cleanups.push(() => { io.disconnect(); document.removeEventListener('visibilitychange', kick); if (raf) cancelAnimationFrame(raf); raf = 0; });
    root.classList.add('webgl-on');
    cleanups.push(() => root.classList.remove('webgl-on'));
    kick();
  }
  start();
  return dispose;
}
