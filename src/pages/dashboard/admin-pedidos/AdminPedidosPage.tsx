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
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    if (
      profile?.role &&
      ['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile.role)
    ) {
      fetchPedidos()
    }
  }, [profile])

  const fetchPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select(
        'id, cliente_id, estado, tipo_entrega, direccion_envio, notas, fecha_pedido, items:pedido_items(cantidad, precio_unitario, producto:productos(nombre)), perfil:profiles!cliente_id(nombre_completo, telefono)'
      )
      .not('estado', 'in', '("carrito","entregado")')
      .order('fecha_pedido', { ascending: false })

    if (data) setPedidos(data as unknown as Pedido[])
  }

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    setMensaje('')
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje(`Pedido actualizado a "${nuevoEstado}".`)
      fetchPedidos() // recargar la lista
      // La notificación al cliente ocurre por la suscripción en tiempo real en su página "Mis Pedidos"
    }
    setTimeout(() => setMensaje(''), 3000)
  }

  if (
    !profile ||
    !['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile.role)
  )
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
        const puedeRecibir = estado === 'enviado'
        const puedeEnviar = estado === 'recibido'
        const puedeEntregar = estado === 'enviado_entrega'

        // Calcular importe total
        const total = pedido.items.reduce(
          (sum, item) => sum + item.cantidad * item.precio_unitario,
          0
        )

        return (
          <div
            key={pedido.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Cabecera siempre visible (desglose completo) */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">
                    {pedido.perfil?.nombre_completo || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(pedido.fecha_pedido).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    {pedido.tipo_entrega === 'domicilio'
                      ? `🚚 Envío a domicilio`
                      : '🏥 Recoger en clínica'}
                    {pedido.tipo_entrega === 'domicilio' && pedido.direccion_envio && (
                      <span className="ml-2 text-gray-500">({pedido.direccion_envio})</span>
                    )}
                  </p>
                </div>
                {/* Estado actual solo como referencia pequeña */}
                <span className="text-xs text-gray-400 capitalize">
                  {estado.replace('_', ' ')}
                </span>
              </div>

              {/* Desglose de artículos */}
              <div className="border-t border-gray-100 pt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left font-normal">Producto</th>
                      <th className="text-right font-normal">Cant</th>
                      <th className="text-right font-normal">P. Unit</th>
                      <th className="text-right font-normal">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{item.producto?.nombre}</td>
                        <td className="text-right">{item.cantidad}</td>
                        <td className="text-right">${item.precio_unitario.toFixed(2)}</td>
                        <td className="text-right">
                          ${(item.cantidad * item.precio_unitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2 font-bold text-sm">
                  Importe total: ${total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Detalle expandible (datos de contacto + botones de acción) */}
            {expandido === pedido.id && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                {/* Contacto */}
                {pedido.perfil && (
                  <div className="text-sm text-gray-700 mb-4">
                    <p>
                      <strong>Teléfono:</strong> {pedido.perfil.telefono || 'No registrado'}
                    </p>
                    {pedido.perfil.telefono && (
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href={`tel:${pedido.perfil.telefono}`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞 Llamar
                        </a>
                        <a
                          href={`https://wa.me/${pedido.perfil.telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline text-xs font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                    {pedido.notas && (
                      <p className="mt-2">
                        <strong>Notas:</strong> {pedido.notas}
                      </p>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  {puedeRecibir && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        actualizarEstado(pedido.id, 'recibido')
                      }}
                      disabled={!puedeRecibir}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        puedeRecibir
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ✅ Recibido
                    </button>
                  )}
                  {puedeEnviar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        actualizarEstado(pedido.id, 'enviado_entrega')
                      }}
                      disabled={!puedeEnviar}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        puedeEnviar
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🚀 Enviado
                    </button>
                  )}
                  {puedeEntregar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        actualizarEstado(pedido.id, 'entregado')
                      }}
                      disabled={!puedeEntregar}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        puedeEntregar
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
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