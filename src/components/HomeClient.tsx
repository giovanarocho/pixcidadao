"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Chapters from "./Chapters";
import PriceSection from "./PriceSection";
import ImpactSection from "./ImpactSection";
import NetworkSection from "./NetworkSection";
import Faq from "./Faq";
import Footer from "./Footer";
import StickyBuyBar from "./StickyBuyBar";
import CheckoutSheet from "./CheckoutSheet";

const REF_STORAGE_KEY = "pixcidadao_ref";
const REF_STORAGE_DAYS = 30;

export default function HomeClient() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  // Captura o parametro ?ref= (link do comunicador) e guarda por alguns
  // dias em localStorage, seguindo a regra de "primeiro clique" descrita
  // na proposta técnica (seção 6.1). Isso já deixa a fase 1 pronta para a
  // fase 2 sem precisar mexer nesta página de novo.
  //
  // Lemos o parâmetro direto de window.location em vez de usar o hook
  // useSearchParams (next/navigation) de propósito: esse hook obriga a
  // página inteira a ficar dentro de um <Suspense>, e o conteúdo real só
  // aparece depois que o JavaScript carrega no navegador — até lá, quem
  // acessa o site (ou um link compartilhado, ou um rastreador de rede
  // social) vê a página em branco por um instante. Lendo aqui dentro do
  // useEffect, a página inteira já sai pronta no HTML, sem esse flash.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("ref");
    if (fromUrl) {
      const record = { code: fromUrl, savedAt: Date.now() };
      try {
        localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(record));
      } catch {
        // localStorage indisponível (modo privado, etc.) — segue sem indicação
      }
      setRefCode(fromUrl);
      return;
    }

    try {
      const raw = localStorage.getItem(REF_STORAGE_KEY);
      if (raw) {
        const record = JSON.parse(raw) as { code: string; savedAt: number };
        const ageDays = (Date.now() - record.savedAt) / (1000 * 60 * 60 * 24);
        if (ageDays <= REF_STORAGE_DAYS) {
          setRefCode(record.code);
        }
      }
    } catch {
      // ignora erros de parsing/armazenamento
    }
  }, []);

  return (
    <div className="wrap">
      <Header />
      <Hero onBuy={() => setCheckoutOpen(true)} />
      <hr className="divider" />
      <Features />
      <Chapters />
      <PriceSection onBuy={() => setCheckoutOpen(true)} />
      <ImpactSection />
      <NetworkSection />
      <Faq />
      <Footer />
      <StickyBuyBar onBuy={() => setCheckoutOpen(true)} />
      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        refCode={refCode}
      />
    </div>
  );
}
