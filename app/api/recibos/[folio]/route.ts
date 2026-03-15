import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAndSaveReceipt } from '@/server/pdf/generate-receipt'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  const { folio } = await params

  // Verificar sesión
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar rol
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const esAdmin = perfil?.rol === 'admin'

  const adminSupabase = createAdminClient()

  // Buscar pago por folio
  const { data: pago } = await adminSupabase
    .from('pagos')
    .select('id, padre_id, pdf_url, estado')
    .eq('folio', folio)
    .single()

  if (!pago) {
    return NextResponse.json({ error: 'Recibo no encontrado' }, { status: 404 })
  }

  // Padre solo puede ver sus propios recibos; admin ve todos
  if (!esAdmin && pago.padre_id !== user.id) {
    return NextResponse.json({ error: 'Sin acceso a este recibo' }, { status: 403 })
  }

  // Si ya tiene URL → redirect directo; si no → generar on-demand
  let pdfUrl: string = pago.pdf_url ?? ''

  if (!pdfUrl) {
    pdfUrl = await generateAndSaveReceipt(pago.id)
  }

  return NextResponse.redirect(pdfUrl)
}
