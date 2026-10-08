import { EMAIL } from '../data/projects.js';

export default function Contact() {
  return (
    <section className="contact" id="contacto">
      <span className="label"><b>(04)</b> Contacto</span>
      <h2 className="display" data-split=""><span className="line"><span>¿Hablamos<span className="acc">?</span></span></span></h2>
      <div className="contact-row">
        <div data-reveal="">
          <a className="mail" href={`mailto:${EMAIL}`} data-cursor="link">{EMAIL}</a>
          <p className="note">Si tienes un puesto, un proyecto o una duda sobre gatos pixelados, escríbeme.</p>
        </div>
        <ul className="c-links" data-reveal="">
          <li><a href="https://es.linkedin.com/in/gabrielmottocom" target="_blank" rel="noopener">LinkedIn <span>↗</span></a></li>
          <li><a href="https://github.com/Gabriel-motto" target="_blank" rel="noopener">GitHub <span>↗</span></a></li>
          <li><a href={`mailto:${EMAIL}`}>Email <span>→</span></a></li>
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return <footer><span>© 2026 Gabriel Motto Comesaña</span><span>Hecho a mano en Vigo</span><a href="#top">Volver arriba ↑</a></footer>;
}
