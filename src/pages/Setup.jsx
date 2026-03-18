import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/index.js'
import { useToast } from '../context/ToastContext'

export default function Setup() {
  const toast    = useToast()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '', confirm: '', setupKey: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone]       = useState(false)

  // Password strength checker
  const strength = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const str       = strength(form.password)
  const strColors = ['', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6']
  const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password || !form.setupKey) {
      toast.error('All fields are required')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    console.log(form.email, form.password, form.setupKey)
    try {
      await authAPI.setup({
        email:    form.email,
        password: form.password,
        setupKey: form.setupKey,
      })
      
      setDone(true)
      toast.success('Account created successfully!')
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000)

    } catch (err) {
      const msg = err.response?.data?.message || 'Setup failed'
      // Give friendly messages instead of technical ones
      if (msg.includes('already exists')) {
        toast.error('An admin account already exists. Please login instead.')
      } else if (msg.includes('Invalid setup key')) {
        toast.error('The setup key is incorrect. Please contact your developer.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeUp .5s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.2rem', color: 'var(--gold-lt)', fontStyle: 'italic', marginBottom: 8 }}>
            Swasthika
          </div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1rem', color: 'var(--cream)', marginBottom: 6 }}>
            Floral Decor
          </div>
          <div style={{ fontSize: '.65rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Admin Panel Setup
          </div>
        </div>

        {!done ? (
          <div className="adm-card" style={{ padding: '36px 32px' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌸</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--cream)', marginBottom: 8 }}>
                Welcome!
              </h1>
              <p style={{ fontSize: '.83rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                Create your admin account to start managing your website. You only need to do this <strong style={{ color: 'var(--text)' }}>once</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label">Your Email Address</label>
                <input
                  className="adm-input" type="email"
                  placeholder="yourname@gmail.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email" required
                />
              </div>

              {/* Password */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label">Choose a Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="adm-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem',
                  }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: i <= str ? strColors[str] : 'var(--border)',
                          transition: 'background .3s',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '.7rem', color: strColors[str] }}>{strLabels[str]}</div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label">Confirm Password</label>
                <input
                  className="adm-input" type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  required
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? 'var(--error)' : '' }}
                />
                {form.confirm && form.confirm !== form.password && (
                  <span style={{ fontSize: '.72rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>
                    Passwords do not match
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="adm-divider" />

              {/* Setup Key */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label">Setup Key</label>
                <input
                  className="adm-input" type="password"
                  placeholder="Enter the key provided by your developer"
                  value={form.setupKey}
                  onChange={e => setForm(p => ({ ...p, setupKey: e.target.value }))}
                  required
                />
                <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  This was provided to you by your website developer.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit" className="adm-btn adm-btn-primary"
                disabled={loading}
                style={{ justifyContent: 'center', padding: '13px', marginTop: 8, fontSize: '.82rem', letterSpacing: '.12em' }}
              >
                {loading
                  ? <><div className="adm-spinner" /> Creating Account...</>
                  : '🌸 Create My Account'
                }
              </button>

              {/* Already have account */}
              <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--muted)' }}>
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  style={{ color: 'var(--purple-lt)', cursor: 'pointer' }}
                >
                  Sign in here
                </span>
              </p>
            </form>
          </div>

        ) : (
          /* Success state */
          <div className="adm-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', color: 'var(--cream)', fontWeight: 400, marginBottom: 12 }}>
              Account Created!
            </h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 24 }}>
              Your admin account has been set up successfully.<br />
              Redirecting you to the login page...
            </p>
            <div className="adm-spinner" style={{ margin: '0 auto', width: 28, height: 28 }} />
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '.72rem', color: 'var(--muted)', letterSpacing: '.08em' }}>
          © 2026 Swasthika Floral Decor
        </p>
      </div>
    </div>
  )
}
