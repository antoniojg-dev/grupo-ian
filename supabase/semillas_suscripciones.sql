-- Tabla: semillas_suscripciones
-- Programa Semillas de Sabiduría — suscripciones mensuales vía Stripe

CREATE TYPE semillas_paquete AS ENUM ('siembra', 'crece', 'florece');
CREATE TYPE semillas_status AS ENUM ('activa', 'cancelada', 'pausada', 'pago_fallido');

CREATE TABLE semillas_suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id),
  padre_id UUID NOT NULL REFERENCES auth.users(id),
  paquete semillas_paquete NOT NULL,
  status semillas_status NOT NULL DEFAULT 'activa',
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  precio_mensual INTEGER NOT NULL,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_cancelacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE semillas_suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "padre_own" ON semillas_suscripciones
  FOR SELECT USING (padre_id = auth.uid());

CREATE POLICY "admin_all" ON semillas_suscripciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'
  ));

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_semillas_suscripciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER semillas_suscripciones_updated_at
  BEFORE UPDATE ON semillas_suscripciones
  FOR EACH ROW EXECUTE FUNCTION update_semillas_suscripciones_updated_at();

-- Índices
CREATE INDEX idx_semillas_suscripciones_padre_id ON semillas_suscripciones(padre_id);
CREATE INDEX idx_semillas_suscripciones_alumno_id ON semillas_suscripciones(alumno_id);
CREATE INDEX idx_semillas_suscripciones_status ON semillas_suscripciones(status);
