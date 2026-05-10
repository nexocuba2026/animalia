import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

export default function NuevoPacientePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState('')

  const [formPropietario, setFormPropietario] = useState({
    nombre_completo: '',
    cedula: '',
    direccion: '',
    telefono: '',
  })

  const [formMascota, setFormMascota] = useState({
    nombre: '',
    especie: 'perro',
    raza: '',
    fecha_nacimiento: '',
    peso: '',
  })

  if (!profile || !['superadmin', 'veterinario', 'recepcionista', 'tecnico', 'administrador'].includes(profile.role)) {
    return <p className="p-4">No tienes permiso para registrar pacientes.</p>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')

    // 1. Buscar o crear propietario
    let propietarioId: string | null = null

    // Buscar por cédula
    const { data: existente } = await supabase
      .from('profiles')
      .select('id')
      .eq('cedula', formPropietario.cedula)
      .single()

    if (existente) {
      propietarioId = existente.id
    } else {
      // Crear nuevo perfil de cliente
      const { data: nuevo, error: errorCreacion } = await supabase
        .from('profiles')
        .insert({
          role: 'cliente',
          nombre_completo: formPropietario.nombre_completo,
          cedula: formPropietario.cedula || null,
          direccion: formPropietario.direccion || null,
          telefono: formPropietario.telefono || null,
        })
        .select('id')
        .single()

      if (errorCreacion) {
        setMensaje('Error al crear propietario: ' + errorCreacion.message)
        return
      }
      propietarioId = nuevo.id
    }

    // 2. Insertar mascota (siempre activa)
    const { data: nuevaMascota, error: errorMascota } = await supabase
      .from('mascotas')
      .insert({
        propietario_id: propietarioId,
        nombre: formMascota.nombre,
        especie: formMascota.especie,
        raza: formMascota.raza || null,
        fecha_nacimiento: formMascota.fecha_nacimiento || null,
        peso: formMascota.peso ? parseFloat(formMascota.peso) : null,
        estado: 'activa',
      })
      .select('id, numero_historia_clinica')
      .single()

    if (errorMascota) {
      setMensaje('Error al registrar mascota: ' + errorMascota.message)
      return
    }

    // 3. Crear entrada automática en historia clínica
    if (nuevaMascota) {
      await supabase.from('historias_clinicas').insert({
        mascota_id: nuevaMascota.id,
        veterinario_id: profile.id,
        tipo: 'nota',
        descripcion: `Paciente registrado. Número de historia: ${nuevaMascota.numero_historia_clinica}`,
      })
    }

    setMensaje('✅ Paciente registrado correctamente. Redirigiendo...')
    setTimeout(() => navigate('/dashboard/pacientes'), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🐾 Registrar Nuevo Paciente</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        {/* Datos del propietario */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Datos del Propietario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre completo *"
              value={formPropietario.nombre_completo}
              onChange={(e) => setFormPropietario({ ...formPropietario, nombre_completo: e.target.value })}
              className="border rounded-xl px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="Cédula"
              value={formPropietario.cedula}
              onChange={(e) => setFormPropietario({ ...formPropietario, cedula: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
            <input
              type="text"
              placeholder="Dirección"
              value={formPropietario.direccion}
              onChange={(e) => setFormPropietario({ ...formPropietario, direccion: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={formPropietario.telefono}
              onChange={(e) => setFormPropietario({ ...formPropietario, telefono: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
          </div>
        </div>

        {/* Datos de la mascota */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Datos de la Mascota</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre de la mascota *"
              value={formMascota.nombre}
              onChange={(e) => setFormMascota({ ...formMascota, nombre: e.target.value })}
              className="border rounded-xl px-4 py-2"
              required
            />
            <select
              value={formMascota.especie}
              onChange={(e) => setFormMascota({ ...formMascota, especie: e.target.value })}
              className="border rounded-xl px-4 py-2"
            >
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="ave">Ave</option>
              <option value="cerdo">Cerdo</option>
              <option value="otro">Otro</option>
            </select>
            <input
              type="text"
              placeholder="Raza"
              value={formMascota.raza}
              onChange={(e) => setFormMascota({ ...formMascota, raza: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
            <input
              type="date"
              placeholder="Fecha de nacimiento"
              value={formMascota.fecha_nacimiento}
              onChange={(e) => setFormMascota({ ...formMascota, fecha_nacimiento: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Peso (kg)"
              value={formMascota.peso}
              onChange={(e) => setFormMascota({ ...formMascota, peso: e.target.value })}
              className="border rounded-xl px-4 py-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition">
            Guardar Paciente
          </button>
          <button type="button" onClick={() => navigate('/dashboard/pacientes')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition">
            Cancelar
          </button>
        </div>

        {mensaje && (
          <p className={`text-sm ${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{mensaje}</p>
        )}
      </form>
    </div>
  )
}