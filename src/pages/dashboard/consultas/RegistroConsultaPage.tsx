import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Paciente = { id: string; nombre: string; numero_historia_clinica: string }
type EquipoMember = { id: string; nombre_completo: string; cargo: string }
type Consulta = {
  id: string
  fecha: string
  descripcion: string
  mascota: { id: string; nombre: string; numero_historia_clinica: string } | null
  veterinario: { id: string; nombre_completo: string } | null
}

export default function RegistroConsultaPage() {
  const { profile } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [veterinarios, setVeterinarios] = useState<EquipoMember[]>([]) // miembros del equipo con cargo veterinario
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({
    mascota_id: '',
    fecha: new Date().toISOString().slice(0,10),
    descripcion: '',
    veterinario_id: '',             // ID del miembro del equipo seleccionado (para incluir su nombre en la descripción)
    veterinario_nombre: '',         // nombre correspondiente, se llena automáticamente
  })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!profile || !['veterinario','superadmin','tecnico','administrador'].includes(profile.role)) return
    fetchConsultas()
    fetchPacientes()
    fetchVeterinarios()
  }, [profile])

  const fetchConsultas = async () => {
    const { data } = await supabase
      .from('historias_clinicas')
      .select('id, fecha, descripcion, mascota:mascotas(id, nombre, numero_historia_clinica), veterinario:profiles!veterinario_id(id, nombre_completo)')
      .eq('tipo', 'consulta')
      .order('fecha', { ascending: false })
    if (data) setConsultas(data as unknown as Consulta[])
  }

  const fetchPacientes = async () => {
    const { data } = await supabase.from('mascotas').select('id, nombre, numero_historia_clinica')
    if (data) setPacientes(data)
  }

  const fetchVeterinarios = async () => {
    const { data } = await supabase.from('equipo').select('id, nombre_completo, cargo')
    if (data) setVeterinarios(data.filter(m => m.cargo.toLowerCase().includes('veterinario')))
  }

  const abrirNueva = () => {
    setEditandoId(null)
    setForm({
      mascota_id: '',
      fecha: new Date().toISOString().slice(0,10),
      descripcion: '',
      veterinario_id: '',
      veterinario_nombre: '',
    })
    setMostrarFormulario(true)
  }

  const editarConsulta = (c: Consulta) => {
    setEditandoId(c.id)
    setForm({
      mascota_id: c.mascota?.id || '',
      fecha: c.fecha,
      descripcion: c.descripcion,
      veterinario_id: '',           // no podemos recuperar el responsable original
      veterinario_nombre: '',
    })
    setMostrarFormulario(true)
  }

  const eliminarConsulta = async (id: string) => {
    if (!confirm('¿Eliminar esta consulta?')) return
    await supabase.from('historias_clinicas').delete().eq('id', id)
    fetchConsultas()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')

    // Construir descripción incluyendo al veterinario responsable del equipo
    let descripcionFinal = form.descripcion
    if (form.veterinario_nombre) {
      descripcionFinal = `Veterinario: ${form.veterinario_nombre}. ` + descripcionFinal
    }

    const datos = {
      mascota_id: form.mascota_id,
      fecha: form.fecha,
      descripcion: descripcionFinal,
      veterinario_id: profile!.id,   // siempre el usuario logueado
      tipo: 'consulta',
    }

    const { error } = editandoId
      ? await supabase.from('historias_clinicas').update(datos).eq('id', editandoId)
      : await supabase.from('historias_clinicas').insert(datos)

    if (error) setMensaje('Error: ' + error.message)
    else {
      setMensaje('✅ Consulta guardada.')
      setMostrarFormulario(false)
      fetchConsultas()
    }
  }

  if (!profile || !['veterinario','superadmin','tecnico','administrador'].includes(profile.role))
    return <p className="p-4">Acceso denegado.</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🩺 Consultas</h1>
        <button onClick={abrirNueva} className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
          + Nueva Consulta
        </button>
      </div>

      {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>}

      {/* Lista de consultas */}
      {consultas.map(c => (
        <details key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4 group">
          <summary className="cursor-pointer font-semibold">
            {c.mascota?.nombre || 'Paciente desconocido'} — {new Date(c.fecha).toLocaleDateString()}
            <span className="text-gray-500 ml-2">({c.veterinario?.nombre_completo || 'Sin responsable'})</span>
          </summary>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{c.descripcion}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => editarConsulta(c)} className="text-orange-600 hover:underline text-xs">Editar</button>
            <button onClick={() => eliminarConsulta(c.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
          </div>
        </details>
      ))}
      {consultas.length === 0 && <p className="text-gray-500">No hay consultas registradas.</p>}

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editandoId ? 'Editar Consulta' : 'Nueva Consulta'}</h2>

            <div>
              <label className="text-sm font-medium">Paciente</label>
              <select value={form.mascota_id} onChange={e => setForm({...form, mascota_id: e.target.value})} className="w-full border rounded-xl px-4 py-2" required>
                <option value="">-- Seleccionar --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.numero_historia_clinica})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full border rounded-xl px-4 py-2" rows={4} required />
            </div>

            <div>
              <label className="text-sm font-medium">Veterinario responsable (aparecerá en la descripción)</label>
              <select
                value={form.veterinario_id}
                onChange={e => {
                  const selectedId = e.target.value
                  const vet = veterinarios.find(v => v.id === selectedId)
                  setForm({
                    ...form,
                    veterinario_id: selectedId,
                    veterinario_nombre: vet ? vet.nombre_completo : '',
                  })
                }}
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="">-- Seleccionar --</option>
                {veterinarios.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre_completo}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setMostrarFormulario(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-xl">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}