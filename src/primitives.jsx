// Reusable primitives: custom cursor, magnetic button, photo placeholder, marquee.

const { useEffect, useRef, useState, useCallback } = React;

/* ---------------- Custom cursor ---------------- */
function useCursor() {
  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'cursor';
    document.body.appendChild(el);

    let tx = window.innerWidth/2, ty = window.innerHeight/2;
    let cx = tx, cy = ty;
    let raf;
    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const onOver = (e) => {
      const t = e.target;
      const interactive = t.closest && t.closest('a, button, .featured-row, .card, .lrow, [data-magnet]');
      el.classList.toggle('ring', !!interactive);
    };
    const onLeave = () => el.classList.add('hide');
    const onEnter = () => el.classList.remove('hide');

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      el.remove();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
    };
  }, []);
}

/* ---------------- Magnetic button ---------------- */
function MagneticButton({ children, onClick, href, strength = 0.35 }) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${x * strength * 0.4}px, ${y * strength * 0.4}px)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
    if (innerRef.current) innerRef.current.style.transform = '';
  };

  const Tag = href ? 'a' : 'button';
  return (
    <span style={{ display: 'inline-block' }} data-magnet
          onMouseMove={onMove} onMouseLeave={onLeave}>
      <Tag ref={ref} href={href} onClick={onClick} className="btn-magnet"
           style={{ transition: 'transform .45s cubic-bezier(.22,.61,.36,1)' }}>
        <span ref={innerRef} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, transition: 'transform .45s cubic-bezier(.22,.61,.36,1)' }}>
          <span>{children}</span>
          <span className="arr">→</span>
        </span>
      </Tag>
    </span>
  );
}

/* ---------------- Photo placeholder ---------------- */
function Photo({ work, ratio, idx }) {
  const r = ratio ?? work?.ratio ?? 1;
  const c = work?.color ?? ((idx ?? 0) % 10 + 1);
  return (
    <div className={`ph p-${c}`} style={{ aspectRatio: `1 / ${r}` }}>
      <div className="stripe" />
    </div>
  );
}

/* ---------------- Hover preview (for list/table rows) ---------------- */
function HoverPreview({ work, x, y, visible }) {
  if (!work) return null;
  return (
    <div className={`hover-preview ${visible ? 'on' : ''}`}
         style={{ left: x, top: y }}>
      <Photo work={work} ratio={1.22} idx={0} />
    </div>
  );
}

/* ---------------- Clock ---------------- */
function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const fmt = (n) => String(n).padStart(2, '0');
  const tz = 'TYO';
  return (
    <span className="clock">
      {tz} · {fmt(t.getUTCHours() + 9 > 23 ? t.getUTCHours() + 9 - 24 : t.getUTCHours() + 9)}:{fmt(t.getUTCMinutes())}:{fmt(t.getUTCSeconds())}
    </span>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const items = [
    'available for commissions — 2026', 'based in tokyo', 'editorial · portrait · landscape',
    'shooting digital + medium format film', 'selected works below', 'instagram / k.umpei'
  ];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {Array.from({ length: 3 }).map((_, i) => (
          <React.Fragment key={i}>
            {items.map((t, j) => (
              <React.Fragment key={j}>
                <span>{t}</span>
                <span className="dot">◆</span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { useCursor, MagneticButton, Photo, HoverPreview, Clock, Marquee });
