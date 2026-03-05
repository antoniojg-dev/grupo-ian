import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

export interface ReceiptData {
  folio: string
  fechaPago: Date
  metodoPago: string
  alumnoNombre: string
  alumnoApellido: string
  grado: string
  becaPorcentaje: number
  concepto: string
  periodo: string        // "Marzo 2026"
  montoOriginal: number  // centavos
  descuentoBeca: number  // centavos
  descuentoCupon: number // centavos
  montoFinal: number     // centavos
  padreNombre: string
  padreEmail: string
}

const IAN_RED = '#E00700'
const GRAY_LIGHT = '#F5F5F5'
const GRAY_MID = '#E5E7EB'
const GRAY_DARK = '#374151'
const RED_LIGHT = '#FEE2E2'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: GRAY_DARK,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: IAN_RED,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 3,
  },
  headerRight: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  schoolBar: {
    backgroundColor: GRAY_LIGHT,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolText: {
    fontSize: 8.5,
    color: '#6B7280',
  },
  dataGrid: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 24,
  },
  dataCol: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dataValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: GRAY_DARK,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: IAN_RED,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: GRAY_MID,
    marginHorizontal: 32,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: GRAY_MID,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_MID,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_MID,
  },
  tableFooter: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  colConcepto: { flex: 3 },
  colPeriodo: { flex: 2 },
  colMonto: { flex: 2, textAlign: 'right' },
  colDescuento: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  thText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#6B7280',
  },
  tdText: {
    fontSize: 9.5,
    color: GRAY_DARK,
  },
  tfText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: GRAY_DARK,
  },
  totalsBox: {
    backgroundColor: RED_LIGHT,
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#991B1B',
  },
  totalsValue: {
    fontSize: 10,
    color: '#991B1B',
  },
  totalsDivider: {
    height: 1,
    backgroundColor: '#FCA5A5',
    marginBottom: 8,
  },
  totalsFinalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: IAN_RED,
  },
  totalsFinalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: IAN_RED,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: GRAY_MID,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
})

function centavosAPesos(centavos: number): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100)
  return `$${formatted} MXN`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReceiptTemplate({ data }: { data: ReceiptData }) {
  const hayBeca = data.becaPorcentaje > 0 && data.descuentoBeca > 0
  const hayCupon = data.descuentoCupon > 0
  const totalDescuento = data.descuentoBeca + data.descuentoCupon

  return (
    <Document title={`Recibo ${data.folio} — Grupo IAN`}>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>GRUPO IAN</Text>
            <Text style={styles.headerSubtitle}>El Futuro Es Hoy</Text>
          </View>
          <Text style={styles.headerRight}>RECIBO DE PAGO</Text>
        </View>

        {/* SCHOOL INFO BAR */}
        <View style={styles.schoolBar}>
          <Text style={styles.schoolText}>
            Cerro Acasulco #42, Oxtopulco Universidad, Coyoacán, CDMX
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={styles.schoolText}>Tel: 55 7807 2426</Text>
            <Text style={styles.schoolText}>Lun–Vie 7:00–19:00 hrs</Text>
          </View>
        </View>

        {/* DATOS DEL RECIBO */}
        <View style={styles.dataGrid}>
          {/* Columna izquierda */}
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>FOLIO</Text>
            <Text style={styles.dataValue}>{data.folio}</Text>

            <Text style={styles.dataLabel}>FECHA DE PAGO</Text>
            <Text style={styles.dataValue}>{formatDate(data.fechaPago)}</Text>

            <Text style={styles.dataLabel}>MÉTODO DE PAGO</Text>
            <Text style={styles.dataValue}>{data.metodoPago}</Text>
          </View>

          {/* Columna derecha */}
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>ALUMNO</Text>
            <Text style={styles.dataValue}>{data.alumnoNombre} {data.alumnoApellido}</Text>

            <Text style={styles.dataLabel}>GRADO</Text>
            <Text style={styles.dataValue}>{data.grado}</Text>

            {hayBeca && (
              <View>
                <Text style={styles.dataLabel}>BECA APLICADA</Text>
                <Text style={styles.dataValue}>{data.becaPorcentaje}%</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* DETALLE DEL PAGO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLE DEL PAGO</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, styles.colConcepto]}>Concepto</Text>
              <Text style={[styles.thText, styles.colPeriodo]}>Periodo</Text>
              <Text style={[styles.thText, styles.colMonto]}>Monto orig.</Text>
              <Text style={[styles.thText, styles.colDescuento]}>Descuento</Text>
              <Text style={[styles.thText, styles.colTotal]}>Total</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tdText, styles.colConcepto]}>{data.concepto}</Text>
              <Text style={[styles.tdText, styles.colPeriodo]}>{data.periodo}</Text>
              <Text style={[styles.tdText, styles.colMonto]}>{centavosAPesos(data.montoOriginal)}</Text>
              <Text style={[styles.tdText, styles.colDescuento]}>
                {totalDescuento > 0 ? `-${centavosAPesos(totalDescuento)}` : '—'}
              </Text>
              <Text style={[styles.tdText, styles.colTotal]}>{centavosAPesos(data.montoFinal)}</Text>
            </View>

            <View style={styles.tableFooter}>
              <Text style={[styles.tfText, styles.colConcepto]}>TOTAL</Text>
              <Text style={[styles.tfText, styles.colPeriodo]} />
              <Text style={[styles.tfText, styles.colMonto]} />
              <Text style={[styles.tfText, styles.colDescuento]} />
              <Text style={[styles.tfText, styles.colTotal]}>{centavosAPesos(data.montoFinal)}</Text>
            </View>
          </View>
        </View>

        {/* TOTALES */}
        <View style={{ paddingHorizontal: 32 }}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{centavosAPesos(data.montoOriginal)}</Text>
            </View>

            {hayBeca && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Descuento beca ({data.becaPorcentaje}%)</Text>
                <Text style={styles.totalsValue}>-{centavosAPesos(data.descuentoBeca)}</Text>
              </View>
            )}

            {hayCupon && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Descuento cupón</Text>
                <Text style={styles.totalsValue}>-{centavosAPesos(data.descuentoCupon)}</Text>
              </View>
            )}

            <View style={styles.totalsDivider} />

            <View style={styles.totalsRow}>
              <Text style={styles.totalsFinalLabel}>TOTAL PAGADO</Text>
              <Text style={styles.totalsFinalValue}>{centavosAPesos(data.montoFinal)}</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Este recibo es comprobante oficial de pago</Text>
            <Text style={[styles.footerText, { marginTop: 2 }]}>Grupo IAN — RFC: [por definir]</Text>
          </View>
          <Text style={styles.footerText}>Generado el {formatDateTime(new Date())}</Text>
        </View>

      </Page>
    </Document>
  )
}
