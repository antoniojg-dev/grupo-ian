export type Alumno = {
  id: string
  nombre: string
  apellido: string
  grado: string
  grupo: string | null
  beca_porcentaje: number
  activo: boolean
  padre_id: string | null
  created_at: string
  padre?: {
    nombre: string | null
    apellido: string | null
    email?: string | null
  } | null
}

export type Pago = {
  id: string
  alumno_id: string
  servicio_id: string | null
  padre_id: string | null
  monto_original: number
  descuento_beca: number
  descuento_cupon: number
  monto_final: number
  periodo_mes: number | null
  periodo_anio: number | null
  estado: 'pendiente' | 'pagado' | 'condonado' | 'vencido'
  stripe_payment_intent_id: string | null
  pdf_url: string | null
  folio: string | null
  metodo_pago: string | null
  created_at: string
  paid_at: string | null
  alumnos?: {
    nombre: string
    apellido: string
    grado: string
  } | null
  servicios?: {
    nombre: string
  } | null
}

export type Perfil = {
  id: string
  nombre: string | null
  apellido: string | null
  rol: 'admin' | 'padre'
}

export type KPIs = {
  total_cobrado: number
  alumnos_al_corriente: number
  alumnos_con_adeudo: number
  inscripciones_pendientes: number
  total_alumnos_activos: number
}

export type AlumnoConPago = Alumno & {
  estado_pago_mes: 'pagado' | 'pendiente' | 'vencido' | 'condonado'
}
