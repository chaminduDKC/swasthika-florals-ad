import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './context/ToastContext'
import Layout        from './components/Layout'
import Login         from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Dashboard     from './pages/Dashboard'
import Categories    from './pages/Categories'
import Images        from './pages/Images'
import Contact       from './pages/Contact'
import Setup         from './pages/Setup'
import Emails from './pages/Emails'
import OTPVerify from './pages/OTPVerify'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div className="adm-spinner" style={{ width:32, height:32 }} />
      <span style={{ color:'var(--muted)', fontSize:'.8rem', letterSpacing:'.15em', textTransform:'uppercase' }}>Loading</span>
    </div>
  )
  return admin ? children : <Navigate to="/login" replace />  // ← /login not /setup
}

// ✅ PublicRoute — show spinner not null while loading
function PublicRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return (                          // ← show spinner not null!
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="adm-spinner" style={{ width:32, height:32 }} />
    </div>
  )
  return admin ? <Navigate to="/" replace /> : children  // ← / not /setup
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/setup" element={<PublicRoute><Setup /></PublicRoute>} />
            <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/verify-otp" element={<PublicRoute><OTPVerify /></PublicRoute>} />
            <Route path="/health" element={<PublicRoute><h1>health</h1></PublicRoute>} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index             element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="images"     element={<Images />} />
              <Route path="contact"    element={<Contact />} />
              <Route path="emails"    element={<Emails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
