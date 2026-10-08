import { PROJECT_GROUPS } from '../data/projects.js';

function Media({ m }) {
  const cap = m.cap ? <span className="cap">{m.cap}</span> : null;
  switch (m.type) {
    case 'img':
      return <div className="pv"><img src={m.src} alt={m.alt} loading="lazy" />{cap}</div>;
    case 'sprite':
      return <div className="pv sprite"><img src={m.src} alt={m.alt} loading="lazy" />{cap}</div>;
    case 'stock':
      return <div className="pv pv-stock"><div className="ui"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>{cap}</div>;
    case 'split':
      return <div className="pv pv-split"><div>{m.left}</div><div>{m.right}</div></div>;
    case 'moon':
      return <div className="pv pv-moon"><span className="orb"></span><span className="ground"></span><span className="fig"></span>{cap}</div>;
    case 'orbit':
      return <div className="pv pv-orbit"><span className="o"></span>{cap}</div>;
    default:
      return null;
  }
}

// Rows are the source of truth for the 3D flight: src/three/world.js builds its panels from them.
function Row({ p }) {
  return (
    <li className="row" data-row="">
      <div className="row-media"><Media m={p.media} /></div>
      <span className="num">{p.num}</span>
      <h3 className="display">{p.title}<sup>{p.sup}</sup></h3>
      <div className="meta">
        <p className="kind">{p.kind}</p>
        <p>{p.text}</p>
        <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="links">
          {p.links.map((l, i) => l.href
            ? <a key={i} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            : <span key={i}>{l.text}</span>)}
        </div>
      </div>
    </li>
  );
}

export default function Work() {
  return (
    <section className="work" id="trabajo">
      <div className="sec-head">
        <h2 className="big display" data-split=""><span className="line"><span>Cosas que</span></span><span className="line"><span>he hecho</span></span></h2>
      </div>

      <div className="flight" id="flight" aria-label="Recorrido en 3D por los proyectos">
        <canvas id="world"></canvas>
        <div className="fl-hud"><span className="label" id="flGroup"><b>(02)</b> Web y apps</span><span className="fl-count" id="flCount"><b>01</b> / 07</span></div>
        <div id="flPanels"></div>
        <ul className="fl-ticks" id="flTicks" aria-label="Ir a un proyecto"></ul>
      </div>

      {PROJECT_GROUPS.map((g) => [
        <div className="group" key={g.label + '-h'}><span className="label"><b>(02)</b> {g.label}</span><span className="label">{g.range}</span></div>,
        <ol className="rows" key={g.label}>
          {g.projects.map((p) => <Row key={p.num} p={p} />)}
        </ol>,
      ])}
    </section>
  );
}
