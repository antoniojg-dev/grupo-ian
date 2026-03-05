import { Resend } from 'resend'
import { createElement } from 'react'
import ConfirmacionPago from './templates/confirmacion-pago'
import RecordatorioPago from './templates/recordatorio-pago'
import Bienvenida from './templates/bienvenida'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@grupoian.mx'

export interface ConfirmacionPagoData {
  to: string
  nombrePadre: string
  nombreAlumno: string
  folio: string
  concepto: string
  periodo: string
  montoFinal: number // centavos
  pdfUrl?: string
}

export interface RecordatorioData {
  to: string
  nombrePadre: string
  nombreAlumno: string
  montoPendiente: number // centavos
  diasVencido?: number
}

export interface BienvenidaData {
  to: string
  nombrePadre: string
  nombreAlumno: string
  portalUrl: string
}

export async function sendConfirmacionPago(data: ConfirmacionPagoData) {
  const { to, nombrePadre, nombreAlumno, folio, concepto, periodo, montoFinal, pdfUrl } = data

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recibo de pago — ${nombreAlumno} — ${periodo}`,
    react: createElement(ConfirmacionPago, {
      nombrePadre,
      nombreAlumno,
      folio,
      concepto,
      periodo,
      montoFinal,
      pdfUrl,
    }),
  })
}

export async function sendRecordatorioPago(data: RecordatorioData) {
  const { to, nombrePadre, nombreAlumno, montoPendiente, diasVencido } = data

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recordatorio de pago pendiente — ${nombreAlumno}`,
    react: createElement(RecordatorioPago, {
      nombrePadre,
      nombreAlumno,
      montoPendiente,
      diasVencido,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://grupoian.mx'}/dashboard/padre`,
    }),
  })
}

export async function sendBienvenida(data: BienvenidaData) {
  const { to, nombrePadre, nombreAlumno, portalUrl } = data

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenido al Portal de Padres — Grupo IAN',
    react: createElement(Bienvenida, {
      nombrePadre,
      nombreAlumno,
      portalUrl,
    }),
  })
}
