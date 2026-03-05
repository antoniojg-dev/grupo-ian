import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // REGLA: el rol SIEMPRE se lee desde la tabla perfiles, NUNCA desde user_metadata
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (perfil?.rol !== "admin") {
    redirect("/dashboard/padre");
  }

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="font-fredoka text-3xl font-semibold"
              style={{ color: "var(--ian-dark)" }}
            >
              Panel de Administración
            </h1>
            <p className="font-quicksand text-sm text-gray-500 mt-1">
              Grupo IAN — Vista Admin
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
            style={{ backgroundColor: "var(--ian-green)" }}
          >
            <span className="text-white text-3xl">⚙️</span>
          </div>
          <h2
            className="font-fredoka text-xl font-semibold mb-2"
            style={{ color: "var(--ian-dark)" }}
          >
            Dashboard Admin en construcción
          </h2>
          <p className="font-quicksand text-sm text-gray-500">
            Aquí verás KPIs, alumnos, pagos, cupones y configuración general.
          </p>
        </div>
      </div>
    </main>
  );
}
