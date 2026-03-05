import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { buildPaymentData } from '@/server/payments/process-payment'
import { Alumno, Servicio } from '@/types'
import { Cupon } from '@/server/payments/apply-coupon'

const schema = z.object({
  alumnoId: z.string().uuid(),
  servicioId: z.string().uuid(),
  cuponCodigo: z.string().optional(),
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).optional(),
})

async function generarFolio(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc('generar_folio', {
    p_anio: new Date().getFullYear(),
  })
  if (error) throw error
  return data as string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Verificar rol padre
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (!perfil || perfil.rol !== 'padre') {
      return NextResponse.json({ error: 'Solo padres pueden realizar pagos' }, { status: 403 })
    }

    // Validar input
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }
    const { alumnoId, servicioId, cuponCodigo, mes, anio } = parsed.data

    // Verificar que el alumno pertenece al padre
    const { data: alumno, error: alumnoErr } = await supabase
      .from('alumnos')
      .select('*')
      .eq('id', alumnoId)
      .eq('padre_id', user.id)
      .single()
    if (alumnoErr || !alumno) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    // Obtener servicio
    const { data: servicio, error: servicioErr } = await supabase
      .from('servicios')
      .select('*')
      .eq('id', servicioId)
      .eq('activo', true)
      .single()
    if (servicioErr || !servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Obtener congelaciones del alumno
    const { data: congelaciones } = await supabase
      .from('alumno_congelaciones')
      .select('alumno_id, mes, anio')
      .eq('alumno_id', alumnoId)

    // Obtener cupón si se proporcionó
    let cupon: Cupon | undefined = undefined
    let cuponId: string | undefined = undefined
    if (cuponCodigo) {
      const { data: cuponData } = await supabase
        .from('cupones')
        .select('*')
        .eq('codigo', cuponCodigo.toUpperCase())
        .single()
      if (!cuponData) {
        return NextResponse.json({ error: 'Cupón no encontrado o inválido' }, { status: 400 })
      }
      cupon = cuponData as Cupon
      cuponId = cuponData.id
    }

    // Construir datos de pago
    const paymentData = buildPaymentData({
      alumno: alumno as Alumno,
      servicio: servicio as Servicio,
      cupon,
      mes,
      anio,
      congelaciones: congelaciones ?? [],
    })

    if (!paymentData.valido) {
      return NextResponse.json({ error: paymentData.error }, { status: 400 })
    }

    // Verificar pago duplicado
    const { data: pagoExistente } = await supabase
      .from('pagos')
      .select('id, estado, stripe_payment_intent_id')
      .eq('alumno_id', alumnoId)
      .eq('servicio_id', servicioId)
      .eq('periodo_mes', mes ?? null)
      .eq('periodo_anio', anio ?? null)
      .in('estado', ['pendiente', 'pagado'])
      .single()

    if (pagoExistente) {
      if (pagoExistente.estado === 'pagado') {
        return NextResponse.json({ error: 'Este mes ya está pagado' }, { status: 409 })
      }
      // pendiente con PaymentIntent existente → reutilizar
      if (pagoExistente.stripe_payment_intent_id) {
        const existingIntent = await stripe.paymentIntents.retrieve(
          pagoExistente.stripe_payment_intent_id
        )
        return NextResponse.json({
          clientSecret: existingIntent.client_secret,
          montoFinal: paymentData.montoFinal,
          alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
          concepto: servicio.nombre,
        })
      }
    }

    // Monto cero → condonar directamente sin pasar por Stripe
    if (paymentData.montoFinal === 0) {
      const folio = await generarFolio(supabase)
      await supabase.from('pagos').insert({
        alumno_id: alumnoId,
        servicio_id: servicioId,
        padre_id: user.id,
        monto_original: paymentData.montoOriginal,
        descuento_beca: paymentData.descuentoBeca,
        descuento_cupon: paymentData.descuentoCupon,
        monto_final: 0,
        periodo_mes: mes ?? null,
        periodo_anio: anio ?? null,
        estado: 'condonado',
        folio,
        cupon_id: cuponId ?? null,
        paid_at: new Date().toISOString(),
      })
      return NextResponse.json({ condonado: true, folio })
    }

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.montoFinal,
      currency: 'mxn',
      metadata: {
        alumnoId,
        servicioId,
        padreId: user.id,
        mes: mes?.toString() ?? '',
        anio: anio?.toString() ?? '',
        cuponId: cuponId ?? '',
      },
    })

    const pagoBase = {
      alumno_id: alumnoId,
      servicio_id: servicioId,
      padre_id: user.id,
      monto_original: paymentData.montoOriginal,
      descuento_beca: paymentData.descuentoBeca,
      descuento_cupon: paymentData.descuentoCupon,
      monto_final: paymentData.montoFinal,
      periodo_mes: mes ?? null,
      periodo_anio: anio ?? null,
      estado: 'pendiente',
      stripe_payment_intent_id: paymentIntent.id,
      cupon_id: cuponId ?? null,
    }

    // Actualizar registro pendiente existente o insertar uno nuevo
    if (pagoExistente) {
      await supabase.from('pagos').update(pagoBase).eq('id', pagoExistente.id)
    } else {
      await supabase.from('pagos').insert(pagoBase)
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      montoFinal: paymentData.montoFinal,
      alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
      concepto: servicio.nombre,
    })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
