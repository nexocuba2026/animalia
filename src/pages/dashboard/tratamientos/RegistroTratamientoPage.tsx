import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Paciente = { id: string; nombre: string; numero_historia_clinica: string }
type EquipoMember = { id: string; nombre_completo: string; cargo: string }
type Medicamento = { id: string; nombre: string }
type Tratamiento = {
  id: string
  fecha: string
  descripcion: string
  mascota: { id: string; nombre: string; numero_historia_clinica: string } | null
  veterinario: { id: string; nombre_completo: string } | null
}

export default function RegistroTratamientoPage() {
  const { profile } = useAuth()
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [equipo, setEquipo] = useState<EquipoMember[]>([])            // todos los miembros
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({
    mascota_id: '',
    fecha: new Date().toISOString().slice(0,10),
    descripcion: '',
    responsable_id: '',             // ID del miembro del equipo seleccionado
    responsable_nombre: '',         // nombre correspondiente
    medicamento_id: '',
    medicamento_nombre: '',
    cantidad: '',
  })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!profile || !['veterinario','superadmin','tecnico','administrador'].includes(profile.role)) return
    fetchTratamientos()
    fetchPacientes()
    fetchEquipo()
    fetchMedicamentos()
  }, [profile])

  const fetchTratamientos = async () => {
    const { data } = await supabase
      .from('historias_clinicas')
      .select('id, fecha, descripcion, mascota:mascotas(id, nombre, numero_historia_clinica), veterinario:profiles!veterinario_id(id, nombre_completo)')
      .eq('tipo', 'tratamiento')
      .order('fecha', { ascending: false })
    if (data) setTratamientos(data as unknown as Tratamiento[])
  }

  const fetchPacientes = async () => {
    const { data } = await supabase.from('mascotas').select('id, nombre, numero_historia_clinica')
    if (data) setPacientes(data)
  }

  const fetchEquipo = async () => {
    const { data } = await supabase.from('equipo').select('id, nombre_completo, cargo')
    if (data) setEquipo(data)  // todos los miembros
  }

  const fetchMedicamentos = async () => {
    const { data } = await supabase
      .from('inventario')
      .select('id, nombre')
      .ilike('categoria', '%medicamento%')
    if (data) setMedicamentos(data)
  }

  const abrirNueva = () => {
    setEditandoId(null)
    setForm({
      mascota_id: '',
      fecha: new Date().toISOString().slice(0,10),
      descripcion: '',
      responsable_id: '',
      responsable_nombre: '',
      medicamento_id: '',
      medicamento_nombre: '',
      cantidad: '',
    })
    setMostrarFormulario(true)
  }

  const editarTratamiento = (t: Tratamiento) => {
    setEditandoId(t.id)
    setForm({
      mascota_id: t.mascota?.id || '',
      fecha: t.fecha,
      descripcion: t.descripcion,
      responsable_id: '',
      responsable_nombre: '',
      medicamento_id: '',
      medicamento_nombre: '',
      cantidad: '',
    })
    setMostrarFormulario(true)
  }

  const eliminarTratamiento = async (id: string) => {
    if (!confirm('¿Eliminar este tratamiento?')) return
    await supabase.from('historias_clinicas').delete().eq('id', id)
    fetchTratamientos()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')

    // Construir descripción combinada con medicamento, cantidad y responsable
    let descFinal = form.descripcion
    if (form.medicamento_nombre) {
      descFinal = `Medicamento: ${form.medicamento_nombre}` + (form.cantidad ? `, Cantidad: ${form.cantidad}` : '') + `. ` + descFinal
    }
    if (form.responsable_nombre) {
      descFinal = `Responsable: ${form.responsable_nombre}. ` + descFinal
    }

    const datos = {
      mascota_id: form.mascota_id,
      fecha: form.fecha,
      descripcion: descFinal,
      veterinario_id: profile!.id,   // siempre el usuario logueado
      tipo: 'tratamiento',
    }

    const { error } = editandoId
      ? await supabase.from('historias_clinicas').update(datos).eq('id', editandoId)
      : await supabase.from('historias_clinicas').insert(datos)

    if (error) setMensaje('Error: ' + error.message)
    else {
      setMensaje('✅ Tratamiento guardado.')
      setMostrarFormulario(false)
      fetchTratamientos()
    }
  }

  if (!profile || !['veterinario','superadmin','tecnico','administrador'].includes(profile.role))
    return <p className="p-4">Acceso denegado.</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">💉 Tratamientos</h1>
        <button onClick={abrirNueva} className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
          + Nuevo Tratamiento
        </button>
      </div>

      {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>}

      {/* Lista de tratamientos */}
      {tratamientos.map(t => (
        <details key={t.id} className="bg-white border border-gray-200 rounded-2xl p-4 group">
          <summary className="cursor-pointer font-semibold">
            {t.mascota?.nombre || 'Paciente desconocido'} — {new Date(t.fecha).toLocaleDateString()}
            <span className="text-gray-500 ml-2">({t.veterinario?.nombre_completo || 'Sin responsable'})</span>
          </summary>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{t.descripcion}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => editarTratamiento(t)} className="text-orange-600 hover:underline text-xs">Editar</button>
            <button onClick={() => eliminarTratamiento(t.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
          </div>
        </details>
      ))}
      {tratamientos.length === 0 && <p className="text-gray-500">No hay tratamientos registrados.</p>}

      {/* Modal formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editandoId ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}</h2>

            <div>
              <label className="text-sm font-medium">Paciente</label>
              <select value={form.mascota_id} onChange={e => setForm({...form, mascota_id: e.target.value})} className="w-full border rounded-xl px-4 py-2" required>
                <option value="">-- Seleccionar --</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.numero_historia_clinica})</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium">Medicamento</label>
              <select
                value={form.medicamento_id}
                onChange={e => {
                  const id = e.target.value
                  const med = medicamentos.find(m => m.id === id)
                  setForm({
                    ...form,
                    medicamento_id: id,
                    medicamento_nombre: med ? med.nombre : '',
                  })
                }}
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="">-- Seleccionar medicamento --</option>
                {medicamentos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Cantidad</label>
              <input type="text" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="w-full border rounded-xl px-4 py-2" placeholder="Ej: 2 tabletas" />
            </div>

            <div>
              <label className="text-sm font-medium">Descripción adicional</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full border rounded-xl px-4 py-2" rows={3} placeholder="Instrucciones, observaciones..." />
            </div>

            <div>
              <label className="text-sm font-medium">Responsable (miembro del equipo)</label>
              <select
                value={form.responsable_id}
                onChange={e => {
                  const id = e.target.value
                  const resp = equipo.find(m => m.id === id)
                  setForm({
                    ...form,
                    responsable_id: id,
                    responsable_nombre: resp ? resp.nombre_completo : '',
                  })
                }}
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="">-- Seleccionar responsable --</option>
                {equipo.map(m => <option key={m.id} value={m.id}>{m.nombre_completo} ({m.cargo})</option>)}
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