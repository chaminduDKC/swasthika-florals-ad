import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useToast } from '../context/ToastContext'
import { useLocation } from 'react-router-dom'


export default function ResetPassword() {
  const { state } = useLocation()
const token = state?.resetToken
const email = state?.email
  const toast                 = useToast()
  const navigate              = useNavigate()
  const [form, setForm]       = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(()=>{
    if(!state?.resetToken || !state?.email) {
      navigate('/forgot-password')
    }
  },[])
  const strength = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const pw = form.password
  const str = strength(pw)
  const strColors = ['', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6']
  const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token)              { toast.error('Invalid or missing reset token'); return }
    if (pw.length < 8)       { toast.error('Password must be at least 8 characters'); return }
    if (pw !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ resetToken: token, newPassword: pw })
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link may have expired')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, zIndex:1, position:'relative' }}>
      <div className="adm-card" style={{ textAlign:'center', padding:40, maxWidth:400 }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>⚠️</div>
        <h2 style={{ fontFamily:'var(--ff-display)', color:'var(--cream)', fontSize:'1.5rem', fontWeight:400, marginBottom:12 }}>Invalid Link</h2>
        <p style={{ color:'var(--muted)', fontSize:'.83rem', marginBottom:24 }}>This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="adm-btn adm-btn-primary" style={{ display:'inline-flex' }}>Request New Link</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .5s ease' }}>

        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:'2rem', color:'var(--gold-lt)', fontStyle:'italic', marginBottom:8 }}>Swasthika</div>
          <div style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--muted)' }}>Floral Decor · Admin</div>
        </div>

        <div className="adm-card" style={{ padding:'36px 32px' }}>
          {!done ? (
            <>
              <div style={{ fontSize:'2rem', marginBottom:16 }}>🔒</div>
              <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'1.8rem', fontWeight:400, color:'var(--cream)', marginBottom:6 }}>
                Reset Password
              </h1>
              <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:28 }}>
                Choose a strong new password for your account. {email}
              </p>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="adm-form-group" style={{ marginBottom:0 }}>
                  <label className="adm-label">New Password</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="adm-input" type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 characters" value={pw}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required style={{ paddingRight:44 }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', fontSize:'.8rem' }}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pw.length > 0 && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= str ? strColors[str] : 'var(--border)', transition:'background .3s' }} />
                        ))}
                      </div>
                      <div style={{ fontSize:'.7rem', color: strColors[str] }}>{strLabels[str]}</div>
                    </div>
                  )}
                </div>

                <div className="adm-form-group" style={{ marginBottom:0 }}>
                  <label className="adm-label">Confirm Password</label>
                  <input
                    className="adm-input" type="password"
                    placeholder="Repeat new password" value={form.confirm}
                    onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                    required
                    style={{ borderColor: form.confirm && form.confirm !== pw ? 'var(--error)' : '' }}
                  />
                  {form.confirm && form.confirm !== pw && (
                    <span style={{ fontSize:'.72rem', color:'var(--error)' }}>Passwords do not match</span>
                  )}
                </div>

                <button type="submit" className="adm-btn adm-btn-primary" disabled={loading}
                  style={{ justifyContent:'center', padding:'12px', fontSize:'.82rem', letterSpacing:'.12em', marginTop:8 }}>
                  {loading ? <><div className="adm-spinner" />Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:20 }}>✅</div>
              <h2 style={{ fontFamily:'var(--ff-display)', fontSize:'1.6rem', color:'var(--cream)', marginBottom:12, fontWeight:400 }}>Password Reset!</h2>
              <p style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.8, marginBottom:24 }}>
                Your password has been updated successfully.
              </p>
              <button className="adm-btn adm-btn-primary" style={{ margin:'0 auto', display:'flex' }} onClick={() => navigate('/login')}>
                Sign In Now
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:24 }}>
          <Link to="/login" style={{ fontSize:'.75rem', color:'var(--muted)', letterSpacing:'.08em' }}>← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
