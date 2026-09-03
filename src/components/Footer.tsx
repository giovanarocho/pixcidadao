import Link from "next/link";

export default function Footer({
  siteName,
  footerText,
  creditText,
  creditLabel,
  creditHref,
  contactEmail,
}: {
  siteName: string;
  footerText: string;
  creditText: string;
  creditLabel: string;
  creditHref: string;
  contactEmail: string;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="logo-mark-img" width={22} height={22} />
        {siteName}
      </div>
      <p className="small">{footerText}</p>
      <a className="footer-email" href={`mailto:${contactEmail}`}>
        {contactEmail}
      </a>
      <div className="footer-links">
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <Link href="/contato">Contato</Link>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {siteName}. Todos os direitos
        reservados.
      </div>
      <div className="footer-credit">
        {creditText}{" "}
        <a href={creditHref} target="_blank" rel="noopener noreferrer">
          {creditLabel}
        </a>
      </div>
    </footer>
  );
}
