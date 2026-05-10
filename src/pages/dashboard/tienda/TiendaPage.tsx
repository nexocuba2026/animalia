import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { Link } from 'react-router-dom'

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
  categoria: string
}

export default function TiendaPage() {
  const { profile } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [filtroCat, setFiltroCat] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        if (data) {
          setProductos(data)
          const cats = Array.from(new Set(data.map((p) => p.categoria)))
          setCategorias(cats as string[])
        }
        setCargando(false)
      })
  }, [])

  const agregarAlCarrito = async (producto: Producto) => {
    if (!profile) return

    const { data: pedidoData } = await supabase
      .from('pedidos')
      .select('id')
      .eq('cliente_id', profile.id)
      .eq('estado', 'carrito')
      .single()

    let pedidoId = pedidoData?.id
    if (!pedidoId) {
      const { data: nuevo } = await supabase
        .from('pedidos')
        .insert({ cliente_id: profile.id, estado: 'carrito', tipo_entrega: 'recogida' })
        .select('id')
        .single()
      pedidoId = nuevo?.id
    }
    if (!pedidoId) return

    const { data: itemExistente } = await supabase
      .from('pedido_items')
      .select('id, cantidad')
      .eq('pedido_id', pedidoId)
      .eq('producto_id', producto.id)
      .single()

    if (itemExistente) {
      await supabase
        .from('pedido_items')
        .update({ cantidad: itemExistente.cantidad + 1 })
        .eq('id', itemExistente.id)
    } else {
      await supabase.from('pedido_items').insert({
        pedido_id: pedidoId,
        producto_id: producto.id,
        cantidad: 1,
        precio_unitario: producto.precio,
      })
    }

    setToast(`✅ ${producto.nombre} añadido al carrito`)
    setTimeout(() => setToast(null), 2000)
  }

  const productosFiltrados = productos.filter((p) => {
    const coincideCat = filtroCat === 'todas' || p.categoria === filtroCat
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCat && coincideBusqueda
  })

  if (cargando) return <p className="p-4">Cargando tienda...</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛍️ Tienda Veterinaria</h1>
        <Link
          to="/dashboard/tienda/carrito"
          className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 text-sm font-semibold"
        >
          🛒 Ver carrito
        </Link>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-2"
        />
        <select
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)}
          className="border rounded-xl px-4 py-2"
        >
          <option value="todas">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img
              src={prod.imagen_url || '/placeholder.png'}
              alt={prod.nombre}
              className="w-full h-40 object-contain bg-gray-100 p-4"
            />
            <div className="p-4">
              <span className="text-xs text-orange-600 uppercase font-semibold">{prod.categoria}</span>
              <h3 className="font-bold mt-1">{prod.nombre}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{prod.descripcion}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-green-700">${prod.precio.toFixed(2)}</span>
                <button
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg"
                >
                  + Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}