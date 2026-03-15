import { SupabaseClient } from '@supabase/supabase-js'

export type CrmTipo = 'kinder' | 'semillas'
export type CrmStatus = 'nuevo' | 'contactado' | 'en_proceso' | 'inscrito' | 'cancelado'

export type CrmLead = {
  id: string
  tipo: CrmTipo
  nombre: string
  whatsapp: string
  email: string | null
  interes: string
  status: CrmStatus
  razon_cancelacion: string | null
  notas: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export async function getLeadsByTipo(
  supabase: SupabaseClient,
  tipo: CrmTipo
): Promise<CrmLead[]> {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CrmLead[]
}
