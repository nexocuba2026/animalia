import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Pedido = {
  id: string
  estado: string
  tipo_entrega: string
  direccion_envio: string | null
  notas: string | null
  fecha_pedido: string
  items: { cantidad: number; precio_unitario: number; producto: { nombre: string } }[]
}

export default function PedidosPage() {
  const { profile } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('pedidos')
      .select('id, estado, tipo_entrega, direccion_envio, notas, fecha_pedido, items:pedido_items(cantidad, precio_unitario, producto:productos(nombre))')
      .eq('cliente_id', profile.id)
      .neq('estado', 'carrito')
      .order('fecha_pedido', { ascending: false })
      .then(({ data }) => {
        if (data) setPedidos(data as unknown as Pedido[])
        setCargando(false)
      })
  }, [profile])

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'enviado': return 'bg-yellow-100 text-yellow-700'
      case 'preparando': return 'bg-blue-100 text-blue-700'
      case 'listo': return 'bg-green-100 text-green-700'
      case 'entregado': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (cargando) return <p className="p-4">Cargando pedidos...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📦 Mis Pedidos</h1>
      {pedidos.length === 0 && <p className="text-gray-500">No tienes pedidos realizados.</p>}
      {pedidos.map((pedido) => (
        <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Pedido del {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400">{pedido.tipo_entrega === 'domicilio' ? 'Envío a domicilio' : 'Recogida en clínica'}</p>
              {pedido.direccion_envio && <p className="text-xs text-gray-400">📍 {pedido.direccion_envio}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor(pedido.estado)}`}>
              {pedido.estado.toUpperCase()}
            </span>
          </div>
          <ul className="divide-y">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="flex justify-between py-1 text-sm">
                <span>{item.producto?.nombre} x{item.cantidad}</span>
                <span>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {pedido.notas && <p className="text-xs text-gray-500 mt-2">📝 {pedido.notas}</p>}
        </div>
      ))}
    </div>
  )
}