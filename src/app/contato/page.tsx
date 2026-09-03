import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/ebook/getContent";

export const metadata = { title: "Contato — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function Contato() {
  const { site, footer, contact } = await getSiteContent();
  return (
    <div className="wrap">
      <Header siteName={site.name} />
      <div className="legal-page">
        <Link href="/" className="back-link">
          ← Voltar
        </Link>
        <h1>Contato</h1>
        <p>
          Dúvidas sobre o e-book, sobre o pagamento ou sobre a Rede de
          Comunicadores? Fale com a gente:
        </p>
        <ul>
          <li>E-mail: {contact.email}</li>
          {contact.instagram && <li>Instagram: {contact.instagram}</li>}
        </ul>
        <p>Respondemos, em média, em até 2 dias úteis.</p>
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
