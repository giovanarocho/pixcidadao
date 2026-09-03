"use client";

import type { SiteContent } from "@/lib/ebook/getContent";
import { CheckIcon, PixIcon } from "./Icons";

export default function PriceSection({
  onBuy,
  priceSection,
  priceLabel,
}: {
  onBuy: () => void;
  priceSection: SiteContent["priceSection"];
  priceLabel: string;
}) {
  return (
    <section className="price-section">
      <div className="price-inner">
        <div className="price-tag">{priceSection.tag}</div>
        <div className="price-row">
          <span className="price-value">{priceLabel}</span>
          <span className="price-old">pagamento único</span>
        </div>
        <p className="price-note">{priceSection.note}</p>
        <ul className="price-list">
          {priceSection.bullets.map((b) => (
            <li key={b}>
              <CheckIcon />
              {b}
            </li>
          ))}
        </ul>
        <button className="btn btn-gold" onClick={onBuy}>
          {priceSection.cta}
        </button>
        <div className="pix-hint">
          <PixIcon /> {priceSection.hint}
        </div>
      </div>
    </section>
  );
}
