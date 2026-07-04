import { useState, useContext } from 'react';
import { PALETTE_PRESETS } from '../lib/colors';
import { FavColorsContext } from '../lib/context';

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, onChange }: Props) {
  const [custom, setCustom] = useState(color);
  const { favColors, saveFavColors } = useContext(FavColorsContext);

  function addFav(c: string) {
    if (favColors.includes(c)) return;
    saveFavColors([...favColors.slice(0, 7), c]);
  }

  return (
    <div style={{ minWidth: 180 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginBottom: 10 }}>
        {PALETTE_PRESETS.map(c => (
          <Swatch key={c} color={c} active={color === c} onClick={() => onChange(c)} />
        ))}
      </div>

      {favColors.length > 0 && (
        <div>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>favorites</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {favColors.map(c => (
              <Swatch key={c} color={c} active={color === c} onClick={() => onChange(c)} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="color"
          value={custom}
          onChange={e => { setCustom(e.target.value); onChange(e.target.value); }}
          style={{ width: 28, height: 28, padding: 1, border: 'none', borderRadius: 6, cursor: 'pointer' }}
        />
        <button
          onClick={() => addFav(custom)}
          title="Save to favorites"
          style={{ fontSize: 11, background: 'transparent', border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}
        >+ fav</button>
      </div>
    </div>
  );
}

function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: 5, background: color, cursor: 'pointer',
        border: active ? '2px solid rgba(99,102,241,0.8)' : '2px solid transparent',
        boxShadow: active ? '0 0 0 1px rgba(99,102,241,0.4)' : '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'transform 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    />
  );
}
