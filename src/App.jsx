import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

import Nav from './components/Nav.jsx';
import { TopBar, Meter, CursorLayer } from './components/ProgressBar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Work from './components/Work.jsx';
import Stack from './components/Stack.jsx';
import Contact, { Footer } from './components/Contact.jsx';
import { initHeroCat } from './three/heroCat.js';
import { initWorld } from './three/world.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// All page behaviour lives in one effect, in the same order as the static site's scripts:
// smooth scroll, progress meter, cursor, scroll animations, then the two three.js pieces (loaded async).
export default function App() {
  const scope = useRef(null);

  useGSAP(() => {
    const root = document.documentElement;
    const cleanups = [];
    const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && !navigator.maxTouchPoints;
    const animate = !reduce;
    if (!animate) { root.classList.add('no-anim'); cleanups.push(() => root.classList.remove('no-anim')); }

    /* smooth scroll */
    let lenis = null;
    if (animate) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (t) => { lenis.raf(t * 1000); };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
      cleanups.push(() => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); lenis.destroy(); if (window.__lenis === lenis) delete window.__lenis; lenis = null; });
    }
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      on(a, 'click', (e) => {
        const t = document.querySelector(a.getAttribute('href')); if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { duration: 1.4 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    /* progress meter + active nav */
    const bar = document.getElementById('topbar'), meterBar = document.getElementById('meterBar'), meterNum = document.getElementById('meterNum');
    const navEl = document.querySelector('.nav');
    const navLinks = [].slice.call(document.querySelectorAll('.nav ul a'));
    const secs = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
    function onScroll() {
      const max = document.documentElement.scrollHeight - innerHeight, y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      navEl.classList.toggle('scrolled', y > 24);
      bar.style.transform = 'scaleX(' + p + ')';
      meterBar.style.setProperty('--p', p);
      meterNum.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
      const probe = y + innerHeight * .4; let cur = -1;
      secs.forEach((s, i) => { if (s && s.offsetTop <= probe) cur = i; });
      navLinks.forEach((a, i) => a.classList.toggle('on', i === cur));
    }
    if (lenis) lenis.on('scroll', onScroll); else on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll); onScroll();

    /* custom cursor + hover previews (desktop only) */
    const preview = document.getElementById('preview');
    if (fine && !reduce) {
      root.classList.add('has-cursor');
      cleanups.push(() => root.classList.remove('has-cursor'));
      const cur = document.getElementById('cursor'), dot = document.getElementById('cursorDot');
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, px = mx, py = my, vx = 0, showing = false, loopRaf = 0;
      on(window, 'pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; }, { passive: true });
      (function loop() {
        rx += (mx - rx) * .2; ry += (my - ry) * .2;
        cur.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        const nx = px + (mx - px) * .12; vx = nx - px; px = nx; py += (my - py) * .12;
        if (showing) preview.style.transform = 'translate(' + (px - preview.offsetWidth / 2) + 'px,' + (py - preview.offsetHeight / 2) + 'px) rotate(' + Math.max(-8, Math.min(8, vx * .35)) + 'deg)';
        loopRaf = requestAnimationFrame(loop);
      })();
      cleanups.push(() => cancelAnimationFrame(loopRaf));
      document.querySelectorAll('a, button').forEach((el) => {
        on(el, 'mouseenter', () => { if (!cur.classList.contains('view')) cur.classList.add('link'); });
        on(el, 'mouseleave', () => { cur.classList.remove('link'); });
      });
      const title = document.getElementById('heroTitle');
      on(title, 'mouseenter', () => { cur.classList.add('big'); });
      on(title, 'mouseleave', () => { cur.classList.remove('big'); });
      document.querySelectorAll('[data-row]').forEach((row) => {
        const media = row.querySelector('.row-media');
        on(row, 'mouseenter', () => {
          preview.innerHTML = media.innerHTML; showing = true; px = mx; py = my;
          cur.classList.add('view'); cur.classList.remove('link');
          gsap.to(preview, { clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'expo.out', overwrite: true });
        });
        on(row, 'mouseleave', () => {
          cur.classList.remove('view');
          gsap.to(preview, { clipPath: 'inset(50% 50% 50% 50%)', duration: .35, ease: 'power2.in', overwrite: true, onComplete: () => { showing = false; } });
        });
        row.querySelectorAll('.links a').forEach((a) => {
          on(a, 'mouseenter', () => { cur.classList.remove('view'); cur.classList.add('link'); });
          on(a, 'mouseleave', () => { cur.classList.remove('link'); cur.classList.add('view'); });
        });
      });
      cleanups.push(() => { preview.innerHTML = ''; });
    }

    if (animate) {
      /* hero entrance */
      gsap.set('#heroTitle .line > span', { yPercent: 110 });
      gsap.set('[data-hero]', { autoAlpha: 0, y: 16 });
      gsap.timeline({ delay: .15 })
        .to('#heroTitle .line > span', { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: .09 })
        .to('[data-hero]', { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 }, .45);

      /* hero kinetic type on scroll: lines drift apart */
      [['.l1', -6], ['.l2', 8], ['.l3', -4]].forEach((d) => {
        gsap.to('#heroTitle ' + d[0], { xPercent: d[1], ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      });
      gsap.to('.hero-foot', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '40% top', scrub: true } });

      /* about: words light up as you scroll */
      const fill = document.getElementById('fill');
      gsap.to(fill.querySelectorAll('.w'), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: fill, start: 'top 82%', end: 'bottom 42%', scrub: true } });

      /* big headings: lines rise in, then drift with scroll */
      document.querySelectorAll('[data-split]').forEach((h) => {
        const inner = h.querySelectorAll('.line > span');
        gsap.from(inner, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 85%' } });
        h.querySelectorAll('.line').forEach((l, i) => {
          gsap.fromTo(l, { xPercent: i % 2 ? 4 : -2 }, { xPercent: i % 2 ? -3 : 3, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      });

      /* generic reveals */
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });

      /* work rows: the divider draws, then the row slides up */
      gsap.utils.toArray('[data-row]').forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%' } });
        tl.fromTo(row, { '--line-p': 0 }, { '--line-p': 1, duration: 1.1, ease: 'expo.out' })
          .from(row.querySelector('h3'), { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0)
          .from(row.querySelectorAll('.num, .meta'), { y: 24, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .15);
      });

      /* stack marquees move with the scroll */
      gsap.utils.toArray('.mq-track').forEach((t) => {
        const dir = +t.getAttribute('data-dir');
        gsap.fromTo(t, { xPercent: dir < 0 ? 0 : -25 }, { xPercent: dir < 0 ? -25 : 0, ease: 'none', scrollTrigger: { trigger: '#stack', start: 'top bottom', end: 'bottom top', scrub: .6 } });
      });

      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState === 'complete') requestAnimationFrame(refresh); else on(window, 'load', refresh);
    }

    /* the 3D pieces (each loads three.js on demand and falls back silently) */
    const disposeCat = initHeroCat(document.getElementById('heroArt'), document.getElementById('voxel'));
    const disposeWorld = initWorld(document.getElementById('flight'), { getLenis: () => lenis });

    return () => {
      disposeWorld();
      disposeCat();
      cleanups.splice(0).reverse().forEach((fn) => fn());
    };
  }, { scope });

  return (
    <div ref={scope}>
      <TopBar />
      <CursorLayer />
      <Nav />
      <Meter />
      <main id="top">
        <Hero />
        <About />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
