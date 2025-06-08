"use client"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { usePerformerStore } from "../store/performerStore"

const HomePage = () => {
  const { performers, fetchPerformers, isLoading } = usePerformerStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    fetchPerformers()

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [fetchPerformers])

  return (
    <div className="bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <img src="/wide1.png" alt="Musicians performing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-70 mix-blend-multiply"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[hsl(var(--accent))] opacity-20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[hsl(var(--primary))] opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full border-4 border-white/30 animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-8 h-8 rounded-md border-4 border-white/20 animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-lg border-4 border-white/10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="max-w-3xl backdrop-blur-sm bg-black/10 p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Găsește Artiștii  <span className="text-[hsl(var(--accent))]">Potriviți pentru Evenimentul Tău
            </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Cauți muzică live? Aici găsești muzicieni, trupe și artiști gata să facă spectacol. Verifică dacă sunt liberi și rezervă-i pe loc!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/browse"
                className="btn-primary text-md px-8 py-4 bg-white text-[hsl(var(--primary))] hover:bg-white/90 hover-lift hover-glow"
              >
                Vezi Artiștii

              </Link>
              <Link
                to="/register"
                className="btn-outline text-md px-8 py-4 text-white border-white hover:bg-white/10 hover:text-white hover:border-white"
              >
                Devino Artist
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${scrolled ? "opacity-0" : "opacity-100"}`}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/80 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Featured Performers */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[hsl(var(--primary))] opacity-5 rounded-full blur-3xl -z-10"></div>

        <div className="text-center mb-16 relative">
          <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent inline-block">
          Selecția noastră
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] mx-auto mt-4 rounded-full"></div>
          <p className="mt-6 max-w-xl mx-auto text-lg text-[hsl(var(--muted-foreground))]">
          Aruncă o privire la câțiva dintre artiștii noștri preferați
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 text-center py-12">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-[hsl(var(--secondary))] animate-pulse delay-150"></div>
                <div className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] animate-pulse delay-300"></div>
              </div>
              <p className="mt-4 text-[hsl(var(--muted-foreground))]">Loading performers...</p>
            </div>
          ) : (
            performers.slice(0, 6).map((performer, index) => (
              <div
                key={performer._id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80 opacity-70 z-10"></div>

                {/* Main image */}
                <div className="h-96 w-full overflow-hidden">
                  <img
                    src={
                      performer.profileImage ||
                      `/placeholder.svg?height=600&width=400&query=musician+performing+${index || "/placeholder.svg"}`
                    }
                    alt={performer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  {/* Genre badge */}
                  <div className="flex items-center mb-2">
                    <span className="px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full">
                      {performer.genre || "Music"}
                    </span>
                    <span className="ml-2 text-sm text-white/90">{performer.location || "Local"}</span>
                  </div>

                  {/* Name and bio */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[hsl(var(--accent))] transition-colors">
                    {performer.name}
                  </h3>

                  <p className="text-white/80 mb-4 line-clamp-2 transform translate-y-0 opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {performer.bio || "Professional performer available for bookings."}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/performer/${performer._id}`}
                      className="px-4 py-2 bg-white text-[hsl(var(--primary))] font-medium rounded-lg  hover:text-white transition-colors duration-300"
                    >
                      Vezi Profilul
                    </Link>
                    <div className="flex items-center text-white/90">
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

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md z-20 flex items-center justify-center group-hover:bg-[hsl(var(--accent))] transition-colors duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 text-center">
          <Link to="/browse" className="btn-secondary hover-lift px-8 py-3">
          Vezi Toți Artiștii
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 sm:py-24 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(var(--primary))] opacity-5 -z-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full border border-[hsl(var(--primary))] opacity-20 -z-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full border border-[hsl(var(--secondary))] opacity-20 -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent inline-block">
            Cum funcționează?
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[calc(16.67%-8px)] right-[calc(16.67%-8px)] h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--accent))]"></div>

            <div className="card p-8 relative group hover-lift z-10">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="pt-12">
                <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-[hsl(var(--primary))] transition-colors">
                  Descoperă Artiștii

                </h3>
                <p className="mt-4 text-center text-[hsl(var(--muted-foreground))]">
                Caută prin lista noastră plină de talente – muzicieni, trupe și performeri de toate genurile.
                </p>
              </div>
            </div>

            <div className="card p-8 relative group hover-lift z-10">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="pt-12">
                <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-[hsl(var(--secondary))] transition-colors">
                Verifică cand sunt liberi
                </h3>
                <p className="mt-4 text-center text-[hsl(var(--muted-foreground))]">
                  Vezi în ce zile sunt disponibili direct din profilul lor.
                </p>
              </div>
            </div>

            <div className="card p-8 relative group hover-lift z-10">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <div className="pt-12">
                <h3 className="mt-4 text-xl font-semibold text-center group-hover:text-[hsl(var(--accent))] transition-colors">
                  Contactează & Rezervă
                </h3>
                <p className="mt-4 text-center text-[hsl(var(--muted-foreground))]">
                  Scrie-le direct și pune la punct detaliile pentru evenimentul tău.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* Testimoniale */}
<div className="py-20 px-4 sm:py-24 sm:px-6 lg:px-8 relative">
  <div className="absolute top-0 left-0 w-full h-full bg-[url('/abstract-dots.png')] bg-repeat opacity-5 -z-10"></div>

  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold sm:text-5xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent inline-block">
        Ce spun utilizatorii noștri
      </h2>
      <div className="h-1 w-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] mx-auto mt-4 rounded-full"></div>
    </div>

    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="card p-8 relative hover-lift">
        <div className="absolute -top-6 -left-6 text-[hsl(var(--primary))] text-7xl opacity-20">"</div>
        <div className="flex items-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            AD
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-lg">Ana Dobre</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Vlogger</p>
          </div>
        </div>
        <p className="text-[hsl(var(--foreground))] relative z-10">
          "Acest site m-a ajutat să găsesc tot ce aveam nevoie pentru vlogul meu. Recomand pentru toți cei care vor să-și facă treaba mai ușoară!"
        </p>
        <div className="mt-4 flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      <div className="card p-8 relative hover-lift">
        <div className="absolute -top-6 -left-6 text-[hsl(var(--secondary))] text-7xl opacity-20">"</div>
        <div className="flex items-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            PB
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-lg">Pavel Bogdanov</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Fotograf</p>
          </div>
        </div>
        <p className="text-[hsl(var(--foreground))] relative z-10">
          "Am folosit platforma pentru a găsi muzică bună pentru un eveniment de nuntă și totul a fost super ușor!"
        </p>
        <div className="mt-4 flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      <div className="card p-8 relative hover-lift">
        <div className="absolute -top-6 -left-6 text-[hsl(var(--accent))] text-7xl opacity-20">"</div>
        <div className="flex items-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            AK
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-lg">Aleksey Kravchuk</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">DJ</p>
          </div>
        </div>
        <p className="text-[hsl(var(--foreground))] relative z-10">
        "Нашел то, что искал для своей вечеринки! Платформа быстрая и очень удобная в использовании."        </p>
        <div className="mt-4 flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>


      {/* CTA Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]"></div>
        <div className="absolute inset-0 bg-[url('/texture-overlay.png')] bg-repeat opacity-10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Gata să găsești artistul perfect?</h2>
          <p className="text-xl text-white/80 mb-8">
          Mulți au reușit să găsească artiști potriviți pentru evenimentele lor. Poate găsești și tu ce cauți!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/browse" className="btn-primary bg-white text-[hsl(var(--primary))] hover:bg-white/90 px-8 py-4">
              Vezi Artiștii
            </Link>
            <Link
              to="/register"
              className="btn-outline text-white border-white hover:bg-white/10 hover:text-white hover:border-white px-8 py-4"
            >
              Devino Artist
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
