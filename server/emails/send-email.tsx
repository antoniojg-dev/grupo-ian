import { Resend } from 'resend'
import { render } from '@react-email/render'
import ConfirmacionPago from './templates/confirmacion-pago'
import RecordatorioPago from './templates/recordatorio-pago'
import Bienvenida from './templates/bienvenida'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `Grupo IAN <${process.env.RESEND_FROM_EMAIL ?? 'noreply@grupoian.mx'}>`

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

  const html = await render(
    <ConfirmacionPago
      nombrePadre={nombrePadre}
      nombreAlumno={nombreAlumno}
      folio={folio}
      concepto={concepto}
      periodo={periodo}
      montoFinal={montoFinal}
      pdfUrl={pdfUrl}
    />
  )

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recibo de pago — ${nombreAlumno} — ${periodo}`,
    html,
  })
}

export async function sendRecordatorioPago(data: RecordatorioData) {
  const { to, nombrePadre, nombreAlumno, montoPendiente, diasVencido } = data

  const html = await render(
    <RecordatorioPago
      nombrePadre={nombrePadre}
      nombreAlumno={nombreAlumno}
      montoPendiente={montoPendiente}
      diasVencido={diasVencido}
      portalUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://grupoian.mx'}/dashboard/padre`}
    />
  )

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recordatorio de pago pendiente — ${nombreAlumno}`,
    html,
  })
}

export async function sendBienvenida(data: BienvenidaData) {
  const { to, nombrePadre, nombreAlumno, portalUrl } = data

  const html = await render(
    <Bienvenida
      nombrePadre={nombrePadre}
      nombreAlumno={nombreAlumno}
      portalUrl={portalUrl}
    />
  )

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenido al Portal de Padres — Grupo IAN',
    html,
  })
}
