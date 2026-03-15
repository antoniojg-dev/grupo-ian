# Análisis del Proyecto — Grupo IAN

**Fecha:** Marzo 2026  
**Producción:** https://www.grupoian.lat  
**Objetivo:** Reporte informativo. No se han aplicado cambios al código en esta parte.

---

## 1. ARQUITECTURA

### ¿Se está siguiendo la arquitectura definida en CONTEXT.md?

**En gran parte sí**, con algunas desviaciones:

- **Server Components:** Las páginas de dashboard (padre y admin) usan Server Components y hacen data fetching en servidor pasando `supabase` a funciones de `/services`. Correcto.
- **'use client':** Se usa solo donde hay interactividad (formularios, modales, landing con animaciones). Correcto.
- **Lógica de negocio en /server:** `buildPaymentData`, `calculateAmount`, `applyCoupon`, `generateAndSaveReceipt`, etc. están en `/server`. Correcto.
- **Queries en /services:** `getPagos`, `getAlumnosByPadre`, `getConfiguracion`, etc. están en `/services`. Correcto.
- **Tipos en /types:** `types/index.ts` concentra tipos globales. Correcto.

**Inconsistencias:**

- **CONTEXT.md** indica estructura `app/api/admin/registrar-pago-manual/route.ts`; en el proyecto la ruta real es **`app/api/pagos/manual/route.ts`**. La estructura actual es coherente (agrupa por dominio), pero no coincide con el documento.
- No existe **middleware.ts** en la raíz. CONTEXT.md y la sección de Seguridad indican que el rol admin se verifica "con middleware de Next.js". La protección se hace solo en **`app/dashboard/admin/layout.tsx`** (redirect si no hay user o si `perfil.rol !== 'admin'`). Las rutas API admin verifican sesión y rol dentro de cada handler, no vía middleware.

### ¿Hay lógica de negocio en API routes que debería estar en /server?

- **checkout/route.ts:** Usa `buildPaymentData` de `/server` correctamente. La generación de folio se hace con `supabase.rpc('generar_folio')` y las inserciones/updates en la misma ruta. La orquestación en la ruta es aceptable; la lógica pura está en `/server`.
- **pagos/manual/route.ts:** Igual: usa `buildPaymentData` y `generateAndSaveReceipt`/`sendConfirmacionPago` del server. Correcto.
- **webhooks/stripe/route.ts:** Orquesta llamadas a Supabase, folio, PDF y email. La lógica de "qué hacer cuando pago succeed" podría extraerse a un módulo en `/server` (por ejemplo `server/payments/confirm-stripe-payment.ts`) para reducir tamaño del handler y facilitar tests. **Recomendación:** refactor opcional a /server.

No hay lógica de negocio pesada duplicada en las rutas; la mayoría está bien delegada a `/server`.

### ¿Hay queries directas a DB en componentes?

**No.** Las páginas (Server Components) reciben el cliente Supabase y llaman a funciones de `/services` (ej. `getAlumnosByPadre(supabase, user.id)`). Los componentes UI no importan Supabase ni ejecutan queries. Correcto.

### ¿Hay inconsistencias en la estructura de carpetas?

- **Dashboard admin:** CONTEXT.md lista `dashboard/admin/crm/` en la estructura; en el repo **no existe** `app/dashboard/admin/crm/`. El CRM está pendiente de implementación.
- **Auth:** CONTEXT muestra `(auth)/` con login, invite, set-password, reset-password. En el repo existe `app/auth/` (login en `app/login/`, invite/set-password/reset en `app/auth/`). Pequeña diferencia de ubicación de `login`.
- **API:** No hay `app/api/cron/` con las rutas de cron mencionadas en CONTEXT; solo se referencian en el documento. No hay `app/api/crm/` aún.

---

## 2. SEGURIDAD

### ¿Hay API routes sin validación de sesión?

| Ruta | Sesión | Notas |
|------|--------|--------|
| `POST /api/checkout` | Sí | Verifica user y rol padre. |
| `POST /api/admin/config` | Sí | Verifica user y rol admin. |
| `POST /api/pagos/manual` | Sí | Verifica user y rol admin. |
| `GET /api/recibos/[folio]` | Sí | Verifica user; padre solo sus recibos, admin todos. |
| `POST /api/emails/recordatorio` | No (por diseño) | Protegida por `CRON_SECRET` (Bearer token). Aceptable para cron. |
| `POST /api/webhooks/stripe` | No (por diseño) | Verificación por firma Stripe. Correcto. |
| `GET /api/auth/confirm` | N/A | Flujo de confirmación con code/token. |

Todas las rutas que deben estar protegidas por sesión lo están. Las que no requieren sesión (cron, webhook) usan otros mecanismos.

### ¿Hay API routes sin validación Zod?

- **checkout:** Zod con `schema.safeParse(body)`. Correcto.
- **admin/config:** Zod. Correcto.
- **pagos/manual:** Zod. Correcto.
- **recibos/[folio]:** Solo recibe `folio` por params; no body. Aceptable.
- **emails/recordatorio:** No body; solo auth por header. Aceptable.
- **webhooks/stripe:** Body es el evento de Stripe; se valida con `stripe.webhooks.constructEvent`. Correcto.
- **auth/confirm:** Query params; no hay schema Zod explícito. **Recomendación:** validar `code`, `token_hash`, `type` con Zod para evitar malformados.

### ¿Hay variables de entorno expuestas incorrectamente?

- En **server** se usan `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`, `RESEND_*`, `CRON_SECRET`. Las únicas públicas son las `NEXT_PUBLIC_*`, adecuado para cliente.
- **lib/supabase/server.ts** usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (necesaria para SSR con cookies). Correcto.
- No se observan claves secretas en código cliente.

### ¿Hay endpoints que deberían requerir rol admin y no lo verifican?

- **GET /api/recibos/[folio]:** Permite a padre ver sus recibos y a admin todos. Correcto.
- **POST /api/admin/config** y **POST /api/pagos/manual** comprueban `perfil.rol === 'admin'`. Correcto.

No se detectan endpoints admin sin verificación de rol.

### ¿El RLS de Supabase está correctamente configurado?

En **supabase/schema.sql**:

- RLS está **habilitado** en: perfiles, alumnos, servicios, cupones, pagos, inscripciones, payment_batches, payment_batch_items, folios, alumno_congelaciones.
- Políticas usan `auth.uid()` y `public.is_admin()` de forma coherente (padres ven solo lo suyo, admins todo).
- **Storage** bucket `recibos`: políticas SELECT por padre/admin e INSERT solo admin.

La tabla **configuracion** no aparece en el schema.sql mostrado; si existe en la base real, debe tener RLS y políticas que restrinjan escritura a admin.

**Nota:** Las rutas que necesitan operar como admin (pagos manuales, webhook, cron) usan **SUPABASE_SERVICE_ROLE_KEY**, que bypasea RLS. Es la práctica correcta para esos flujos.

### ¿Hay rutas críticas sin rate limiting?

- CONTEXT.md indica: "Rate limiting: pendiente (Upstash Redis)".
- No hay rate limiting en:
  - **POST /api/checkout** (creación de PaymentIntents).
  - **POST /api/admin/config** (cambios de configuración).
  - **POST /api/pagos/manual** (registro de pagos).
  - **GET /api/recibos/[folio]** (acceso a PDFs).

**Recomendación:** Añadir rate limiting (p. ej. Upstash) en login, checkout y rutas admin según prioridad.

---

## 3. BUGS DETECTADOS

### CRÍTICO

- **WhatsApp mal formado en dashboard padre**  
  - **Archivo:** `app/dashboard/padre/page.tsx` línea 51.  
  - **Código:** `href="https://wa.me/5257807242"`  
  - **Problema:** Número incompleto (falta parte del número). CONTEXT indica 55 7807 2426 → wa.me debería ser `525578072426` (o con celular `5215578072426`).  
  - **Solución:** Usar el mismo número oficial que en el resto de la app (ej. 5578072426 → `525578072426` o el que se defina globalmente).

### ALTO

- **Emails no esperados (fire-and-forget)**  
  - CONTEXT: "Emails siempre con await — nunca fire-and-forget".  
  - **app/api/pagos/manual/route.ts** (aprox. 150–173): `generateAndSaveReceipt` y `sendConfirmacionPago` se llaman con `.catch()` sin `await`. Si la respuesta se envía antes de que terminen, fallos no se propagan al cliente.  
  - **app/api/emails/recordatorio/route.ts** (aprox. 62–69): `sendRecordatorioPago` dentro del loop se usa con `.catch()` sin `await`; el conteo `enviados` puede incrementarse aunque el envío falle.  
  - **app/auth/confirm/route.ts** (aprox. 76–83): `sendBienvenida` con `.catch()` sin `await`.  
  - **Solución:** Hacer `await sendConfirmacionPago(...)`, `await sendRecordatorioPago(...)` y `await sendBienvenida(...)` (o await del promise chain) y manejar errores; en cron/recordatorio decidir si se quiere reintento o registro de fallo.

- **Posible desajuste schema DB vs código (pagos)**  
  - **supabase/schema.sql** (aprox. 131–134): tabla `pagos` con columnas `metodo` (tipo `metodo_pago`) y `referencia_manual`.  
  - **app/api/pagos/manual/route.ts** y **types/index.ts** usan `metodo_pago` y `referencia`.  
  - Si la base real tiene `metodo` y `referencia_manual`, los inserts/updates fallarían o habría columnas distintas.  
  - **Solución:** Confirmar en Supabase los nombres reales de las columnas y alinear schema.sql y código (o migrar la DB al esquema que use el código).

### MEDIO

- **Webhook Stripe: email en background**  
  - **app/api/webhooks/stripe/route.ts** (aprox. 119–132): `sendConfirmacionPago` se llama sin `await` (then/catch). Stripe recibe 200 antes de que el email termine; un fallo de Resend no se refleja en la respuesta.  
  - **Solución:** Usar `await sendConfirmacionPago(...)` y en caso de error loguear y opcionalmente notificar; mantener 200 para no provocar reintentos de Stripe si el pago ya se marcó pagado.

- **Logs de depuración en webhook en producción**  
  - Múltiples `console.log`/`console.error` en el webhook (evento, IDs, resultados de queries, config Resend, etc.). Funcionalmente no es un bug pero expone detalle en logs de producción.  
  - **Solución:** Reducir a logs de error o nivel info mínimo; quitar logs de debugging (ver también sección 4).

### BAJO

- **Checkout: generación de folio en ruta**  
  - **app/api/checkout/route.ts** (aprox. 17–24): Función local `generarFolio(supabase)` que llama a `supabase.rpc('generar_folio')`. Podría vivir en `/server` o en un servicio para consistencia y reutilización. No es bug; es mejora de estructura.

---

## 4. DEUDA TÉCNICA

### Logs de diagnóstico en producción

- **app/api/webhooks/stripe/route.ts:**  
  Líneas ~34–35, 40–41, 49–50, 53, 81, 95–98, 106–107, 109, 111, 114–119, 131–132, 134, 137, 149, 152: múltiples `console.log`/`console.error`/`console.warn` de eventos, IDs, resultados de DB, config de Resend, resultado de envío de email. Conviene dejar solo logs de error o un único log resumido por evento.
- **components/padre/CheckoutForm.tsx** (aprox. 61, 65, 74–75): `console.log` de `clientSecret`, CardElement y resultado de confirmación. Eliminar en producción.
- **app/api/checkout/route.ts** (206): `console.error` en catch. Aceptable para errores; asegurar que no incluya datos sensibles.
- **app/api/admin/config/route.ts** (40): `console.error`. Aceptable.
- **app/api/pagos/manual/route.ts** (140, 152, 173, 178): `console.error`. Aceptable para errores.
- **app/api/emails/recordatorio/route.ts** (41, 70): `console.error`. Aceptable.
- **app/auth/confirm/route.ts** (20, 30, 83): `console.error`. Aceptable.
- **services/configuracion.ts** (49): `console.error`. Aceptable.
- **components/BotonRecibo.tsx** (27): `console.error` en fallo de descarga. Aceptable.

Resumen: el único lugar con exceso de logs de depuración es el webhook de Stripe; el resto son errores razonables.

### Código duplicado

- **Creación de cliente admin Supabase:**  
  - `app/api/recibos/[folio]/route.ts`: `createAdminClient()` local.  
  - `app/api/pagos/manual/route.ts`: `createAdminClientRaw` de `@supabase/supabase-js` inline.  
  - `app/api/webhooks/stripe/route.ts`: `createAdminClient()` local.  
  - `app/api/emails/recordatorio/route.ts`: `createAdminClient()` local.  
  Existe **lib/supabase/admin.ts** con `createAdminClient()`. **Recomendación:** Usar siempre `createAdminClient()` de `@/lib/supabase/admin` en estas rutas para no duplicar lógica ni env vars.

- **Constantes WhatsApp en landing:**  
  Mismo número (con typo 5255780724264) repetido en: `app/page.tsx`, `components/landing/HeroSection.tsx`, `KinderSection.tsx`, `PaquetesSection.tsx`, `Footer.tsx`, `CTAFinalSection.tsx`, `ServicesSection.tsx`. **Recomendación:** Una constante compartida (ej. en `config/constants.ts` o en un único componente/env) y usar 5578072426 (o el formato wa.me acordado) en todos.

### Tipos TypeScript con `any` innecesarios

- **server/pdf/generate-receipt.ts** (aprox. 127): `React.createElement(ReceiptTemplate, { data: receiptData }) as any`. El cast a `any` se usa para compatibilidad con la API de render de `@react-pdf/renderer`. **Recomendación:** Tipar correctamente el retorno del componente o el tipo que espera `renderToBuffer` para evitar `any`.

### Funciones muy largas

- **app/api/checkout/route.ts:** `POST` tiene ~185 líneas (validación, alumno, servicio, congelaciones, cupón, buildPaymentData, pago existente, condonación, PaymentIntent, insert/update). **Recomendación:** Extraer a helpers (ej. en `/server` o en la misma ruta): validar y obtener alumno/servicio, aplicar reglas de pago, crear o reutilizar intent.
- **app/api/webhooks/stripe/route.ts:** Handler con muchos pasos y logs. **Recomendación:** Extraer la lógica de `payment_intent.succeeded` a una función (ej. en `/server`) que reciba el intent y el cliente Supabase y devuelva éxito/error.
- **app/api/pagos/manual/route.ts:** ~175 líneas. **Recomendación:** Extraer obtención de alumno/servicio/cupón y construcción de pago a funciones reutilizables.

---

## 5. PERFORMANCE

### ¿Hay queries N+1 en Supabase?

- **services/alumnos.ts — getAlumnos:** Obtiene alumnos, luego en paralelo pagos del mes y perfiles por `padreIds`. Una query por conjunto de IDs, no por fila. Correcto.
- **services/alumnos.ts — getAlumnoById:** Alumno + en paralelo pagos y perfil del padre. Correcto.
- **services/pagos.ts — getPagos, getPagosByPadre, getUltimosPagos:** Usan `select('*, alumnos(...), servicios(...)')` (joins en una query). Correcto.
- **app/api/emails/recordatorio/route.ts:** Una query con `select` que incluye `alumnos` y `perfiles`; luego loop sobre resultados para enviar emails. No hay N+1 de DB; el loop es solo para envío de correos.
- **Dashboard admin page:** `getKPIs`, `getUltimosPagos`, `getAlumnosConAdeudo` en `Promise.all`. Correcto.

No se identifican patrones N+1 clásicos en las queries revisadas.

### ¿Hay Server Components que podrían optimizarse?

- Las páginas de dashboard hacen varios fetches en paralelo donde aplica. No hay bloqueos evidentes.
- **getAlumnos** (admin) podría paginarse si crece mucho la lista; por ahora no está implementado. Menor prioridad.

### ¿Hay datos que deberían cachearse?

- **Configuración (precios):** `getConfiguracion` se llama en cada carga de `/dashboard/admin/config` y posiblemente en otros sitios. Los precios no cambian a cada request; podría cachearse en memoria con TTL corto (ej. 60 s) o usar `unstable_cache` de Next, sin invalidación fuerte por ahora.
- **Servicios activos:** Si se usan en muchas rutas, un cache ligero podría reducir lecturas a Supabase. No crítico para el tamaño actual.

---

## 6. PENDIENTES DEL CONTEXT.MD

Listado de la sección "⏳ PENDIENTE" con prioridad sugerida:

| Item | Prioridad | Notas |
|------|-----------|--------|
| Cron jobs (día 1, 5, 10 del mes) | Alta | Ya existe ruta de recordatorio; falta definir y proteger cron de generación de colegiaturas y marcar vencidos (y posiblemente más). |
| Inscripción configurable al crear alumno | Media | Mejora de flujo admin al dar de alta alumno. |
| Talleres extracurriculares | Media | Modelo de datos y servicios ya soportan tipo taller; falta flujo completo en UI y posiblemente precios. |
| Semillas con Stripe Subscriptions | Alta | Cobro recurrente para paquetes Semillas; impacto directo en ingresos. |
| Seguridad — rate limiting Upstash | Alta | Reducir abuso en login, checkout y rutas sensibles. |
| Dashboard Admin Fase 2 — cupones CRUD, reportes CSV | Media | Página cupones existe; falta CRUD completo y export CSV según CONTEXT. |
| CRM Leads — formularios landing + Kanban Admin | Alta | Indicado "en progreso"; tabla y flujos por implementar (formulario público + vista admin). |

---

*Fin del reporte. No se ha modificado código; las correcciones y mejoras quedan a criterio del equipo.*
