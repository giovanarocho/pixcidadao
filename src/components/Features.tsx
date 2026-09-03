import type { SiteContent } from "@/lib/ebook/getContent";
import { BookIcon, UsersIcon, LeafIcon } from "./Icons";

const icons = [BookIcon, UsersIcon, LeafIcon];

export default function Features({ features }: { features: SiteContent["features"] }) {
  return (
    <section id="sobre" className="section" style={{ paddingBottom: 6 }}>
      <h2 className="section-title">O que é o Pix Cidadão</h2>
      <p className="section-lede">
        Uma proposta de renda básica de R$ 600 para todas as pessoas, com
        direcionamento estratégico para fortalecer a economia local, o
        trabalho com sentido e a regeneração ambiental — explicada de forma
        acessível, sem prometer respostas prontas.
      </p>
      <div className="feature-grid">
        {features.map((f, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div className="feature-card" key={f.title}>
              <div className="ic">
                <Icon />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
