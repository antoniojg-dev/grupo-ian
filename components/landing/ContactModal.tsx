'use client'

import { useState, useEffect } from 'react'
import { WHATSAPP_URL } from '@/config/constants'

const KINDER_OPCIONES = ['Maternal', 'Nursery', 'Kinder 1', 'Kinder 2', 'Kinder 3'] as const
const SEMILLAS_OPCIONES = ['Paquete Siembra', 'Paquete Crece', 'Paquete Florece'] as const

export type ContactModalTipo = 'kinder' | 'semillas'

type Props = {
  isOpen: boolean
  onClose: () => void
  tipo: ContactModalTipo
  interesInicial: string
  /** Si no se pasa, se construye desde tipo e interes (Hola! Me gustaría pedir informes para...) */
  mensajeWhatsapp?: string
}

function buildMensajeWhatsapp(tipo: ContactModalTipo, interes: string): string {
  if (tipo === 'kinder') return `Hola! Me gustaría pedir informes para ${interes}`
  return `Hola! Me gustaría pedir informes para el ${interes}`
}

export default function ContactModal({
  isOpen,
  onClose,
  tipo,
  interesInicial,
  mensajeWhatsapp: mensajeWhatsappProp,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [interes, setInteres] = useState(interesInicial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openedAt, setOpenedAt] = useState<number | null>(null)
  const [honey, setHoney] = useState('')

  useEffect(() => {
    if (isOpen && openedAt === null) setOpenedAt(Date.now())
    if (!isOpen) {
      setNombre('')
      setWhatsapp('')
      setEmail('')
      setInteres(interesInicial)
      setError('')
      setHoney('')
      setOpenedAt(null)
    }
  }, [isOpen, interesInicial, openedAt])

  const opciones = tipo === 'kinder' ? KINDER_OPCIONES : SEMILLAS_OPCIONES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (nombre.trim().length < 3) {
      setError('Nombre debe tener al menos 3 caracteres.')
      return
    }
    const whatsappDigits = whatsapp.replace(/\D/g, '')
    if (whatsappDigits.length !== 10) {
      setError('WhatsApp debe ser 10 dígitos.')
      return
    }
    if (openedAt !== null && Date.now() - openedAt < 3000) {
      return
    }
    if (honey) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          nombre: nombre.trim(),
          whatsapp: whatsappDigits,
          email: email.trim() || undefined,
          interes,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError('Has enviado muchos mensajes. Intenta en una hora.')
          return
        }
        setError(data?.error ?? 'Error al enviar. Intenta de nuevo.')
        return
      }

      const mensaje = mensajeWhatsappProp ?? buildMensajeWhatsapp(tipo, interes)
      const text = encodeURIComponent(mensaje)
      window.location.href = `${WHATSAPP_URL}?text=${text}`
      onClose()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <header
          className="flex items-center justify-between rounded-t-2xl px-5 py-4 text-white"
          style={{ backgroundColor: '#E00700' }}
        >
          <h2 id="contact-modal-title" className="font-fredoka text-lg font-semibold">
            Solicitar información
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/90 transition hover:bg-white/20"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="contact-nombre" className="mb-1 block text-sm font-medium text-gray-700">
              Nombre completo (padre/madre) *
            </label>
            <input
              id="contact-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              minLength={3}
              maxLength={100}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="contact-whatsapp" className="mb-1 block text-sm font-medium text-gray-700">
              WhatsApp *
            </label>
            <input
              id="contact-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              pattern="[0-9]{10}"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
              placeholder="10 dígitos"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email (opcional)
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="contact-interes" className="mb-1 block text-sm font-medium text-gray-700">
              Grado o Paquete de interés
            </label>
            <select
              id="contact-interes"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
            >
              {opciones.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Honeypot: oculto con posición fuera de vista, no display:none */}
          <div
            className="absolute opacity-0 pointer-events-none"
            style={{ position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
          >
            <label htmlFor="contact-company">Empresa</label>
            <input
              id="contact-company"
              type="text"
              name="company"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 font-quicksand font-semibold text-white transition disabled:opacity-70"
            style={{ backgroundColor: '#E00700' }}
          >
            {loading ? 'Enviando…' : 'Enviar y abrir WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  )
}
