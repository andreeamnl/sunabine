import { create } from "zustand"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

export const usePerformerStore = create((set, get) => ({
  performers: [],
  currentPerformer: null,
  isLoading: false,
  error: null,

  fetchPerformers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/performers`)
      // Filter to only include users with role "performer"
      const performersOnly = response.data.filter((user) => user.role === "performer")
      set({ performers: performersOnly, isLoading: false })
    } catch (error) {
      console.error("Error fetching performers:", error)
      set({
        error: error.response?.data?.message || "Failed to fetch performers",
        isLoading: false,
      })
    }
  },

  fetchPerformerById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/api/performers/${id}`)
      console.log("Fetched performer data:", response.data)
      set({ currentPerformer: response.data, isLoading: false })
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch performer",
        isLoading: false,
      })
      console.error("Error fetching performer by ID:", error)
    }
  },

  updateAvailability: async (dates) => {
    set({ isLoading: true, error: null })
    try {
      console.log("Updating availability with data:", dates)
      const response = await axios.post(
        `${API_URL}/api/performers/availability`,
        { dates },
        { withCredentials: true },
      )

      // Update the current performer in the store if it exists
      const currentPerformer = get().currentPerformer
      if (currentPerformer) {
        set({
          currentPerformer: {
            ...currentPerformer,
            availability: dates,
          },
        })
      }

      set({ isLoading: false })
      return true
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update availability",
        isLoading: false,
      })
      console.error("Error updating availability:", error)
      return false
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    try {
      // Use a direct JSON payload instead of FormData since we're using Cloudinary
      const response = await axios.put(`${API_URL}/api/performers/profile`, profileData, {
        withCredentials: true,
      })

      // Update the current performer in the store
      set({
        currentPerformer: response.data.user,
        isLoading: false,
      })

      return true
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update profile",
        isLoading: false,
      })
      console.error("Error updating profile:", error)
      return false
    }
  },
}))
