import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlumniHub",
  description: "Plateforme de connexion pour les diplômés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
