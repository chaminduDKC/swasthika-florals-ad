import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../api'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
     
  console.log('submitted')
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      console.log(form.email, form.password);
      
      await login(form.email,form.password)
      toast.success("Welcome to the dashboard");
      navigate('/')
    } catch (err) {
      console.log(err);
      
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>

      {/* Background glow */}
      <div style={{
        position:'fixed', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
        width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .5s ease' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:'2rem', color:'var(--gold-lt)', fontStyle:'italic', marginBottom:8 }}>
            Swasthika
          </div>
          <div style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--muted)' }}>
            Floral Decor · Admin
          </div>
        </div>

        {/* Card */}
        <div className="adm-card" style={{ padding:'36px 32px' }}>
          <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'1.8rem', fontWeight:400, color:'var(--cream)', marginBottom:6 }}>
            Sign In
          </h1>
          <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:28, letterSpacing:'.05em' }}>
            Enter your credentials to access the admin panel
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="adm-form-group" style={{ marginBottom:0 }}>
              <label className="adm-label">Email Address</label>
              <input
                className="adm-input" type="email" placeholder="admin@swasthikafloraldecor.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="email" required
              />
            </div>

            <div className="adm-form-group" style={{ marginBottom:0 }}>
              <label className="adm-label">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  className="adm-input" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password" required
                  style={{ paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--muted)', fontSize:'.8rem',
                  transition:'color .2s',
                }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ textAlign:'right', marginTop:-8 }}>
              <Link to="/forgot-password" style={{ fontSize:'.75rem', color:'var(--purple-lt)', letterSpacing:'.05em', transition:'color .2s' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="adm-btn adm-btn-primary" disabled={loading}
              style={{ justifyContent:'center', padding:'12px', marginTop:8, fontSize:'.82rem', letterSpacing:'.12em' }}>
              {loading ? <><div className="adm-spinner" />Signing in...</> : 'Sign In'}
            </button>
          </form>
         
        </div>

        <p style={{ textAlign:'center', marginTop:24, fontSize:'.72rem', color:'var(--muted)', letterSpacing:'.08em' }}>
          © 2026 Swasthika Floral Decor
        </p>
      </div>
    </div>
  )
}
