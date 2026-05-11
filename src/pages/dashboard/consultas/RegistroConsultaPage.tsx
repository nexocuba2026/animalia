import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Paciente = { id: string; nombre: string; numero_historia_clinica: string }
type EquipoMember = { id: string; nombre_completo: string; cargo: string }

export default function RegistroConsultaPage() {
  const { profile } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [veterinarios, setVeterinarios] = useState<EquipoMember[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [nuevoPaciente, setNuevoPaciente] = useState(false)
  const [form, setForm] = useState({
    propietario_nombre: '',
    propietario_cedula: '',
    propietario_telefono: '',
    nombre_mascota: '',
    especie: 'perro',
    raza: '',
    fecha: new Date().toISOString().slice(0,10),
    descripcion: '',
    veterinario_id: '',
  })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!profile || !['veterinario','superadmin','tecnico','administrador'].includes(profile.role)) return
    fetchPacientes()
    fetchVeterinarios()
  }, [profile])

  const fetchPacientes = async () => {
    const { data } = await supabase.from('mascotas').select('id, nombre, numero_historia_clinica')
    if (data) setPacientes(data)
  }

  const fetchVeterinarios = async () => {
    const { data } = await supabase.from('equipo').select('id, nombre_completo, cargo')
    if (data) setVeterinarios(data.filter(m => m.cargo.toLowerCase().includes('veterinario')))
  }

  const handlePacienteChange = async (pacienteId: string) => {
    if (!pacienteId) {
      setSelectedPaciente(null)
      setNuevoPaciente(true)
      return
    }
    const { data } = await supabase.from('mascotas').select('*, propietario:propietario_id(nombre_completo, cedula, telefono)').eq('id', pacienteId).single()
    if (data) {
      setSelectedPaciente(data)
      setNuevoPaciente(false)
      setForm(prev => ({
        ...prev,
        propietario_nombre: data.propietario?.nombre_completo || '',
        propietario_cedula: data.propietario?.cedula || '',
        propietario_telefono: data.propietario?.telefono || '',
        nombre_mascota: data.nombre,
        especie: data.especie,
        raza: data.raza || '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')

    let propietarioId = null
    if (!selectedPaciente) {
      // Buscar o crear propietario
      const { data: existente } = await supabase.from('profiles').select('id').eq('cedula', form.propietario_cedula).single()
      if (existente) {
        propietarioId = existente.id
      } else {
        const { data: nuevo } = await supabase.from('profiles').insert({
          role: 'cliente',
          nombre_completo: form.propietario_nombre,
          cedula: form.propietario_cedula,
          telefono: form.propietario_telefono,
        }).select('id').single()
        propietarioId = nuevo?.id
      }
      if (!propietarioId) { setMensaje('Error al crear propietario'); return }

      const { data: mascota } = await supabase.from('mascotas').insert({
        propietario_id: propietarioId,
        nombre: form.nombre_mascota,
        especie: form.especie,
        raza: form.raza || null,
        estado: 'activa',
      }).select('id').single()
      if (!mascota) { setMensaje('Error al crear mascota'); return }

      // Crear entrada en historia clínica
      await supabase.from('historias_clinicas').insert({
        mascota_id: mascota.id,
        veterinario_id: form.veterinario_id || profile!.id,
        tipo: 'consulta',
        descripcion: form.descripcion,
        fecha: form.fecha,
      })
      setMensaje('✅ Consulta registrada y mascota creada.')
    } else {
      // Solo añadir historial
      await supabase.from('historias_clinicas').insert({
        mascota_id: selectedPaciente.id,
        veterinario_id: form.veterinario_id || profile!.id,
        tipo: 'consulta',
        descripcion: form.descripcion,
        fecha: form.fecha,
      })
      setMensaje('✅ Consulta agregada al historial.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🩺 Registro de Consulta</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Paciente</label>
          <select
            onChange={(e) => handlePacienteChange(e.target.value)}
            className="w-full border rounded-xl px-4 py-2"
            defaultValue=""
          >
            <option value="">-- Seleccionar paciente existente --</option>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.numero_historia_clinica})</option>)}
            <option value="__new__">+ Nuevo paciente</option>
          </select>
        </div>

        {nuevoPaciente && (
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-gray-50">
            <input type="text" placeholder="Nombre del propietario" value={form.propietario_nombre} onChange={e => setForm({...form, propietario_nombre: e.target.value})} className="border rounded-xl px-4 py-2" required />
            <input type="text" placeholder="Cédula" value={form.propietario_cedula} onChange={e => setForm({...form, propietario_cedula: e.target.value})} className="border rounded-xl px-4 py-2" />
            <input type="text" placeholder="Teléfono" value={form.propietario_telefono} onChange={e => setForm({...form, propietario_telefono: e.target.value})} className="border rounded-xl px-4 py-2" />
            <input type="text" placeholder="Nombre de la mascota" value={form.nombre_mascota} onChange={e => setForm({...form, nombre_mascota: e.target.value})} className="border rounded-xl px-4 py-2" required />
            <select value={form.especie} onChange={e => setForm({...form, especie: e.target.value})} className="border rounded-xl px-4 py-2">
              <option value="perro">Perro</option><option value="gato">Gato</option><option value="ave">Ave</option><option value="otro">Otro</option>
            </select>
            <input type="text" placeholder="Raza" value={form.raza} onChange={e => setForm({...form, raza: e.target.value})} className="border rounded-xl px-4 py-2" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Fecha</label>
          <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Descripción de la consulta</label>
          <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full border rounded-xl px-4 py-2" rows={4} required />
        </div>
        <div>
          <label className="text-sm font-medium">Veterinario responsable</label>
          <select value={form.veterinario_id} onChange={e => setForm({...form, veterinario_id: e.target.value})} className="w-full border rounded-xl px-4 py-2">
            <option value="">-- Seleccionar veterinario --</option>
            {veterinarios.map(v => <option key={v.id} value={v.id}>{v.nombre_completo}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold">Registrar Consulta</button>
        {mensaje && <p className={`text-sm ${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{mensaje}</p>}
      </form>
    </div>
  )
}