import { createClient } from '@/lib/supabase/server'
import { getLeadsByTipo } from '@/services/crm'
import CrmDashboard from '@/components/admin/CrmDashboard'

export default async function CrmPage() {
  const supabase = await createClient()
  const [leadsKinder, leadsSemillas] = await Promise.all([
    getLeadsByTipo(supabase, 'kinder'),
    getLeadsByTipo(supabase, 'semillas'),
  ])

  return <CrmDashboard leadsKinder={leadsKinder} leadsSemillas={leadsSemillas} />
}
