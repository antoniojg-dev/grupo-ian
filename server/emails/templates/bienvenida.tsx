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

export interface BienvenidaProps {
  nombrePadre: string
  nombreAlumno: string
  portalUrl: string
}

export default function Bienvenida({ nombrePadre, nombreAlumno, portalUrl }: BienvenidaProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido al Portal de Padres de Grupo IAN</Preview>
      <Body style={body}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerTitle}>GRUPO IAN</Heading>
          <Text style={headerSubtitle}>El Futuro Es Hoy</Text>
        </Section>

        <Container style={container}>
          <Heading style={mainTitle}>Bienvenido al Portal de Padres</Heading>

          <Text style={greeting}>Hola, {nombrePadre}:</Text>
          <Text style={paragraph}>
            Tu cuenta ha sido creada exitosamente. Ahora puedes acceder al portal para gestionar los
            pagos de <strong>{nombreAlumno}</strong>.
          </Text>

          <Section style={featureList}>
            <Text style={featureItem}>Consulta el historial de pagos</Text>
            <Text style={featureItem}>Realiza pagos con tarjeta de forma segura</Text>
            <Text style={featureItem}>Descarga recibos en PDF</Text>
            <Text style={featureItem}>Verifica el estatus de mensualidades</Text>
          </Section>

          <Section style={buttonSection}>
            <Button href={portalUrl} style={primaryButton}>
              Acceder al portal
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={helpText}>
            Si tienes alguna duda, contáctanos al <strong>55 7807 2426</strong> o visítanos en
            Cerro Acasulco #42, Coyoacán.
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

const mainTitle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#1A1A2E',
  marginBottom: '16px',
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

const featureList: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '24px',
}

const featureItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '6px 0',
  paddingLeft: '12px',
  borderLeft: '3px solid #E00700',
}

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#E00700',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  padding: '14px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const helpText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
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
