"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { usePerformerStore } from "../store/performerStore"
import Calendar from "../components/Calendar"
import CloudinaryUpload from "../components/CloudinaryUpload"
import TimeSlotSelector from "../components/TimeSlotSelector"
import BookingsList from "../components/BookingsList"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { updateAvailability, updateProfile, isLoading: performerLoading } = usePerformerStore()

  const [availabilityData, setAvailabilityData] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])

  const [profileData, setProfileData] = useState({
    bio: "",
    genre: "",
    location: "",
    phone: "",
    profileImage: null,
    bannerImage: null,
    media: [],
  })

  const [activeTab, setActiveTab] = useState("bookings") // Default to bookings tab
  const [mediaFiles, setMediaFiles] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [isPerformer, setIsPerformer] = useState(false)

  const tabsRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }

    if (user) {
      // Determine if user is a performer based on role
      const hasPerformerRole = user.role === "performer"
      setIsPerformer(hasPerformerRole)

      setProfileData({
        bio: user.bio || "",
        genre: user.genre || "",
        location: user.location || "",
        phone: user.phone || "",
        profileImage: user.profileImage || null,
        bannerImage: user.bannerImage || null,
        media: user.media || [],
      })

      if (user.availability) {
        // Convert old format to new format if needed
        const formattedAvailability = user.availability.map((item) => {
          if (typeof item === "string") {
            return { date: item, timeSlots: [] }
          }
          return item
        })
        setAvailabilityData(formattedAvailability)
      }
    }

    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateIn(true)
    }, 100)
  }, [user, isAuthenticated, authLoading, navigate])

  // Debug log to check availability data
  useEffect(() => {
    console.log("Current availability data:", availabilityData)
  }, [availabilityData])

  const handleDateClick = (dateString) => {
    console.log("Date clicked:", dateString)

    // Check if this date is already selected
    const existingDateIndex = availabilityData.findIndex((item) => item.date === dateString)

    if (existingDateIndex >= 0) {
      // Date exists, select it for editing
      console.log("Selecting existing date for editing:", dateString)
      setSelectedDate(dateString)
      setSelectedTimeSlots(availabilityData[existingDateIndex].timeSlots || [])
    } else {
      // Date doesn't exist, add it with empty time slots
      console.log("Adding new date:", dateString)
      setAvailabilityData((prevData) => [...prevData, { date: dateString, timeSlots: [] }])
      setSelectedDate(dateString)
      setSelectedTimeSlots([])
    }
  }

  const handleTimeSlotChange = (timeSlots) => {
    console.log("Time slots changed:", timeSlots)
    setSelectedTimeSlots(timeSlots)

    // Update the availability data with the new time slots
    if (selectedDate) {
      setAvailabilityData((prevData) =>
        prevData.map((item) => {
          if (item.date === selectedDate) {
            return { ...item, timeSlots }
          }
          return item
        }),
      )
    }
  }

  const handleRemoveDate = (dateToRemove) => {
    console.log("Removing date:", dateToRemove)
    setAvailabilityData((prevData) => prevData.filter((item) => item.date !== dateToRemove))

    if (selectedDate === dateToRemove) {
      setSelectedDate(null)
      setSelectedTimeSlots([])
    }
  }

  const handleSaveAvailability = async () => {
    console.log("Saving availability:", availabilityData)
    const success = await updateAvailability(availabilityData)
    if (success) {
      showSuccessMessage("Availability updated successfully!")
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileImageUploadSuccess = (info) => {
    setProfileData((prev) => ({
      ...prev,
      profileImage: info.secure_url,
    }))
  }

  const handleBannerImageUploadSuccess = (info) => {
    setProfileData((prev) => ({
      ...prev,
      bannerImage: info.secure_url,
    }))
  }

  const handleMediaUploadSuccess = (info) => {
    const mediaType = info.resource_type === "video" ? "video" : "image"
    const newMedia = {
      type: mediaType,
      url: info.secure_url,
      public_id: info.public_id,
    }

    setMediaFiles([...mediaFiles, newMedia])
  }

  const handleRemoveMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const handleSaveProfile = async () => {
    // Prepare profile data with media files
    const updatedProfileData = {
      ...profileData,
      media: [...profileData.media, ...mediaFiles],
    }

    const success = await updateProfile(updatedProfileData)
    if (success) {
      setMediaFiles([])
      showSuccessMessage("Profile updated successfully!")
    }
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setShowSuccessAnimation(true)
    setTimeout(() => {
      setShowSuccessAnimation(false)
      setTimeout(() => setSuccessMessage(""), 300)
    }, 3000)
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const scrollToTabs = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--secondary))] animate-pulse delay-150"></div>
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] animate-pulse delay-300"></div>
          </div>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[hsl(var(--primary))] opacity-5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-[hsl(var(--secondary))] opacity-5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute inset-0 bg-[url('/abstract-dots.png')] bg-repeat opacity-5 -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header section with user info */}
        <div
          className={`relative overflow-hidden rounded-2xl mb-10 transition-all duration-700 transform ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="h-48 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] relative">
            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-[url('/texture-overlay.png')] bg-repeat opacity-10"></div>

            {/* User info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
              <div className="mr-6">
                <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  <img
                    src={profileData.profileImage || "/placeholder.svg?height=200&width=200&query=musician+portrait"}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <div className="flex items-center mt-2">
                  {isPerformer ? (
                    <span className="badge bg-white/20 text-white backdrop-blur-sm mr-2">
                      {profileData.genre || "No genre set"}
                    </span>
                  ) : (
                    <span className="badge bg-white/20 text-white backdrop-blur-sm mr-2">Client</span>
                  )}
                  <span className="text-sm text-white/80">{profileData.location || "No location set"}</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white/10"></div>
            <div className="absolute top-10 left-10 w-12 h-12 rounded-full border-2 border-white/10"></div>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center shadow-lg transition-all duration-300 ${
              showSuccessAnimation ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-4"
            }`}
          >
            <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Dashboard stats */}
        <div
          className={`grid grid-cols-1 md:grid-cols-${isPerformer ? "4" : "3"} gap-6 mb-10 transition-all duration-700 delay-100 transform ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          {isPerformer && (
            <div className="card p-6 hover-lift">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] bg-opacity-10 flex items-center justify-center text-[#ffffff]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Available Dates</h3>
                  <p className="text-2xl font-bold">{availabilityData.length}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab("availability")
                  scrollToTabs()
                }}
                className="mt-4 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] flex items-center"
              >
                Manage availability
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--secondary))] bg-opacity-10 flex items-center justify-center text-[#ffffff]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Profile Completion</h3>
                <p className="text-2xl font-bold">
                  {(() => {
                    // Calculate profile completion percentage
                    const fields = [profileData.location, profileData.phone, profileData.profileImage]

                    // Add performer-specific fields if user is a performer
                    if (isPerformer) {
                      fields.push(
                        profileData.bio,
                        profileData.genre,
                        profileData.bannerImage,
                        profileData.media.length > 0,
                      )
                    }

                    const filledFields = fields.filter(Boolean).length
                    return `${Math.round((filledFields / fields.length) * 100)}%`
                  })()}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("profile")
                scrollToTabs()
              }}
              className="mt-4 text-sm text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-dark))] flex items-center"
            >
              Complete your profile
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div> */}

          {isPerformer && (
            <div className="card p-6 hover-lift">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent))] bg-opacity-10 flex items-center justify-center text-[#ffffff]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Media Items</h3>
                  <p className="text-2xl font-bold">{(profileData.media?.length || 0) + mediaFiles.length}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab("media")
                  scrollToTabs()
                }}
                className="mt-4 text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-dark))] flex items-center"
              >
                Manage media
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <div className="card p-6 hover-lift">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Bookings</h3>
                <p className="text-2xl font-bold">Manage</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("bookings")
                scrollToTabs()
              }}
              className="mt-4 text-sm text-green-600 hover:text-green-700 flex items-center"
            >
              View bookings
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div
          ref={tabsRef}
          className={`card overflow-hidden transition-all duration-700 delay-200 transform ${animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="border-b relative">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--border))]"></div>
            <nav className="flex overflow-x-auto">
              {isPerformer && (
                <button
                  onClick={() => setActiveTab("availability")}
                  className={`relative px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === "availability"
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Availability
                  {activeTab === "availability" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"></div>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab("profile")}
                className={`relative px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "profile"
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                Profile
                {activeTab === "profile" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"></div>
                )}
              </button>
              {isPerformer && (
                <button
                  onClick={() => setActiveTab("media")}
                  className={`relative px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === "media"
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Media
                  {activeTab === "media" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"></div>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab("bookings")}
                className={`relative px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === "bookings"
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                Bookings
                {activeTab === "bookings" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "availability" && isPerformer && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                      Setează-ți disponibilitatea
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Alege zilele și orele în care ești disponibil
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={handleSaveAvailability}
                      disabled={performerLoading}
                      className="btn-primary hover-glow"
                    >
                      {performerLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          Salvează
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card p-6 hover-lift">
                    <h3 className="text-md font-medium mb-4 inline-flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white text-xs mr-2">
                        1
                      </span>
                      Select Dates
                    </h3>
                    <Calendar
                      availableDates={availabilityData}
                      selectedDate={selectedDate}
                      onDateClick={handleDateClick}
                      selectionMode="edit"
                    />
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-4 inline-flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white text-xs mr-2">
                        2
                      </span>
                      Set Time Slots
                    </h3>
                    {selectedDate ? (
                      <div className="card p-6 hover-lift">
                        <div className="mb-4 flex items-center">
                          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] mr-2"></div>
                          <span className="font-medium">Selected Date: </span>
                          <span className="ml-2 text-[hsl(var(--muted-foreground))]">
                            {formatDateForDisplay(selectedDate)}
                          </span>
                        </div>
                        <TimeSlotSelector selectedTimeSlots={selectedTimeSlots} onChange={handleTimeSlotChange} />
                      </div>
                    ) : (
                      <div className="card p-6 flex flex-col items-center justify-center text-center h-full hover-lift">
                        <div className="relative w-24 h-24 mb-4">
                          <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-full animate-pulse-slow"></div>
                          <svg
                            className="h-24 w-24 text-[hsl(var(--muted-foreground))] relative z-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))]">
                          Select a date from the calendar to add time slots
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="text-md font-medium mb-4 inline-flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white text-xs mr-2">
                      3
                    </span>
                    Your Available Dates
                  </h3>
                  {availabilityData.length > 0 ? (
                    <div className="card divide-y">
                      {availabilityData.map((item) => (
                        <div
                          key={item.date}
                          className="p-4 flex flex-col sm:flex-row sm:items-start hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">{formatDateForDisplay(item.date)}</span>
                              <button
                                onClick={() => handleRemoveDate(item.date)}
                                className="ml-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-[hsl(var(--muted))]"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                            {item.timeSlots && item.timeSlots.length > 0 ? (
                              <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <span className="font-medium text-[hsl(var(--foreground))]">Time Slots: </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.timeSlots.map((slot, index) => (
                                    <span
                                      key={index}
                                      className="badge bg-[hsl(var(--secondary))] bg-opacity-20 text-[#ffffff]"
                                    >
                                      {slot.start.replace(/:00$/, "")} - {slot.end.replace(/:00$/, "")}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                                No time slots specified (available all day)
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDate(item.date)
                              setSelectedTimeSlots(item.timeSlots || [])
                            }}
                            className="mt-3 sm:mt-0 text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors"
                          >
                            Edit Time Slots
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-full animate-pulse-slow"></div>
                        <svg
                          className="h-24 w-24 text-[hsl(var(--muted-foreground))] relative z-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-[hsl(var(--muted-foreground))] mb-4">
                        No dates selected. Click on dates in the calendar to mark yourself as available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                      Edit Your Profile
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Update your {isPerformer ? "performer" : "user"} information that will be displayed to{" "}
                      {isPerformer ? "potential clients" : "others"}.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button onClick={handleSaveProfile} disabled={performerLoading} className="btn-primary hover-glow">
                      {performerLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          Salvează
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="card p-6 hover-lift">
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>

                    <div className="space-y-4">
                      {isPerformer && (
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium mb-2">
                            Bio
                          </label>
                          <div className="relative">
                            <textarea
                              id="bio"
                              name="bio"
                              rows={4}
                              value={profileData.bio}
                              onChange={handleProfileChange}
                              className="input min-h-[120px]"
                              placeholder="Tell clients about yourself or your band..."
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-[hsl(var(--muted-foreground))]">
                              {profileData.bio.length}/500
                            </div>
                          </div>
                        </div>
                      )}

                      {isPerformer && (
                        <div>
                          <label htmlFor="genre" className="block text-sm font-medium mb-2">
                            Genre
                          </label>
                          <div className="relative">
                            <select
                              id="genre"
                              name="genre"
                              value={profileData.genre}
                              onChange={handleProfileChange}
                              className="input pl-10"
                            >
                              <option value="">Select a genre</option>
                              <option value="Rock">Rock</option>
                              <option value="Pop">Pop</option>
                              <option value="Jazz">Jazz</option>
                              <option value="Classical">Classical</option>
                              <option value="Electronic">Electronic</option>
                              <option value="Hip Hop">Hip Hop</option>
                              <option value="R&B">R&B</option>
                              <option value="Country">Country</option>
                              <option value="Folk">Folk</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                className="h-5 w-5 text-[hsl(var(--muted-foreground))]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={profileData.location}
                            onChange={handleProfileChange}
                            className="input pl-10"
                            placeholder="City, State"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-[hsl(var(--muted-foreground))]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="input pl-10"
                            placeholder="(123) 456-7890"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-[hsl(var(--muted-foreground))]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 hover-lift">
                    <h3 className="text-lg font-medium mb-4">Profile Images</h3>

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="profileImage" className="block text-sm font-medium mb-3">
                          Profile Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[hsl(var(--primary))] bg-[hsl(var(--muted))]">
                            {profileData.profileImage ? (
                              <img
                                src={profileData.profileImage || "/placeholder.svg"}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <CloudinaryUpload resourceType="image" onUploadSuccess={handleProfileImageUploadSuccess} />
                        </div>
                        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                          Recommended: Square image, at least 300x300 pixels
                        </p>
                      </div>

                      {isPerformer && (
                        <div>
                          <label htmlFor="bannerImage" className="block text-sm font-medium mb-3">
                            Banner Image
                          </label>
                          <div className="flex flex-col space-y-4">
                            <div className="relative w-full h-32 rounded-md overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                              {profileData.bannerImage ? (
                                <img
                                  src={profileData.bannerImage || "/placeholder.svg"}
                                  alt="Banner preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <CloudinaryUpload resourceType="image" onUploadSuccess={handleBannerImageUploadSuccess} />
                          </div>
                          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                            Recommended: Wide image, at least 1200x400 pixels
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "media" && isPerformer && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                      Gestionează fișierele media
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                    Încarcă poze și videoclipuri pentru a-ți arăta spectacolele. Acestea vor apărea pe profilul tău.
              
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={handleSaveProfile}
                      disabled={performerLoading || mediaFiles.length === 0}
                      className="btn-primary hover-glow"
                    >
                      {performerLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          Salvează
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="card p-6 mb-8 hover-lift">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium mb-2">încarcă fișiere</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 md:mb-0">
                      Adaugă poze și videoclipuri cu spectacolele tale pentru a-ți arăta talentul.
                      </p>
                    </div>
                    <CloudinaryUpload
                      resourceType="auto"
                      multiple={true}
                      onUploadSuccess={handleMediaUploadSuccess}
                      className="px-6 py-3"
                    />
                  </div>

                  <div className="mt-4 p-4 bg-[hsl(var(--muted))] rounded-md">
                    <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))]">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Supported formats: JPG, PNG, GIF, MP4. Maximum file size: 10MB</span>
                    </div>
                  </div>
                </div>

                {mediaFiles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">New Media</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="relative group hover-lift">
                          <div className="h-40 rounded-md overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                            {file.type === "image" ? (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={`Media ${index}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-black relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <svg
                                  className="h-12 w-12 text-white relative z-10"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div className="absolute bottom-2 left-2 text-xs text-white">Video</div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.media && profileData.media.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Existing Media</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {profileData.media.map((media, index) => (
                        <div key={index} className="relative group hover-lift">
                          <div className="h-40 rounded-md overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                            {media.type === "image" ? (
                              <img
                                src={media.url || "/placeholder.svg"}
                                alt={`Media ${index}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-black relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <svg
                                  className="h-12 w-12 text-white relative z-10"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div className="absolute bottom-2 left-2 text-xs text-white">Video</div>
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {media.type === "image" ? "Image" : "Video"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!profileData.media || profileData.media.length === 0) && mediaFiles.length === 0 && (
                  <div className="card p-12 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-full animate-pulse-slow"></div>
                      <svg
                        className="h-24 w-24 text-[hsl(var(--muted-foreground))] relative z-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Media Yet</h3>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                    Încarcă poze și videoclipuri pentru a-ți arăta prestațiile
                    </p>
                    <CloudinaryUpload
                      resourceType="auto"
                      multiple={true}
                      onUploadSuccess={handleMediaUploadSuccess}
                      className="mx-auto px-6 py-3"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <BookingsList />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
