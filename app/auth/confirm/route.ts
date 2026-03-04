import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as "email" | "recovery" | "invite" | "email_change",
      token_hash,
    });

    if (!error && data.user) {
      const role = data.user.user_metadata?.role as string | undefined;
      const redirectPath =
        role === "admin" ? "/dashboard/admin" : "/dashboard/padre";

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = redirectPath;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Error o token inválido → volver al login con mensaje
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "?error=link_invalido";
  return NextResponse.redirect(loginUrl);
}
