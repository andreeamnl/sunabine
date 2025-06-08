"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const Register = () => {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    genre: "",
    location: "",
    bio: "",
    phone: "",
    role: "client", // Default role is client
  })

  const [step, setStep] = useState(1)
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formTouched, setFormTouched] = useState({})

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateIn(true)
    }, 100)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormTouched((prev) => ({ ...prev, [name]: true }))

    // Validate password match
    if (name === "confirmPassword" || name === "password") {
      if (name === "confirmPassword" && value !== formData.password) {
        setPasswordError("Passwords do not match")
      } else if (name === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
        setPasswordError("Passwords do not match")
      } else {
        setPasswordError("")
      }
    }

    // Clear specific error when field is changed
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateStep1 = () => {
    const errors = {}

    if (!formData.name) errors.name = "Name is required"
    if (!formData.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"

    if (!formData.password) errors.password = "Password is required"
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters"

    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match"

    if (!formData.role) errors.role = "Please select a role"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}

    // Only require genre and bio for performers
    if (formData.role === "performer") {
      if (!formData.genre) errors.genre = "Genre is required for performers"
      if (!formData.bio) errors.bio = "Bio is required for performers"
    }

    if (!formData.location) errors.location = "Location is required"
    if (!formData.phone) errors.phone = "Phone number is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
      // Scroll to top when changing steps
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    setStep(1)
    // Scroll to top when changing steps
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1) {
      handleNextStep()
      return
    }

    if (!validateStep2()) {
      return
    }

    const success = await register(formData)
    if (success) {
      navigate("/login")
    }
  }

  const getStepCompletionPercentage = () => {
    if (step === 1) {
      const fields = ["name", "email", "password", "confirmPassword", "role"]
      const filledFields = fields.filter((field) => formData[field]).length
      return Math.round((filledFields / fields.length) * 100)
    } else {
      const fields = formData.role === "performer" ? ["genre", "location", "bio", "phone"] : ["location", "phone"]
      const filledFields = fields.filter((field) => formData[field]).length
      return Math.round((filledFields / fields.length) * 100)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(var(--primary))] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[hsl(var(--secondary))] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      {/* Floating shapes */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full border-4 border-[hsl(var(--primary))] border-opacity-20 animate-float"></div>
      <div
        className="absolute bottom-1/4 right-1/3 w-6 h-6 rounded-md border-4 border-[hsl(var(--secondary))] border-opacity-20 animate-float"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-10 h-10 rounded-lg border-4 border-[hsl(var(--accent))] border-opacity-10 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
          Alătură-te SunăBine
          </h2>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Creează-ți contul și începe să rezervi artiști sau să fii rezervat pentru evenimente
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div
          className={`card p-8 shadow-lg transition-all duration-700 ${
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-[var(--radius)] flex items-center">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                Step {step} of 2: {step === 1 ? "Account Details" : "Profile Information"}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {getStepCompletionPercentage()}% complete
              </div>
            </div>
            <div className="h-2 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] transition-all duration-500"
                style={{ width: `${step === 1 ? 50 : 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step >= 1
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  1
                </div>
                <span className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Account</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-[hsl(var(--muted))]">
                <div
                  className={`h-full ${step === 1 ? "w-0" : "w-full"} bg-[hsl(var(--primary))] transition-all duration-300`}
                ></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step === 2
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  2
                </div>
                <span className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Profile</span>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className={`space-y-6 transition-all duration-500 ${step === 1 ? "opacity-100" : "opacity-0"}`}>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Full Name
                  </label>
                  <div className="relative">
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
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`input pl-10 ${formErrors.name && formTouched.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="Your name or band name"
                    />
                  </div>
                  {formErrors.name && formTouched.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Email address
                  </label>
                  <div className="relative">
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
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`input pl-10 ${formErrors.email && formTouched.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {formErrors.email && formTouched.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Password
                  </label>
                  <div className="relative">
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
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`input pl-10 pr-10 ${formErrors.password && formTouched.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {formErrors.password && formTouched.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Confirm Password
                  </label>
                  <div className="relative">
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
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input pl-10 pr-10 ${formErrors.confirmPassword && formTouched.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {formErrors.confirmPassword && formTouched.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    I want to register as
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`relative border rounded-md p-4 cursor-pointer transition-all ${
                        formData.role === "client"
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, role: "client" }))}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            formData.role === "client"
                              ? "border-[hsl(var(--primary))]"
                              : "border-[hsl(var(--muted-foreground))]"
                          }`}
                        >
                          {formData.role === "client" && (
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Client</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Book performers</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative border rounded-md p-4 cursor-pointer transition-all ${
                        formData.role === "performer"
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, role: "performer" }))}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            formData.role === "performer"
                              ? "border-[hsl(var(--primary))]"
                              : "border-[hsl(var(--muted-foreground))]"
                          }`}
                        >
                          {formData.role === "performer" && (
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Performer</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Get booked for events</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {formErrors.role && formTouched.role && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                  )}
                </div>

                <div>
                  <button type="button" onClick={handleNextStep} className="btn-primary w-full py-3 hover-glow">
                    <div className="flex items-center justify-center">
                    Continue
                      <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`space-y-6 transition-all duration-500 ${step === 2 ? "opacity-100" : "opacity-0"}`}>
                {formData.role === "performer" && (
                  <div className="space-y-2">
                    <label htmlFor="genre" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                      Genre
                    </label>
                    <div className="relative">
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
                            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                          />
                        </svg>
                      </div>
                      <select
                        id="genre"
                        name="genre"
                        required={formData.role === "performer"}
                        value={formData.genre}
                        onChange={handleChange}
                        className={`input pl-10 ${formErrors.genre && formTouched.genre ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
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
                    </div>
                    {formErrors.genre && formTouched.genre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.genre}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Location
                  </label>
                  <div className="relative">
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
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className={`input pl-10 ${formErrors.location && formTouched.location ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="City, State"
                    />
                  </div>
                  {formErrors.location && formTouched.location && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                    Phone Number
                  </label>
                  <div className="relative">
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
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input pl-10 ${formErrors.phone && formTouched.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  {formErrors.phone && formTouched.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {formData.role === "performer" && (
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        required={formData.role === "performer"}
                        value={formData.bio}
                        onChange={handleChange}
                        className={`input min-h-[120px] ${formErrors.bio && formTouched.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                        placeholder="Tell us about yourself or your band..."
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-[hsl(var(--muted-foreground))]">
                        {formData.bio.length}/500
                      </div>
                    </div>
                    {formErrors.bio && formTouched.bio && <p className="text-red-500 text-xs mt-1">{formErrors.bio}</p>}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button type="button" onClick={handlePrevStep} className="btn-outline flex-1 py-3">
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </div>
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 hover-glow">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
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
                        Registering...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Complete Registration
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">
                Ai deja un cont?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-3 px-4 border border-[hsl(var(--border))] rounded-md shadow-sm bg-[hsl(var(--card))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] hover-lift"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
