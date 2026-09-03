import type { SiteContent } from "@/lib/ebook/getContent";
import { HeartIcon } from "./Icons";

export default function ImpactSection({ impact }: { impact: SiteContent["impact"] }) {
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
