import axios from 'axios'

//  const BASE_URL = import.meta.env.VITE_API_URL || 'https://swasthika-florals-backend.onrender.com/api/v1'
const BASE_URL =  'http://localhost:3000/api/v1/'

const api = axios.create({ 
  baseURL: BASE_URL, 
  withCredentials:true, 
   
})
console.log("Through interceptor")
api.interceptors.response.use(
  
  
 response => {
    console.log('Response received:', response.config.url, response.status)  // ← runs on every success
    return response
  },

  async error => {
    console.log('full error data:', error.response?.data)  // ← add this
  console.log('expired flag:', error.response?.data?.expired)
    console.log('Error intercepted:', error.response?.status, error.config?.url)  // ← runs on every error
    
    const original = error.config

    

    // If 401 expired and not already retried
    if (error.response?.status    === 401 &&
        error.response?.data?.expired === true &&
        !original._retry) {

      original._retry = true  // ← prevent infinite retry loop

      try {
        console.log("trying to refresh");
        
        // Try to refresh tokens
        await api.post('/auth/refresh')
        alert("refreshed")

        // Retry original request — new cookie already set
        return api(original)

      } catch {
        // Refresh failed → force logout
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

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
  verifyOtp:      (data)=> api.post("/auth/verify-otp",data)
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
