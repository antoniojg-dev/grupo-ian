import { createClient } from '@/lib/supabase/server'
import { getKPIs, getUltimosPagos, getAlumnosConAdeudo } from '@/services/pagos'
import KPICard from '@/components/admin/KPICard'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [kpis, ultimosPagos, alumnosConAdeudo] = await Promise.allSettled([
    getKPIs(supabase),
    getUltimosPagos(supabase, 5),
    getAlumnosConAdeudo(supabase),
  ])

  const kpiData = kpis.status === 'fulfilled' ? kpis.value : {
    total_cobrado: 0,
    alumnos_al_corriente: 0,
    alumnos_con_adeudo: 0,
    inscripciones_pendientes: 0,
    total_alumnos_activos: 0,
  }

  const pagos = ultimosPagos.status === 'fulfilled' ? ultimosPagos.value : []
  const adeudos = alumnosConAdeudo.status === 'fulfilled' ? alumnosConAdeudo.value : []

  const now = new Date()
  const mesActual = MESES[now.getMonth()]

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            Resumen General
          </h1>
          <p className="font-quicksand text-sm text-gray-500 mt-1">
            {mesActual} {now.getFullYear()} — Vista general del sistema
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Cobrado este mes"
            value={formatMXN(kpiData.total_cobrado)}
            subtitle={`${mesActual} ${now.getFullYear()}`}
            color="green"
          />
          <KPICard
            title="Alumnos al corriente"
            value={`${kpiData.alumnos_al_corriente} / ${kpiData.total_alumnos_activos}`}
            subtitle="Pagaron este mes"
            color="blue"
          />
          <KPICard
            title="Alumnos con adeudo"
            value={kpiData.alumnos_con_adeudo}
            subtitle="Sin pago este mes"
            color="red"
            alert={kpiData.alumnos_con_adeudo > 0}
          />
          <KPICard
            title="Inscripciones pendientes"
            value={kpiData.inscripciones_pendientes}
            subtitle="Sin completar"
            color="orange"
            alert={kpiData.inscripciones_pendientes > 0}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ultimos pagos */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-fredoka text-lg font-semibold mb-4" style={{ color: 'var(--ian-dark)' }}>
              Ultimos pagos recibidos
            </h2>
            {pagos.length === 0 ? (
              <p className="font-quicksand text-sm text-gray-400 text-center py-6">Sin pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-quicksand font-medium text-sm text-gray-800">
                        {pago.alumnos ? `${pago.alumnos.nombre} ${pago.alumnos.apellido}` : '—'}
                      </p>
                      <p className="font-quicksand text-xs text-gray-400">
                        {pago.servicios?.nombre ?? 'Pago'}
                        {pago.periodo_mes && pago.periodo_anio
                          ? ` · ${MESES[pago.periodo_mes - 1]} ${pago.periodo_anio}`
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-quicksand font-semibold text-sm" style={{ color: 'var(--ian-green)' }}>
                        {formatMXN(pago.monto_final)}
                      </p>
                      <p className="font-quicksand text-xs text-gray-400">
                        {pago.paid_at
                          ? new Date(pago.paid_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alumnos con adeudo */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-fredoka text-lg font-semibold mb-4" style={{ color: 'var(--ian-dark)' }}>
              Alumnos con adeudo — {mesActual}
            </h2>
            {adeudos.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-quicksand text-sm text-green-600 font-medium">
                  ¡Todos al corriente este mes!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {adeudos.slice(0, 8).map((alumno) => (
                  <div key={alumno.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--ian-red)' }} />
                      <div>
                        <p className="font-quicksand text-sm font-medium text-gray-800">
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        <p className="font-quicksand text-xs text-gray-400">{alumno.grado}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {adeudos.length > 8 && (
                  <p className="font-quicksand text-xs text-gray-400 pt-2">
                    y {adeudos.length - 8} más...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
