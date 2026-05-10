import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre_completo: '',
    cedula: '',
    telefono: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre_completo: form.nombre_completo,
          cedula: form.cedula,
          telefono: form.telefono
        }
      }
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Registro exitoso. Redirigiendo al inicio de sesión...')
    setTimeout(() => navigate('/login'), 1500)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-naranja-600/80"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <span className="text-5xl">🐾</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">ANIMALIA</h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Únete a nuestra comunidad. Registra tus mascotas y accede a todos nuestros servicios.
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">🐾</span>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">ANIMALIA</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Crear cuenta</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Completa tus datos para registrarte en el sistema.
          </p>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre completo</label>
              <input type="text" placeholder="Tu nombre" value={form.nombre_completo} onChange={(e) => setForm({...form, nombre_completo: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-naranja-500 transition bg-white" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cédula</label>
                <input type="text" placeholder="12345678" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-naranja-500 transition bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                <input type="tel" placeholder="+5355123456" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-naranja-500 transition bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo electrónico</label>
              <input type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-naranja-500 transition bg-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-naranja-500 transition bg-white" required />
            </div>

            {message && (
              <div className={`text-sm p-4 rounded-xl ${message.includes('error') || message.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-naranja-500 hover:bg-naranja-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-naranja-500/25">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-naranja-600 hover:text-naranja-700 font-semibold">Inicia sesión</Link>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            Elaborado por <span className="font-semibold text-naranja-600">neXo</span>
          </p>
        </div>
      </div>
    </div>
  )
}