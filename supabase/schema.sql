-- =============================================================================
-- GRUPO IAN — SUPABASE SCHEMA
-- Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Stripe · Vercel
-- Moneda: MXN (centavos) · Idioma: Español
-- =============================================================================

-- =============================================================================
-- 1. ENUMs
-- =============================================================================

CREATE TYPE tipo_servicio AS ENUM (
  'colegiatura',
  'taller_mensual',
  'taller_dia',
  'semillas_sabiduria',
  'inscripcion'
);

CREATE TYPE estado_pago AS ENUM (
  'pendiente',
  'pagado',
  'condonado',
  'vencido'
);

CREATE TYPE estado_inscripcion AS ENUM (
  'pendiente',
  'pagada',
  'condonada'
);

CREATE TYPE tipo_cupon AS ENUM (
  'porcentaje',
  'monto_fijo',
  'condonacion_inscripcion'
);

CREATE TYPE aplica_cupon AS ENUM (
  'inscripcion',
  'colegiatura',
  'todos'
);

CREATE TYPE metodo_pago AS ENUM (
  'stripe',
  'efectivo',
  'transferencia',
  'caja'
);

CREATE TYPE nombre_paquete AS ENUM (
  'Siembra',
  'Crece',
  'Florece'
);

-- =============================================================================
-- 2. TABLAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 Perfiles de usuario (extiende auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  email       TEXT NOT NULL DEFAULT '',
  telefono    TEXT,
  rol         TEXT NOT NULL DEFAULT 'padre' CHECK (rol IN ('padre', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2.2 Alumnos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alumnos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,
  apellido         TEXT NOT NULL,
  grado            TEXT NOT NULL,
  grupo            TEXT,
  padre_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  beca_porcentaje  NUMERIC(5,2) NOT NULL DEFAULT 0
                     CHECK (beca_porcentaje >= 0 AND beca_porcentaje <= 100),
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2.3 Servicios
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servicios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  tipo         tipo_servicio NOT NULL,
  precio_base  INTEGER NOT NULL CHECK (precio_base >= 0), -- centavos MXN
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2.4 Cupones
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cupones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo           TEXT NOT NULL UNIQUE,
  tipo             tipo_cupon NOT NULL,
  valor            INTEGER NOT NULL CHECK (valor >= 0), -- porcentaje o centavos
  usos_maximos     INTEGER,                             -- NULL = ilimitado
  usos_actuales    INTEGER NOT NULL DEFAULT 0,
  aplica_a         aplica_cupon NOT NULL DEFAULT 'todos',
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2.5 Pagos (colegiaturas, talleres, semillas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pagos (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id                 UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  servicio_id               UUID NOT NULL REFERENCES public.servicios(id) ON DELETE RESTRICT,
  padre_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  monto_original            INTEGER NOT NULL CHECK (monto_original >= 0),   -- centavos
  descuento_beca            INTEGER NOT NULL DEFAULT 0 CHECK (descuento_beca >= 0),
  descuento_cupon           INTEGER NOT NULL DEFAULT 0 CHECK (descuento_cupon >= 0),
  monto_final               INTEGER NOT NULL CHECK (monto_final >= 0),
  periodo_mes               SMALLINT CHECK (periodo_mes BETWEEN 1 AND 12),  -- null si no es mensual
  periodo_anio              SMALLINT,
  estado                    estado_pago NOT NULL DEFAULT 'pendiente',
  metodo                    metodo_pago,
  referencia_manual         TEXT,                                            -- para pagos efectivo/transferencia
  stripe_payment_intent_id  TEXT UNIQUE,
  cupon_id                  UUID REFERENCES public.cupones(id),
  pdf_url                   TEXT,
  folio                     TEXT UNIQUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 2.6 Inscripciones
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id                 UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  padre_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  anio_escolar              SMALLINT NOT NULL,
  monto_original            INTEGER NOT NULL DEFAULT 400000, -- $4,000 en centavos
  descuento_cupon           INTEGER NOT NULL DEFAULT 0,
  monto_final               INTEGER NOT NULL CHECK (monto_final >= 0),
  condonada                 BOOLEAN NOT NULL DEFAULT FALSE,
  cupon_id                  UUID REFERENCES public.cupones(id),
  estado                    estado_inscripcion NOT NULL DEFAULT 'pendiente',
  stripe_payment_intent_id  TEXT UNIQUE,
  metodo                    metodo_pago,
  referencia_manual         TEXT,
  pdf_url                   TEXT,
  folio                     TEXT UNIQUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ,
  UNIQUE (alumno_id, anio_escolar)
);

-- -----------------------------------------------------------------------------
-- 2.7 Payment Batches (checkout multi-concepto con Stripe)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_batches (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  padre_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  stripe_payment_intent_id  TEXT UNIQUE,
  monto_total               INTEGER NOT NULL CHECK (monto_total >= 0),
  estado                    estado_pago NOT NULL DEFAULT 'pendiente',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ
);

-- Relación batch → pagos individuales
CREATE TABLE IF NOT EXISTS public.payment_batch_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
  pago_id    UUID REFERENCES public.pagos(id),
  inscripcion_id UUID REFERENCES public.inscripciones(id),
  CHECK (
    (pago_id IS NOT NULL AND inscripcion_id IS NULL) OR
    (pago_id IS NULL AND inscripcion_id IS NOT NULL)
  )
);

-- -----------------------------------------------------------------------------
-- 2.8 Folios (contador anual incremental)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.folios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anio       SMALLINT NOT NULL,
  ultimo_num INTEGER NOT NULL DEFAULT 0,
  UNIQUE (anio)
);

-- -----------------------------------------------------------------------------
-- 2.9 Congelaciones de alumno (mes congelado = sin pago de colegiatura)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alumno_congelaciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  mes         SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio        SMALLINT NOT NULL,
  motivo      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alumno_id, mes, anio)
);

-- =============================================================================
-- 3. FUNCIONES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 is_admin() — verifica si el usuario actual tiene rol admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = auth.uid()
      AND rol = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- 3.2 generar_folio(p_anio) — genera el siguiente folio IAN-YYYY-XXXX
-- Uso: SELECT generar_folio(2025);  → 'IAN-2025-0001'
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generar_folio(p_anio SMALLINT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_num INTEGER;
BEGIN
  INSERT INTO public.folios (anio, ultimo_num)
  VALUES (p_anio, 1)
  ON CONFLICT (anio)
  DO UPDATE SET ultimo_num = folios.ultimo_num + 1
  RETURNING ultimo_num INTO v_num;

  RETURN 'IAN-' || p_anio::TEXT || '-' || LPAD(v_num::TEXT, 4, '0');
END;
$$;

-- -----------------------------------------------------------------------------
-- 3.3 handle_new_user() — crea perfil automáticamente al registrar usuario
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'padre')
  );
  RETURN NEW;
END;
$$;

-- Trigger sobre auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.perfiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupones               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batch_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumno_congelaciones  ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Perfiles
-- -----------------------------------------------------------------------------
CREATE POLICY "perfiles: usuario ve su propio perfil"
  ON public.perfiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "perfiles: usuario edita su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "perfiles: solo admin inserta"
  ON public.perfiles FOR INSERT
  WITH CHECK (public.is_admin() OR id = auth.uid());

-- -----------------------------------------------------------------------------
-- Alumnos
-- -----------------------------------------------------------------------------
CREATE POLICY "alumnos: padre ve sus hijos"
  ON public.alumnos FOR SELECT
  USING (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "alumnos: solo admin inserta"
  ON public.alumnos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "alumnos: solo admin edita"
  ON public.alumnos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "alumnos: solo admin elimina"
  ON public.alumnos FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- Servicios (lectura pública, escritura solo admin)
-- -----------------------------------------------------------------------------
CREATE POLICY "servicios: cualquiera puede leer activos"
  ON public.servicios FOR SELECT
  USING (activo = TRUE OR public.is_admin());

CREATE POLICY "servicios: solo admin inserta"
  ON public.servicios FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "servicios: solo admin edita"
  ON public.servicios FOR UPDATE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- Cupones
-- -----------------------------------------------------------------------------
CREATE POLICY "cupones: padre puede leer activos"
  ON public.cupones FOR SELECT
  USING (activo = TRUE OR public.is_admin());

CREATE POLICY "cupones: solo admin inserta"
  ON public.cupones FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "cupones: solo admin edita"
  ON public.cupones FOR UPDATE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- Pagos
-- -----------------------------------------------------------------------------
CREATE POLICY "pagos: padre ve sus pagos"
  ON public.pagos FOR SELECT
  USING (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "pagos: padre inserta sus pagos"
  ON public.pagos FOR INSERT
  WITH CHECK (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "pagos: solo admin edita"
  ON public.pagos FOR UPDATE
  USING (public.is_admin() OR padre_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Inscripciones
-- -----------------------------------------------------------------------------
CREATE POLICY "inscripciones: padre ve las suyas"
  ON public.inscripciones FOR SELECT
  USING (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "inscripciones: padre inserta"
  ON public.inscripciones FOR INSERT
  WITH CHECK (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "inscripciones: solo admin edita"
  ON public.inscripciones FOR UPDATE
  USING (public.is_admin() OR padre_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Payment Batches
-- -----------------------------------------------------------------------------
CREATE POLICY "batches: padre ve los suyos"
  ON public.payment_batches FOR SELECT
  USING (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "batches: padre inserta"
  ON public.payment_batches FOR INSERT
  WITH CHECK (padre_id = auth.uid() OR public.is_admin());

CREATE POLICY "batches: solo admin edita"
  ON public.payment_batches FOR UPDATE
  USING (public.is_admin() OR padre_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Payment Batch Items
-- -----------------------------------------------------------------------------
CREATE POLICY "batch_items: padre ve los suyos"
  ON public.payment_batch_items FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.payment_batches b
      WHERE b.id = batch_id AND b.padre_id = auth.uid()
    )
  );

CREATE POLICY "batch_items: padre inserta"
  ON public.payment_batch_items FOR INSERT
  WITH CHECK (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.payment_batches b
      WHERE b.id = batch_id AND b.padre_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Folios (solo admin puede leer/escribir)
-- -----------------------------------------------------------------------------
CREATE POLICY "folios: solo admin"
  ON public.folios FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- Congelaciones
-- -----------------------------------------------------------------------------
CREATE POLICY "congelaciones: padre ve las de sus hijos"
  ON public.alumno_congelaciones FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.alumnos a
      WHERE a.id = alumno_id AND a.padre_id = auth.uid()
    )
  );

CREATE POLICY "congelaciones: solo admin inserta"
  ON public.alumno_congelaciones FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "congelaciones: solo admin edita"
  ON public.alumno_congelaciones FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "congelaciones: solo admin elimina"
  ON public.alumno_congelaciones FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 5. ÍNDICES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_alumnos_padre_id          ON public.alumnos (padre_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_activo             ON public.alumnos (activo);

CREATE INDEX IF NOT EXISTS idx_pagos_alumno_id            ON public.pagos (alumno_id);
CREATE INDEX IF NOT EXISTS idx_pagos_padre_id             ON public.pagos (padre_id);
CREATE INDEX IF NOT EXISTS idx_pagos_servicio_id          ON public.pagos (servicio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado               ON public.pagos (estado);
CREATE INDEX IF NOT EXISTS idx_pagos_periodo              ON public.pagos (periodo_anio, periodo_mes);
CREATE INDEX IF NOT EXISTS idx_pagos_stripe               ON public.pagos (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_pagos_folio                ON public.pagos (folio);

CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno_id    ON public.inscripciones (alumno_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_padre_id     ON public.inscripciones (padre_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado       ON public.inscripciones (estado);
CREATE INDEX IF NOT EXISTS idx_inscripciones_anio         ON public.inscripciones (anio_escolar);

CREATE INDEX IF NOT EXISTS idx_cupones_codigo             ON public.cupones (codigo);
CREATE INDEX IF NOT EXISTS idx_cupones_activo             ON public.cupones (activo);

CREATE INDEX IF NOT EXISTS idx_congelaciones_alumno       ON public.alumno_congelaciones (alumno_id);
CREATE INDEX IF NOT EXISTS idx_congelaciones_periodo      ON public.alumno_congelaciones (alumno_id, anio, mes);

CREATE INDEX IF NOT EXISTS idx_batches_padre_id           ON public.payment_batches (padre_id);
CREATE INDEX IF NOT EXISTS idx_batches_stripe             ON public.payment_batches (stripe_payment_intent_id);

-- =============================================================================
-- 6. DATOS INICIALES — Servicios
-- =============================================================================

INSERT INTO public.servicios (nombre, tipo, precio_base, activo) VALUES
  -- Inscripción anual
  ('Inscripción Anual', 'inscripcion', 400000, TRUE),

  -- Colegiatura mensual ($5,000 MXN = 500000 centavos)
  ('Colegiatura Mensual', 'colegiatura', 500000, TRUE),

  -- Paquetes Semillas de Sabiduría
  ('Semillas de Sabiduría — Siembra',  'semillas_sabiduria', 125000, TRUE),
  ('Semillas de Sabiduría — Crece',    'semillas_sabiduria', 180000, TRUE),
  ('Semillas de Sabiduría — Florece',  'semillas_sabiduria', 250000, TRUE),

  -- Talleres extracurriculares ejemplo
  ('Taller de Inglés Extracurricular (Mensual)', 'taller_mensual', 0, TRUE),
  ('Taller de Inglés Extracurricular (Por día)', 'taller_dia',     0, TRUE),
  ('Curso Ingreso a Secundaria',                 'taller_mensual', 0, TRUE)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. STORAGE — Bucket para recibos PDF
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recibos',
  'recibos',
  FALSE,                          -- privado: acceso solo por URL firmada
  5242880,                        -- 5 MB máximo por archivo
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: padre solo accede a sus propios recibos
-- La carpeta sigue la convención: recibos/{padre_id}/{folio}.pdf
CREATE POLICY "storage: padre descarga sus recibos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recibos'
    AND (
      public.is_admin()
      OR (auth.uid())::TEXT = (string_to_array(name, '/'))[1]
    )
  );

CREATE POLICY "storage: solo backend sube recibos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recibos'
    AND public.is_admin()
  );

-- =============================================================================
-- FIN DEL SCHEMA — GRUPO IAN v1.0
-- =============================================================================
