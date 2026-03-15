'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import ContactModal from './ContactModal'

export default function FloatingWhatsApp() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ian-dark text-white text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none">
          ¡Escríbenos!
        </span>
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          aria-label="Contactar por WhatsApp"
          className="bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-pulse-whatsapp"
          style={{ boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)' }}
        >
          <MessageCircle className="w-7 h-7" aria-hidden="true" />
        </button>
      </div>
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        tipo="kinder"
        interesInicial="Kinder 1"
      />
    </>
  )
}
