import type { CSSProperties } from "react";
import Link from "next/link";
import { isValidAdminPassword } from "@/lib/comunicadores/refCode";
import { getSiteContent } from "@/lib/ebook/getContent";
import { salvarConteudoSite } from "./actions";

export const metadata = { title: "Editar site — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function EditarSite({
  searchParams,
}: {
  searchParams: { senha?: string; salvo?: string; erro?: string };
}) {
  const senha = searchParams.senha || "";
  const authorized = isValidAdminPassword(senha);

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div style={pageStyle}>
        <h1>Editar site</h1>
        <p>
          Defina a variável de ambiente <code>ADMIN_PASSWORD</code> para
          poder acessar esta página.
        </p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={pageStyle}>
        <h1>Editar site</h1>
        <form method="get" style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input
            type="password"
            name="senha"
            placeholder="Senha de administrador"
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>
        {senha && <p style={{ color: "#b91c1c", marginTop: 12 }}>Senha incorreta.</p>}
      </div>
    );
  }

  const content = await getSiteContent();
  const { site, hero, features, chapters, priceSection, impact, network, faq, legal, contact, footer } =
    content;

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Editar site</h1>
        <Link href={`/admin/comunicadores?senha=${encodeURIComponent(senha)}`} style={{ fontSize: 13 }}>
          ← Painel de comunicadores
        </Link>
      </div>
      <p style={{ color: "#4b5d55", marginBottom: 20 }}>
        Aqui você edita todo o texto do site e o preço do e-book. As
        alterações aparecem no site na hora, sem precisar de um novo deploy.
      </p>

      {searchParams.salvo && (
        <div style={bannerStyle("#dcfce7", "#166534")}>Alterações salvas com sucesso.</div>
      )}
      {searchParams.erro === "preco" && (
        <div style={bannerStyle("#fee2e2", "#991b1b")}>
          Preço inválido — digite um valor tipo <code>37,90</code>. Nada foi salvo.
        </div>
      )}
      {searchParams.erro === "salvar" && (
        <div style={bannerStyle("#fee2e2", "#991b1b")}>
          Não foi possível salvar agora. Tente de novo em instantes.
        </div>
      )}

      <form action={salvarConteudoSite}>
        <input type="hidden" name="senha" value={senha} />

        <Section title="Identidade e preço" open>
          <Field label="Nome do site">
            <input name="site_name" defaultValue={site.name} style={fieldInputStyle} />
          </Field>
          <Row>
            <Field label="Preço do e-book (R$)">
              <input
                name="site_price_reais"
                defaultValue={(site.priceCents / 100).toFixed(2).replace(".", ",")}
                style={fieldInputStyle}
                placeholder="37,90"
              />
            </Field>
            <Field label="% de comissão do comunicador">
              <input
                name="site_comissao_pct"
                type="number"
                min={0}
                max={100}
                defaultValue={site.comissaoComunicadorPct}
                style={fieldInputStyle}
              />
            </Field>
          </Row>
          <p style={helpTextStyle}>
            Atenção: o preço também é mencionado como texto solto em dois
            lugares — na resposta &quot;Quanto custa e como pago?&quot; das
            Perguntas Frequentes (mais abaixo) e no início dos Termos de Uso.
            Se você mudar o preço aqui, lembre de atualizar esses dois textos
            também, senão eles vão mostrar o valor antigo.
          </p>
        </Section>

        <Section title="Topo da página (Hero)">
          <Field label="Selo pequeno no topo">
            <input name="hero_eyebrow" defaultValue={hero.eyebrow} style={fieldInputStyle} />
          </Field>
          <Row>
            <Field label="Título — antes do destaque">
              <input name="hero_title_prefix" defaultValue={hero.titlePrefix} style={fieldInputStyle} />
            </Field>
            <Field label="Título — parte em destaque">
              <input name="hero_title_emphasis" defaultValue={hero.titleEmphasis} style={fieldInputStyle} />
            </Field>
          </Row>
          <Field label="Título — depois do destaque">
            <input name="hero_title_suffix" defaultValue={hero.titleSuffix} style={fieldInputStyle} />
          </Field>
          <Field label="Texto de apoio (parágrafo abaixo do título)">
            <textarea name="hero_lede" defaultValue={hero.lede} style={textareaStyle} rows={3} />
          </Field>
          <Row>
            <Field label="Botão principal">
              <input name="hero_cta_primary" defaultValue={hero.ctaPrimary} style={fieldInputStyle} />
            </Field>
            <Field label="Botão secundário">
              <input name="hero_cta_secondary" defaultValue={hero.ctaSecondary} style={fieldInputStyle} />
            </Field>
          </Row>
          <Field label="Descrição curta do formato (ex.: &quot;leitura acessível&quot;)">
            <input name="hero_book_pages" defaultValue={hero.bookPages} style={fieldInputStyle} />
          </Field>
        </Section>

        <Section title="Diferenciais (3 cartões)">
          {features.map((f, i) => (
            <div key={i} style={itemBoxStyle}>
              <Field label={`Título ${i + 1}`}>
                <input name={`feature_${i}_title`} defaultValue={f.title} style={fieldInputStyle} />
              </Field>
              <Field label={`Texto ${i + 1}`}>
                <textarea name={`feature_${i}_text`} defaultValue={f.text} style={textareaStyle} rows={2} />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Capítulos do e-book">
          {chapters.map((c, i) => (
            <div key={i} style={itemBoxStyle}>
              <Field label={`Capítulo ${i + 1} — título`}>
                <input name={`chapter_${i}_title`} defaultValue={c.title} style={fieldInputStyle} />
              </Field>
              <Field label={`Capítulo ${i + 1} — texto`}>
                <textarea name={`chapter_${i}_text`} defaultValue={c.text} style={textareaStyle} rows={2} />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Seção de preço (bloco de compra)">
          <Field label="Selo (ex.: &quot;Acesso imediato&quot;)">
            <input name="price_tag" defaultValue={priceSection.tag} style={fieldInputStyle} />
          </Field>
          <Field label="Observação abaixo do preço">
            <input name="price_note" defaultValue={priceSection.note} style={fieldInputStyle} />
          </Field>
          <Field label="Lista de benefícios (um por linha)">
            <textarea
              name="price_bullets"
              defaultValue={priceSection.bullets.join("\n")}
              style={textareaStyle}
              rows={4}
            />
          </Field>
          <Row>
            <Field label="Texto do botão de compra">
              <input name="price_cta" defaultValue={priceSection.cta} style={fieldInputStyle} />
            </Field>
            <Field label="Aviso de segurança abaixo do botão">
              <input name="price_hint" defaultValue={priceSection.hint} style={fieldInputStyle} />
            </Field>
          </Row>
        </Section>

        <Section title="Seção de impacto">
          <Field label="Título">
            <input name="impact_title" defaultValue={impact.title} style={fieldInputStyle} />
          </Field>
          <Field label="Texto">
            <textarea name="impact_text" defaultValue={impact.text} style={textareaStyle} rows={3} />
          </Field>
          <p style={helpTextStyle}>
            Mantenha <code>{`{${impact.highlight}}`}</code> em algum ponto do
            texto acima — é ali que a palavra aparece destacada em negrito.
          </p>
        </Section>

        <Section title="Rede de Comunicadores">
          <Field label="Título da seção">
            <input name="network_title" defaultValue={network.title} style={fieldInputStyle} />
          </Field>
          <Field label="Título do cartão">
            <input name="network_card_title" defaultValue={network.cardTitle} style={fieldInputStyle} />
          </Field>
          <Field label="Texto do cartão">
            <textarea name="network_text" defaultValue={network.text} style={textareaStyle} rows={3} />
          </Field>
          <Field label="Lista de benefícios (um por linha)">
            <textarea
              name="network_bullets"
              defaultValue={network.bullets.join("\n")}
              style={textareaStyle}
              rows={3}
            />
          </Field>
          <Field label="Botão de participar">
            <input name="network_cta_label" defaultValue={network.ctaLabel} style={fieldInputStyle} />
          </Field>
          <Field label="Título do formulário (página /seja-comunicador)">
            <input name="network_form_title" defaultValue={network.formTitle} style={fieldInputStyle} />
          </Field>
          <Field label="Texto do formulário">
            <textarea name="network_form_text" defaultValue={network.formText} style={textareaStyle} rows={2} />
          </Field>
          <Row>
            <Field label="Iniciais nos avatares (separadas por vírgula)">
              <input
                name="network_avatars"
                defaultValue={network.avatars.join(", ")}
                style={fieldInputStyle}
              />
            </Field>
            <Field label="Texto do avatar &quot;+N&quot;">
              <input name="network_more_label" defaultValue={network.moreLabel} style={fieldInputStyle} />
            </Field>
          </Row>
        </Section>

        <Section title="Perguntas frequentes">
          {faq.map((item, i) => (
            <div key={i} style={itemBoxStyle}>
              <Field label={`Pergunta ${i + 1}`}>
                <input name={`faq_${i}_q`} defaultValue={item.q} style={fieldInputStyle} />
              </Field>
              <Field label={`Resposta ${i + 1}`}>
                <textarea name={`faq_${i}_a`} defaultValue={item.a} style={textareaStyle} rows={3} />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Política de Privacidade">
          <Row>
            <Field label="Data da última atualização (texto livre, ex.: &quot;agosto de 2026&quot;)">
              <input name="legal_updated_at" defaultValue={legal.updatedAt} style={fieldInputStyle} />
            </Field>
          </Row>
          <Field label="Introdução">
            <textarea
              name="legal_privacy_intro"
              defaultValue={legal.privacy.intro}
              style={textareaStyle}
              rows={3}
            />
          </Field>
          {legal.privacy.sections.map((section, i) => (
            <div key={i} style={itemBoxStyle}>
              <Field label={`Seção ${i + 1} — título`}>
                <input
                  name={`legal_privacy_section_${i}_title`}
                  defaultValue={section.title}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label={`Seção ${i + 1} — texto (parágrafos separados por linha em branco)`}>
                <textarea
                  name={`legal_privacy_section_${i}_paragraphs`}
                  defaultValue={section.paragraphs.join("\n\n")}
                  style={textareaStyle}
                  rows={4}
                />
              </Field>
              <Field label={`Seção ${i + 1} — lista com marcadores (um por linha, opcional)`}>
                <textarea
                  name={`legal_privacy_section_${i}_bullets`}
                  defaultValue={(section.bullets || []).join("\n")}
                  style={textareaStyle}
                  rows={3}
                />
              </Field>
              <Field label={`Seção ${i + 1} — observação final (opcional)`}>
                <input
                  name={`legal_privacy_section_${i}_footer`}
                  defaultValue={section.footer || ""}
                  style={fieldInputStyle}
                />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Termos de Uso">
          {legal.terms.sections.map((section, i) => (
            <div key={i} style={itemBoxStyle}>
              <Field label={`Seção ${i + 1} — título`}>
                <input
                  name={`legal_terms_section_${i}_title`}
                  defaultValue={section.title}
                  style={fieldInputStyle}
                />
              </Field>
              <Field label={`Seção ${i + 1} — texto (parágrafos separados por linha em branco)`}>
                <textarea
                  name={`legal_terms_section_${i}_paragraphs`}
                  defaultValue={section.paragraphs.join("\n\n")}
                  style={textareaStyle}
                  rows={4}
                />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Contato e rodapé">
          <Row>
            <Field label="E-mail de contato">
              <input name="contact_email" defaultValue={contact.email} style={fieldInputStyle} />
            </Field>
            <Field label="Instagram">
              <input name="contact_instagram" defaultValue={contact.instagram} style={fieldInputStyle} />
            </Field>
          </Row>
          <Field label="Frase do rodapé">
            <input name="footer_text" defaultValue={footer.text} style={fieldInputStyle} />
          </Field>
          <Row>
            <Field label="Crédito — texto (ex.: &quot;Feito por&quot;)">
              <input name="footer_credit_text" defaultValue={footer.credit.text} style={fieldInputStyle} />
            </Field>
            <Field label="Crédito — nome/link">
              <input name="footer_credit_label" defaultValue={footer.credit.label} style={fieldInputStyle} />
            </Field>
          </Row>
          <Field label="Crédito — URL">
            <input name="footer_credit_href" defaultValue={footer.credit.href} style={fieldInputStyle} />
          </Field>
        </Section>

        <div style={{ position: "sticky", bottom: 0, background: "#f4f8f5", padding: "16px 0", marginTop: 8 }}>
          <button type="submit" style={{ ...buttonStyle, width: "100%", padding: "14px 16px", fontSize: 15 }}>
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} style={sectionStyle}>
      <summary style={summaryStyle}>{title}</summary>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </details>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>;
}

function bannerStyle(bg: string, fg: string): CSSProperties {
  return {
    background: bg,
    color: fg,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13.5,
    marginBottom: 18,
  };
}

const pageStyle: CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "32px 20px 80px",
  fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  color: "#12201a",
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e4ece6",
  fontSize: 14,
};

const fieldInputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid #e4ece6",
  fontSize: 13.5,
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  ...fieldInputStyle,
  fontFamily: "inherit",
  resize: "vertical",
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "#4b5d55",
  marginBottom: 4,
};

const helpTextStyle: CSSProperties = {
  fontSize: 12,
  color: "#6b7d73",
  marginTop: -4,
};

const itemBoxStyle: CSSProperties = {
  border: "1px solid #e4ece6",
  borderRadius: 10,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const sectionStyle: CSSProperties = {
  border: "1px solid #e4ece6",
  borderRadius: 14,
  padding: "14px 16px",
  background: "#fff",
  marginBottom: 14,
};

const summaryStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14.5,
  cursor: "pointer",
};

const buttonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#15803d",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};
