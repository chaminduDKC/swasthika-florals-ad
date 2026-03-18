import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
  const navigateTo = useNavigate();
  const toast = useToast()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!email) { toast.error('Please enter your email'); return }
  setLoading(true)
  try {
    await authAPI.forgotPassword({ email })
    toast.success('OTP sent to your email!')
    navigateTo('/verify-otp', { state: { email } })  // ← navigate immediately
  } catch (err) {
    toast.error(err.response?.data?.message || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .5s ease' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--ff-display)', fontSize:'2rem', color:'var(--gold-lt)', fontStyle:'italic', marginBottom:8 }}>Swasthika</div>
          <div style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--muted)' }}>Floral Decor · Admin</div>
        </div>

        <div className="adm-card" style={{ padding:'36px 32px' }}>
          {!sent ? (
            <>
              <div style={{ fontSize:'2rem', marginBottom:16 }}>🔑</div>
              <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'1.8rem', fontWeight:400, color:'var(--cream)', marginBottom:6 }}>
                Forgot Password
              </h1>
              <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:28, lineHeight:1.7 }}>
                Enter your admin email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="adm-form-group" style={{ marginBottom:0 }}>
                  <label className="adm-label">Email Address</label>
                  <input
                    className="adm-input" type="email"
                    placeholder="admin@swasthikafloraldecor.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={loading}
                  style={{ justifyContent:'center', padding:'12px', fontSize:'.82rem', letterSpacing:'.12em' }}>
                  {loading ? <><div className="adm-spinner" />Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:20 }}>📧</div>
              <h2 style={{ fontFamily:'var(--ff-display)', fontSize:'1.6rem', color:'var(--cream)', marginBottom:12, fontWeight:400 }}>
                Check Your Email
              </h2>
              <p style={{ fontSize:'.83rem', color:'var(--muted)', lineHeight:1.8, marginBottom:24 }}>
                We've sent a password reset link to<br />
                <span style={{ color:'var(--purple-lt)' }}>{email}</span>
              </p>
              <p style={{ fontSize:'.75rem', color:'var(--muted)', lineHeight:1.7 }}>
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} style={{ background:'none', border:'none', color:'var(--purple-lt)', cursor:'pointer', fontSize:'.75rem' }}>
                  try again
                </button>
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:24 }}>
          <Link to="/login" style={{ fontSize:'.75rem', color:'var(--muted)', letterSpacing:'.08em', transition:'color .2s' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
