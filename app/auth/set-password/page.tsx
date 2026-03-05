"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getStrength(password: string): "empty" | "weak" | "medium" | "strong" {
  if (!password) return "empty";
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const score = [hasLength, hasNumber, hasSpecial].filter(Boolean).length;
  if (score === 3) return "strong";
  if (score === 2) return "medium";
  return "weak";
}

const strengthConfig = {
  empty: { width: "0%", color: "", label: "" },
  weak: { width: "33%", color: "bg-red-400", label: "Débil" },
  medium: { width: "66%", color: "bg-yellow-400", label: "Media" },
  strong: { width: "100%", color: "bg-green-400", label: "Fuerte" },
};

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(password);
  const { width, color, label } = strengthConfig[strength];

  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password === confirm && confirm.length > 0;
  const isValid = hasLength && hasNumber && hasSpecial && passwordsMatch;

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSuccess(true);

    // Verificar rol y redirigir
    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user!.id)
      .single();
    const rol = perfil?.rol ?? "padre";
    setTimeout(() => {
      router.push(rol === "admin" ? "/dashboard/admin" : "/dashboard/padre");
    }, 1500);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "var(--ian-red)" }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: "var(--ian-red)" }}
            >
              <span className="text-white font-fredoka text-2xl font-bold">IAN</span>
            </div>
            <div className="text-center">
              <p className="font-fredoka text-xl font-semibold" style={{ color: "var(--ian-dark)" }}>
                Grupo IAN
              </p>
              <p className="font-quicksand text-sm text-gray-500">El Futuro Es Hoy</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1 className="font-fredoka text-2xl font-semibold text-center mb-1" style={{ color: "var(--ian-dark)" }}>
            Crea tu contraseña
          </h1>
          <p className="font-quicksand text-sm text-gray-500 text-center mb-6">
            Elige una contraseña segura para tu cuenta
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-quicksand">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-quicksand">
              Contraseña guardada. Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="block font-quicksand text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "var(--ian-blue)" } as React.CSSProperties}
              />

              {/* Barra de fortaleza */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${color}`}
                      style={{ width }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-quicksand text-xs text-gray-400">Fortaleza</span>
                    <span className={`font-quicksand text-xs font-medium ${
                      strength === "strong" ? "text-green-600" :
                      strength === "medium" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {label}
                    </span>
                  </div>
                </div>
              )}

              {/* Requisitos */}
              <ul className="mt-2 space-y-1">
                {[
                  { ok: hasLength, text: "Mínimo 8 caracteres" },
                  { ok: hasNumber, text: "Al menos 1 número" },
                  { ok: hasSpecial, text: "Al menos 1 caracter especial (!@#$%^&*)" },
                ].map(({ ok, text }) => (
                  <li key={text} className={`font-quicksand text-xs flex items-center gap-1.5 ${ok ? "text-green-600" : "text-gray-400"}`}>
                    <span>{ok ? "✓" : "○"}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label htmlFor="confirm" className="block font-quicksand text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border font-quicksand text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  confirm.length > 0 && !passwordsMatch ? "border-red-300" : "border-gray-200"
                }`}
                style={{ "--tw-ring-color": "var(--ian-blue)" } as React.CSSProperties}
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="mt-1 font-quicksand text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading || success}
              className="mt-2 w-full py-3 rounded-xl font-fredoka text-base font-semibold text-white transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--ian-red)" }}
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
