const Footer = () => {
    return (
      <footer className="bg-[hsl(var(--card))] border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
              SunăBine
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Găsește și rezervă artiști pentru orice tip de eveniment</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="#"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                 Despre noi
              </a>
              <a
                href="#"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Contacte
              </a>
              <a
                href="#"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Politica de Confidențialitate
              </a>
              <a
                href="#"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                Termeni și Condiții
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-[hsl(var(--muted-foreground))] text-sm">
            &copy; {new Date().getFullYear()} SunăBine. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    )
  }
  
  export default Footer
  