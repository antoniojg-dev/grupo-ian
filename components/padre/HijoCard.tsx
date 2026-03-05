import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, GraduationCap, ArrowRight, CreditCard } from 'lucide-react'
import { AlumnoConPago } from '@/types'

const SEMAFORO = {
  pagado: {
    label: 'Al corriente',
    icon: CheckCircle2,
    dotColor: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  pendiente: {
    label: 'Pago pendiente',
    icon: Clock,
    dotColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  vencido: {
    label: 'Pago vencido',
    icon: AlertCircle,
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  condonado: {
    label: 'Al corriente',
    icon: CheckCircle2,
    dotColor: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
}

export default function HijoCard({ alumno }: { alumno: AlumnoConPago }) {
  const estado = alumno.estado_pago_mes ?? 'pendiente'
  const sem = SEMAFORO[estado] ?? SEMAFORO.pendiente
  const Icon = sem.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header: nombre + semáforo */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-fredoka text-xl font-semibold" style={{ color: 'var(--ian-dark)' }}>
            {alumno.nombre} {alumno.apellido}
          </h3>
          <p className="font-quicksand text-sm text-gray-500 mt-0.5">
            {alumno.grado}{alumno.grupo ? ` — Grupo ${alumno.grupo}` : ''}
          </p>
        </div>

        {/* Semáforo badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${sem.bgColor} ${sem.borderColor}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${sem.dotColor} flex-shrink-0`} />
          <Icon className={`w-3.5 h-3.5 ${sem.textColor}`} />
          <span className={`font-quicksand text-xs font-semibold ${sem.textColor} whitespace-nowrap`}>
            {sem.label}
          </span>
        </div>
      </div>

      {/* Beca */}
      {alumno.beca_porcentaje > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-quicksand text-sm text-blue-700">
            Beca aplicada: <strong>{alumno.beca_porcentaje}%</strong>
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="pt-1 flex flex-wrap gap-2">
        {(estado === 'pendiente' || estado === 'vencido') && (
          <Link
            href="/dashboard/padre/pagos"
            className="inline-flex items-center gap-2 font-quicksand text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 text-white"
            style={{ backgroundColor: estado === 'vencido' ? 'var(--ian-red)' : 'var(--ian-blue)' }}
          >
            <CreditCard className="w-4 h-4" />
            Pagar ahora
          </Link>
        )}
        <Link
          href="/dashboard/padre/pagos"
          className="inline-flex items-center gap-2 font-quicksand text-sm font-medium px-4 py-2 rounded-xl transition-colors text-gray-600 border border-gray-200 hover:bg-gray-50"
        >
          Ver pagos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
