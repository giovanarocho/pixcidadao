import Link from "next/link";
import { site, footer, contact } from "@/lib/ebook/content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="logo-mark-img" width={22} height={22} />
        {site.name}
      </div>
      <p className="small">{footer.text}</p>
      <a className="footer-email" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
      <div className="footer-links">
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <Link href="/contato">Contato</Link>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {site.name}. Todos os direitos
        reservados.
      </div>
      <div className="footer-credit">
        {footer.credit.text}{" "}
        <a href={footer.credit.href} target="_blank" rel="noopener noreferrer">
          {footer.credit.label}
        </a>
      </div>
    </footer>
  );
}
