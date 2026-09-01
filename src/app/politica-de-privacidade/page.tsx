import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { legal } from "@/lib/ebook/content";

export const metadata = { title: "Política de Privacidade — Pix Cidadão" };

export default function PoliticaDePrivacidade() {
  return (
    <div className="wrap">
      <Header />
      <div className="legal-page">
        <Link href="/" className="back-link">
          ← Voltar
        </Link>
        <h1>Política de Privacidade</h1>
        <p className="updated">Última atualização: {legal.updatedAt}</p>

        <p>{legal.privacy.intro}</p>

        {legal.privacy.sections.map((section) => (
          <div key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {section.footer && <p>{section.footer}</p>}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
