import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';

export function TeamArea() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    apiFetch('/api/team')
      .then(setTeam)
      .catch(err => { if (err.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleMoveToBackpack(id) {
    try {
      await apiFetch('/api/team/move-to-backpack', { method: 'POST', body: JSON.stringify({ id }) });
      setFeedback('POKEMON MOVED TO BACKPACK');
      load();
    } catch (err) { setFeedback(err.message); }
  }

  async function handleRemove(id) {
    try {
      await apiFetch('/api/team/remove', { method: 'POST', body: JSON.stringify({ id }) });
      setFeedback('POKEMON REMOVED FROM TEAM');
      load();
    } catch (err) { setFeedback(err.message); }
  }

  if (loading) return <p style={{ color: '#9bbc0f', fontSize: 9 }}>&#9654; LOADING TEAM...</p>;

  const slots = Array.from({ length: 6 }, (_, i) => team.find(p => p.slot === i + 1) || null);

  return (
    <section>
      <div style={{ borderLeft: '4px solid #cc0000', paddingLeft: 12, marginBottom: '1.25rem' }}>
        <h1 style={s.title}>BATTLE TEAM</h1>
        <p style={s.subtitle}>{team.length}/6 SLOTS FILLED</p>
      </div>

      {feedback && <div style={s.feedback}>&#9654; {feedback}</div>}

      {team.length === 0 && (
        <div style={s.emptyMsg}>
          <p style={{ color: '#9bbc0f', fontSize: 9 }}>&#9654; NO TEAM MEMBERS</p>
          <p style={{ color: '#555', fontSize: 8, marginTop: 8 }}>
            GO TO <span style={{ color: '#cc0000', cursor: 'pointer' }} onClick={() => navigate('/backpack')}>BACKPACK</span> TO BUILD YOUR TEAM
          </p>
        </div>
      )}

      <div style={s.grid}>
        {slots.map((p, i) => (
          p ? (
            <div key={p.id} style={s.card}>
              <div style={s.slotHeader}>
                <span style={s.slotNum}>SLOT {p.slot}</span>
                <span style={s.dexNum}>#{String(p.pokeapi_id).padStart(3,'0')}</span>
              </div>
              <img src={p.sprite_url} alt={p.name} style={s.sprite}
                onClick={() => navigate(`/pokemon/${p.pokeapi_id}`)} />
              <p style={s.name}>{p.name.toUpperCase()}</p>
              <div style={s.types}>
                {(Array.isArray(p.types) ? p.types : JSON.parse(p.types||'[]')).map(t => (
                  <span key={t} style={s.badge}>{t.toUpperCase()}</span>
                ))}
              </div>
              <button style={s.backBtn} onClick={() => handleMoveToBackpack(p.id)}>&#9664; BACKPACK</button>
              <button style={s.removeBtn} onClick={() => handleRemove(p.id)}>RELEASE</button>
            </div>
          ) : (
            <div key={i} style={s.emptySlot}>
              <p style={s.slotNum}>SLOT {i + 1}</p>
              <div style={s.pokeball}>
                <div style={s.pokeballTop} />
                <div style={s.pokeballLine} />
                <div style={s.pokeballBottom} />
                <div style={s.pokeballCenter} />
              </div>
              <p style={s.emptyLabel}>EMPTY</p>
            </div>
          )
        ))}
      </div>
    </section>
  );
}

const s = {
  title: { color: '#cc0000', fontSize: 14, letterSpacing: 3 },
  subtitle: { color: '#555', fontSize: 8, marginTop: 4 },
  feedback: { background: '#0f380f', border: '2px solid #306230', color: '#9bbc0f', fontSize: 8, padding: '8px 12px', borderRadius: 2, marginBottom: '1rem', letterSpacing: 1 },
  emptyMsg: { background: '#0f380f', border: '4px solid #306230', borderRadius: 4, padding: '2rem', textAlign: 'center', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  card: { background: '#111', border: '2px solid #cc0000', borderRadius: 4, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  emptySlot: { background: '#0a0a0a', border: '2px dashed #333', borderRadius: 4, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 200 },
  slotHeader: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  slotNum: { color: '#cc0000', fontSize: 7, letterSpacing: 1 },
  dexNum: { color: '#555', fontSize: 7 },
  sprite: { width: 80, height: 80, imageRendering: 'pixelated', cursor: 'pointer', background: '#0a0a0a', borderRadius: 2 },
  name: { color: '#fff', fontSize: 8, letterSpacing: 1 },
  types: { display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { background: '#222', color: '#aaa', fontSize: 6, padding: '2px 5px', borderRadius: 2 },
  backBtn: { width: '100%', background: '#1a1a3a', border: '2px solid #334', color: '#88aaff', fontSize: 7, padding: '6px 4px', borderRadius: 2, letterSpacing: 1 },
  removeBtn: { width: '100%', background: 'transparent', border: '2px solid #440000', color: '#884444', fontSize: 7, padding: '6px 4px', borderRadius: 2, letterSpacing: 1 },
  pokeball: { position: 'relative', width: 48, height: 48, margin: '0.5rem 0' },
  pokeballTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: '#333', borderRadius: '24px 24px 0 0', border: '2px solid #444', borderBottom: 'none' },
  pokeballBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: '#1a1a1a', borderRadius: '0 0 24px 24px', border: '2px solid #444', borderTop: 'none' },
  pokeballLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: '#444', transform: 'translateY(-50%)' },
  pokeballCenter: { position: 'absolute', top: '50%', left: '50%', width: 14, height: 14, background: '#222', border: '3px solid #444', borderRadius: '50%', transform: 'translate(-50%, -50%)' },
  emptyLabel: { color: '#333', fontSize: 7, letterSpacing: 2 },
};
