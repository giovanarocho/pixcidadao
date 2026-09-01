"use client";

import { useState } from "react";
import { faq } from "@/lib/ebook/content";
import { ChevronIcon } from "./Icons";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section" style={{ paddingTop: 6 }}>
      <h2 className="section-title">Perguntas frequentes</h2>
      <div>
        {faq.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div className={`faq-item${isOpen ? " open" : ""}`} key={item.q}>
              <button
                className="faq-q"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                {item.q}
                <span className="chev">
                  <ChevronIcon />
                </span>
              </button>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
