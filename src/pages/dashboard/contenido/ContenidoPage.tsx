import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

export default function ContenidoPage() {
  const { profile } = useAuth()
  const [seccion, setSeccion] = useState('inicio')
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [items, setItems] = useState<string[]>([])
  const [faqItems, setFaqItems] = useState<{ pregunta: string; respuesta: string }[]>([])
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(true)

  // Cargar datos de la sección seleccionada
  useEffect(() => {
    if (!profile || !['administrador', 'superadmin'].includes(profile.role)) return

    setLoading(true)
    supabase
      .from('contenido_web')
      .select('*')
      .eq('seccion', seccion)
      .single()
      .then(({ data }) => {
        if (data) {
          const contenido = data.contenido
          setTitulo(contenido.titulo || '')
          setTexto(contenido.texto || '')
          if (seccion === 'faq') {
            // FAQ usa array de {pregunta, respuesta}
            setFaqItems(contenido.items || [])
            setItems([])
          } else {
            setItems(contenido.items || [])
            setFaqItems([])
          }
        } else {
          // Valores por defecto
          setTitulo('')
          setTexto('')
          setItems([])
          setFaqItems([])
        }
        setLoading(false)
      })
  }, [seccion, profile])

  // Guardar cambios
  const handleGuardar = async () => {
    const contenido: any = { titulo, texto }
    if (seccion === 'faq') {
      contenido.items = faqItems
    } else {
      contenido.items = items
    }

    const { data: existente } = await supabase
      .from('contenido_web')
      .select('id')
      .eq('seccion', seccion)
      .single()

    const { error } = existente
      ? await supabase.from('contenido_web').update({ contenido }).eq('id', existente.id)
      : await supabase.from('contenido_web').insert({ seccion, contenido })

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Contenido guardado correctamente.')
    }
    setTimeout(() => setMensaje(''), 3000)
  }

  // Funciones para manejar items de Servicios
  const agregarItem = () => {
    setItems([...items, ''])
  }
  const actualizarItem = (index: number, valor: string) => {
    const nuevos = [...items]
    nuevos[index] = valor
    setItems(nuevos)
  }
  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Funciones para manejar preguntas frecuentes
  const agregarPregunta = () => {
    setFaqItems([...faqItems, { pregunta: '', respuesta: '' }])
  }
  const actualizarPregunta = (index: number, campo: string, valor: string) => {
    const nuevos = [...faqItems]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setFaqItems(nuevos)
  }
  const eliminarPregunta = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index))
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
            {s === 'inicio' ? 'Inicio' : s === 'servicios' ? 'Servicios' : 'Preguntas Frecuentes'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando contenido...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {/* Campos comunes: Título y Texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border rounded-xl px-4 py-2"
              placeholder="Título de la sección"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto principal</label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full border rounded-xl px-4 py-2"
              rows={3}
              placeholder="Texto descriptivo"
            />
          </div>

          {/* Sección específica para Servicios */}
          {seccion === 'servicios' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Lista de servicios</label>
                <button onClick={agregarItem} className="text-orange-600 text-sm hover:underline">+ Añadir servicio</button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => actualizarItem(index, e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-2"
                    placeholder={`Servicio ${index + 1}`}
                  />
                  <button onClick={() => eliminarItem(index)} className="text-red-600 hover:underline">🗑️</button>
                </div>
              ))}
            </div>
          )}

          {/* Sección específica para FAQ */}
          {seccion === 'faq' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Preguntas y respuestas</label>
                <button onClick={agregarPregunta} className="text-orange-600 text-sm hover:underline">+ Añadir pregunta</button>
              </div>
              {faqItems.map((item, index) => (
                <div key={index} className="border rounded-xl p-4 mb-4 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Pregunta</label>
                    <input
                      type="text"
                      value={item.pregunta}
                      onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)}
                      className="w-full border rounded-xl px-4 py-2"
                      placeholder="Escribe la pregunta"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Respuesta</label>
                    <textarea
                      value={item.respuesta}
                      onChange={(e) => actualizarPregunta(index, 'respuesta', e.target.value)}
                      className="w-full border rounded-xl px-4 py-2"
                      rows={2}
                      placeholder="Escribe la respuesta"
                    />
                  </div>
                  <button onClick={() => eliminarPregunta(index)} className="text-red-600 text-sm hover:underline">Eliminar pregunta</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGuardar}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Guardar cambios
          </button>
          {mensaje && (
            <p className={`text-sm ${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{mensaje}</p>
          )}
        </div>
      )}
    </div>
  )
}