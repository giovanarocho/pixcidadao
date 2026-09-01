"use client";

import { hero, site } from "@/lib/ebook/content";
import { ShieldIcon, BoltIcon, LockIcon } from "./Icons";

export default function Hero({ onBuy }: { onBuy: () => void }) {
  return (
    <section className="hero">
      <span className="eyebrow">
        <span className="dot" />
        {hero.eyebrow}
      </span>
      <h1>
        {hero.titlePrefix}
        <em>{hero.titleEmphasis}</em>
        {hero.titleSuffix}
      </h1>
      <p className="lede">{hero.lede}</p>
      <div className="hero-actions">
        <button className="btn btn-primary" onClick={onBuy}>
          {hero.ctaPrimary} · {site.priceLabel}
        </button>
        <a href="#sobre" className="btn btn-ghost">
          {hero.ctaSecondary}
        </a>
      </div>
      <div className="trust-row">
        <span className="trust-item">
          <ShieldIcon /> Pagamento via Pix
        </span>
        <span className="trust-item">
          <BoltIcon /> Entrega automática
        </span>
        <span className="trust-item">
          <LockIcon /> Sem cadastro complicado
        </span>
      </div>

      <div className="hero-card">
        <div className="hero-card-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={40} height={40} />
        </div>
        <div>
          <p className="hero-card-title">E-book &quot;Pix Cidadão&quot;</p>
          <p className="hero-card-sub">
            PDF · {hero.bookPages} · liberado na hora, direto no seu celular,
            após a confirmação do pagamento.
          </p>
        </div>
      </div>
    </section>
  );
}
