import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pix Cidadão — renda básica com direcionamento estratégico",
  description:
    "E-book digital sobre a proposta do Pix Cidadão: renda básica de R$ 600 com direcionamento estratégico. Pagamento via Pix, entrega automática, e 90% da venda financia comunicadores independentes.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pixcidadao.app.br"
  ),
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Pix Cidadão",
    description:
      "Conheça o Pix Cidadão e financie o comunicador que você acompanha. Renda básica de R$ 600 com direcionamento estratégico.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
