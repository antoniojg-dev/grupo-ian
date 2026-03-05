"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_SECONDS = 60;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);

    const supabase = createClient();
    // No verificamos si el error ocurrió — siempre mostramos el mismo mensaje
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
    });

    setSent(true);
    setLoading(false);
    startCooldown();
  }

  const buttonDisabled = loading || cooldown > 0;

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
            Recuperar contraseña
          </h1>
          <p className="font-quicksand text-sm text-gray-500 text-center mb-6">
            Te enviaremos instrucciones a tu correo
          </p>

          {sent && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 font-quicksand leading-relaxed">
              Si el correo está registrado, recibirás un link en los próximos minutos.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block font-quicksand text-sm font-medium text-gray-700 mb-1">
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

            <button
              type="submit"
              disabled={buttonDisabled}
              className="mt-2 w-full py-3 rounded-xl font-fredoka text-base font-semibold text-white transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--ian-red)" }}
            >
              {loading
                ? "Enviando..."
                : cooldown > 0
                ? `Reenviar en ${cooldown}s...`
                : "Enviar instrucciones"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-quicksand text-sm hover:underline"
              style={{ color: "var(--ian-blue)" }}
            >
              ← Volver al login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
