import { createClient } from '@/lib/supabase/server'
import { getConfiguracion } from '@/services/configuracion'
import ConfigPanel from '@/components/admin/ConfigPanel'

export default async function ConfigPage() {
  const supabase = await createClient()
  const config = await getConfiguracion(supabase)

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1
          className="font-fredoka text-2xl lg:text-3xl font-semibold mb-2"
          style={{ color: 'var(--ian-dark)' }}
        >
          Configuración
        </h1>
        <p className="font-quicksand text-sm text-gray-500 mb-8">
          Precios y ajustes generales del sistema
        </p>
        <ConfigPanel config={config} />
      </div>
    </main>
  )
}
