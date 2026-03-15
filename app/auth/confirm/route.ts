import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { sendBienvenida } from "@/server/emails/send-email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();
  let user = null;
  let authError = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    user = data?.user ?? null;
    authError = error;
    if (error) {
      console.error("[auth/confirm] exchangeCodeForSession error:", error.message);
    }
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as "email" | "recovery" | "invite" | "email_change" | "signup",
      token_hash,
    });
    user = data?.user ?? null;
    authError = error;
    if (error) {
      console.error(`[auth/confirm] verifyOtp error (type=${type}):`, error.message);
    }
  }

  if (authError) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.search = "";
    loginUrl.pathname = "/login";
    // Distinguir token expirado de inválido
    const isExpired =
      authError.message?.toLowerCase().includes("expired") ||
      authError.message?.toLowerCase().includes("expirado");
    loginUrl.search = isExpired ? "?error=link_expirado" : "?error=link_invalido";
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "?error=link_invalido";
    return NextResponse.redirect(loginUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = "";

  // Flujos que requieren crear/actualizar contraseña
  if (type === "recovery" || type === "invite") {
    // Si el padre aceptó una invitación con alumno_id en metadata, vincular padre_id
    const alumnoId = user.user_metadata?.alumno_id as string | undefined
    if (type === "invite" && alumnoId) {
      await supabase
        .from("alumnos")
        .update({ padre_id: user.id })
        .eq("id", alumnoId)

      // Enviar email de bienvenida (await para no fire-and-forget)
      if (user.email) {
        try {
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("nombre")
            .eq("id", user.id)
            .single()
          const { data: alumnoData } = await supabase
            .from("alumnos")
            .select("nombre")
            .eq("id", alumnoId)
            .single()
          await sendBienvenida({
            to: user.email,
            nombrePadre: perfil?.nombre ?? "Padre/Madre",
            nombreAlumno: alumnoData?.nombre ?? "tu hijo",
            portalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://grupoian.mx"}/dashboard/padre`,
          })
        } catch (err) {
          console.error("[auth/confirm] Error bienvenida:", err)
        }
      }
    }

    redirectUrl.pathname = "/auth/set-password";
    return NextResponse.redirect(redirectUrl);
  }

  // type=signup o code → redirigir según rol (leer de tabla perfiles)
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const rol = perfil?.rol ?? "padre";
  redirectUrl.pathname = rol === "admin" ? "/dashboard/admin" : "/dashboard/padre";
  return NextResponse.redirect(redirectUrl);
}
