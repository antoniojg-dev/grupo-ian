import type { Metadata } from "next";
import { Fredoka, Quicksand } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grupo IAN — Escuela Bilingüe Kinder y Primaria | Coyoacán, CDMX",
  description:
    "Escuela bilingüe en Coyoacán con clases de regularización, inglés, natación y talleres extracurriculares. Horarios flexibles. Modalidad virtual, presencial y mixta. ¡Inscripciones abiertas!",
  keywords:
    "escuela bilingüe coyoacán, kinder coyoacán, primaria bilingüe CDMX, regularización niños, clases natación niños, grupo IAN",
  openGraph: {
    title: "Grupo IAN — El Futuro Es Hoy",
    description:
      "Más que clases — Crecimiento Académico y Deportivo en Coyoacán, CDMX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${fredoka.variable} ${quicksand.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
