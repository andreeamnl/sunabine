"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import HomePage from "./pages/HomePage"
import BrowsePerformers from "./pages/BrowsePerformers"
import PerformerProfile from "./pages/PerformerProfile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import { useAuthStore } from "./store/authStore"
import axios from "axios"

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem("token")
    console.log("App mounted, token exists:", !!token)

    // Set up axios interceptor to handle token expiration
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Authentication error detected in response")
          // Only redirect to login if we're not already on the login page
          if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            console.log("Redirecting to login page due to auth error")
            // Instead of immediate redirect, we'll let the component handle it
            checkAuth() // This will update the auth state
          }
        }
        return Promise.reject(error)
      },
    )

    checkAuth()

    return () => {
      // Remove the interceptor when the component unmounts
      axios.interceptors.response.eject(interceptor)
    }
  }, [checkAuth])

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* Add padding-top to account for fixed navbar */}
        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePerformers />} />
            <Route path="/performer/:id" element={<PerformerProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
