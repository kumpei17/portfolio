const { useState, useEffect, useRef } = React;

const ROUTES = [
  { key: 'home',    label: 'index' },
  { key: 'journal', label: 'journal' },
  { key: 'about',   label: 'about' },
  { key: 'contact', label: 'contact' },
];

function parseHash() {
  const h = (window.location.hash || '#home').slice(1);
  if (h.startsWith('entry/')) return { route: 'entry', id: h.slice('entry/'.length) };
  return { route: h || 'home', id: null };
}

function App() {
  useCursor();

  const init = parseHash();
  const [route, setRoute]   = useState(ROUTES.find(r => r.key === init.route) || init.route === 'entry' ? init.route : 'home');
  const [entryId, setEntryId] = useState(init.id);
  const [tweaks, setTweaks] = useState(() => ({ ...window.__TWEAKS__ }));
  const [editMode, setEditMode] = useState(false);
  const [wipe, setWipe]     = useState({ on: false });
  const [routeKey, setRouteKey] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.style.setProperty('--accent', tweaks.accent);
  }, [tweaks.theme, tweaks.accent]);

  useEffect(() => {
    const onMessage = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEditMode(true);
      if (d.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // back/forward
  useEffect(() => {
    const onHash = () => {
      const p = parseHash();
      setRoute(p.route);
      setEntryId(p.id);
      setRouteKey(k => k + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (key, id) => {
    if (key === route && id === entryId) return;
    setWipe({ on: true });
    setTimeout(() => {
      setRoute(key);
      setEntryId(id || null);
      setRouteKey(k => k + 1);
      const hash = key === 'entry' && id ? `#entry/${id}` : `#${key}`;
      window.history.replaceState(null, '', hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => setWipe({ on: false }), 50);
    }, 380);
  };

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="dot" />
            <span>Kumpei</span>
            <span className="sub">— Photo Journal, Tokyo</span>
          </div>
          <nav className="links">
            {ROUTES.map(r => (
              <a key={r.key} href={'#' + r.key}
                 className={(route === r.key || (r.key === 'journal' && route === 'entry')) ? 'active' : ''}
                 onClick={(e) => { e.preventDefault(); navigate(r.key); }}>
                {r.label}
              </a>
            ))}
          </nav>
          <Clock />
        </div>
      </header>

      <main>
        <div key={routeKey}>
          {route === 'home'    && <HomePage navigate={navigate} />}
          {route === 'journal' && <JournalIndex navigate={navigate} />}
          {route === 'entry'   && <JournalEntry id={entryId} navigate={navigate} />}
          {route === 'about'   && <AboutPage />}
          {route === 'contact' && <ContactPage />}
        </div>
      </main>

      <footer className="foot">
        <span>© 2026 Kumpei — all images protected</span>
        <span className="mid">IG — @k.umpei</span>
        <span className="right">built quietly in Tokyo</span>
      </footer>

      <WipeOverlay on={wipe.on} />
      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} visible={editMode} />
    </div>
  );
}

function WipeOverlay({ on }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (on) {
      el.style.transition = 'transform .38s cubic-bezier(.7,0,.3,1)';
      el.style.transformOrigin = 'bottom';
      el.style.transform = 'scaleY(1)';
    } else {
      el.style.transition = 'transform .5s cubic-bezier(.7,0,.3,1)';
      el.style.transformOrigin = 'top';
      el.style.transform = 'scaleY(0)';
    }
  }, [on]);
  return <div ref={ref} className="page-wipe" style={{ transform: 'scaleY(0)' }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
