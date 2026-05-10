import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

export default function ContenidoPage() {
  const { profile } = useAuth()
  const [seccion, setSeccion] = useState('inicio')
  const [contenido, setContenido] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile || !['administrador', 'superadmin'].includes(profile.role)) return

    supabase
      .from('contenido_web')
      .select('*')
      .eq('seccion', seccion)
      .single()
      .then(({ data }) => {
        if (data) {
          setContenido(JSON.stringify(data.contenido, null, 2))
        } else {
          setContenido(JSON.stringify({ titulo: '', texto: '', items: [] }, null, 2))
        }
        setLoading(false)
      })
  }, [seccion, profile])

  const handleGuardar = async () => {
    try {
      const json = JSON.parse(contenido)
      const { data: existente } = await supabase
        .from('contenido_web')
        .select('id')
        .eq('seccion', seccion)
        .single()

      if (existente) {
        await supabase.from('contenido_web').update({ contenido: json }).eq('id', existente.id)
      } else {
        await supabase.from('contenido_web').insert({ seccion, contenido: json })
      }
      setMensaje('✅ Contenido guardado correctamente.')
    } catch {
      setMensaje('❌ Error: el contenido no es un JSON válido.')
    }

    setTimeout(() => setMensaje(''), 3000)
  }

  if (!profile || !['administrador', 'superadmin'].includes(profile.role))
    return <p className="p-4">Acceso denegado.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📝 Gestión de Contenido</h1>

      {/* Selector de sección */}
      <div className="flex gap-2">
        {['inicio', 'servicios', 'faq'].map((s) => (
          <button
            key={s}
            onClick={() => setSeccion(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              seccion === s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Editor de texto */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {loading ? (
          <p className="text-gray-500">Cargando contenido...</p>
        ) : (
          <>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={16}
              className="w-full border rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder='{"titulo": "", "texto": "", "items": []}'
            />
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleGuardar}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl transition"
              >
                Guardar cambios
              </button>
              {mensaje && (
                <span className={`text-sm ${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {mensaje}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ayuda de ejemplo */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">Ejemplos de formato JSON:</p>
        <pre className="whitespace-pre-wrap">
{`{
  "titulo": "Bienvenidos a ANIMALIA",
  "texto": "Centro Veterinario Universitario de Cienfuegos",
  "items": []
}`}
        </pre>
        <p className="mt-2">Para Servicios o FAQ, añade el arreglo <strong>"items": ["Servicio 1", "Servicio 2"]</strong></p>
      </div>
    </div>
  )
}