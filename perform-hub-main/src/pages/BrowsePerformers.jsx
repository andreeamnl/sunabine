"use client"

import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { usePerformerStore } from "../store/performerStore"

const BrowsePerformers = () => {
  const { performers, fetchPerformers, isLoading } = usePerformerStore()
  const [filters, setFilters] = useState({
    genre: "",
    location: "",
    search: "",
  })
  const [activeView, setActiveView] = useState("grid") // grid or list
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef(null)
  const [sortBy, setSortBy] = useState("name") // name, location, genre
  const [sortOrder, setSortOrder] = useState("asc") // asc or desc

  useEffect(() => {
    fetchPerformers()

    // Close filters when clicking outside
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [fetchPerformers])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      genre: "",
      location: "",
      search: "",
    })
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const filteredPerformers = performers
    .filter((performer) => {
      const matchesGenre = !filters.genre || performer.genre === filters.genre
      const matchesLocation = !filters.location || performer.location.includes(filters.location)
      const matchesSearch =
        !filters.search ||
        performer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        performer.bio.toLowerCase().includes(filters.search.toLowerCase())

      return matchesGenre && matchesLocation && matchesSearch
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "location") {
        comparison = a.location.localeCompare(b.location)
      } else if (sortBy === "genre") {
        comparison = a.genre.localeCompare(b.genre)
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

  // Get unique genres for filter
  const genres = [...new Set(performers.map((p) => p.genre).filter(Boolean))]

  // Get unique locations for filter
  const locations = [...new Set(performers.map((p) => p.location).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[hsl(var(--primary))] opacity-5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-[hsl(var(--secondary))] opacity-5 rounded-full blur-3xl -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent mb-4 md:mb-0">
              Descoperă artiștii
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">Caută prin lista noastră plină de talente – muzicieni, trupe și performeri de toate genurile.

</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <div className="badge badge-primary py-1 px-3">{filteredPerformers.length} performers found</div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline p-2 md:hidden"
            aria-label="Toggle filters"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z"
              />
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setActiveView("grid")}
              className={`p-2 rounded-md ${activeView === "grid" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"}`}
              aria-label="Grid view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setActiveView("list")}
              className={`p-2 rounded-md ${activeView === "list" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"}`}
              aria-label="List view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        ref={filtersRef}
        className={`card p-6 mb-10 transition-all duration-300 ${showFilters ? "opacity-100 scale-100" : "md:opacity-100 md:scale-100 opacity-0 scale-95 md:h-auto h-0 overflow-hidden md:overflow-visible"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filtre</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))]"
            >
              Șterge tot
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="md:hidden p-1 rounded-full hover:bg-[hsl(var(--muted))]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Caută
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="input pl-9"
                placeholder="Caută după nume sau descriere"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Gen
            </label>
            <select id="genre" name="genre" value={filters.genre} onChange={handleFilterChange} className="input">
              <option value="">Toate genurile</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Locație
            </label>
            <select
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">Toate locațiile</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Sortează după:</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSortBy("name")}
                className={`px-3 py-1 text-sm rounded-full ${sortBy === "name" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}
              >
                Nume
              </button>
              <button
                onClick={() => setSortBy("genre")}
                className={`px-3 py-1 text-sm rounded-full ${sortBy === "genre" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}
              >
                Gen
              </button>
              <button
                onClick={() => setSortBy("location")}
                className={`px-3 py-1 text-sm rounded-full ${sortBy === "location" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}
              >
                Locație
              </button>
              <button
                onClick={toggleSortOrder}
                className="p-1 rounded-full bg-[hsl(var(--muted))]"
                aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ transform: sortOrder === "desc" ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 4h13M3 8h9M3 12h5M13 12L7 6m0 0l6-6M7 6v12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--secondary))] animate-pulse delay-150"></div>
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] animate-pulse delay-300"></div>
          </div>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">„Se încarcă artiștii...</p>
        </div>
      ) : filteredPerformers.length === 0 ? (
        <div className="text-center py-20 card">
          <svg
            className="h-16 w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Nu s-au găsit interpreți</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
          Încearcă să schimbi criteriile de căutare sau revino mai târziu.
          </p>
          <button onClick={clearFilters} className="btn-primary mx-auto">
          Șterge filtrele
          </button>
        </div>
      ) : activeView === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPerformers.map((performer, index) => (
            <div key={performer._id} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Card with perspective effect */}
              <div className="relative overflow-hidden rounded-xl transform transition-all duration-500 group-hover:scale-[1.02] shadow-lg group-hover:shadow-xl">
                {/* Top section with image and gradient overlay */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                  <img
                    src={
                      performer.profileImage ||
                      `/placeholder.svg?height=400&width=600&query=musician+performing+${index}`
                    }
                    alt={performer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Floating genre badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full shadow-lg">
                      {performer.genre || "Music"}
                    </span>
                  </div>

                  {/* Name overlay at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[hsl(var(--accent))] transition-colors">
                      {performer.name}
                    </h3>
                    <div className="flex items-center text-white/80">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm">{performer.location || "Local"}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom section with content */}
                <div className="bg-white dark:bg-[hsl(var(--card))] p-5 relative">
                  {/* Decorative music icon */}
                  <div className="absolute -top-8 left-4 w-16 h-16 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-white shadow-lg transform -translate-y-1/2 group-hover:rotate-12 transition-transform">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  {/* Bio with line clamp */}
                  <div className="mt-4 pt-2">
                    <p className="text-[hsl(var(--foreground))] line-clamp-3 mb-4">
                      {performer.bio || "Professional performer available for bookings."}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-4">
                      <Link
                        to={`/performer/${performer._id}`}
                        className="px-4 py-2  text-white font-medium rounded-lg  transition-colors"
                      >
                        View Profile
                      </Link>
                      <div className="flex items-center text-[hsl(var(--muted-foreground))]">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{performer.availability?.length || 0} dates</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated border effect on hover */}
                <div className="absolute inset-0 border-2 border-transparent rounded-xl group-hover:border-[hsl(var(--primary))] transition-colors duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPerformers.map((performer, index) => (
            <div
              key={performer._id}
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-[hsl(var(--card))]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left side with image and overlay */}
                <div className="md:w-1/3 h-60 md:h-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10 md:bg-gradient-to-t"></div>
                  <img
                    src={
                      performer.profileImage ||
                      `/placeholder.svg?height=400&width=600&query=musician+performing+${index || "/placeholder.svg"}`
                    }
                    alt={performer.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />

                  {/* Mobile view name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 md:hidden">
                    <h3 className="text-2xl font-bold text-white">{performer.name}</h3>
                    <div className="flex items-center text-white/80 mt-1">
                      <span className="px-2 py-0.5 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full">
                        {performer.genre || "Music"}
                      </span>
                      <span className="ml-2 text-sm">{performer.location || "Local"}</span>
                    </div>
                  </div>

                  {/* Decorative music icon */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white z-20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right side with content */}
                <div className="p-6 md:w-2/3 md:flex md:flex-col md:justify-between">
                  {/* Desktop view header */}
                  <div className="hidden md:block mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{performer.name}</h3>
                      <span className="px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full">
                        {performer.genre || "Music"}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-[hsl(var(--muted-foreground))]">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm">{performer.location || "Local"}</span>

                      <span className="mx-2">•</span>

                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">{performer.availability?.length || 0} dates available</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 md:mt-0 text-[hsl(var(--foreground))] line-clamp-3">
                    {performer.bio || "Professional performer available for bookings."}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/performer/${performer._id}`}
                      className="px-5 py-2 bg-[hsl(var(--primary))] text-white font-medium rounded-lg hover:bg-[hsl(var(--primary-dark))] transition-colors"
                    >
                      Vezi profil
                    </Link>

                    {/* Mobile view availability */}
                    <div className="flex items-center text-[hsl(var(--muted-foreground))] md:hidden">
                      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{performer.availability?.length || 0} date</span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="hidden md:flex space-x-2">
                      <button
                        className="p-2 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground))/20] transition-colors"
                        title="Save for later"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground))/20] transition-colors"
                        title="Share profile"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowsePerformers
