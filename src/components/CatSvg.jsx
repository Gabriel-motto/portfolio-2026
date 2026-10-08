import { CAT_MAP } from '../data/projects.js';

// Pixel cat as SVG rects: used for the nav logo and the static fallback of the 3D hero.
// Same output as the original catSVG(): with depth, each cell gets a shadow rect then the face rect.
export default function CatSvg({ body, eye, nose, depth = false, gap = false, ...props }) {
  const rects = [];
  CAT_MAP.forEach((row, y) => row.split('').forEach((c, x) => {
    if (c === '.') return;
    if (depth) rects.push(<rect key={`s${x}-${y}`} x={x + 1} y={y + 1} width={1} height={1} fill="#2a2925" />);
    const fill = c === 'E' ? eye : c === 'N' ? nose : body;
    rects.push(<rect key={`r${x}-${y}`} x={x} y={y} width={gap ? 0.9 : 1} height={gap ? 0.9 : 1} fill={fill} />);
  }));
  const w = CAT_MAP[0].length + (depth ? 1 : 0), h = CAT_MAP.length + (depth ? 1 : 0);
  return <svg viewBox={`0 0 ${w} ${h}`} {...props}>{rects}</svg>;
}
