import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

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
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as "email" | "recovery" | "invite" | "email_change",
      token_hash,
    });
    user = data?.user ?? null;
    authError = error;
  }

  if (!authError && user) {
    const role = user.user_metadata?.role as string | undefined;
    const redirectPath =
      role === "admin" ? "/dashboard/admin" : "/dashboard/padre";

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Error o token inválido → volver al login con mensaje
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "?error=link_invalido";
  return NextResponse.redirect(loginUrl);
}
