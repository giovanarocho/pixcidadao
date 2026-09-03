import Link from "next/link";
import type { SiteContent } from "@/lib/ebook/getContent";
import { CheckIcon } from "./Icons";

export default function NetworkSection({ network }: { network: SiteContent["network"] }) {
  return (
    <section className="section" style={{ paddingTop: 6 }}>
      <h2 className="section-title">{network.title}</h2>
      <div className="network-card">
        <div className="avatars">
          {network.avatars.map((a) => (
            <div className="avatar" key={a}>
              {a}
            </div>
          ))}
          <div className="avatar more">{network.moreLabel}</div>
        </div>
        <h3>{network.cardTitle}</h3>
        <p>{network.text}</p>
        <ul className="network-bullets">
          {network.bullets.map((b) => (
            <li key={b}>
              <CheckIcon />
              {b}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 16 }}>
          <Link href="/seja-comunicador" className="btn btn-ghost">
            {network.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
