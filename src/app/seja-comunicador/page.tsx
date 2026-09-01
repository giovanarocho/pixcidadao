import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComunicadorForm from "@/components/ComunicadorForm";
import { network } from "@/lib/ebook/content";

export const metadata = { title: "Seja um Comunicador — Pix Cidadão" };

export default function SejaComunicador() {
  return (
    <div className="wrap">
      <Header />
      <div className="legal-page">
        <h1>{network.formTitle}</h1>
        <p style={{ marginBottom: 24 }}>{network.formText}</p>
        <ComunicadorForm />
      </div>
      <Footer />
    </div>
  );
}
