import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface RecordatorioPagoProps {
  nombrePadre: string
  nombreAlumno: string
  montoPendiente: number // centavos
  diasVencido?: number
  portalUrl?: string
}

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

export default function RecordatorioPago({
  nombrePadre,
  nombreAlumno,
  montoPendiente,
  diasVencido,
  portalUrl = 'https://grupoian.mx/dashboard/padre',
}: RecordatorioPagoProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Recordatorio de pago pendiente — {nombreAlumno}</Preview>
      <Body style={body}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerTitle}>GRUPO IAN</Heading>
          <Text style={headerSubtitle}>El Futuro Es Hoy</Text>
        </Section>

        <Container style={container}>
          {/* Alerta */}
          <Section style={warningBanner}>
            <Heading style={warningTitle}>Recordatorio de pago pendiente</Heading>
          </Section>

          <Text style={greeting}>Hola, {nombrePadre}:</Text>
          <Text style={paragraph}>
            Te recordamos que tienes un pago pendiente para <strong>{nombreAlumno}</strong>.
          </Text>

          <Section style={amountBox}>
            <Text style={amountLabel}>Monto pendiente</Text>
            <Text style={amountValue}>{formatMXN(montoPendiente)}</Text>
            {diasVencido !== undefined && diasVencido > 0 && (
              <Text style={overdueText}>Vencido hace {diasVencido} día{diasVencido !== 1 ? 's' : ''}</Text>
            )}
          </Section>

          <Section style={buttonSection}>
            <Button href={portalUrl} style={primaryButton}>
              Ir al portal de pagos
            </Button>
          </Section>

          <Hr style={divider} />
          <Text style={disclaimer}>
            Si ya realizaste tu pago, por favor ignora este mensaje. Puede tomar algunas horas en reflejarse.
          </Text>
        </Container>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>Cerro Acasulco #42, Coyoacán, CDMX</Text>
          <Text style={footerText}>Tel: 55 7807 2426</Text>
          <Text style={footerText}>© 2026 Grupo IAN</Text>
        </Section>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const header: React.CSSProperties = {
  backgroundColor: '#E00700',
  textAlign: 'center',
  padding: '24px 0',
}

const headerTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  letterSpacing: '2px',
}

const headerSubtitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '14px',
  margin: 0,
  opacity: 0.9,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px 40px',
}

const warningBanner: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderLeft: '4px solid #FF6A1B',
  padding: '12px 16px',
  marginBottom: '24px',
  borderRadius: '4px',
}

const warningTitle: React.CSSProperties = {
  color: '#FF6A1B',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: 0,
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#1A1A2E',
  marginBottom: '8px',
}

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  color: '#555555',
  lineHeight: '1.6',
  marginBottom: '24px',
}

const amountBox: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  marginBottom: '24px',
}

const amountLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px 0',
}

const amountValue: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#FF6A1B',
  margin: '0 0 4px 0',
}

const overdueText: React.CSSProperties = {
  fontSize: '12px',
  color: '#ef4444',
  margin: 0,
}

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#E00700',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const disclaimer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center',
  lineHeight: '1.6',
}

const footer: React.CSSProperties = {
  backgroundColor: '#1A1A2E',
  textAlign: 'center',
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto',
}

const footerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '4px 0',
}
