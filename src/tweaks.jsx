const { useState: useStateT, useEffect: useEffectT } = React;

const ACCENTS = [
  { name: 'ember',  v: '#d4572a' },
  { name: 'ink',    v: '#1a1a1a' },
  { name: 'lake',   v: '#2a6f97' },
  { name: 'moss',   v: '#5a7a3a' },
  { name: 'plum',   v: '#7a3a6a' },
];

function TweaksPanel({ tweaks, setTweaks, visible }) {
  if (!visible) return null;

  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  return (
    <div className="tweaks">
      <h5><span>— Tweaks</span><span style={{ color: 'var(--ink-3)' }}>live</span></h5>

      <div className="row">
        <label>theme</label>
        <div className="chips">
          {['light', 'dark'].map(t => (
            <button key={t} className={`chip ${tweaks.theme === t ? 'on' : ''}`} onClick={() => set('theme', t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="row">
        <label>accent</label>
        <div className="swatches">
          {ACCENTS.map(a => (
            <button key={a.v}
              className={`sw ${tweaks.accent === a.v ? 'on' : ''}`}
              title={a.name}
              style={{ background: a.v }}
              onClick={() => set('accent', a.v)} />
          ))}
        </div>
      </div>

      <div className="row">
        <label>works</label>
        <div className="chips">
          {['masonry', 'grid', 'list'].map(l => (
            <button key={l} className={`chip ${tweaks.worksLayout === l ? 'on' : ''}`} onClick={() => set('worksLayout', l)}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
window.ACCENTS = ACCENTS;
