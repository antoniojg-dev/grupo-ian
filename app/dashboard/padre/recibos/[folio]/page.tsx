import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'

export default async function ReciboPadrePage({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--ian-blue)' }}
        >
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-fredoka text-2xl font-semibold mb-2" style={{ color: 'var(--ian-dark)' }}>
          Recibo {folio}
        </h1>
        <p className="font-quicksand text-sm text-gray-400">
          La generacion de recibos en PDF estara disponible proximamente.
        </p>
      </div>
    </div>
  )
}
