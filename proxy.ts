import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Seguridad delegada a Supabase Auth:
 * - Rate limiting en endpoints de auth (/auth/v1/*)
 * - Tokens JWT con expiración de 1 hora
 * - Refresh tokens rotativos (un solo uso)
 * - Sesiones invalidadas automáticamente al cambiar contraseña
 */

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Sin sesión intentando acceder a /dashboard → redirigir a /login
  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Con sesión intentando acceder a /login → redirigir según rol
  // REGLA: el rol SIEMPRE se lee desde la tabla perfiles, NUNCA desde user_metadata
  if (user && pathname === "/login") {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    const rol = perfil?.rol ?? "padre";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      rol === "admin" ? "/dashboard/admin" : "/dashboard/padre";
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return addSecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
