import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Pedido = {
  id: string
  cliente_id: string
  estado: string
  tipo_entrega: string
  direccion_envio: string | null
  notas: string | null
  fecha_pedido: string
  items: { cantidad: number; precio_unitario: number; producto: { nombre: string } }[]
  perfil?: { nombre_completo: string; telefono: string }
}

export default function AdminPedidosPage() {
  const { profile } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [mensaje, setMensaje] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null) // ID del pedido expandido

  useEffect(() => {
    if (profile?.role && ['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile.role)) {
      fetchPedidos()
    }
  }, [profile])

  const fetchPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('id, cliente_id, estado, tipo_entrega, direccion_envio, notas, fecha_pedido, items:pedido_items(cantidad, precio_unitario, producto:productos(nombre)), perfil:profiles!cliente_id(nombre_completo, telefono)')
      .not('estado', 'in', '("carrito","entregado")')  // solo activos
      .order('fecha_pedido', { ascending: false })

    if (data) setPedidos(data as unknown as Pedido[])
  }

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id)
    if (!error) {
      setMensaje(`Pedido actualizado a "${nuevoEstado}".`)
      fetchPedidos() // recargar lista
      // La notificación al cliente se maneja por el realtime en su página (ya implementado)
    } else {
      setMensaje('Error: ' + error.message)
    }
    setTimeout(() => setMensaje(''), 3000)
  }

  if (!profile || !['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile.role))
    return <p className="p-4">Acceso denegado.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📋 Pedidos Activos</h1>

      {mensaje && (
        <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>
      )}

      {pedidos.length === 0 && <p>No hay pedidos activos.</p>}

      {pedidos.map((pedido) => {
        const estado = pedido.estado
        // Determinar qué botones están habilitados según el estado
        const puedeRecibir = estado === 'enviado'
        const puedeEnviar = estado === 'recibido'
        const puedeEntregar = estado === 'enviado_entrega'

        return (
          <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Cabecera (siempre visible) */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {pedido.perfil?.nombre_completo || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(pedido.fecha_pedido).toLocaleString()}</p>
                  <p className="text-sm">{pedido.tipo_entrega === 'domicilio' ? `🚚 ${pedido.direccion_envio}` : '🏥 Recoger en clínica'}</p>
                  {pedido.notas && <p className="text-sm text-gray-500">📝 {pedido.notas}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  estado === 'enviado' ? 'bg-yellow-100 text-yellow-700' :
                  estado === 'recibido' ? 'bg-blue-100 text-blue-700' :
                  estado === 'enviado_entrega' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {estado.replace('_', ' ')}
                </span>
              </div>

              {/* Resumen de items (visible) */}
              <div className="mt-2 text-sm">
                {pedido.items.map((item, idx) => (
                  <span key={idx}>
                    {item.producto?.nombre} x{item.cantidad}
                    {idx < pedido.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Detalle expandible */}
            {expandido === pedido.id && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <h3 className="font-semibold mb-3">Detalles del pedido</h3>
                <ul className="divide-y text-sm mb-4">
                  {pedido.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between py-1">
                      <span>{item.producto?.nombre} x{item.cantidad}</span>
                      <span>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Datos del cliente */}
                {pedido.perfil && (
                  <div className="text-sm text-gray-700 mb-4">
                    <p><strong>Cliente:</strong> {pedido.perfil.nombre_completo}</p>
                    {pedido.perfil.telefono && (
                      <div className="flex items-center gap-3 mt-2">
                        <span>📞 {pedido.perfil.telefono}</span>
                        <a
                          href={`tel:${pedido.perfil.telefono}`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Llamar
                        </a>
                        <a
                          href={`https://wa.me/${pedido.perfil.telefono.replace(/\D/g,'')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline text-xs font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Botones de acción (estado) */}
                <div className="flex gap-2">
                  {puedeRecibir && (
                    <button
                      onClick={() => actualizarEstado(pedido.id, 'recibido')}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm"
                    >
                      ✅ Recibido
                    </button>
                  )}
                  {puedeEnviar && (
                    <button
                      onClick={() => actualizarEstado(pedido.id, 'enviado_entrega')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm"
                    >
                      🚀 Enviado
                    </button>
                  )}
                  {puedeEntregar && (
                    <button
                      onClick={() => actualizarEstado(pedido.id, 'entregado')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 text-sm"
                    >
                      📬 Entregado
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}