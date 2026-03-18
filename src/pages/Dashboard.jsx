import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoriesAPI, imagesAPI } from '../api'
import { useAuth } from '../hooks/useAuth'

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to} style={{ textDecoration:'none' }}>
      <div className="adm-card" style={{ cursor:'pointer', transition:'border-color .3s, transform .3s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
      >
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:'1.8rem' }}>{icon}</div>
          <div style={{ fontSize:'.6rem', letterSpacing:'.2em', textTransform:'uppercase', color, padding:'3px 8px', border:`1px solid ${color}22`, background:`${color}11`, borderRadius:20 }}>
            View All
          </div>
        </div>
        <div style={{ fontFamily:'var(--ff-display)', fontSize:'2.5rem', fontWeight:400, color:'var(--cream)', lineHeight:1, marginBottom:6 }}>
          {value ?? <div style={{ width:48, height:36, background:'var(--border)', borderRadius:4, animation:'pulse 1.5s infinite' }} />}
        </div>
        <div style={{ fontSize:'.72rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)' }}>{label}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { admin } = useAuth()
  const [stats, setStats] = useState({ categories: null, images: null, contact:null })

  useEffect(() => {
    Promise.allSettled([
      categoriesAPI.getAllMainCats(),
      imagesAPI.getAll({ limit: 1 }),
    ]).then(([cats, imgs]) => {
      console.log("cats.data");
      console.log(cats);
      console.log("imgs.data");
      console.log(imgs);
      
      setStats({
        categories: cats.status === 'fulfilled' ? cats.value.data.data.length : '—',
        images:     imgs.status === 'fulfilled' ? (imgs.value.data.data.total ?? imgs.value.data.data.length) : '—',
      })
    })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const quickActions = [
    { icon:'❋', label:'Add Category',  to:'/categories', color:'var(--purple)' },
    { icon:'⊞', label:'Upload Image',  to:'/images',     color:'var(--gold)' },
    { icon:'◎', label:'Edit Contact',  to:'/contact',    color:'var(--success)' },
    { icon:'◎', label:'Browse Emails',  to:'/emails',    color:'var(--success)' },
  ]

  return (
    <div style={{ animation:'fadeUp .4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <span style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--purple-lt)' }}>
          Dashboard
        </span>
        <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', marginTop:6, lineHeight:1.1 }}>
          {greeting}, <em style={{ fontStyle:'italic', color:'var(--gold-lt)' }}>Admin</em>
        </h1>
        <p style={{ fontSize:'.83rem', color:'var(--muted)', marginTop:8 }}>
          Here's an overview of your Swasthika Floral Decor website.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16, marginBottom:32 }}>
        <StatCard icon="❋" label="Categories"    value={stats.categories} color="var(--purple)"  to="/categories" />
        <StatCard icon="⊞" label="Total Images"  value={stats.images}     color="var(--gold)"    to="/images" />
        <StatCard icon="◎" label="Contact Info"  value="1"                color="var(--success)" to="/contact" />
        <StatCard icon="◎" label="Emails"  value="10"                color="var(--success)" to="/emails" />
      </div>

      {/* Quick Actions */}
      <div className="adm-card" style={{ marginBottom:24 }}>
        <div style={{ fontSize:'.65rem', letterSpacing:'.25em', textTransform:'uppercase', color:'var(--muted)', marginBottom:16 }}>
          Quick Actions
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} className="adm-btn adm-btn-outline" style={{ gap:8 }}>
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background:'rgba(139,92,246,.06)', border:'1px solid rgba(139,92,246,.15)',
        borderRadius:'var(--radius)', padding:'16px 20px',
        display:'flex', alignItems:'flex-start', gap:14,
      }}>
        <span style={{ fontSize:'1.1rem', flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:'.8rem', color:'var(--text)', lineHeight:1.7 }}>
            <strong style={{ color:'var(--purple-lt)' }}>Tip:</strong> All changes you make here are saved to your database and will reflect on the live website automatically. Make sure your backend API is running before making changes.
          </div>
        </div>
      </div>
    </div>
  )
}
