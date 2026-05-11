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

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight">
          ANIMALIA
        </h1>
        <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Centro Veterinario Universitario de Cienfuegos. Cuidamos de tu mascota con ciencia y dedicación.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-naranja-500 hover:bg-naranja-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-naranja-500/30 transition-all duration-300 transform hover:scale-105"
          >
            <span>🔐</span> Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <span>✨</span> Registrarse
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-sm">
        Elaborado por <span className="font-semibold text-white/60">neXo</span>
      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/5355415537"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.807-1.588-3.86-1.588-5.99C.156 5.204 5.472 0 12.004 0c3.159 0 6.124 1.232 8.354 3.47 2.232 2.24 3.463 5.212 3.458 8.38-.006 6.853-5.326 11.996-11.995 11.996h-.005c-1.993 0-3.945-.494-5.655-1.423L.057 24zm6.591-3.804l.36.213c1.473.875 3.158 1.338 4.895 1.338 5.718 0 10.278-4.66 10.283-10.389.003-2.777-1.076-5.386-3.037-7.348-1.96-1.96-4.57-3.04-7.347-3.04-5.724 0-10.292 4.667-10.292 10.398 0 1.943.536 3.84 1.55 5.479l.247.394-1.002 3.655 3.343-.7z" />
          <path d="M17.853 14.29c-.217-.109-1.281-.633-1.48-.706-.198-.073-.343-.109-.487.11-.145.22-.559.707-.685.852-.126.145-.253.163-.47.054-.218-.109-.917-.338-1.747-1.078-.646-.575-1.082-1.286-1.209-1.503-.127-.218-.013-.336.096-.445.099-.099.218-.253.327-.38.109-.126.145-.218.218-.362.073-.145.036-.272-.018-.38-.055-.109-.487-1.173-.667-1.607-.176-.424-.355-.365-.487-.372-.127-.006-.273-.007-.418-.007-.145 0-.38.054-.58.272-.2.218-.76.743-.76 1.812 0 1.07.78 2.103.89 2.248.108.145 1.535 2.343 3.722 3.285 2.187.942 2.187.628 2.58.588.393-.04 1.272-.52 1.451-1.022.18-.502.18-.932.126-1.022-.054-.09-.199-.145-.416-.254z" />
        </svg>
      </a>
    </div>
  )
}