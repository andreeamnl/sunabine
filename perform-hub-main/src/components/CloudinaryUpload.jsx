"use client"

import { useEffect, useRef, useState } from "react"

const CloudinaryUpload = ({ onUploadSuccess, resourceType = "auto", multiple = false, className = "" }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const cloudinaryWidget = useRef(null)

  useEffect(() => {
    // Check if the Cloudinary script is already loaded
    if (!document.getElementById("cloudinary-widget-script")) {
      const script = document.createElement("script")
      script.id = "cloudinary-widget-script"
      script.src = "https://upload-widget.cloudinary.com/global/all.js"
      script.async = true
      script.onload = () => setIsScriptLoaded(true)
      document.body.appendChild(script)
    } else {
      setIsScriptLoaded(true)
    }

    // Cleanup
    return () => {
      if (cloudinaryWidget.current) {
        cloudinaryWidget.current.close()
      }
    }
  }, [])

  const initializeWidget = () => {
    if (!window.cloudinary) {
      console.error("Cloudinary script not loaded")
      return
    }

    // Initialize the Cloudinary widget
    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        resourceType,
        multiple,
        maxFiles: multiple ? 10 : 1,
        sources: ["local", "url", "camera"],
        folder: "performer_booking",
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#7C3AED", // Purple color that matches our primary
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#7C3AED", // Purple color that matches our primary
            action: "#7C3AED", // Purple color that matches our primary
            inactiveTabIcon: "#aaaaaa",
            error: "#f44235",
            inProgress: "#7C3AED", // Purple color that matches our primary
            complete: "#20B832",
            sourceBg: "#f4f4f5",
          },
          frame: {
            background: "rgba(255, 255, 255, 0.95)",
          },
        },
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          onUploadSuccess(result.info)
        }
        if (error) {
          console.error("Cloudinary upload error:", error)
        }
      },
    )
  }

  const openWidget = () => {
    if (!cloudinaryWidget.current) {
      initializeWidget()
    }
    if (cloudinaryWidget.current) {
      cloudinaryWidget.current.open()
    }
  }

  return (
    <button type="button" onClick={openWidget} disabled={!isScriptLoaded} className={`btn-secondary ${className}`}>
      {multiple ? "Upload Media Files" : "Upload File"}
    </button>
  )
}

export default CloudinaryUpload
