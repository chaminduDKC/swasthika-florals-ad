import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://swasthika-florals-backend.onrender.com/api/v1'
//const BASE_URL = 'http://localhost:3000/api/v1'

const api = axios.create({ 
  baseURL: BASE_URL, 
  withCredentials: true, // sends HttpOnly cookies automatically
})

// ── RESPONSE INTERCEPTOR ──
let isRefreshing = false
let failedQueue = []  // queue requests that came in while refreshing

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    console.log("Processing failed queue");
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response, // 2xx — pass through

  async (error) => {
    const originalRequest = error.config
   const skipRefresh = 
  originalRequest.url.includes('/auth/refresh') ||
  originalRequest.url.includes('/auth/login')

if (error.response?.status !== 401 || originalRequest._retry || skipRefresh) {
  return Promise.reject(error)
}

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => api(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    // First 401 — attempt refresh
    originalRequest._retry = true
    isRefreshing = true

    try {
      console.log("Trying to refresh")
      await api.post('/auth/refresh') // sends HttpOnly refresh cookie automatically
      processQueue(null)
      console.log("Returned")
      return api(originalRequest) // retry the original request
   } catch (refreshError) {
  processQueue(refreshError)
  // Don't redirect if already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
  return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
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
