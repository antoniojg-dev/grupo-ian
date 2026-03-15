import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const KINDER_INTERES = ['Maternal', 'Nursery', 'Kinder 1', 'Kinder 2', 'Kinder 3'] as const
const SEMILLAS_INTERES = ['Paquete Siembra', 'Paquete Crece', 'Paquete Florece'] as const

const schema = z.object({
  tipo: z.enum(['kinder', 'semillas']),
  nombre: z.string().min(3, 'Nombre mínimo 3 caracteres').max(100),
  whatsapp: z.string().regex(/^\d{10}$/, 'WhatsApp debe ser 10 dígitos'),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  interes: z.string().min(1, 'Interés requerido'),
  company: z.string().optional(),
  website: z.string().optional(),
})

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

const ipCounts = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIp) return realIp
  return 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (now >= entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Has enviado muchos mensajes. Intenta en aproximadamente una hora.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { tipo, nombre, whatsapp, email, interes, company, website } = parsed.data

    if (company?.trim() || website?.trim()) {
      return NextResponse.json({ success: true, id: null })
    }

    const isValidInteres =
      tipo === 'kinder'
        ? (KINDER_INTERES as readonly string[]).includes(interes)
        : (SEMILLAS_INTERES as readonly string[]).includes(interes)
    if (!isValidInteres) {
      return NextResponse.json({ error: 'Interés no válido' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('crm_leads')
      .insert({
        tipo,
        nombre: nombre.trim(),
        whatsapp,
        email: (email ?? '').trim() || null,
        interes,
        status: 'nuevo',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id ?? null })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
