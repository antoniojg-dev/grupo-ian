GRUPO IAN
El Futuro Es Hoy
ESPECIFICACIONES COMPLETAS DEL PROYECTO WEB

Stack: Next.js 16 · TypeScript · Tailwind CSS · Supabase · Stripe · Resend · Vercel
Moneda: MXN  ·  Idioma: Español  ·  Pagos: Stripe  ·  Deploy: Vercel (HTTPS automático)

═══════════════════════════════════════════════════════
1. Información de la Institución
═══════════════════════════════════════════════════════

Nombre: Grupo IAN — El Futuro Es Hoy
Tipo: Kinder bilingüe + Programa Semillas de Sabiduría (extracurriculares)
Dirección: Cerro Acasulco #42, Oxtopulco Universidad, Coyoacán, CDMX
Teléfono / WhatsApp: 55 7807 2426
Horario: 7:00 – 19:00 hrs

═══════════════════════════════════════════════════════
2. Dominio y Servicios de Producción
═══════════════════════════════════════════════════════

Producción:       https://www.grupoian.lat
Vercel project:   antoniojuarez-rgb/grupoian-web
Email (Resend):   noreply@grupoian.lat
Stripe:           Modo TEST activo
WhatsApp:         5578072426

═══════════════════════════════════════════════════════
3. Identidad Visual & Diseño
═══════════════════════════════════════════════════════

Paleta de Colores
- Rojo/Rosa principal: #FF4B6E
- Turquesa: #00BFA5
- Amarillo: #F5C518
- Neutros: blanco, grises suaves

Tipografía
Headings: Nunito (Google Fonts) — redondeada, amigable, perfecta para educación infantil
Body: Inter — limpio, legible en pantallas, excelente para dashboards
Logo font: sans-serif geométrico bold (como en el branding actual)

Tono Visual
Alegre, colorido, profesional — no infantil en exceso
Cards con bordes redondeados (border-radius: 16px)
Sombras suaves (shadow-md), no agresivas
Imágenes reales de la escuela donde sea posible

═══════════════════════════════════════════════════════
4. Arquitectura Técnica
═══════════════════════════════════════════════════════

Capa              Tecnología
──────────────────────────────────────────────────────
Framework         Next.js 16.1.6 (App Router) — SSR/SSG para SEO perfecto
Lenguaje          TypeScript — seguridad de tipos, menos bugs en producción
Estilos           Tailwind CSS — bundle mínimo, carga ultrarrápida
Base de datos     Supabase (PostgreSQL) — Auth + DB + Storage + Row Level Security
Pagos             Stripe — PaymentIntents + Webhooks (no Stripe Checkout hosted)
PDFs / Recibos    @react-pdf/renderer — generación server-side
Email             Resend + @react-email/components + @react-email/render
Deploy            Vercel — HTTPS automático, CDN global, CI/CD desde GitHub
Moneda            MXN (pesos mexicanos)
Testing           Vitest — 45 tests en verde

Estructura de Rutas
──────────────────────────────────────────────────────
Ruta                                  Descripción
/                                     Landing Page pública (SEO optimizado)
/login                                Acceso padres y admin
/invite                               Flujo de invitación para padres nuevos
/set-password                         Establecer contraseña al aceptar invitación
/reset-password                       Recuperar contraseña olvidada
/dashboard/padre                      Portal del padre: hijos, pagos, recibos
/dashboard/padre/pagar                Checkout con Stripe Elements
/dashboard/admin                      Vista general: KPIs, alertas de pagos
/dashboard/admin/alumnos              CRUD de alumnos + asignar becas
/dashboard/admin/pagos                Reporte de pagos / deudores / filtros
/dashboard/admin/servicios            Gestión de talleres y paquetes
/dashboard/admin/cupones              Crear y gestionar cupones (pendiente)
/dashboard/admin/configuracion        Precios editables desde Admin

═══════════════════════════════════════════════════════
5. Variables de Entorno
═══════════════════════════════════════════════════════

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL=noreply@grupoian.lat
NEXT_PUBLIC_APP_URL=https://www.grupoian.lat
CRON_SECRET

═══════════════════════════════════════════════════════
6. Base de Datos — Supabase
═══════════════════════════════════════════════════════

Todas las tablas usan Row Level Security (RLS). Los padres solo ven sus datos; el admin ve todo.

alumnos
• id, nombre, apellido, grado, grupo
• padre_id (FK → auth.users)
• beca_porcentaje (0–100) — configurable por admin
• activo (boolean)
• created_at

servicios
• id, nombre (ej: 'Colegiatura', 'Taller de Inglés', 'Paquete Siembra')
• tipo: ENUM('colegiatura', 'taller_mensual', 'taller_dia', 'semillas_sabiduria', 'inscripcion')
• precio_base (en centavos MXN)
• activo (boolean)

pagos
• id, alumno_id (FK), servicio_id (FK), padre_id (FK)
• monto_original, descuento_beca, descuento_cupon, monto_final
• periodo_mes, periodo_anio (para colegiaturas mensuales)
• estado: ENUM('pendiente', 'pagado', 'condonado', 'vencido')
• stripe_payment_intent_id
• folio (formato IAN-YYYY-XXXX)
• pdf_url (URL del recibo en Supabase Storage)
• metodo_pago (stripe, efectivo, transferencia, caja)
• created_at, paid_at

inscripciones
• id, alumno_id, anio_escolar
• monto_original (default: $4,000 MXN → 400000 centavos)
• condonada (boolean) — el admin puede marcarla
• cupon_id (FK, nullable)
• estado: ENUM('pendiente', 'pagada', 'condonada')
• stripe_payment_intent_id, pdf_url

cupones
• id, codigo (único, ej: 'BIENVENIDO2025')
• tipo: ENUM('porcentaje', 'monto_fijo', 'condonacion_inscripcion')
• valor (porcentaje o monto en centavos)
• usos_maximos, usos_actuales
• aplica_a: ENUM('inscripcion', 'colegiatura', 'todos')
• activo, fecha_expiracion

semillas_sabiduria (paquetes extracurriculares)
• id, nombre: ENUM('Siembra', 'Crece', 'Florece')
• precio_mensual: Siembra=$1,250 / Crece=$1,800 / Florece=$2,500 MXN
• descripcion detallada del paquete
• horas_semana, incluye_natacion, incluye_regularizacion

configuracion
• clave (PK, ej: 'precio_colegiatura', 'precio_inscripcion')
• valor (en centavos MXN)
• descripcion
• updated_at
• updated_by (FK → auth.users)

crm_leads
• id
• tipo (ej: 'landing_contacto', 'landing_semillas', 'whatsapp')
• nombre
• whatsapp
• email
• interes (servicio de interés)
• status: ENUM('nuevo', 'contactado', 'interesado', 'inscrito', 'cancelado')
• razon_cancelacion
• notas
• created_at
• updated_at
• updated_by (FK → auth.users)

═══════════════════════════════════════════════════════
7. Servicios y Precios
═══════════════════════════════════════════════════════

7.1 Colegiatura Escolar (Bilingüe)
Incluye: Inglés · Español · Matemáticas · Historia · Estimulación Temprana · Juego y Aprendo · High Scope

Concepto              Descripción                                              Monto MXN
Inscripción (1/año)   Primer pago del ciclo escolar. Condonable con cupón.     $4,000
Colegiatura mensual   10 mensualidades al año. Becas configurables por alumno.  $5,000
Total año escolar     Inscripción + 10 meses (sin beca)                        $54,000

Precios configurables desde Admin → /dashboard/admin/configuracion usando getConfiguracion()
Las becas se expresan en porcentaje (ej: 50%) y se aplican al monto base de la colegiatura
El precio real = precio_base × (1 - beca_porcentaje/100)
El admin puede condonar la inscripción individualmente o mediante cupones

7.2 Paquetes Semillas de Sabiduría
Talleres extracurriculares de Regularización + Natación. Precio mensual fijo.

Paquete     Hrs/Semana   Incluye                                       Precio/Mes   Color
🌱 Siembra  2 hrs        1hr Regularización + 1hr Natación             $1,250       #FF4B6E
🧠 Crece    5 hrs        3hrs Regular (L/M/J) + 2hrs Natación (M/J)   $1,800       #F5C518
🌿 Florece  7 hrs        4hrs Regular (L/M/Mi/J) + 3hrs Nat (M/J/V)  $2,500       #00BFA5

7.3 Talleres Extracurriculares
Clases de Inglés extracurriculares (separado de la colegiatura)
Curso especial para Ingreso a Secundaria
Otros talleres (el admin puede crearlos desde el dashboard)
Pago: mensual O por día — el padre elige al momento del checkout
Recibo PDF se envía automáticamente al pagar con: nombre alumno, servicio, monto, período

═══════════════════════════════════════════════════════
8. Estado de Implementación (Marzo 2026)
═══════════════════════════════════════════════════════

✅ COMPLETADO
- Landing page completa (todas las secciones)
- Auth: login, invite, set-password, reset-password
- Dashboard Admin — KPIs, alumnos, pagos manuales, configuración
- Dashboard Padre — hijos, historial, pagos con Stripe
- Engine financiero — 45 tests en verde (Vitest)
- Stripe — PaymentIntents + Webhooks funcionando en producción
- PDFs — generación y descarga desde Supabase Storage
- Emails — confirmación de pago con Resend + React Email
- Tabla configuración — precios editables desde Admin
- CRM Leads — formularios landing + Kanban Admin (en progreso)

⏳ PENDIENTE
- Cron jobs (día 1, 5, 10 del mes)
- Inscripción configurable al crear alumno
- Talleres extracurriculares
- Semillas con Stripe Subscriptions
- Seguridad — rate limiting Upstash
- Dashboard Admin Fase 2 — cupones CRUD, reportes CSV

═══════════════════════════════════════════════════════
9. Flujo de Pago Real (Implementado)
═══════════════════════════════════════════════════════

1. Padre selecciona servicio y mes en /dashboard/padre/pagar
2. Sistema aplica beca automáticamente (si existe)
3. Padre puede ingresar cupón de descuento
4. Se muestra monto final antes de proceder
5. /api/checkout → crea PaymentIntent en Stripe → guarda pago con estado 'pendiente'
6. Frontend muestra Stripe Elements (no Stripe Checkout hosted) — PCI compliant
7. Padre completa pago con tarjeta
8. Stripe → /api/webhooks/stripe →
   - Actualiza estado a 'pagado'
   - Genera folio (IAN-YYYY-XXXX)
   - Genera PDF del recibo
   - await sendConfirmacionPago() — email con PDF al padre

IMPORTANTE: Emails siempre con await — nunca fire-and-forget

═══════════════════════════════════════════════════════
10. Convenciones Importantes
═══════════════════════════════════════════════════════

1. Precios SIEMPRE en centavos en DB (500000 = $5,000 MXN)
2. Helpers: pesosACentavos() / centavosAPesos()
3. Precios NUNCA hardcodeados — usar getConfiguracion()
4. Emails siempre con await (nunca fire-and-forget)
5. SUPABASE_SERVICE_ROLE_KEY en todas las rutas server (no anon key)
6. RLS activo en todas las tablas — crear políticas al agregar tablas nuevas
7. Zod para validación en todos los API routes
8. npm run build debe pasar antes de cualquier commit
9. No romper los 45 tests existentes en /tests

═══════════════════════════════════════════════════════
11. Estructura del Proyecto
═══════════════════════════════════════════════════════

/grupo-ian
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── invite/
│   │   ├── set-password/
│   │   └── reset-password/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── padre/
│   │   │   ├── page.tsx
│   │   │   ├── pagar/
│   │   │   └── [alumnoId]/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── alumnos/
│   │       ├── pagos/
│   │       ├── servicios/
│   │       ├── cupones/
│   │       ├── configuracion/
│   │       └── crm/
│   └── api/
│       ├── checkout/route.ts
│       ├── webhooks/stripe/route.ts
│       ├── cron/
│       │   ├── generar-colegiaturas/route.ts
│       │   └── marcar-vencidos/route.ts
│       └── admin/
│           └── registrar-pago-manual/route.ts
├── components/
├── lib/
├── services/          ← queries a DB únicamente
├── server/            ← lógica de negocio pura
│   ├── payments/
│   │   ├── calculate-amount.ts
│   │   ├── apply-scholarship.ts
│   │   ├── apply-coupon.ts
│   │   ├── generate-monthly-payments.ts
│   │   ├── mark-overdue.ts
│   │   └── register-manual-payment.ts
│   ├── folios/
│   │   └── generate-folio.ts
│   ├── pdf/
│   │   └── generate-receipt.ts
│   ├── email/
│   │   └── send-confirmacion-pago.ts
│   └── permissions/
│       └── require-admin.ts
├── types/
│   └── index.ts       ← tipos globales
├── hooks/
├── utils/
├── config/
├── public/
├── styles/
├── tests/
│   ├── payments/
│   │   ├── calculate-amount.test.ts
│   │   ├── apply-coupon.test.ts
│   │   ├── scholarship.test.ts
│   │   ├── freeze-month.test.ts
│   │   └── overdue.test.ts
│   ├── folios/
│   │   └── generate-folio.test.ts
│   └── manual-payments/
│       └── register-manual-payment.test.ts
├── middleware.ts
├── vercel.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json

Convenciones de nomenclatura
- Archivos: kebab-case
- Componentes: PascalCase
- Funciones: camelCase
- Enums: UPPER_SNAKE_CASE
- Variables de entorno públicas: prefijo NEXT_PUBLIC_

Capas arquitectónicas
1. UI components → nunca acceden directamente a la DB
2. API routes → sin lógica de negocio, solo orquestan
3. /server → toda la lógica de negocio (funciones puras cuando es posible)
4. /services → solo queries a la DB (Supabase)
5. Middleware → protege rutas de admin
6. Server Components por defecto; 'use client' solo cuando se necesita interactividad

═══════════════════════════════════════════════════════
12. Testing — Engine Financiero
═══════════════════════════════════════════════════════

Tool: Vitest (Unit Testing Only) — 45 tests en verde
No Playwright en MVP.
Tests solo sobre lógica de negocio (funciones puras, sin DB ni Stripe).

Reglas de negocio cubiertas:

A. Beca (Scholarship):
   - 0% beca → precio completo
   - 50% beca → mitad del precio base
   - 100% beca → $0

B. Cupones:
   - Cupón porcentaje → aplica DESPUÉS de la beca
   - Cupón monto fijo → resta monto exacto
   - Monto final nunca puede ser negativo

C. Mes congelado (Freeze Month):
   - Mes congelado → no se genera pago
   - Pago existente + mes congelado → se marca 'condonado'

D. Vencido (Overdue):
   - Pago se vuelve 'vencido' después de 10 días
   - Si ya está pagado → status no cambia

E. Folio:
   - Formato: IAN-YYYY-XXXX
   - Incremento reinicia cada año nuevo
   - Sin duplicados

F. Pago Manual:
   - Cambia status a 'pagado'
   - Guarda método (efectivo, transferencia, caja)
   - Genera folio

Patrón requerido (funciones puras):

  export function calculateAmount({ base, scholarshipPercent, coupon }) {
    let afterScholarship = base - (base * scholarshipPercent / 100)
    let discount = 0
    if (coupon?.type === "percentage") {
      discount = afterScholarship * coupon.value / 100
    } else if (coupon?.type === "fixed") {
      discount = coupon.value
    }
    return { afterScholarship, discount, finalAmount: Math.max(0, afterScholarship - discount) }
  }

Regla: ninguna función financiera sin cobertura de tests.
Correr con: npm run test

═══════════════════════════════════════════════════════
13. Landing Page — Especificaciones
═══════════════════════════════════════════════════════

URL: / (raíz). Renderizado SSG para máxima velocidad y SEO.

Secciones en orden:

13.1 NAVBAR (fijo en scroll)
  Logo Grupo IAN a la izquierda
  Links: Inicio · Nosotros · Servicios · Paquetes · Galería · Contacto
  Botón CTA: 'Portal Padres' (rojo, abre /login)
  Mobile: hamburger menu con drawer lateral
  Fondo blanco con sombra suave al hacer scroll

13.2 HERO — Alta conversión
  Fondo: gradiente diagonal turquesa → blanco
  Badge animado: '¡Inscripciones Abiertas!'
  H1: '¡Diversión + Aprendizaje En Un Solo Lugar!'
  Subtítulo: 'Mejoran en la escuela y se divierten como nunca'
  2 CTAs: [Inscribe a tu hijo →] (rojo) + [Ver Paquetes] (outline turquesa)
  Trust badges: ✓ Maestros Certificados  ✓ Ambiente Seguro  ✓ Horarios Flexibles

13.3 STATS / PRUEBA SOCIAL
  Fondo turquesa sólido
  4 números animados al hacer scroll: '200+ Alumnos' · '10+ Años' · '3 Modalidades' · '100% Bilingüe'

13.4 ¿POR QUÉ GRUPO IAN?
  Grid de 6 tarjetas: Horarios Flexibles · Escuela de Inglés · Regularización
                      Educación Integral · Ambiente Seguro · Maestros Certificados

13.5 SECCIÓN DE SERVICIOS
  Tab switcher: [Kinder & Primaria] [Regularización] [Inglés] [Natación]

13.6 PAQUETES SEMILLAS DE SABIDURÍA
  3 cards: Siembra (rojo) · Crece (amarillo, badge 'MÁS POPULAR') · Florece (turquesa)
  Botones redirigen a WhatsApp o al portal de padres

13.7 GALERÍA DE FOTOS
  Masonry grid o carousel con lightbox
  CTA: 'Agenda una visita'

13.8 TESTIMONIOS DE PADRES
  Carousel con 5–8 testimonios con nombre, hijo/grado, ★★★★★

13.9 FAQ — Acordeón expandible con 8–10 preguntas clave

13.10 CTA FINAL
  Fondo rojo/rosa vibrante
  Headline: '¡Adelántate al Futuro — Asegura su Lugar Desde Hoy!'
  Botón: 'Inscribir a mi hijo ahora →' + link a WhatsApp

13.11 FOOTER
  Logo + 'El Futuro Es Hoy'
  Dirección, WhatsApp, horario
  © 2025 Grupo IAN — Todos los derechos reservados

13.12 FORMULARIO CRM
  Captura leads desde landing a tabla crm_leads

═══════════════════════════════════════════════════════
14. Dashboard — Portal de Padres (/dashboard/padre)
═══════════════════════════════════════════════════════

Acceso: requiere autenticación Supabase (email + contraseña)

14.1 Vista Principal
  Header: 'Bienvenido, [Nombre]' + resumen de hijos
  Cards por alumno: nombre, grado, estatus de pago del mes actual
  Semáforo visual: Verde (al corriente) · Amarillo (próximo a vencer) · Rojo (vencido)

14.2 Detalle por Alumno
  Historial completo de pagos (colegiatura + talleres + inscripción)
  Botón 'Pagar ahora' con modal de selección de servicio y período
  Opción de ingresar cupón de descuento antes del pago
  Descarga de recibos PDF de cualquier pago pasado

═══════════════════════════════════════════════════════
15. Dashboard — Admin (/dashboard/admin)
═══════════════════════════════════════════════════════

Acceso: solo usuario con rol 'admin' en Supabase. Verificado server-side con middleware.

15.1 Vista General (Overview)
  KPI cards: Total cobrado este mes · Alumnos al corriente · Adeudos · Inscripciones pendientes
  Gráfica de ingresos mensuales (últimos 12 meses)
  Lista de pagos recientes en tiempo real
  Alertas: alumnos con más de 1 mes de adeudo

15.2 Gestión de Alumnos
  Tabla con filtros: nombre, grado, estatus de pago, beca
  CRUD: crear, editar (beca %, padre, activar/desactivar), ver historial
  Al crear alumno → genera código de invitación → envía email al padre

15.3 Gestión de Pagos
  Filtros avanzados: mes, año, servicio, alumno, estatus
  Exportar CSV/Excel para contabilidad
  Ver/descargar PDF de cualquier recibo
  Marcar pago como condonado (con motivo)
  Registro de pagos manuales (efectivo, transferencia, caja)

15.4 Configuración de Precios
  Editar precios desde UI
  Lee/escribe tabla configuracion mediante getConfiguracion()
  Ruta: /dashboard/admin/configuracion

15.5 CRM — Gestión de Leads
  Kanban por estatus (nuevo/contactado/interesado/inscrito/cancelado)
  Leads capturados desde formularios de la landing
  En progreso

15.6 Cupones (pendiente)
  CRUD: código, tipo (% / monto fijo / condonar inscripción), valor, usos máximos
  Activar / desactivar, fecha de expiración, contador de usos

15.7 Reportes CSV (pendiente)

═══════════════════════════════════════════════════════
16. Sistema de Recibos PDF
═══════════════════════════════════════════════════════

Generados server-side con @react-pdf/renderer
Almacenados en Supabase Storage (bucket 'recibos')
URL guardada en pagos.pdf_url

Contenido del recibo:
- Logo Grupo IAN + datos de la institución
- Datos del alumno: nombre, grado, grupo
- Folio: IAN-YYYY-XXXX
- Concepto y período
- Desglose: precio base · descuento beca · descuento cupón · TOTAL
- Método de pago
- Fecha de pago + ID de transacción Stripe (si aplica)
- Leyenda: 'Este recibo es comprobante de pago válido'

Envío automático (siempre con await):
- Email con React Email al padre inmediatamente después del pago
- Asunto: 'Recibo de pago — [Nombre alumno] — [Mes/Año]'
- Cuerpo: confirmación amigable + botón para ver en portal

═══════════════════════════════════════════════════════
17. SEO y Performance
═══════════════════════════════════════════════════════

SEO On-Page
Title: 'Grupo IAN — Escuela Bilingüe Kinder y Primaria | Coyoacán, CDMX'
Meta description: 'Colegio bilingüe en Coyoacán con regularización, inglés, natación y más. ¡Inscripciones abiertas! Horarios flexibles.'
Open Graph para redes sociales
Schema.org: EducationalOrganization markup para Google
Sitemap.xml automático · robots.txt configurado

Performance (Core Web Vitals)
- next/image con lazy loading + WebP automático
- next/font — CLS = 0
- SSG en landing page: HTML pre-generado en build time
- Server Components por defecto — mínimo JS al cliente
- Tailwind purge — bundle final < 10kb
- Target: Lighthouse Score > 90 en todas las métricas

═══════════════════════════════════════════════════════
18. Seguridad
═══════════════════════════════════════════════════════

HTTPS: automático en Vercel (SSL renovado automáticamente)
Auth: Supabase Auth — tokens JWT, sesiones seguras
RLS: padres solo ven sus propios datos en DB
Stripe: datos de tarjeta nunca en nuestro servidor — todo pasa por Stripe
Webhooks Stripe: verificados con firma secreta (stripe-signature header)
Variables de entorno: .env.local para desarrollo, Vercel Env para producción
Admin role: verificado server-side en cada request con middleware de Next.js
Rate limiting: pendiente (Upstash Redis)
Cron routes: protegidas con CRON_SECRET

═══════════════════════════════════════════════════════
19. Deploy
═══════════════════════════════════════════════════════

Push a main → Vercel deploya automáticamente
Variables de entorno en Vercel Dashboard
npm run build debe pasar antes de cualquier commit/push

Comandos:
  npm run dev      → desarrollo local
  npm run build    → verificar antes de push
  npm run test     → correr 45 tests del engine financiero



GRUPO IAN — El Futuro Es Hoy
Documento de especificaciones v2.0 — Actualizado Marzo 2026
