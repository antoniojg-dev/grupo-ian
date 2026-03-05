import { createClient } from '@/lib/supabase/server'
import { getPagos } from '@/services/pagos'
import { getAlumnos } from '@/services/alumnos'
import { getServicios } from '@/services/servicios'
import PagosTable from '@/components/admin/PagosTable'

export default async function PagosPage() {
  const supabase = await createClient()

  let pagos: import('@/types').Pago[] = []
  let alumnos: import('@/types').Alumno[] = []
  let servicios: import('@/types').Servicio[] = []

  try {
    ;[pagos, alumnos, servicios] = await Promise.all([
      getPagos(supabase),
      getAlumnos(supabase),
      getServicios(supabase),
    ])
  } catch {
    // Tabla no existe aún — mostrar vacío
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Pagos
          </h1>
          <p className="font-quicksand text-sm text-gray-500 mt-1">
            Reporte de pagos con filtros y exportación
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <PagosTable pagos={pagos} alumnos={alumnos} servicios={servicios} />
        </div>
      </div>
    </main>
  )
}
