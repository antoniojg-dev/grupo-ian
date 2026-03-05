"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 3;

const URL_ERRORS: Record<string, string> = {
  link_expirado: "El link expiró. Solicita uno nuevo.",
  link_invalido: "El link no es válido.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError && URL_ERRORS[urlError]) {
      setError(URL_ERRORS[urlError]);
    }
  }, [searchParams]);

  function lockButton() {
    setLocked(true);
    setTimeout(() => setLocked(false), LOCK_SECONDS * 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || loading) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setError(
          "Demasiados intentos. Usa '¿Olvidaste tu contraseña?' para recuperar acceso."
        );
      } else {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      }

      lockButton();
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user!.id)
      .single();
    const rol = perfil?.rol ?? "padre";
    router.push(rol === "admin" ? "/dashboard/admin" : "/dashboard/padre");
  }

  const buttonDisabled = loading || locked || attempts >= MAX_ATTEMPTS;

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
              <span className="text-white font-fredoka text-2xl font-bold">
                IAN
              </span>
            </div>
            <div className="text-center">
              <p
                className="font-fredoka text-xl font-semibold"
                style={{ color: "var(--ian-dark)" }}
              >
                Grupo IAN
              </p>
              <p className="font-quicksand text-sm text-gray-500">
                El Futuro Es Hoy
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1
            className="font-fredoka text-2xl font-semibold text-center mb-1"
            style={{ color: "var(--ian-dark)" }}
          >
            Portal de Acceso
          </h1>
          <p className="font-quicksand text-sm text-gray-500 text-center mb-6">
            Ingresa con tu correo y contraseña
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-quicksand">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block font-quicksand text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-quicksand text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "var(--ian-blue)" } as React.CSSProperties}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block font-quicksand text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <Link
                  href="/auth/reset-password"
                  className="font-quicksand text-xs hover:underline"
                  style={{ color: "var(--ian-blue)" }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={buttonDisabled}
              className="mt-2 w-full py-3 rounded-xl font-fredoka text-base font-semibold text-white transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--ian-red)" }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 text-center font-quicksand text-xs text-gray-400">
            ¿Problemas para acceder?{" "}
            <a
              href="https://wa.me/5578072426"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--ian-blue)" }}
            >
              Contáctanos por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
