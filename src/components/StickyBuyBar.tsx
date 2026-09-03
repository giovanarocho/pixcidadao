"use client";

export default function StickyBuyBar({
  onBuy,
  siteName,
  priceLabel,
}: {
  onBuy: () => void;
  siteName: string;
  priceLabel: string;
}) {
  return (
    <div className="sticky-bar">
      <div className="info">
        <div className="l1">E-book {siteName}</div>
        <div className="l2">{priceLabel}</div>
      </div>
      <button className="btn btn-primary" onClick={onBuy}>
        Comprar
      </button>
    </div>
  );
}
