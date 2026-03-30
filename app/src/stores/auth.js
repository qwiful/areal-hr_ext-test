import { defineStore } from 'pinia'
import api from '@/modules/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loaded: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role_name,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials)
        this.user = response.data.user
        return true
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
        this.user = null
        this.loaded = true
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },
    async fetchUser() {
      if (this.loaded) return
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
      } catch {
        this.user = null
      } finally {
        this.loaded = true
      }
    },
    reset() {
      this.user = null
      this.loaded = false
    },
  },
})
