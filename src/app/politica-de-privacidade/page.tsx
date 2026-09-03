import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/ebook/getContent";

export const metadata = { title: "Política de Privacidade — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function PoliticaDePrivacidade() {
  const { site, footer, contact, legal } = await getSiteContent();
  return (
    <div className="wrap">
      <Header siteName={site.name} />
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
            {section.bullets && section.bullets.length > 0 && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {section.footer && section.footer.trim() && <p>{section.footer}</p>}
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
