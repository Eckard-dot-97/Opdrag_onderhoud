import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';

export function BackpackArea() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    apiFetch('/api/backpack')
      .then(setItems)
      .catch(err => { if (err.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(id) {
    try {
      await apiFetch('/api/backpack/remove', { method: 'POST', body: JSON.stringify({ id }) });
      setFeedback('POKEMON RELEASED');
      load();
    } catch (err) { setFeedback(err.message); }
  }

  async function handleMoveToTeam(id) {
    try {
      await apiFetch('/api/team/move-from-backpack', { method: 'POST', body: JSON.stringify({ pokemon_id: id }) });
      setFeedback('POKEMON ADDED TO TEAM!');
      load();
    } catch (err) { setFeedback(err.message); }
  }

  if (loading) return <p style={{ color: '#9bbc0f', fontSize: 9 }}>&#9654; LOADING BACKPACK...</p>;

  return (
    <section>
      <div style={s.heading}>
        <div style={{ borderLeft: '4px solid #cc0000', paddingLeft: 12 }}>
          <h1 style={s.title}>BACKPACK</h1>
          <p style={s.subtitle}>{items.length} POKEMON STORED</p>
        </div>
      </div>

      {feedback && (
        <div style={s.feedback}>&#9654; {feedback}</div>
      )}

      {items.length === 0 ? (
        <div style={s.empty}>
          <p style={{ color: '#9bbc0f', fontSize: 9 }}>&#9654; BACKPACK IS EMPTY</p>
          <p style={{ color: '#555', fontSize: 8, marginTop: 8 }}>
            <span style={{ color: '#cc0000', cursor: 'pointer' }} onClick={() => navigate('/search')}>SEARCH</span> FOR POKEMON TO CATCH
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {items.map(p => {
            const types = Array.isArray(p.types) ? p.types : JSON.parse(p.types || '[]');
            return (
              <div key={p.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.dexNum}>#{String(p.pokeapi_id).padStart(3, '0')}</span>
                </div>
                <img src={p.sprite_url} alt={p.name} style={s.sprite}
                  onClick={() => navigate(`/pokemon/${p.pokeapi_id}`)} />
                <p style={s.name}>{p.name.toUpperCase()}</p>
                <div style={s.types}>
                  {types.map(t => <span key={t} style={s.badge}>{t.toUpperCase()}</span>)}
                </div>
                <button style={s.teamBtn} onClick={() => handleMoveToTeam(p.id)}>&#9658; TEAM</button>
                <button style={s.releaseBtn} onClick={() => handleRemove(p.id)}>RELEASE</button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const s = {
  heading: { marginBottom: '1.25rem' },
  title: { color: '#cc0000', fontSize: 14, letterSpacing: 3 },
  subtitle: { color: '#555', fontSize: 8, marginTop: 4 },
  feedback: { background: '#0f380f', border: '2px solid #306230', color: '#9bbc0f', fontSize: 8, padding: '8px 12px', borderRadius: 2, marginBottom: '1rem', letterSpacing: 1 },
  empty: { background: '#0f380f', border: '4px solid #306230', borderRadius: 4, padding: '2rem', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  card: { background: '#111', border: '2px solid #333', borderRadius: 4, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  cardTop: { width: '100%', display: 'flex', justifyContent: 'flex-end' },
  dexNum: { color: '#555', fontSize: 7 },
  sprite: { width: 80, height: 80, imageRendering: 'pixelated', cursor: 'pointer', background: '#0a0a0a', borderRadius: 2 },
  name: { color: '#fff', fontSize: 8, letterSpacing: 1 },
  types: { display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { background: '#222', color: '#aaa', fontSize: 6, padding: '2px 5px', borderRadius: 2 },
  teamBtn: { width: '100%', background: '#1a4a1a', border: '2px solid #306230', color: '#9bbc0f', fontSize: 7, padding: '6px 4px', borderRadius: 2, letterSpacing: 1 },
  releaseBtn: { width: '100%', background: 'transparent', border: '2px solid #440000', color: '#884444', fontSize: 7, padding: '6px 4px', borderRadius: 2, letterSpacing: 1 },
};
