import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/ebook/getContent";

export const metadata = { title: "Termos de Uso — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function TermosDeUso() {
  const { site, footer, contact, legal } = await getSiteContent();
  return (
    <div className="wrap">
      <Header siteName={site.name} />
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
      <Footer
        siteName={site.name}
        footerText={footer.text}
        creditText={footer.credit.text}
        creditLabel={footer.credit.label}
        creditHref={footer.credit.href}
        contactEmail={contact.email}
      />
    </div>
  );
}
