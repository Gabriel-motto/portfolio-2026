import { MARQUEES, STACK } from '../data/projects.js';

export default function Stack() {
  return (
    <section className="stack" id="stack" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="sec-head" style={{ padding: '0 var(--pad)' }}>
        <h2 className="big display" data-split=""><span className="line"><span>Con qué</span></span><span className="line"><span>trabajo</span></span></h2>
      </div>
      {MARQUEES.map((m, mi) => (
        <div className="marquee" key={mi}>
          <div className="mq-track display" data-dir={m.dir}>
            {[...m.items, ...m.items].map(([t, acc], i) => <span key={i} className={acc ? 'acc' : undefined}>{t}</span>)}
          </div>
        </div>
      ))}
      <div className="stack-list" style={{ padding: '0 var(--pad)' }}>
        {STACK.map((c) => (
          <div data-reveal="" key={c.title}><h3>{c.title}</h3><ul>{c.items.map(([t, small]) => <li key={t}>{t}{small ? <> <small>{small}</small></> : null}</li>)}</ul></div>
        ))}
      </div>
    </section>
  );
}
