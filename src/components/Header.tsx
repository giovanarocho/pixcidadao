import { site } from "@/lib/ebook/content";

export default function Header() {
  return (
    <header className="site-header">
      <div className="px header-inner">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" className="logo-mark-img" width={26} height={26} />
          {site.name}
        </div>
        <span className="header-badge">Compra 100% via Pix</span>
      </div>
    </header>
  );
}
