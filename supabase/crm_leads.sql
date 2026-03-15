-- =============================================================================
-- CRM LEADS — Grupo IAN
-- Ejecutar en Supabase SQL Editor. No ejecutar desde el proyecto.
-- =============================================================================

CREATE TYPE crm_tipo AS ENUM ('kinder', 'semillas');
CREATE TYPE crm_status AS ENUM ('nuevo', 'contactado', 'en_proceso', 'inscrito', 'cancelado');

CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo crm_tipo NOT NULL,
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  interes TEXT NOT NULL,
  status crm_status NOT NULL DEFAULT 'nuevo',
  razon_cancelacion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON crm_leads
  USING (EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'
  ));

CREATE POLICY "public_insert" ON crm_leads
  FOR INSERT WITH CHECK (true);

-- Actualizar updated_at al modificar
CREATE OR REPLACE FUNCTION crm_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION crm_leads_updated_at();

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_crm_leads_tipo ON crm_leads (tipo);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads (status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads (created_at DESC);
