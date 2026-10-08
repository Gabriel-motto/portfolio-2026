import CatSvg from './CatSvg.jsx';

export default function Nav() {
  return (
    <header className="nav">
      <a className="logo" href="#top" aria-label="Inicio">
        <CatSvg viewBox="0 0 16 14" shapeRendering="crispEdges" aria-hidden="true" id="logoCat" body="#ebe7de" eye="#0e0e0d" nose="#0e0e0d" />
        <span>Gabriel Motto</span>
      </a>
      <ul>
        <li><a href="#sobre-mi">Sobre mí</a></li>
        <li><a href="#trabajo">Trabajo</a></li>
        <li><a href="#stack">Stack</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </header>
  );
}
