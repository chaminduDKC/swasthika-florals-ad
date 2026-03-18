import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../api'






export default function OTPVerify() {
  const {state} = useLocation();
  const  email    = state?.email;
  const navigate    = useNavigate()
  const decodedEmail = decodeURIComponent(email)

  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [shake, setShake]     = useState(false)

  const inputRefs = useRef([])


  // Countdown timer for resend
  useEffect(() => {
   
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

useEffect(() => {
  if (!email) navigate('/forgot-password')
}, [])
  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // Handle single digit input
  const handleChange = (index, value) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    // Auto advance to next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto submit when all filled
    if (digit && index === 5) {
      const fullOtp = [...newOtp].join('')
      if (fullOtp.length === 6) handleVerify(fullOtp)
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Go back to previous
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  // Handle paste — auto fill all boxes
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newOtp = ['', '', '', '', '', '']
    pasted.split('').forEach((digit, i) => { newOtp[i] = digit })
    setOtp(newOtp)
    setError('')

    // Focus last filled or last box
    const lastIndex = Math.min(pasted.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()

    // Auto submit if 6 digits pasted
    if (pasted.length === 6) handleVerify(pasted)
  }

  // Verify OTP
 const handleVerify = async (code) => {
  const otpCode = code || otp.join('')
  if (otpCode.length < 6) { setError('Please enter all 6 digits'); return }

  setLoading(true)
  setError('')
  try {
    // ✅ Backend verifies — trust the response
    const res = await authAPI.verifyOtp({ otp: otpCode, email })
    
    // ← pass resetToken from backend to ResetPassword page
    console.log(res.data.resetToken);
    
    navigate('/reset-password', { 
      state: { 
        email, 
        resetToken: res.data.resetToken  // ← from backend
      } 
    })
  } catch (err) {
    const msg = err.response?.data?.message || 'Invalid or expired OTP'
    setError(msg)
    triggerShake()
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  } finally {
    setLoading(false)
  }
}

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    setError('')
    try {
      await authAPI.forgotPassword({ email: decodedEmail })
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      setError('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const filledCount = otp.filter(d => d).length

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--ff-body)',
    }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        @keyframes spin     { to { transform:rotate(360deg); } }

        .otp-input {
          width: 52px; height: 64px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--cream);
          font-family: var(--ff-display);
          font-size: 1.8rem; font-weight: 400;
          text-align: center;
          outline: none;
          transition: all 0.2s cubic-bezier(.22,1,.36,1);
          caret-color: var(--purple);
          -webkit-tap-highlight-color: transparent;
        }
        .otp-input:focus {
          border-color: var(--purple);
          background: rgba(139,92,246,.08);
          box-shadow: 0 0 0 3px rgba(139,92,246,.15);
          transform: translateY(-2px);
        }
        .otp-input.filled {
          border-color: rgba(139,92,246,.4);
          color: var(--purple-lt);
        }
        .otp-input.error {
          border-color: rgba(239,68,68,.5) !important;
          background: rgba(239,68,68,.05) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,.1) !important;
        }
        .otp-wrap { display:flex; gap:10px; justify-content:center; }
        .otp-wrap.shake { animation: shake .5s ease; }

        @media (max-width: 400px) {
          .otp-input { width: 42px; height: 54px; font-size: 1.4rem; }
          .otp-wrap  { gap: 7px; }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeUp .5s ease',
      }}>

        {/* ── Card ── */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 'clamp(32px, 6vw, 48px)',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Purple glow top */}
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 120,
            background: 'radial-gradient(ellipse, rgba(139,92,246,.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── Icon ── */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(139,92,246,.12)',
                border: '1px solid rgba(139,92,246,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--purple-lt)" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              {/* Pulse ring */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1px solid rgba(139,92,246,.3)',
                animation: 'pulse-ring 2s ease infinite',
              }} />
            </div>
          </div>

          {/* ── Title ── */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '.62rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purple-lt)' }}>
              Verification
            </span>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 400, color: 'var(--cream)',
              lineHeight: 1.1, marginTop: 6, marginBottom: 0,
            }}>
              Check your email
            </h1>
          </div>

          {/* ── Subtitle with email ── */}
          <p style={{
            textAlign: 'center', fontSize: '.82rem',
            color: 'var(--muted)', lineHeight: 1.7,
            marginBottom: 32,
          }}>
            We sent a 6-digit code to{' '}
            <span style={{
              color: 'var(--purple-lt)',
              background: 'rgba(139,92,246,.1)',
              padding: '2px 8px', borderRadius: 4,
              fontWeight: 400,
            }}>
              {email}
            </span>
          </p>

          {/* ── OTP Inputs ── */}
          <div
            className={`otp-wrap${shake ? ' shake' : ''}`}
            style={{ marginBottom: 24 }}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                className={`otp-input${digit ? ' filled' : ''}${error ? ' error' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            height: 2, background: 'var(--border)',
            borderRadius: 2, marginBottom: 24, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(to right, var(--purple-dk), var(--purple-lt))',
              width: `${(filledCount / 6) * 100}%`,
              transition: 'width .2s cubic-bezier(.22,1,.36,1)',
            }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              textAlign: 'center', fontSize: '.78rem',
              color: 'var(--error)', marginBottom: 16,
              background: 'rgba(239,68,68,.06)',
              border: '1px solid rgba(239,68,68,.15)',
              borderRadius: 'var(--radius)', padding: '8px 12px',
              animation: 'fadeUp .2s ease',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || filledCount < 6}
            style={{
              width: '100%', padding: '13px',
              background: filledCount === 6
                ? 'linear-gradient(135deg, var(--purple-dk), var(--purple))'
                : 'rgba(139,92,246,.1)',
              border: `1px solid ${filledCount === 6 ? 'transparent' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              color: filledCount === 6 ? '#fff' : 'var(--muted)',
              fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase',
              fontFamily: 'var(--ff-body)',
              transition: 'all .3s cubic-bezier(.22,1,.36,1)',
              cursor: filledCount === 6 ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.3)',
                  borderTopColor: '#fff',
                  animation: 'spin .7s linear infinite',
                }} />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '20px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: '.1em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Resend */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
              Didn't receive it?{' '}
            </span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '.78rem', fontFamily: 'var(--ff-body)',
                color: countdown > 0 ? 'var(--muted)' : 'var(--purple-lt)',
                cursor: countdown > 0 ? 'default' : 'pointer',
                transition: 'color .2s',
              }}
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '.75rem', color: 'var(--muted)',
                fontFamily: 'var(--ff-body)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Login
            </button>
          </div>

        </div>

        {/* Bottom hint */}
        <p style={{
          textAlign: 'center', marginTop: 16,
          fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.6,
        }}>
          Check your spam folder if you don't see it.
        </p>

      </div>
    </div>
  )
}
