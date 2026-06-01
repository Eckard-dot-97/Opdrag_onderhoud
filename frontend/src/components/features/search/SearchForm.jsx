import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SearchForm() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div style={s.screenWrap}>
      <div style={s.screenLabel}>&#9654; SEARCH MODE — ENTER POKEMON NAME</div>
      <form onSubmit={handleSubmit} style={s.form}>
        <input
          style={s.input}
          type="search"
          placeholder="e.g. pikachu_"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        <button style={s.btn} type="submit">GO</button>
      </form>
    </div>
  );
}

const s = {
  screenWrap: { background: '#0f380f', border: '4px solid #306230', borderRadius: 4, padding: '1rem', marginBottom: '1.5rem' },
  screenLabel: { color: '#9bbc0f', fontSize: 8, marginBottom: '0.75rem', letterSpacing: 1 },
  form: { display: 'flex', gap: 8 },
  input: { flex: 1, background: '#1a4a1a', border: '2px solid #306230', color: '#9bbc0f', fontSize: 9, padding: '8px 10px', borderRadius: 2, outline: 'none' },
  btn: { background: '#cc0000', border: '2px solid #880000', color: '#fff', fontSize: 9, padding: '8px 16px', borderRadius: 2, letterSpacing: 1 },
};
