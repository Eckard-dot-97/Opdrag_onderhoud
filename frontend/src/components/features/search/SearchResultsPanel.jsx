import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../api/client.js';

export function SearchResultsPanel({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) { setResults([]); return; }
    setLoading(true);
    setError('');
    apiFetch(`/api/pokemon/search?q=${encodeURIComponent(query)}`)
      .then(data => setResults(data))
      .catch(err => {
        if (err.status === 401) navigate('/login');
        else setError('SEARCH ERROR — TRY AGAIN');
      })
      .finally(() => setLoading(false));
  }, [query]);

  async function handleAdd(pokemon) {
    try {
      await apiFetch('/api/backpack', {
        method: 'POST',
        body: JSON.stringify({ pokemon_id: pokemon.id }),
      });
      setAddedIds(prev => new Set([...prev, pokemon.id]));
    } catch (err) {
      alert(err.message || 'Could not add Pokemon');
    }
  }

  if (!query) return <p style={s.hint}>&#9654; AWAITING INPUT...</p>;
  if (loading)  return <p style={s.hint}>&#9654; SCANNING DATABASE...</p>;
  if (error)    return <p style={s.error}>&#9888; {error}</p>;
  if (results.length === 0) return <p style={s.hint}>&#9888; NO DATA FOR "{query.toUpperCase()}"</p>;

  return (
    <>
      <p style={s.count}>&#9654; {results.length} POKEMON FOUND</p>
      <div style={s.grid}>
        {results.map(p => {
          const types = Array.isArray(p.types) ? p.types : JSON.parse(p.types || '[]');
          return (
            <div key={p.id} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.dexNum}>#{String(p.pokeapi_id).padStart(3, '0')}</span>
              </div>
              <img
                src={p.sprite_url}
                alt={p.name}
                style={s.sprite}
                onClick={() => navigate(`/pokemon/${p.pokeapi_id}`)}
              />
              <p style={s.name}>{p.name.toUpperCase()}</p>
              <div style={s.types}>
                {types.map(t => (
                  <span key={t} style={{ ...s.badge, background: typeColor(t) }}>{t.toUpperCase()}</span>
                ))}
              </div>
              <button
                style={{ ...s.btn, background: addedIds.has(p.id) ? '#333' : '#cc0000', borderColor: addedIds.has(p.id) ? '#555' : '#880000' }}
                onClick={() => handleAdd(p)}
                disabled={addedIds.has(p.id)}
              >
                {addedIds.has(p.id) ? '&#10003; CAUGHT' : '+ BACKPACK'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function typeColor(type) {
  const c = { fire:'#f08030',water:'#6890f0',grass:'#78c850',electric:'#b8a000',psychic:'#f85888',ice:'#98d8d8',dragon:'#7038f8',dark:'#705848',fairy:'#ee99ac',normal:'#6a6a5a',fighting:'#c03028',flying:'#a890f0',poison:'#a040a0',ground:'#e0c068',rock:'#b8a038',bug:'#a8b820',ghost:'#705898',steel:'#b8b8d0' };
  return c[type] || '#555';
}

const s = {
  hint:  { color: '#9bbc0f', fontSize: 9, background: '#0f380f', border: '2px solid #306230', padding: '10px 14px', borderRadius: 2 },
  error: { color: '#ff6666', fontSize: 9, background: '#1a0000', border: '2px solid #cc0000', padding: '10px 14px', borderRadius: 2 },
  count: { color: '#9bbc0f', fontSize: 8, marginBottom: '0.75rem' },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  card:  { background: '#111', border: '2px solid #333', borderRadius: 4, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'border-color 0.2s' },
  cardTop: { width: '100%', display: 'flex', justifyContent: 'flex-end' },
  dexNum: { color: '#555', fontSize: 7 },
  sprite: { width: 80, height: 80, imageRendering: 'pixelated', cursor: 'pointer', background: '#0a0a0a', borderRadius: 2 },
  name:  { color: '#fff', fontSize: 8, letterSpacing: 1, textAlign: 'center' },
  types: { display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { color: '#fff', fontSize: 6, padding: '2px 6px', borderRadius: 2, letterSpacing: 1 },
  btn:   { width: '100%', border: '2px solid #880000', color: '#fff', fontSize: 7, padding: '6px 4px', borderRadius: 2, letterSpacing: 1, marginTop: 2 },
};
