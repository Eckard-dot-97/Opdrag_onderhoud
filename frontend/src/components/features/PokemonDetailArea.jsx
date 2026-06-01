import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';

export function PokemonDetailArea() {
  const { pokeapiId } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/pokemon/${pokeapiId}`),
      apiFetch(`/api/pokemon/${pokeapiId}/evolution`),
    ])
      .then(([p, evo]) => { setPokemon(p); setEvolution(evo); })
      .catch(err => { if (err.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  }, [pokeapiId]);

  async function handleAdd() {
    try {
      await apiFetch('/api/backpack', { method: 'POST', body: JSON.stringify({ pokemon_id: pokemon.id }) });
      setAdded(true);
    } catch (err) { alert(err.message || 'Could not add Pokemon'); }
  }

  if (loading) return <p style={{ color: '#9bbc0f', fontSize: 9 }}>&#9654; LOADING POKEMON DATA...</p>;
  if (!pokemon) return <p style={{ color: '#ff6666', fontSize: 9 }}>&#9888; POKEMON NOT FOUND</p>;

  const types = Array.isArray(pokemon.types) ? pokemon.types : JSON.parse(pokemon.types || '[]');
  const stats = typeof pokemon.stats === 'object' ? pokemon.stats : JSON.parse(pokemon.stats || '{}');

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate(-1)}>&#9664; BACK</button>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.dexNum}>#{String(pokemon.pokeapi_id).padStart(3, '0')}</span>
          <span style={s.name}>{pokemon.name.toUpperCase()}</span>
          <div style={s.types}>
            {types.map(t => <span key={t} style={s.badge}>{t.toUpperCase()}</span>)}
          </div>
        </div>

        <div style={s.cardBody}>
          <div style={s.spriteWrap}>
            <img src={pokemon.sprite_url} alt={pokemon.name} style={s.sprite} />
          </div>
          <div style={s.statsWrap}>
            <p style={s.statsTitle}>BASE STATS</p>
            {Object.entries(stats).map(([stat, val]) => (
              <div key={stat} style={s.statRow}>
                <span style={s.statName}>{stat.toUpperCase().slice(0, 7)}</span>
                <div style={s.barBg}>
                  <div style={{ ...s.bar, width: `${Math.min(val, 150) / 150 * 100}%`, background: val > 80 ? '#33cc33' : val > 50 ? '#cc0000' : '#884400' }} />
                </div>
                <span style={s.statVal}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          style={{ ...s.addBtn, background: added ? '#333' : '#cc0000', borderColor: added ? '#555' : '#880000' }}
          onClick={handleAdd}
          disabled={added}
        >
          {added ? '&#10003; IN BACKPACK' : '+ ADD TO BACKPACK'}
        </button>
      </div>

      {evolution.length > 0 && (
        <div style={s.evoCard}>
          <p style={s.evoTitle}>&#9654; EVOLUTION CHAIN</p>
          <div style={s.evoChain}>
            {evolution.map((e, i) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: '#555', fontSize: 12 }}>&#9658;</span>}
                <span style={{
                  ...s.evoBadge,
                  background: e.owned ? '#1a4a1a' : '#1a1a1a',
                  border: `2px solid ${e.owned ? '#33cc33' : '#444'}`,
                  color: e.owned ? '#33cc33' : '#666',
                }}>
                  {e.name.toUpperCase()}{e.owned ? ' ✓' : ''}
                </span>
              </div>
            ))}
          </div>
          <p style={{ color: '#444', fontSize: 7, marginTop: 8 }}>GREEN = IN YOUR COLLECTION</p>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: 640, margin: '0 auto' },
  back: { background: 'transparent', border: '2px solid #444', color: '#888', fontSize: 8, padding: '6px 12px', borderRadius: 2, marginBottom: '1rem', letterSpacing: 1 },
  card: { background: '#111', border: '3px solid #cc0000', borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' },
  cardHeader: { background: '#cc0000', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  dexNum: { color: '#ffaaaa', fontSize: 8 },
  name: { color: '#fff', fontSize: 13, letterSpacing: 2, flex: 1 },
  types: { display: 'flex', gap: 6 },
  badge: { background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 7, padding: '3px 8px', borderRadius: 2, letterSpacing: 1 },
  cardBody: { display: 'flex', gap: '1rem', padding: '1rem', flexWrap: 'wrap' },
  spriteWrap: { background: '#0a0a0a', border: '2px solid #222', borderRadius: 4, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sprite: { width: 120, height: 120, imageRendering: 'pixelated' },
  statsWrap: { flex: 1, minWidth: 200 },
  statsTitle: { color: '#cc0000', fontSize: 8, letterSpacing: 2, marginBottom: '0.75rem' },
  statRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  statName: { color: '#666', fontSize: 6, width: 52, textAlign: 'right' },
  barBg: { flex: 1, height: 6, background: '#222', borderRadius: 2, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 2 },
  statVal: { color: '#aaa', fontSize: 7, width: 24 },
  addBtn: { display: 'block', width: '100%', border: '2px solid #880000', color: '#fff', fontSize: 9, padding: '12px', borderRadius: 0, letterSpacing: 2 },
  evoCard: { background: '#111', border: '2px solid #333', borderRadius: 4, padding: '1rem' },
  evoTitle: { color: '#9bbc0f', fontSize: 8, letterSpacing: 2, marginBottom: '0.75rem' },
  evoChain: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  evoBadge: { fontSize: 7, padding: '6px 10px', borderRadius: 2, letterSpacing: 1 },
};
