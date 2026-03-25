/**
 * Número oficial de WhatsApp — Grupo IAN
 * Formato wa.me: código país (52) + número (5578072426)
 */
export const WHATSAPP_NUMBER = '525578072426'
export const WHATSAPP_URL = 'https://wa.me/525578072426'

export const SEMILLAS_PRICES = {
  siembra: process.env.STRIPE_PRICE_SEMILLAS_SIEMBRA!,
  crece: process.env.STRIPE_PRICE_SEMILLAS_CRECE!,
  florece: process.env.STRIPE_PRICE_SEMILLAS_FLORECE!,
}

export const SEMILLAS_INFO = {
  siembra: {
    nombre: 'Siembra',
    precio: 125000, // centavos
    descripcion: '1hr Regularización + 1hr Natación',
    horas: '2 hrs/semana',
    color: '#FF4B6E',
  },
  crece: {
    nombre: 'Crece',
    precio: 180000,
    descripcion: '3hrs Regularización (L/M/J) + 2hrs Natación (M/J)',
    horas: '5 hrs/semana',
    color: '#F5C518',
  },
  florece: {
    nombre: 'Florece',
    precio: 250000,
    descripcion: '4hrs Regularización (L/M/Mi/J) + 3hrs Natación (M/J/V)',
    horas: '7 hrs/semana',
    color: '#00BFA5',
  },
} as const
