import { chapters } from "@/lib/ebook/content";

export default function Chapters() {
  return (
    <section className="section" style={{ paddingTop: 6 }}>
      <h2 className="section-title">O que o e-book apresenta</h2>
      <p className="section-lede">
        Um passo a passo curto, dividido em capítulos objetivos:
      </p>
      <ul className="chapters">
        {chapters.map((c, i) => (
          <li key={c.title}>
            <span className="ch-num">{i + 1}</span>
            <span className="ch-text">
              <b>{c.title}</b>
              {c.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
