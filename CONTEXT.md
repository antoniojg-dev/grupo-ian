GRUPO IAN
El Futuro Es Hoy
ESPECIFICACIONES COMPLETAS DEL PROYECTO WEB

Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Stripe · Vercel
Moneda: MXN  ·  Idioma: Español  ·  Pagos: Stripe  ·  Deploy: Vercel (HTTPS automático)
1. Información de la Institución



2. Identidad Visual & Diseño

Paleta de Colores


Tipografía
Headings: Nunito (Google Fonts) — redondeada, amigable, perfecta para educación infantil
Body: Inter — limpio, legible en pantallas, excelente para dashboards
Logo font: como en el branding actual (sans-serif geométrico bold)

Tono Visual
Alegre, colorido, profesional — no infantil en exceso
Cards con bordes redondeados (border-radius: 16px)
Sombras suaves (shadow-md), no agresivas
Imágenes reales de la escuela donde sea posible

3. Arquitectura Técnica

Capa	Tecnología
Framework	Next.js 14 (App Router) — SSR/SSG para SEO perfecto
Lenguaje	TypeScript — seguridad de tipos, menos bugs en producción
Estilos	Tailwind CSS — bundle mínimo, carga ultrarrápida
Base de datos	Supabase (PostgreSQL) — Auth + DB + Storage + Row Level Security
Pagos	Stripe — checkout seguro, webhooks, recibos automáticos
PDFs / Recibos	react-pdf / puppeteer — generación server-side
Email	Resend + React Email — transaccional (recibos, invitaciones)
Deploy	Vercel — HTTPS automático, CDN global, CI/CD desde GitHub
Moneda	MXN (pesos mexicanos)

Estructura de Rutas

Ruta	Descripción
/	Landing Page pública (SEO optimizado)
/login	Acceso padres y admin
/dashboard/padre	Portal del padre: hijos, pagos, recibos
/dashboard/padre/pagar	Checkout con Stripe
/dashboard/admin	Vista general: KPIs, alertas de pagos
/dashboard/admin/alumnos	CRUD de alumnos + asignar becas
/dashboard/admin/pagos	Reporte de pagos / deudores / filtros
/dashboard/admin/servicios	Gestión de talleres y paquetes
/dashboard/admin/cupones	Crear y gestionar cupones de descuento

4. Base de Datos — Supabase

Todas las tablas usan Row Level Security (RLS). Los padres solo ven sus datos; el admin ve todo.

Tablas Principales
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
• pdf_url (URL del recibo en Supabase Storage)
• created_at, paid_at

inscripciones

• id, alumno_id, anio_escolar
• monto_original (default: $4,000 MXN)
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

5. Servicios y Precios

5.1 Colegiatura Escolar (Bilingüe)
Incluye: Inglés · Español · Matemáticas · Historia · Estimulación Temprana · Juego y Aprendo · High Scope

Concepto	Descripción	Monto MXN
Inscripción (1 vez/año)	Primer pago del ciclo escolar. Condonable con cupón o por admin.	$4,000
Colegiatura mensual	10 mensualidades al año. Becas configurables por alumno.	$5,000
Total año escolar	Inscripción + 10 meses (sin beca)	$54,000

Las becas se expresan en porcentaje (ej: 50%) y se aplican al monto base de la colegiatura
El precio real que paga cada alumno = precio_base × (1 - beca_porcentaje/100)
El admin puede condonar la inscripción individualmente o mediante cupones de descuento

5.2 Paquetes Semillas de Sabiduría
Talleres extracurriculares de Regularización + Natación. Precio mensual fijo.

Paquete	Hrs/Semana	Incluye	Precio/Mes	Color
🌱 Siembra	2 hrs	1hr Regularización + 1hr Natación	$1,250	#FF4B6E
🧠 Crece	5 hrs	3hrs Regular (L/M/J) + 2hrs Natación (M/J)	$1,800	#F5C518
🌿 Florece	7 hrs	4hrs Regular (L/M/Mi/J) + 3hrs Natación (M/J/V)	$2,500	#00BFA5

5.3 Talleres Extracurriculares
Clases de Inglés extracurriculares (separado de la colegiatura)
Curso especial para Ingreso a Secundaria
Otros talleres (el admin puede crearlos desde el dashboard)
Pago: mensual O por día — el padre elige al momento del checkout
Recibo PDF se envía automáticamente al pagar con: nombre alumno, servicio, monto, período
6. Landing Page — Especificaciones Completas

URL: / (raíz del sitio). Renderizado SSG para máxima velocidad y SEO óptimo.

Secciones en Orden
6.1 NAVBAR (fijo en scroll)
Logo Grupo IAN a la izquierda
Links: Inicio · Nosotros · Servicios · Paquetes · Galería · Contacto
Botón CTA: 'Portal Padres' (rojo, abre /login)
En mobile: hamburger menu con drawer lateral
Fondo blanco con sombra suave al hacer scroll

6.2 HERO SECTION — Alta conversión
Fondo: gradiente diagonal turquesa → blanco, con imagen real de niños en clase
Badge animado: '¡Inscripciones Abiertas!' (amarillo parpadeante suave)
H1 principal: '¡Diversión + Aprendizaje En Un Solo Lugar!'
Subtítulo: 'Mejoran en la escuela y se divierten como nunca con clases de regularización, deporte y mucho más'
2 CTAs: [Inscribe a tu hijo →] (rojo) + [Ver Paquetes] (outline turquesa)
Trust badges debajo: ✓ Maestros Certificados  ✓ Ambiente Seguro  ✓ Horarios Flexibles
Imagen hero: foto real de salón de clases Grupo IAN (imagen 3 del flyer)

6.3 STATS / PRUEBA SOCIAL
Fondo turquesa sólido
4 números animados al hacer scroll: '200+ Alumnos' · '10+ Años' · '3 Modalidades' · '100% Bilingüe'
Genera confianza inmediata (social proof numérico)

6.4 ¿POR QUÉ GRUPO IAN? — Diferenciadores
Grid de 6 tarjetas con íconos: Horarios Flexibles · Escuela de Inglés · Regularización · Educación Integral · Ambiente Seguro · Maestros Certificados
Fondo blanco, íconos coloridos en los colores de la marca
Frase ancla: 'Más que clases — Crecimiento Académico Y Deportivo'

6.5 SECCIÓN DE SERVICIOS
Título: 'Todo lo que tu hijo necesita en un solo lugar'
Tab switcher o acordeón: [Kinder & Primaria] [Regularización] [Inglés] [Natación]
Cada tab muestra: descripción, lo que incluye, precio referencial, CTA
Colegiatura: $5,000/mes (bilingüe, incluye todo)
Talleres extracurriculares: desde $1,250/mes

6.6 PAQUETES SEMILLAS DE SABIDURÍA
Título: 'Semillas de Sabiduría — Elige el plan perfecto'
3 cards horizontales: Siembra (rojo) · Crece (amarillo, 'MÁS POPULAR' badge) · Florece (turquesa)
Cada card: nombre, horas/semana, qué incluye, precio, botón 'Inscribirse'
El botón redirige a WhatsApp o al portal de padres si ya tienen cuenta

6.7 GALERÍA DE FOTOS
Masonry grid o carousel con lightbox
Fotos reales del salón, niños en actividades, eventos
CTA final: 'Conoce nuestras instalaciones → Agenda una visita'

6.8 TESTIMONIOS DE PADRES
Carousel con 5–8 testimonios
Cada testimonio: foto (avatar si no hay), nombre, hijo/grado, estrellitas ★★★★★, texto corto
Ejemplo: 'Mi hijo mejoró en matemáticas en solo 2 meses. ¡100% recomendado!' — Ana García, mamá de Luis (3° primaria)

6.9 FAQ — Preguntas Frecuentes
Acordeón expandible con 8–10 preguntas clave
¿Qué incluye la colegiatura? / ¿Cómo funciona la natación? / ¿Hay modalidad virtual?
¿Cómo pago en línea? / ¿Puedo congelar mensualidades? / ¿Hay beca disponible?
¿Cuál es el horario? / ¿Cómo inscribo a mi hijo?

6.10 CTA FINAL — Conversión máxima
Fondo rojo/rosa vibrante
Headline: '¡Adelántate al Futuro — Asegura su Lugar Desde Hoy!'
Botón enorme: 'Inscribir a mi hijo ahora →' (blanco sobre rojo)
Link secundario: 'Hablar con un asesor por WhatsApp'

6.11 FOOTER
Logo + tagline 'El Futuro Es Hoy'
Dirección: Cerro Acasulco #42, Oxtopulco Universidad, Coyoacán
Teléfono / WhatsApp: 55 7807 2426
Horario: 7:00 – 19:00 hrs
Links rápidos: Servicios · Paquetes · Portal Padres · Aviso de Privacidad
Íconos de redes sociales
© 2025 Grupo IAN — Todos los derechos reservados
7. Dashboard — Portal de Padres

Acceso: /dashboard/padre — requiere autenticación Supabase (email + contraseña)

7.1 Vista Principal
Header: 'Bienvenido, [Nombre del Padre]' + resumen de hijos
Cards por alumno: nombre, grado, estatus de pago del mes actual
Semáforo visual: Verde (al corriente) · Amarillo (próximo a vencer) · Rojo (vencido)

7.2 Detalle por Alumno
Historial completo de pagos (colegiatura + talleres + inscripción)
Botón 'Pagar ahora' con modal de selección de servicio y período
Opción de ingresar cupón de descuento antes del pago
Descarga de recibos PDF de cualquier pago pasado

7.3 Flujo de Pago con Stripe
1. Padre selecciona servicio y mes a pagar
2. Sistema aplica beca automáticamente (si existe)
3. Padre puede ingresar cupón de descuento
4. Se muestra el monto final antes de proceder
5. Stripe Checkout (hosted) — PCI compliant, seguro
6. Webhook de Stripe confirma el pago
7. PDF de recibo generado y enviado por email automáticamente
8. Dashboard se actualiza en tiempo real
8. Dashboard — Admin

Acceso: /dashboard/admin — solo el usuario con rol 'admin' en Supabase puede acceder.

8.1 Vista General (Overview)
KPI cards: Total cobrado este mes · Alumnos al corriente · Alumnos con adeudo · Inscripciones pendientes
Gráfica de ingresos mensuales (últimos 12 meses)
Lista de pagos recientes en tiempo real
Alertas: alumnos con más de 1 mes de adeudo

8.2 Gestión de Alumnos
Tabla completa con filtros: nombre, grado, estatus de pago, beca
Crear nuevo alumno: nombre, apellido, grado, padre asignado, beca (%)
Editar alumno: cambiar beca, cambiar padre, activar/desactivar
Al crear alumno → sistema genera código de invitación → envía email al padre
Ver historial de pagos de cada alumno con desglose por concepto

8.3 Gestión de Pagos
Tabla con filtros avanzados: mes, año, servicio, alumno, estatus
Exportar a CSV/Excel para contabilidad
Ver/descargar PDF de cualquier recibo
Marcar pago como condonado (con motivo)
Ver pagos de inscripción separados de colegiaturas mensuales

8.4 Gestión de Cupones
Crear cupón: código, tipo (% / monto fijo / condonar inscripción), valor, usos máximos
Fecha de expiración configurable
Ver cuántas veces se ha usado cada cupón
Activar / desactivar cupones

8.5 Gestión de Talleres y Servicios
Crear/editar talleres extracurriculares con precio mensual y precio por día
Activar/desactivar servicios disponibles para pago
Los 3 paquetes Semillas de Sabiduría son fijos (no editables desde UI en MVP)
9. Sistema de Recibos PDF

Todos los recibos se generan server-side y se almacenan en Supabase Storage.

Recibo de Colegiatura Mensual
Logo Grupo IAN + datos de la institución
Datos del alumno: nombre, grado, grupo
Concepto: Colegiatura [mes] [año]
Desglose: precio base · descuento beca (si aplica) · descuento cupón (si aplica) · TOTAL
Fecha de pago + ID de transacción Stripe
Leyenda: 'Este recibo es comprobante de pago válido'

Recibo de Paquete Semillas de Sabiduría
Logo + datos institución
Nombre del alumno
Plan contratado: [Siembra / Crece / Florece]
Descripción del plan: horas semanales, qué incluye, horarios
Período: [mes] [año] — 1 mes
Monto pagado: $X,XXX MXN
Fecha de pago + ID Stripe

Recibo de Taller Extracurricular
Nombre del taller
Modalidad: Mensual o Por día (especificar fecha si es por día)
Período cubierto
Monto y desglose

Envío Automático
Email con PDF adjunto enviado al padre inmediatamente después del pago
Asunto: 'Recibo de pago — [Nombre alumno] — [Mes/Año]'
Cuerpo: confirmación amigable + botón para ver en portal
10. SEO y Performance

SEO On-Page
Title: 'Grupo IAN — Escuela Bilingüe Kinder y Primaria | Coyoacán, CDMX'
Meta description: 'Colegio bilingüe en Coyoacán con regularización, inglés, natación y más. ¡Inscripciones abiertas! Horarios flexibles. Modalidad virtual, presencial y mixta.'
Open Graph para redes sociales (compartir con preview rico)
Schema.org: EducationalOrganization markup para aparecer en Google
Sitemap.xml generado automáticamente por Next.js
robots.txt configurado

Performance (Core Web Vitals)
Imágenes: next/image con lazy loading + WebP automático
Fuentes: next/font para cero layout shift (CLS = 0)
SSG en landing page: HTML pre-generado en build time
Server Components por defecto — mínimo JS al cliente
CSS: Tailwind purge — bundle final < 10kb
Target: Lighthouse Score > 90 en todas las métricas

11. Seguridad

HTTPS: automático en Vercel (certificado SSL renovado automáticamente)
Autenticación: Supabase Auth — tokens JWT, sesiones seguras
Row Level Security (RLS): cada padre solo puede ver sus propios datos en DB
Stripe: nunca se almacenan datos de tarjeta — todo pasa por Stripe directamente
Webhooks Stripe: verificados con firma secreta (stripe-signature header)
Variables de entorno: .env.local para desarrollo, Vercel Env para producción
Admin role: verificado server-side en cada request con middleware de Next.js
Rate limiting en rutas de API críticas (login, webhooks)

12. Orden de Desarrollo Recomendado
1	Setup inicial	next create-app · TypeScript · Tailwind · Supabase · Vercel deploy vacío → obtener URL HTTPS
2	Landing Page	Todas las secciones del punto 6. SSG. Sin auth.
3	Auth + DB	Tablas Supabase · RLS · Login · Flujo invitación padres
4	Dashboard Padres	Ver hijos · Ver pagos · Stripe checkout básico
5	Stripe + PDFs	Checkout completo · Webhooks · Generación de recibos PDF
6	Dashboard Admin	CRUD alumnos · Reportes · Cupones · Becas
7	Polish	Emails transaccionales · Animaciones · Mobile optimization · SEO final



GRUPO IAN — El Futuro Es Hoy
Documento de especificaciones v1.0 — Preparado para Claude Code


GRUPO IAN — TESTING SPECIFICATION (FOR
CLAUDE CODE)
1. Objective of Testing
The purpose of testing in Grupo IAN system is to protect the financial engine.
The system is 100% focused on payments and financial administration.
Critical rules that must NEVER break:
- Scholarship calculations
- Coupon logic
- No future payments allowed
- Freeze month logic
- Overdue after 10 days
- Incremental annual folio generation
- Manual payment registration
2. Testing Tool
Tool: Vitest (Unit Testing Only)
Do NOT implement Playwright for MVP.
Tests must focus only on business logic functions.
3. Required Test Structure
/tests
■
■■■ payments/
■ ■■■ calculate-amount.test.ts
■ ■■■ apply-coupon.test.ts
■ ■■■ scholarship.test.ts
■ ■■■ freeze-month.test.ts
■ ■■■ overdue.test.ts
■
■■■ folios/
■ ■■■ generate-folio.test.ts
■
■■■ manual-payments/
■■■ register-manual-payment.test.ts
4. Business Logic Rules To Be Tested
A. Scholarship:
- 0% scholarship returns full price
- 50% scholarship correctly halves base price
- 100% scholarship returns 0
B. Coupons:
- Percentage coupon applies AFTER scholarship
- Fixed coupon subtracts exact amount
- Final amount can never be negative
C. Freeze Month:
- If month is frozen, no payment must be generated
- If payment exists and month is frozen, it must be marked 'condonado'
D. Overdue:
- Payment becomes 'vencido' after 10 days
- If already paid, status must not change
E. Folio:
- Format must be IAN-YYYY-XXXX
- Increment must restart every new year
- No duplicates allowed
F. Manual Payment:
- Changes status to 'pagado'
- Saves method (efectivo, transferencia, caja)
- Generates folio
5. Example Function Pattern (Must Be Pure Functions)
export function calculateAmount({ base, scholarshipPercent, coupon }) {
let afterScholarship = base - (base * scholarshipPercent / 100)
let discount = 0
if (coupon?.type === "percentage") {
discount = afterScholarship * coupon.value / 100
if (coupon?.type === "fixed") {
discount = coupon.value
}
}
const finalAmount = Math.max(0, afterScholarship - discount)
return { afterScholarship, discount, finalAmount }
}
6. Example Unit Test
import { describe, it, expect } from "vitest"
import { calculateAmount } from "@/server/payments/calculate-amount"
describe("calculateAmount", () => {
it("applies 50% scholarship correctly", () => {
const result = calculateAmount({
base: 5000,
scholarshipPercent: 50,
coupon: null
})
expect(result.finalAmount).toBe(2500)
})
it("applies percentage coupon after scholarship", () => {
const result = calculateAmount({
base: 5000,
scholarshipPercent: 50,
coupon: { type: "percentage", value: 10 }
})
expect(result.finalAmount).toBe(2250)
})
})
7. Architectural Rules For Claude Code
- All financial logic must live inside /server.
- API routes must not contain business logic.
- All tested functions must be pure (no DB, no Stripe inside them).
- Database operations must be mocked if needed.
- Tests must run with: npm run test
- No financial feature should be implemented without test coverage.

GRUPO IAN — NEXT.JS PROJECT STRUCTURE &
CONVENTIONS
1. Root Folder Structure
/grupo-ian
■
■■■ app/
■■■ components/
■■■ lib/
■■■ services/
■■■ server/
■■■ types/
■■■ hooks/
■■■ utils/
■■■ config/
■■■ public/
■■■ styles/
■
■■■ middleware.ts
■■■ vercel.json
■■■ tailwind.config.ts
■■■ next.config.ts
■■■ tsconfig.json
■■■ package.json
2. App Router Structure (/app)
app/
■
■■■ layout.tsx
■■■ page.tsx
■
■■■ (auth)/
■ ■■■ login/
■ ■■■ page.tsx
■
■■■ dashboard/
■ ■■■ layout.tsx
■ ■
■ ■■■ padre/
■ ■ ■■■ page.tsx
■ ■ ■■■ pagar/
■ ■ ■ ■■■ page.tsx
■ ■ ■■■ [alumnoId]/
■ ■ ■■■ page.tsx
■ ■
■ ■■■ admin/
■ ■■■ page.tsx
■ ■■■ alumnos/
■ ■■■ pagos/
■ ■■■ servicios/
■ ■■■ cupones/
■ ■■■ reportes/
■
■■■ api/
■ ■■■ stripe/
■ ■ ■■■ create-checkout-session/
■ ■ ■ ■■■ route.ts
■ ■ ■■■ webhook/
■ ■ ■■■ route.ts
■ ■
■ ■■■ cron/
■ ■ ■■■ generar-colegiaturas/
■ ■ ■ ■■■ route.ts
■ ■ ■■■ marcar-vencidos/
■ ■ ■■■ route.ts
■ ■
■ ■■■ admin/
■ ■■■ registrar-pago-manual/
■ ■■■ route.ts
3. Server Business Logic (/server)
server/
■
■■■ payments/
■ ■■■ calculate-amount.ts
■ ■■■ apply-scholarship.ts
■ ■■■ apply-coupon.ts
■ ■■■ generate-monthly-payments.ts
■ ■■■ mark-overdue.ts
■ ■■■ register-manual-payment.ts
■
■■■ folios/
■ ■■■ generate-folio.ts
■
■■■ pdf/
■ ■■■ generate-receipt.ts
■
■■■ permissions/
■■■ require-admin.ts
4. Data Access Layer (/services)
services/
■
■■■ alumnos.service.ts
■■■ pagos.service.ts
■■■ cupones.service.ts
■■■ servicios.service.ts
■■■ congelaciones.service.ts
5. Architectural Conventions
1. UI components never access database directly.
2. API routes contain no business logic.
3. Business logic lives in /server.
4. /services only handles database queries.
5. Middleware protects admin routes.
6. Naming:
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase
- Enums: UPPER_SNAKE_CASE
7. Environment variables must never be exposed publicly unless prefixed with NEXT_PUBLIC_.

GRUPO IAN — TECHNICAL IMPLEMENTATION
CHECKLIST
1. Project Setup
• Initialize Next.js 14 project with TypeScript and App Router
• Install Tailwind CSS
• Install Supabase client
• Install Stripe SDK
• Install @react-pdf/renderer
• Install Resend (email service)
• Configure Vercel project and initial deploy
• Setup environment variables (.env.local + Vercel Env)
2. Supabase Configuration
• Enable Email + Password authentication
• Create tables: alumnos, servicios, pagos, payment_batches, cupones, alumno_congelaciones,
folios
• Create folio generation SQL function
• Create RLS policies (padre only sees own data)
• Create storage bucket 'recibos'
• Assign admin role system
3. Financial Engine
• Implement monthly cron job (generate colegiaturas)
• Implement daily cron job (mark payments as vencido after 10 days)
• Implement scholarship (beca) calculation logic
• Implement coupon logic (percentage, fixed amount, condonation)
• Prevent future month payments
• Implement month freeze logic (alumno_congelaciones table)
4. Stripe Integration
• Create API route: create-checkout-session
• Support multi-concept checkout (payment_batches)
• Create Stripe webhook endpoint
• Validate webhook signature
• Mark payments as pagado after confirmation
• Generate consolidated PDF receipt
• Send email with receipt
5. Manual Payments
• Admin UI to register manual payment
• Support methods: efectivo, transferencia, caja
• Store manual reference field
• Generate receipt with folio
• Send email confirmation
6. PDF System
• Generate server-side PDF receipt
• Include folio format: IAN-YYYY-XXXX
• Include payment method and breakdown
• Store PDF in Supabase Storage
• Attach PDF to email
7. Admin Dashboard
• KPI cards (total month revenue, adeudos, inscripciones)
• Revenue chart (last 12 months)
• Alumnos CRUD with scholarship %
• Freeze month UI
• Advanced payment filters
• Export CSV for accounting
8. Parent Portal
• Display children and payment status
• Traffic light indicator (verde, amarillo, rojo)
• Payment selection modal (multi-select)
• Coupon input field
• Receipt download section
9. Security
• Validate admin role server-side
• Protect cron routes with CRON_SECRET
• Validate Stripe signatures
• Ensure RLS policies enforced
• Rate limit critical API routes
10. Testing Before Production
• Test Stripe in test mode
• Test manual payments
• Test coupon application
• Test scholarship calculation
• Test freeze month behavior
• Test vencido auto-update
• Validate folio increment
• Validate email delivery
• Run Lighthouse audit (>90 score)











