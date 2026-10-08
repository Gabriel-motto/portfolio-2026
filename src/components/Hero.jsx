import CatSvg from './CatSvg.jsx';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-art" id="heroArt" aria-hidden="true">
        <div className="fallback" id="fallback">
          <CatSvg shapeRendering="crispEdges" body="#d9d5cb" eye="#c8f03c" nose="#8b877e" depth gap />
        </div>
        <canvas id="voxel"></canvas>
      </div>
      <p className="hero-label label" data-hero="">Gabriel Motto Comesaña <b>—</b> Vigo, España</p>
      <h1 className="display" id="heroTitle" aria-label="Código que llega a producción.">
        <span className="line l1"><span>Código</span></span>
        <span className="line l2"><span>que llega</span></span>
        <span className="line l3"><span>a <span className="acc">producción.</span></span></span>
      </h1>
      <div className="hero-foot" data-hero="">
        <p className="role"><strong>Full stack:</strong> Java, Spring Boot, React y Angular, del primer commit al deploy. En mi tiempo libre, creo videojuegos.</p>
        <span className="scroll-cue label"><i></i>Desliza</span>
      </div>
    </section>
  );
}
