# Grupo IAN — Instrucciones para Claude Code y Cursor

## Contexto del proyecto
App de gestión escolar para Grupo IAN (kinder bilingüe +
programa Semillas de Sabiduría).
Stack: Next.js 16 + Supabase + Stripe + Resend + Vercel
Producción: https://www.grupoian.lat

## Reglas CRÍTICAS — nunca romper
1. NUNCA hardcodear precios — usar getConfiguracion()
2. SIEMPRE usar SUPABASE_SERVICE_ROLE_KEY en server
3. SIEMPRE await emails — nunca fire-and-forget
4. SIEMPRE validar con Zod en API routes
5. Precios en centavos en DB, pesos en UI
6. RLS activo — crear políticas al agregar tablas
7. npm run build debe pasar antes de cualquier commit
8. No romper los 45 tests existentes en /tests

## Arquitectura
- Server Components para páginas (data fetching en server)
- 'use client' solo cuando se necesita interactividad
- Lógica de negocio en /server/
- Queries a DB en /services/
- Tipos globales en /types/index.ts
- API routes en /app/api/

## Comandos útiles
npm run dev      → desarrollo local
npm run build    → verificar antes de push
npm run test     → correr 45 tests del engine financiero

## Deploy
Push a main → Vercel deploya automáticamente
Variables de entorno en Vercel Dashboard

Al terminar hacer push a main.
