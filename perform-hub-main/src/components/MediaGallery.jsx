"use client"

import { useState, useEffect } from "react"

const MediaGallery = ({ media = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    // Auto-advance slides every 5 seconds if there are multiple items
    if (media.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [activeIndex, media.length])

  if (!media || media.length === 0) {
    return (
      <div className="text-center p-8 bg-[hsl(var(--muted))] rounded-[var(--radius)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-5"></div>
        <svg
          className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4 relative z-10"
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
        <p className="text-[hsl(var(--muted-foreground))] relative z-10">No media available</p>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[hsl(var(--primary))] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[hsl(var(--secondary))] opacity-20"></div>
      </div>
    )
  }

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNext()
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      handlePrev()
    }
  }

  const activeMedia = media[activeIndex]

  return (
    <div className="media-gallery">
      <div
        className="relative rounded-[var(--radius)] overflow-hidden shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="aspect-w-16 aspect-h-9 bg-[hsl(var(--muted))] overflow-hidden">
          {activeMedia.type === "image" ? (
            <img
              src={activeMedia.url || "/placeholder.svg"}
              alt="Media"
              className={`w-full h-full object-cover transition-all duration-500 ${isTransitioning ? "opacity-50 scale-105" : "opacity-100 scale-100"}`}
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              <video
                src={activeMedia.url}
                controls
                className="w-full h-full object-contain"
                poster="/abstract-thumbnail.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          )}
        </div>

        {media.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="glass text-white rounded-full p-2 ml-3 hover:bg-white/30 transition-colors transform hover:scale-110"
              aria-label="Previous"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="glass text-white rounded-full p-2 mr-3 hover:bg-white/30 transition-colors transform hover:scale-110"
              aria-label="Next"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Slide indicator */}
        {media.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-16 rounded-md overflow-hidden transition-all ${
                index === activeIndex
                  ? "ring-2 ring-[hsl(var(--primary))] scale-105 shadow-md"
                  : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-[hsl(var(--primary))]"
              }`}
            >
              {item.type === "image" ? (
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={`Thumbnail ${index}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaGallery
