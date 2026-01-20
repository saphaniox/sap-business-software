import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  setAuth: (user, token) => {
    console.log('🔐 setAuth called:', {
      username: user.username || user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      hasToken: !!token,
      tokenLength: token?.length
    });
    
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
    
    // Verify storage immediately
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    console.log('✅ Storage verified:', {
      userStored: !!storedUser,
      tokenStored: !!storedToken,
      roleStored: storedUser?.role
    });
  },
  
  setUser: (user) => {
    console.log('👤 setUser called:', user);
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  
  logout: () => {
    console.log('🚪 logout called');
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))
