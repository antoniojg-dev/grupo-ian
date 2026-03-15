'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react'
import type { CrmLead, CrmStatus, CrmTipo } from '@/services/crm'
import ContactModal from '@/components/landing/ContactModal'

const STATUSES: CrmStatus[] = ['nuevo', 'contactado', 'en_proceso', 'inscrito', 'cancelado']

const STATUS_LABELS: Record<CrmStatus, string> = {
  nuevo: 'Nuevo contacto',
  contactado: 'Contactado',
  en_proceso: 'En proceso',
  inscrito: 'Inscrito',
  cancelado: 'Cancelado',
}

const STATUS_EMOJI: Record<CrmStatus, string> = {
  nuevo: '🔵',
  contactado: '🟡',
  en_proceso: '🟠',
  inscrito: '🟢',
  cancelado: '⚫',
}

type Props = {
  leadsKinder: CrmLead[]
  leadsSemillas: CrmLead[]
}

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CrmDashboard({ leadsKinder, leadsSemillas }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<CrmTipo>('kinder')
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [cancelLead, setCancelLead] = useState<CrmLead | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [notesLead, setNotesLead] = useState<CrmLead | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [updating, setUpdating] = useState(false)

  const leads = tipo === 'kinder' ? leadsKinder : leadsSemillas
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s)
    return acc
  }, {} as Record<CrmStatus, CrmLead[]>)

  const patchLead = async (id: string, data: { status?: CrmStatus; notas?: string; razon_cancelacion?: string }) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) router.refresh()
    } finally {
      setUpdating(false)
    }
  }

  const move = (lead: CrmLead, direction: 'prev' | 'next') => {
    const idx = STATUSES.indexOf(lead.status)
    if (direction === 'prev' && idx > 0) {
      const next = STATUSES[idx - 1]
      if (next === 'cancelado') {
        setCancelLead(lead)
        setCancelReason('')
      } else {
        patchLead(lead.id, { status: next })
      }
    }
    if (direction === 'next' && idx < STATUSES.length - 1) {
      const next = STATUSES[idx + 1]
      if (next === 'cancelado') {
        setCancelLead(lead)
        setCancelReason('')
      } else {
        patchLead(lead.id, { status: next })
      }
    }
  }

  const confirmCancel = () => {
    if (!cancelLead) return
    patchLead(cancelLead.id, {
      status: 'cancelado',
      razon_cancelacion: cancelReason.trim() || undefined,
    })
    setCancelLead(null)
    setCancelReason('')
  }

  const openNotes = (lead: CrmLead) => {
    setNotesLead(lead)
    setNotesValue(lead.notas ?? '')
  }

  const saveNotes = async () => {
    if (!notesLead) return
    await patchLead(notesLead.id, { notas: notesValue })
    setNotesLead(null)
    setNotesValue('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-fredoka text-2xl font-bold text-ian-dark">
          CRM — Prospectos
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setTipo('kinder')}
              className={`px-4 py-2 text-sm font-medium transition ${
                tipo === 'kinder' ? 'bg-ian-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kinder
            </button>
            <button
              type="button"
              onClick={() => setTipo('semillas')}
              className={`px-4 py-2 text-sm font-medium transition ${
                tipo === 'semillas' ? 'bg-ian-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Semillas de Sabiduría
            </button>
          </div>
          <button
            type="button"
            onClick={() => setContactModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ian-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition"
          >
            <Users className="w-4 h-4" /> Agregar contacto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="min-w-[260px] rounded-xl bg-gray-50 border border-gray-200 p-3 flex flex-col max-h-[70vh] overflow-hidden"
          >
            <h2 className="font-quicksand font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>{STATUS_EMOJI[status]}</span> {STATUS_LABELS[status]}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3">
              {byStatus[status].map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg bg-white border border-gray-200 p-3 shadow-sm"
                >
                  <p className="font-medium text-gray-900 truncate">{lead.nombre}</p>
                  <a
                    href={`https://wa.me/52${lead.whatsapp.replace(/\D/g, '').slice(0, 10)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline truncate block"
                  >
                    {lead.whatsapp}
                  </a>
                  <p className="text-xs text-gray-500 truncate">{lead.interes}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(lead.created_at)}
                  </p>
                  <div className="flex items-center justify-between mt-2 gap-1">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => move(lead, 'prev')}
                        disabled={updating || lead.status === 'nuevo'}
                        className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Mover atrás"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(lead, 'next')}
                        disabled={updating || lead.status === 'cancelado'}
                        className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Mover adelante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => openNotes(lead)}
                      className="p-1 rounded text-gray-500 hover:bg-gray-100"
                      aria-label="Notas"
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {contactModalOpen && (
        <ContactModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          tipo={tipo}
          interesInicial={tipo === 'kinder' ? 'Maternal' : 'Paquete Siembra'}
        />
      )}

      {cancelLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5">
            <h3 className="font-fredoka text-lg font-semibold text-gray-900 mb-2">
              Razón de cancelación
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 min-h-[100px] text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
              placeholder="Opcional"
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCancelLead(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="flex-1 py-2 rounded-xl bg-ian-red text-white font-semibold hover:bg-red-700"
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {notesLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5">
            <h3 className="font-fredoka text-lg font-semibold text-gray-900 mb-2">
              Notas — {notesLead.nombre}
            </h3>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 min-h-[120px] text-gray-900 focus:border-ian-red focus:outline-none focus:ring-1 focus:ring-ian-red"
              placeholder="Agregar o editar notas..."
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => { setNotesLead(null); setNotesValue('') }}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={saveNotes}
                className="flex-1 py-2 rounded-xl bg-ian-red text-white font-semibold hover:bg-red-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
