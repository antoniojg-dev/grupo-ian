import { CheckCircle2, Clock, AlertCircle, Ban } from 'lucide-react'

type Estado = 'pagado' | 'pendiente' | 'vencido' | 'condonado'

const CONFIG: Record<Estado, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  bg: string
  text: string
}> = {
  pagado: {
    label: 'Pagado',
    icon: CheckCircle2,
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  vencido: {
    label: 'Vencido',
    icon: AlertCircle,
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  condonado: {
    label: 'Condonado',
    icon: Ban,
    bg: 'bg-gray-100',
    text: 'text-gray-500',
  },
}

export default function PagoStatusBadge({ estado }: { estado: Estado }) {
  const { label, icon: Icon, bg, text } = CONFIG[estado] ?? CONFIG.pendiente

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-quicksand ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
