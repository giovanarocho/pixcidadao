import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComunicadorForm from "@/components/ComunicadorForm";
import { getSiteContent } from "@/lib/ebook/getContent";

export const metadata = { title: "Seja um Comunicador — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function SejaComunicador() {
  const { site, footer, contact, network } = await getSiteContent();
  return (
    <div className="wrap">
      <Header siteName={site.name} />
      <div className="legal-page">
        <h1>{network.formTitle}</h1>
        <p style={{ marginBottom: 24 }}>{network.formText}</p>
        <ComunicadorForm />
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
