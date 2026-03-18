import { createContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
 
  const [admin, setAdmin]     = useState(null)
  const [loading, setLoading] = useState(true)  // ← true until we verify token

  // ── Check if already logged in on page load/refresh ──
  useEffect(() => {
    authAPI.me()
      .then(res => setAdmin(res.data.admin))  // ← valid cookie → set admin
      .catch(() => setAdmin(null))            // ← no cookie or expired → null
      .finally(() => setLoading(false))       // ← done checking
  }, [])

  // ── Login ──
  const login = async (email, password) => {
    try {
      console.log("Coming");
      
      const res = await authAPI.login({ email, password })
      setAdmin(res.data.admin)  // ← no localStorage! cookie set by backend
      return res.data
    } catch (err) {
      console.log("failed");
      throw err  // ← re-throw so Login.jsx can show error message
    }
  }

  // ── Logout ──
  const logout = async () => {
    try {
      await authAPI.logout()  // ← tells backend to blacklist token + clear cookie
    } catch {
      // Even if request fails, clear frontend state
    } finally {
      setAdmin(null)           // ← clear admin state
    }
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, setAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}