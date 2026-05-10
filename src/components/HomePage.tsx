import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
         <img src="/logo.png" alt="ANIMALIA" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight">ANIMALIA</h1>
        <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Centro Veterinario Universitario de Cienfuegos. Cuidamos de tu mascota con ciencia y dedicación.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/login" className="inline-flex items-center gap-2 bg-naranja-500 hover:bg-naranja-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-naranja-500/30 transition-all duration-300 transform hover:scale-105">
            <span>🔐</span> Iniciar sesión
          </Link>
          <Link to="/registro" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105">
            <span>✨</span> Registrarse
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-sm">
        Elaborado por <span className="font-semibold text-white/60">neXo</span>
      </div>
    </div>
  )
}