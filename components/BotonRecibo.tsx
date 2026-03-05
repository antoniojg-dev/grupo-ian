'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
  folio: string
  pdfUrl?: string | null
}

export default function BotonRecibo({ folio, pdfUrl }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
      return
    }

    setLoading(true)
    try {
      // El API hace redirect a la URL firmada del PDF
      const res = await fetch(`/api/recibos/${folio}`, { redirect: 'follow' })
      if (res.ok && res.url) {
        window.open(res.url, '_blank')
      } else {
        console.error('Error descargando recibo:', res.status)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Descargar recibo PDF"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-quicksand text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ color: 'var(--ian-blue)', border: '1px solid var(--ian-blue)' }}
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? 'Generando...' : 'Recibo'}
    </button>
  )
}
