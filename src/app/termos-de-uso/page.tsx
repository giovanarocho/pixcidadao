import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { legal } from "@/lib/ebook/content";

export const metadata = { title: "Termos de Uso — Pix Cidadão" };

export default function TermosDeUso() {
  return (
    <div className="wrap">
      <Header />
      <div className="legal-page">
        <Link href="/" className="back-link">
          ← Voltar
        </Link>
        <h1>Termos de Uso</h1>
        <p className="updated">Última atualização: {legal.updatedAt}</p>

        {legal.terms.sections.map((section) => (
          <div key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
