import { memo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export function AppLayout() {
  return (
    <>
      <StaticChrome />
      <main style={{ background: '#1a1a1a', minHeight: 'calc(100vh - 58px)', padding: '1.5rem' }}>
        <Outlet />
      </main>
      <footer style={{ background: '#880000', borderTop: '3px solid #550000', padding: '0.5rem 1.25rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#ffaaaa', fontSize: 8 }}>NATIONAL DEX MODE</span>
        <span style={{ color: '#ffaaaa', fontSize: 8 }}>POKEAPI.CO</span>
      </footer>
    </>
  );
}

const StaticChrome = memo(function StaticChrome() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  }

  return (
    <header style={s.header}>
      <nav style={s.nav}>
        <div style={s.brand}>
          <span style={s.led} />
          <span style={s.led2} />
          <span style={s.led3} />
          <span style={s.brandText}>POKÉDEX</span>
        </div>
        {isLoggedIn && (
          <div style={s.mainLinks}>
            <NavLink to="/search" style={navStyle}>[ SEARCH ]</NavLink>
            <NavLink to="/backpack" style={navStyle}>[ BACKPACK ]</NavLink>
            <NavLink to="/team" style={navStyle}>[ TEAM ]</NavLink>
          </div>
        )}
        <div style={s.authLinks}>
          {isLoggedIn ? (
            <>
              <span style={s.email}>{email}</span>
              <button style={s.logoutBtn} onClick={handleLogout}>LOGOUT</button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={navStyle}>[ LOGIN ]</NavLink>
              <NavLink to="/register" style={navStyle}>[ REGISTER ]</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
});

function navStyle({ isActive }) {
  return {
    color: isActive ? '#fff' : '#ffaaaa',
    textDecoration: 'none',
    fontSize: 9,
    borderBottom: isActive ? '2px solid #fff' : 'none',
    paddingBottom: 2,
  };
}

const s = {
  header: { background: '#cc0000', borderBottom: '4px solid #880000', padding: '0.75rem 1.25rem' },
  nav: { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  brand: { display: 'flex', alignItems: 'center', gap: 6 },
  led:  { width: 12, height: 12, borderRadius: '50%', background: '#33ff33', boxShadow: '0 0 6px #33ff33', display: 'inline-block' },
  led2: { width: 8,  height: 8,  borderRadius: '50%', background: '#ffaa00', display: 'inline-block' },
  led3: { width: 8,  height: 8,  borderRadius: '50%', background: '#ff4444', display: 'inline-block' },
  brandText: { color: '#fff', fontSize: 13, letterSpacing: 2 },
  mainLinks: { display: 'flex', gap: '1.25rem' },
  authLinks: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' },
  email: { color: '#ffcccc', fontSize: 8 },
  logoutBtn: { background: 'transparent', border: '1px solid #ffaaaa', color: '#ffaaaa', fontSize: 8, padding: '4px 10px', borderRadius: 2 },
};
