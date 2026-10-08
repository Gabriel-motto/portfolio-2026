// Top progress bar and the 00–100% meter. Driven imperatively from App (same as the static site).
export function TopBar() {
  return <div className="topbar" id="topbar"></div>;
}

export function Meter() {
  return <div className="meter" aria-hidden="true"><i id="meterBar"></i><b id="meterNum">00%</b></div>;
}

// custom cursor + hover preview (desktop only, activated in App)
export function CursorLayer() {
  return (
    <>
      <div className="cursor" id="cursor"><span>Ver</span></div>
      <div className="cursor-dot" id="cursorDot"></div>
      <div className="preview" id="preview"></div>
    </>
  );
}
