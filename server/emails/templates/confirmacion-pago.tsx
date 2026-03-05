import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface ConfirmacionPagoProps {
  nombrePadre: string
  nombreAlumno: string
  folio: string
  concepto: string
  periodo: string
  montoFinal: number // centavos
  pdfUrl?: string
}

function formatMXN(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    centavos / 100
  )
}

export default function ConfirmacionPago({
  nombrePadre,
  nombreAlumno,
  folio,
  concepto,
  periodo,
  montoFinal,
  pdfUrl,
}: ConfirmacionPagoProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Pago confirmado — {folio}</Preview>
      <Body style={body}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerTitle}>GRUPO IAN</Heading>
          <Text style={headerSubtitle}>El Futuro Es Hoy</Text>
        </Section>

        <Container style={container}>
          {/* Confirmacion */}
          <Section style={successBanner}>
            <Heading style={successTitle}>Pago confirmado</Heading>
          </Section>

          <Text style={greeting}>Hola, {nombrePadre}:</Text>
          <Text style={paragraph}>
            Hemos recibido tu pago correctamente. A continuación el resumen:
          </Text>

          {/* Tabla de detalles */}
          <Section style={table}>
            <Row style={tableHeader}>
              <Text style={tableHeaderCell}>Folio</Text>
              <Text style={tableHeaderCell}>Alumno</Text>
              <Text style={tableHeaderCell}>Concepto</Text>
              <Text style={tableHeaderCell}>Periodo</Text>
              <Text style={tableHeaderCell}>Total</Text>
            </Row>
            <Row style={tableRow}>
              <Text style={tableCell}>{folio}</Text>
              <Text style={tableCell}>{nombreAlumno}</Text>
              <Text style={tableCell}>{concepto}</Text>
              <Text style={tableCell}>{periodo}</Text>
              <Text style={tableCellBold}>{formatMXN(montoFinal)}</Text>
            </Row>
          </Section>

          {pdfUrl && (
            <Section style={buttonSection}>
              <Button href={pdfUrl} style={primaryButton}>
                Descargar recibo
              </Button>
            </Section>
          )}

          <Hr style={divider} />
          <Text style={thankYou}>Gracias por tu pago puntual.</Text>
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

const successBanner: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #00B412',
  padding: '12px 16px',
  marginBottom: '24px',
  borderRadius: '4px',
}

const successTitle: React.CSSProperties = {
  color: '#00B412',
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

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '24px',
}

const tableHeader: React.CSSProperties = {
  backgroundColor: '#E00700',
}

const tableHeaderCell: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '8px 12px',
  textTransform: 'uppercase' as const,
}

const tableRow: React.CSSProperties = {
  borderBottom: '1px solid #e5e7eb',
}

const tableCell: React.CSSProperties = {
  fontSize: '14px',
  color: '#1A1A2E',
  padding: '10px 12px',
}

const tableCellBold: React.CSSProperties = {
  ...tableCell,
  fontWeight: 'bold',
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

const thankYou: React.CSSProperties = {
  fontSize: '14px',
  color: '#555555',
  textAlign: 'center',
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
