import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://swasthika-florals-backend.onrender.com/api/v1'
//const BASE_URL =  'http://localhost:3000/api/v1'

const api = axios.create({ 
  baseURL: BASE_URL, 
  withCredentials:true, 
   
})
console.log("Through interceptor")
api.interceptors.response.use(
  
  
 response => {
    
    return response
  },

  async error => {
  const original = error.config

  console.group("🔴 API Error")
  console.log("Status:", error.response?.status)
  console.log("URL:", original?.url)
  console.log("Response data:", error.response?.data)       // ← does `expired: true` appear here?
  console.log("Already retried?", original?._retry)
  console.groupEnd()

  if (error.response?.status === 401 &&
      error.response?.data?.expired === true &&
      !original._retry) {

    original._retry = true

    try {
      console.log("🔄 Attempting token refresh...")
      const refreshResult = await api.post('/auth/refresh')
      console.log("✅ Refresh success:", refreshResult.status)
      return api(original)

    } catch (refreshError) {
      console.error("❌ Refresh failed:", refreshError.response?.status, refreshError.response?.data)
      window.location.href = '/login'
      return Promise.reject(refreshError)   // reject with refresh error, not original
    }
  }

  console.warn("⚠️ 401 but NOT retrying — expired flag?", error.response?.data?.expired)
  return Promise.reject(error)
}
)

/* ── AUTH ── */
export const authAPI = {
  login:         (data) => api.post('/auth/login', data),
  logout: ()=> api.post('/auth/logout'),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  setup:         (data) => api.post('/auth/setup', data),
  me:            ()     => api.get('/auth/me'),
  getCurrentEmailOtp:(email)=> api.get('/auth/get-current-otp',{
  params: { email }  
}),
  verifyOtp:      (data)=> api.post("/auth/verify-otp",data),
  refreshToken:() => api.post('/auth/refresh'),
}

/* ── CATEGORIES ── */
export const categoriesAPI = {
  getAllMainCats:  ()           => api.get('/categories'),
  getAllCats:  ()           => api.get('/categories/all'),
  getOne:  (id)         => api.get(`/categories/${id}`),
  create:  (data)       => api.post('/categories', data),
  update:  (id, data)   => api.put(`/categories/${id}`, data),
  delete:  (id)         => api.delete(`/categories/${id}`),
  reorder: (data)       => api.put('/categories/reorder', data),
  getEngagementCat:()=> api.get('/categories/engagement'),
    getBridalCats:()=> api.get('/categories/bridal-bouquets'),
    getOtherCats:()=> api.get('/categories/others'),
}

/* ── IMAGES ── */
export const imagesAPI = {
  getAllByCategory:   (params)      => api.get('/images', { params }),
  getAll:   ()      => api.get('/images/all-images'),
  getOne:   (id)          => api.get(`/images/${id}`),
  upload:   (formData)    => api.post('/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:   (id, data)    => api.put(`/images/${id}`, data),
  delete:   (id)          => api.delete(`/images/${id}`),
}

/* ── CONTACT ── */
export const contactAPI = {
  get:    () => api.get(`contact`),
  create:   (data) => api.post('/contact', data), // only first time
  update: (id, data) => api.put(`/contact/${id}` , data),
}

export const enquiryAPI = {
  getAll:()=> api.get("/emails/all")
}
export default api
