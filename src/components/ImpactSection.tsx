import { impact } from "@/lib/ebook/content";
import { HeartIcon } from "./Icons";

export default function ImpactSection() {
  const parts = impact.text.split(`{${impact.highlight}}`);
  return (
    <section className="section" style={{ paddingTop: 6 }}>
      <h2 className="section-title">{impact.title}</h2>
      <div className="impact-card">
        <div className="ic">
          <HeartIcon />
        </div>
        <p>
          {parts[0]}
          <strong>{impact.highlight}</strong>
          {parts[1]}
        </p>
      </div>
    </section>
  );
}
