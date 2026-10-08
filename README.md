# Portfolio 2026 · Gabriel Motto

Personal portfolio of Gabriel Motto Comesaña, full stack web developer in Vigo. One page with a voxel cat in the hero, a word-by-word "about" sentence, a timeline, and a scroll-pinned three.js flight through seven voxel islands, one per project.

Live: https://gabriel-motto.github.io/portfolio-2026/

## Stack

- React 18 + Vite 6
- GSAP 3.12.5 with ScrollTrigger and `@gsap/react` (`useGSAP`)
- Lenis 1.1.13 for smooth scroll
- three.js 0.170 (plain three.js, loaded on demand as a separate chunk)
- Google Fonts: Bricolage Grotesque, Geist, Geist Mono

With reduced motion or without WebGL, the flight falls back to static project rows.

## Structure

```
src/
  data/projects.js      all copy: projects, timeline, stack
  components/           Nav, ProgressBar, Hero, About, Work, Stack, Contact, CatSvg
  three/heroCat.js      hero voxel cat: initHeroCat(container, canvas) -> dispose
  three/world.js        project flight: initWorld(section, opts) -> dispose
  App.jsx               scroll behaviour, cursor, animations; mounts the three.js pieces
  styles.css            global stylesheet
public/                 images and .nojekyll, copied as-is
```

## Run, build, deploy

```bash
npm install
npm run dev       # http://localhost:5173/portfolio-2026/
npm run build     # outputs dist/
npm run preview   # serves dist/ locally
```

Deploys go through GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` builds the site and publishes `dist/` to GitHub Pages.

The pre-React static version is kept at the git tag `static-v3`.
