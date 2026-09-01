"use client";

import { site } from "@/lib/ebook/content";

export default function StickyBuyBar({ onBuy }: { onBuy: () => void }) {
  return (
    <div className="sticky-bar">
      <div className="info">
        <div className="l1">E-book {site.name}</div>
        <div className="l2">{site.priceLabel}</div>
      </div>
      <button className="btn btn-primary" onClick={onBuy}>
        Comprar
      </button>
    </div>
  );
}
