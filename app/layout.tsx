import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
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
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
