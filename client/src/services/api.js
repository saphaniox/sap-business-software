import axios from 'axios'

// Production API from Koyeb (Never Sleeps)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encouraging-brianne-sap-tech-0570304b.koyeb.app'

console.log('API Base URL:', API_BASE_URL)

// Request queue for handling rate limits
let requestQueue = [];
let isProcessingQueue = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000 // 1 second
})

// Request interceptor with retry logic
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add cache busting timestamp to GET requests
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    }
  }
  
  // Add request ID for tracking
  config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
}, (error) => {
  console.error('Request interceptor error:', error)
  return Promise.reject(error)
})

// Response interceptor with retry logic and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url} - Status: ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    
    // Retry logic for network errors and 5xx server errors
    if (!originalRequest._retry && originalRequest.retry > 0) {
      const shouldRetry = !error.response || 
                         error.response.status >= 500 || 
                         error.code === 'ECONNABORTED' ||
                         error.code === 'ETIMEDOUT';
      
      if (shouldRetry) {
        originalRequest._retry = true;
        originalRequest.retry -= 1;
        
        // Exponential backoff
        const delay = originalRequest.retryDelay * (4 - originalRequest.retry);
        
        console.log(`Retrying request (${3 - originalRequest.retry}/3) after ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }
    
    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const isSuperAdmin = user.role === 'superadmin' || user.isSuperAdmin === true
      const isLoginUrl = error.config?.url?.includes('/login')
      const isSuperAdminUrl = error.config?.url?.includes('/superadmin')
      
      console.error('401 Authentication Error:', {
        url: error.config?.url,
        user: user.email || user.username,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin
      });
      
      // Never logout super admins - they might just need to re-authenticate
      if (isSuperAdmin) {
        console.warn('Super admin session issue detected. Token may be invalid.');
        // Don't redirect or logout super admins automatically
        return Promise.reject(error);
      }
      
      // Only logout regular users if not on login/superadmin pages
      if (!isLoginUrl && !isSuperAdminUrl) {
        console.warn('Session expired. Redirecting to login...');
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    
    // Handle forbidden errors (403) - Don't logout, just reject
    if (error.response?.status === 403) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      console.error('403 Forbidden Error:', {
        url: error.config?.url,
        user: user.email || user.username,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        message: error.response?.data?.message
      });
      
      // Don't automatically logout - let the component handle it
      return Promise.reject(error);
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const superAdminAPI = {
  login: (data) => api.post('/superadmin/login', data),
  getMe: () => api.get('/superadmin/me'),
  logout: () => api.post('/superadmin/logout'),
  getCompanies: () => api.get('/superadmin/companies'),
  getPendingCompanies: () => api.get('/superadmin/pending-companies'),
  getAllUsers: () => api.get('/superadmin/all-users'),
  approveCompany: (companyId) => api.put(`/superadmin/companies/${companyId}/approve`),
  rejectCompany: (companyId, reason) => api.put(`/superadmin/companies/${companyId}/reject`, { reason }),
  blockCompany: (companyId, reason) => api.put(`/superadmin/companies/${companyId}/block`, { reason }),
  deleteCompany: (companyId) => api.delete(`/superadmin/companies/${companyId}`),
  getCompanyProfile: (companyId) => api.get(`/superadmin/companies/${companyId}/profile`),
  getPlatformStatistics: () => api.get('/superadmin/statistics'),
  sendWelcomeEmail: (companyId) => api.post(`/superadmin/companies/${companyId}/welcome-email`),
}

export const companyAPI = {
  register: (data) => api.post('/company/register', data),
  getMyCompany: () => api.get('/company/me'),
  updateCompany: (data) => api.put('/company/me', data),
  getAllCompanies: () => api.get('/company/all'),
  getSettings: () => api.get('/company/settings'),
}

export const productsAPI = {
  create: (data) => api.post('/products', data),
  getAll: (page = 1, limit = 10, search = '') => api.get('/products', { params: { page, limit, search } }),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getDemand: () => api.get('/products/demand'),
  exportCSV: async () => {
    const response = await productsAPI.getAll(1, 10000);
    return response.data.data;
  }
}

export const customersAPI = {
  create: (data) => api.post('/customers', data),
  getAll: (page = 1, limit = 10) => api.get('/customers', { params: { page, limit } }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchase-history`),
}

export const salesAPI = {
  create: (data) => api.post('/sales', data),
  getAll: (page = 1, limit = 10) => api.get('/sales', { params: { page, limit } }),
  getById: (id) => api.get(`/sales/${id}`),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  download: async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/sales/${id}/download?token=${token}`;
    window.open(url, '_blank');
  },
  exportCSV: async () => {
    const response = await salesAPI.getAll(1, 10000);
    return response.data.data;
  }
}

export const invoicesAPI = {
  generate: (data) => api.post('/invoices/generate', data),
  getAll: (page = 1, limit = 10) => api.get('/invoices', { params: { page, limit } }),
  getById: (id) => api.get(`/invoices/${id}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  download: async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/invoices/${id}/download?token=${token}`;
    window.open(url, '_blank');
  },
  exportCSV: async () => {
    const response = await invoicesAPI.getAll(1, 10000);
    return response.data.data;
  }
}

export const reportsAPI = {
  salesSummary: () => api.get('/reports/sales-summary'),
  stockStatus: () => api.get('/reports/stock-status'),
  lowStock: () => api.get('/reports/low-stock'),
  salesTrend: () => api.get('/reports/sales-trend'),
  dailyAnalytics: () => api.get('/reports/analytics/daily'),
  periodAnalytics: (period) => api.get('/reports/analytics/period', { params: { period } }),
  profitAnalytics: (period) => api.get('/reports/profit-analytics', { params: { period } }),
  profitWeeklyBreakdown: () => api.get('/reports/profit-weekly-breakdown'),
  topProducts: () => api.get('/reports/top-products'),
  productDemand: () => api.get('/products/demand'),
}

export const usersAPI = {
  create: (data) => api.post('/users', data),
  getAll: () => api.get('/users'),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  updatePermissions: (userId, permissions) => api.put(`/users/${userId}/permissions`, { permissions }),
  delete: (userId) => api.delete(`/users/${userId}`),
  changePassword: (userId, newPassword) => api.put(`/users/${userId}/password`, { newPassword }),
  changeOwnPassword: (currentPassword, newPassword) => api.put('/users/change-password', { currentPassword, newPassword }),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProfilePicture: () => api.delete('/users/profile-picture'),
  getProfilePicture: (userId) => api.get(`/users/${userId}/profile-picture`),
}

export const returnsAPI = {
  create: (data) => api.post('/returns', data),
  getAll: (page = 1, limit = 10, status = '') => 
    api.get('/returns', { params: { page, limit, status } }),
  getById: (id) => api.get(`/returns/${id}`),
  approve: (id) => api.put(`/returns/${id}/approve`),
  reject: (id, rejection_reason) => 
    api.put(`/returns/${id}/reject`, { rejection_reason }),
  delete: (id) => api.delete(`/returns/${id}`),
}

export const backupAPI = {
  create: () => api.post('/backup/create'),
  getAll: () => api.get('/backup'),
  restore: (backup_name) => api.post('/backup/restore', { backup_name }),
  download: (backup_name) => api.get(`/backup/download/${backup_name}`, { responseType: 'blob' }),
  delete: (backup_name) => api.delete(`/backup/${backup_name}`),
}

// Announcements API
export const announcementsAPI = {
  // Super Admin endpoints
  create: (data) => api.post('/announcements', data),
  getAll: () => api.get('/announcements'),
  delete: (id) => api.delete(`/announcements/${id}`),
  
  // Company endpoints
  getCompanyAnnouncements: () => api.get('/announcements/company'),
  markAsRead: (id) => api.post(`/announcements/${id}/read`),
}

// Support Tickets API
export const supportTicketsAPI = {
  // Company endpoints
  create: (data) => api.post('/support-tickets', data),
  getCompanyTickets: (status) => api.get('/support-tickets/company', { params: { status } }),
  addMessage: (ticketId, message) => api.post(`/support-tickets/${ticketId}/message`, { message }),
  
  // Super Admin endpoints
  getAllTickets: (filters) => api.get('/support-tickets/all', { params: filters }),
  updateStatus: (ticketId, status) => api.put(`/support-tickets/${ticketId}/status`, { status }),
  addAdminMessage: (ticketId, message) => api.post(`/support-tickets/${ticketId}/admin-message`, { message }),
}

// Platform Settings API (Super Admin only)
export const platformSettingsAPI = {
  get: () => api.get('/platform-settings'),
  update: (settings) => api.put('/platform-settings', settings),
  toggleMaintenanceMode: (enabled, message) => 
    api.post('/platform-settings/maintenance-mode', { enabled, message }),
  updateFeatureFlags: (flags) => api.put('/platform-settings/feature-flags', { flags }),
  updateEmailTemplates: (templates) => api.put('/platform-settings/email-templates', { templates }),
}

// CSV Export helper
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default api
