const { useState: useStateP, useRef: useRefP, useEffect: useEffectP, useMemo } = React;

/* ---------------- Journal index (grid of entries) ---------------- */
function JournalIndex({ navigate }) {
  const items = window.JOURNALS;

  return (
    <div className="page">
      <div className="journal-head">
        <div>
          <h2>Journal</h2>
          <p className="sub">A running diary of places, seen through film and digital —
            click any entry to step inside.</p>
        </div>
        <div className="count">{String(items.length).padStart(3, '0')} entries</div>
      </div>

      <div className="jgrid">
        {items.map((j, i) => (
          <a key={j.id} className="jcard" href={'#entry/' + j.id}
             onClick={(e) => { e.preventDefault(); navigate('entry', j.id); }}>
            <div className="jcard-frame">
              <Photo work={{ color: j.cover.color, ratio: 1.25 }} idx={i} />
              <span className="jcard-idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="jcard-count">{j.photos.length} photos</span>
            </div>
            <div className="jcard-meta">
              <div className="jcard-title">{j.title}</div>
              <div className="jcard-sub">
                <span>{j.place}</span>
                <span>{j.date}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Journal detail (one entry, photo grid) ---------------- */
function JournalEntry({ id, navigate }) {
  const entry = window.JOURNALS.find(j => j.id === id) || window.JOURNALS[0];
  const entries = window.JOURNALS;
  const idx = entries.findIndex(e => e.id === entry.id);
  const prev = entries[(idx - 1 + entries.length) % entries.length];
  const next = entries[(idx + 1) % entries.length];

  const [lightbox, setLightbox] = useStateP({ open: false, i: 0 });
  const openLightbox = (i) => setLightbox({ open: true, i });
  const closeLightbox = () => setLightbox(lb => ({ ...lb, open: false }));

  useEffectP(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightbox(lb => ({ ...lb, i: (lb.i + 1) % entry.photos.length }));
      if (e.key === 'ArrowLeft')  setLightbox(lb => ({ ...lb, i: (lb.i - 1 + entry.photos.length) % entry.photos.length }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open, entry.id]);

  return (
    <div className="page jentry">
      <button className="jback" onClick={() => navigate('journal')}>
        <span className="arr">←</span>
        <span>All entries</span>
      </button>

      <header className="jentry-head">
        <div className="jentry-meta">
          <div className="jem-row"><span className="k">№</span><span>{String(idx + 1).padStart(3, '0')} / {String(entries.length).padStart(3, '0')}</span></div>
          <div className="jem-row"><span className="k">Place</span><span>{entry.place}</span></div>
          <div className="jem-row"><span className="k">Date</span><span>{entry.date}</span></div>
          <div className="jem-row"><span className="k">Tag</span><span>{entry.tag}</span></div>
          <div className="jem-row"><span className="k">Frames</span><span>{entry.photos.length}</span></div>
        </div>
        <div className="jentry-title-wrap">
          <h1 className="jentry-title">{entry.title}</h1>
          <p className="jentry-words">{entry.words}</p>
        </div>
      </header>

      {/* Photo grid — mixed sizes, click to open lightbox */}
      <PhotoGrid photos={entry.photos} onOpen={openLightbox} />

      {/* Footer nav to prev / next entry */}
      <nav className="jentry-nav">
        <a className="jn-side" href={'#entry/' + prev.id}
           onClick={(e) => { e.preventDefault(); navigate('entry', prev.id); }}>
          <span className="arr">←</span>
          <div>
            <div className="k">Previous</div>
            <div className="t">{prev.title}</div>
          </div>
        </a>
        <a className="jn-side right" href={'#entry/' + next.id}
           onClick={(e) => { e.preventDefault(); navigate('entry', next.id); }}>
          <div>
            <div className="k">Next</div>
            <div className="t">{next.title}</div>
          </div>
          <span className="arr">→</span>
        </a>
      </nav>

      {lightbox.open && (
        <Lightbox
          photos={entry.photos}
          index={lightbox.i}
          onClose={closeLightbox}
          onPrev={() => setLightbox(lb => ({ ...lb, i: (lb.i - 1 + entry.photos.length) % entry.photos.length }))}
          onNext={() => setLightbox(lb => ({ ...lb, i: (lb.i + 1) % entry.photos.length }))}
          entry={entry}
        />
      )}
    </div>
  );
}

function PhotoGrid({ photos, onOpen }) {
  // Assign each photo a grid span based on its ratio — landscape spans 2 cols, tall photos span 2 rows, etc.
  return (
    <div className="photo-grid">
      {photos.map((p, i) => {
        const wide = p.ratio <= 0.85;      // landscape-ish (since ratio is h/w here, small = wide)
        const tall = p.ratio >= 1.35;
        const cls = 'pg-item' + (wide ? ' wide' : '') + (tall ? ' tall' : '');
        return (
          <button key={i} className={cls} onClick={() => onOpen(i)}>
            <Photo work={{ color: p.color, ratio: p.ratio }} idx={i} />
            <span className="pg-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="pg-label">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Lightbox ---------------- */
function Lightbox({ photos, index, onClose, onPrev, onNext, entry }) {
  const p = photos[index];
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
        <div className="lb-frame">
          <Photo work={{ color: p.color, ratio: p.ratio }} idx={index} />
        </div>
        <div className="lb-bar">
          <div className="lb-bar-l">
            <span className="k">{entry.title}</span>
            <span className="k">·</span>
            <span>{p.label}</span>
          </div>
          <div className="lb-bar-r">
            <span className="k">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">←</button>
      <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">→</button>
      <button className="lb-btn lb-close" onClick={onClose} aria-label="Close">close ×</button>
    </div>
  );
}

/* ---------------- Home ---------------- */
function HomePage({ navigate }) {
  const featured = window.JOURNALS.slice(0, 6);

  return (
    <div className="page home">
      <section>
        <div className="journal-head" style={{ marginTop: 0 }}>
          <div>
            <h2>Recent entries</h2>
          </div>
          <a className="count" href="#journal"
             onClick={(e) => { e.preventDefault(); navigate('journal'); }}>
            view all {String(window.JOURNALS.length).padStart(2, '0')} →
          </a>
        </div>
        <div className="jgrid">
          {featured.map((j, i) => (
            <a key={j.id} className="jcard" href={'#entry/' + j.id}
               onClick={(e) => { e.preventDefault(); navigate('entry', j.id); }}>
              <div className="jcard-frame">
                <Photo work={{ color: j.cover.color, ratio: 1.25 }} idx={i} />
                <span className="jcard-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="jcard-count">{j.photos.length} photos</span>
              </div>
              <div className="jcard-meta">
                <div className="jcard-title">{j.title}</div>
                <div className="jcard-sub">
                  <span>{j.place}</span>
                  <span>{j.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- About ---------------- */
function AboutPage() {
  return (
    <div className="page">
      <div className="prose">
        <aside>
          <h4>— Identity</h4>
          <div className="ident">
            Kumpei<br/>
            Photographer<br/>
            Tokyo, JP
          </div>
        </aside>
        <article>
          <h2>A quiet practice — mostly outdoors, usually alone, always with one camera at a time.</h2>
          <p>I keep this site as a journal more than a portfolio. Each entry is a place I went; each photo grid is what I came back with. If something here feels unfinished, that's because most of these trips are.</p>
          <p>I shoot digital for work and medium format film when I travel. I print small, edit slowly, and post only once an entry feels closed.</p>
          <p>Available for editorial, commercial, and private commissions. Based in Tokyo — happy to travel.</p>
        </article>
      </div>
    </div>
  );
}

/* ---------------- Contact ---------------- */
function ContactPage() {
  return (
    <div className="page">
      <div className="contact-wrap">
        <div className="contact-lead">
          <h2>Say <em>hello</em>.</h2>
          <p>For commissions, prints, or just to share a place you think I should photograph — email is best. I reply within a few days.</p>
        </div>
        <div className="contact-card" style={{ maxWidth: 520 }}>
          <dl>
            <dt>Email</dt>
            <dd><a href="mailto:hello@kumpei.jp">hello@kumpei.jp</a></dd>
            <dt>Instagram</dt>
            <dd><a href="https://instagram.com/k.umpei" target="_blank" rel="noreferrer">@k.umpei</a></dd>
            <dt>Based in</dt>
            <dd>Tokyo, Japan</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, JournalIndex, JournalEntry, AboutPage, ContactPage });
