type KPICardProps = {
  title: string
  value: string | number
  subtitle?: string
  color: 'green' | 'blue' | 'red' | 'orange'
  alert?: boolean
}

const COLOR_MAP = {
  green: 'var(--ian-green)',
  blue: 'var(--ian-blue)',
  red: 'var(--ian-red)',
  orange: 'var(--ian-orange)',
}

const BG_MAP = {
  green: '#F0FDF4',
  blue: '#EFF6FF',
  red: '#FEF2F2',
  orange: '#FFF7ED',
}

export default function KPICard({ title, value, subtitle, color, alert }: KPICardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
      style={{ borderLeftWidth: 4, borderLeftColor: COLOR_MAP[color] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-quicksand text-sm text-gray-500 mb-1">{title}</p>
          <p
            className="font-fredoka text-3xl font-semibold truncate"
            style={{ color: alert ? COLOR_MAP[color] : 'var(--ian-dark)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="font-quicksand text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: BG_MAP[color] }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COLOR_MAP[color] }}
          />
        </div>
      </div>
    </div>
  )
}
