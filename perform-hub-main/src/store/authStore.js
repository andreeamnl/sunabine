import { create } from "zustand"
import axios from "axios"

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        { email, password },
        {
          withCredentials: true,
        },
      )

      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        // Set default authorization header for all future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      }

      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ error: error.response?.data?.message || "Login failed", isLoading: false })
      return false
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post("http://localhost:8000/api/auth/register", userData)
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ error: error.response?.data?.message || "Registration failed", isLoading: false })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      )

      // Remove token from localStorage
      localStorage.removeItem("token")
      // Remove default authorization header
      delete axios.defaults.headers.common["Authorization"]

      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || "Logout failed", isLoading: false })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      // Set default authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      const response = await axios.get("http://localhost:8000/api/auth/me", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.error("Auth check error:", error)
      // Only remove token if it's an authentication error (401 or 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token") // Clear invalid token
      }
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
