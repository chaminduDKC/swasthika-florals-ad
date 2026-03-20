import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

const navItems = [
  { to: '/',           label: 'Dashboard',  icon: '◈' },
  { to: '/categories', label: 'Categories', icon: '❋' },
  { to: '/images',     label: 'Images',     icon: '⊞' },
  { to: '/contact',    label: 'Contact',    icon: '◎' },
  { to: '/emails',    label: 'Email',    icon: '◈' },
]

export default function Layout() {
  const toast = useToast();


  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login'); }

  return (
    <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:1 }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--dark)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: sidebarOpen ? 0 : '-240px', bottom: 0, zIndex: 200,
        transition: 'left .35s cubic-bezier(.22,1,.36,1)',
      }}
        className="adm-sidebar "
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:'1.1rem', color:'var(--gold-lt)', fontStyle:'italic', lineHeight:1.2 }}>
            Swasthika
          </div>
          <div style={{ fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginTop:4 }}>
            Admin Panel
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding: '16px 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius)',
                fontSize: '.82rem', letterSpacing: '.08em',
                color: isActive ? 'var(--cream)' : 'var(--muted)',
                background: isActive ? 'rgba(139,92,246,.12)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--purple)' : '2px solid transparent',
                transition: 'all .25s', fontWeight: isActive ? 400 : 300,
              })}
            >
              <span style={{ fontSize:'1rem', opacity:.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:4 }}>Signed in as</div>
          <div style={{ fontSize:'.82rem', color:'var(--text)', marginBottom:12, wordBreak:'break-all' }}>{admin?.email}</div>
          <button className="adm-btn adm-btn-outline" style={{ width:'100%', justifyContent:'center', fontSize:'.75rem' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(9,8,15,.6)',
          backdropFilter:'blur(4px)', zIndex:199,
        }} />
      )}

      {/* Main */}
      <div style={{ flex:1, marginLeft:0, display:'flex', flexDirection:'column' }} className="adm-main-wrap">

        {/* Topbar */}
        <header style={{
          height: 56, background: 'rgba(15,13,26,.9)', backdropFilter:'blur(12px)',
          borderBottom: '1px solid var(--border)', display:'flex', alignItems:'center',
          padding: '0 24px', gap: 16, position:'sticky', top:0, zIndex:100,
        }}>
          <button className="adm-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background:'none', border:'none', color:'var(--text)', fontSize:'1.2rem', padding:4, display:'flex', flexDirection:'column', gap:4 }}
          >
            <span style={{ display:'block', width:20, height:1, background:'currentColor' }} />
            <span style={{ display:'block', width:14, height:1, background:'currentColor' }} />
            <span style={{ display:'block', width:20, height:1, background:'currentColor' }} />
          </button>

          <div style={{ fontFamily:'var(--ff-display)', fontSize:'1rem', color:'var(--gold-lt)', fontStyle:'italic', marginLeft:4 }}>
            Swasthika <span style={{ fontStyle:'normal', color:'var(--muted)', fontSize:'.75rem', letterSpacing:'.1em' }}>/ Admin</span>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', background:'rgba(139,92,246,.2)',
              border:'1px solid var(--border-lt)', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'.78rem', color:'var(--purple-lt)',
            }}>
              {admin?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:'28px 24px', maxWidth:1200, width:'100%', margin:'0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .adm-sidebar { left: 0 !important; }
          .adm-main-wrap { margin-left: 240px !important; }
          .adm-hamburger {
            display: none !important;
            }
        }
      `}</style>
    </div>
  )
}
