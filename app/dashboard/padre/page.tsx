import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPadrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nombre = user.user_metadata?.nombre ?? user.email;

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="font-fredoka text-3xl font-semibold"
              style={{ color: "var(--ian-dark)" }}
            >
              Bienvenido, {nombre}
            </h1>
            <p className="font-quicksand text-sm text-gray-500 mt-1">
              Portal de Padres — Grupo IAN
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-quicksand text-sm font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--ian-red)" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Placeholder */}
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--ian-blue)" }}
          >
            <span className="text-white text-3xl">👨‍👩‍👧</span>
          </div>
          <h2
            className="font-fredoka text-xl font-semibold mb-2"
            style={{ color: "var(--ian-dark)" }}
          >
            Dashboard en construcción
          </h2>
          <p className="font-quicksand text-sm text-gray-500">
            Aquí verás el resumen de tus hijos, pagos y recibos.
          </p>
        </div>
      </div>
    </main>
  );
}
