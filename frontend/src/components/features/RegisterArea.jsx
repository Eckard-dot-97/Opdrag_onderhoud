import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../api/client.js';

export function RegisterArea() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be 6+ characters');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      navigate('/search');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.outer}>
      <div style={s.card}>
        <div style={s.screenBar}>&#9654; NEW TRAINER REGISTRATION</div>
        <div style={s.screen}>
          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>EMAIL ADDRESS</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            <label style={s.label}>PASSWORD</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <label style={s.label}>CONFIRM PASSWORD</label>
            <input style={s.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            {error && <p style={s.error}>&#9888; {error}</p>}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'LOADING...' : 'REGISTER'}
            </button>
          </form>
          <p style={s.link}>Already registered? <Link to="/login" style={{ color: '#9bbc0f' }}>LOGIN</Link></p>
        </div>
        <div style={s.bottomBar} />
      </div>
    </div>
  );
}

const s = {
  outer: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 1rem' },
  card: { width: '100%', maxWidth: 380, border: '4px solid #cc0000', borderRadius: 8, overflow: 'hidden', background: '#111' },
  screenBar: { background: '#306230', color: '#9bbc0f', fontSize: 9, padding: '6px 12px', borderBottom: '2px solid #0f380f' },
  screen: { background: '#0f380f', padding: '1.5rem', borderBottom: '2px solid #306230' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { color: '#9bbc0f', fontSize: 8, letterSpacing: 1 },
  input: { background: '#1a4a1a', border: '2px solid #306230', color: '#9bbc0f', fontSize: 9, padding: '8px 10px', borderRadius: 2, outline: 'none', width: '100%' },
  btn: { marginTop: '0.5rem', background: '#cc0000', border: '2px solid #880000', color: '#fff', fontSize: 9, padding: '10px', borderRadius: 2, letterSpacing: 1 },
  error: { color: '#ff6666', fontSize: 8 },
  link: { marginTop: '1rem', color: '#6a9a6a', fontSize: 8, textAlign: 'center' },
  bottomBar: { height: 8, background: '#cc0000' },
};
