import { ABOUT_FILL, ABOUT_INTRO, TIMELINE } from '../data/projects.js';

// The fill sentence is pre-split into word spans (.w) so the scroll animation can light them one by one.
function Words({ text }) {
  const out = [];
  text.split(/(\s+)/).forEach((t, i) => {
    if (!t) return;
    out.push(/^\s+$/.test(t) ? t : <span className="w" key={i}>{t}</span>);
  });
  return out;
}

export default function About() {
  return (
    <section className="about" id="sobre-mi">
      <span className="label"><b>(01)</b> Sobre mí</span>
      <p className="fill" id="fill"><Words text={ABOUT_FILL} /></p>

      <div className="about-grid">
        <figure className="photo" data-reveal=""><img src="img/foto-perfil.webp" alt="Gabriel Motto Comesaña" width="962" height="1386" loading="lazy" decoding="async" /><figcaption><b>●</b> Vigo, España</figcaption></figure>
        <div>
          <p className="story-intro" data-reveal="">{ABOUT_INTRO}</p>
          <ol className="tl">
            {TIMELINE.map((t) => (
              <li key={t.when} className={t.star ? 'star' : undefined} data-reveal=""><span className="when">{t.when}</span><h3>{t.title}<small>{t.place}</small></h3><p>{t.text}</p></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
