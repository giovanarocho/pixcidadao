"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { isValidAdminPassword } from "@/lib/comunicadores/refCode";
import { DEFAULT_CONTENT } from "@/lib/ebook/getContent";

function requireAdmin(formData: FormData): string {
  const senha = String(formData.get("senha") || "");
  if (!isValidAdminPassword(senha)) {
    throw new Error("Senha de administrador inválida.");
  }
  return senha;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Textarea com uma linha por item (usado para listas curtas: bullets,
// avatares etc.).
function linesToArray(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Textarea com parágrafos separados por linha em branco (usado nos textos
// longos de Política de Privacidade / Termos de Uso).
function paragraphsToArray(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePrecoReais(raw: string): { priceCents: number; priceLabel: string } | null {
  const normalizado = raw.trim().replace(/[^\d,.-]/g, "").replace(",", ".");
  const valor = parseFloat(normalizado);
  if (!Number.isFinite(valor) || valor <= 0) return null;
  const priceCents = Math.round(valor * 100);
  const priceLabel = `R$ ${(priceCents / 100).toFixed(2).replace(".", ",")}`;
  return { priceCents, priceLabel };
}

/**
 * Salva todo o conteúdo editável do site (textos + preço) numa única linha
 * na tabela `conteudo_site` do Supabase — ver src/lib/ebook/getContent.ts
 * para como isso é lido de volta e mesclado com o padrão de
 * src/lib/ebook/content.ts.
 *
 * O formulário em /admin/site sempre manda TODOS os campos (pré-preenchidos
 * com o valor atual), então salvamos o objeto inteiro de uma vez — não é um
 * "PATCH" parcial.
 */
export async function salvarConteudoSite(formData: FormData): Promise<void> {
  const senha = requireAdmin(formData);

  const preco = parsePrecoReais(str(formData, "site_price_reais"));
  if (!preco) {
    redirect(`/admin/site?senha=${encodeURIComponent(senha)}&erro=preco`);
  }

  const comissaoPct =
    Number(str(formData, "site_comissao_pct")) || DEFAULT_CONTENT.site.comissaoComunicadorPct;

  const dados = {
    site: {
      name: str(formData, "site_name") || DEFAULT_CONTENT.site.name,
      priceLabel: preco!.priceLabel,
      priceCents: preco!.priceCents,
      comissaoComunicadorPct: comissaoPct,
    },
    hero: {
      eyebrow: str(formData, "hero_eyebrow"),
      titlePrefix: str(formData, "hero_title_prefix"),
      titleEmphasis: str(formData, "hero_title_emphasis"),
      titleSuffix: str(formData, "hero_title_suffix"),
      lede: str(formData, "hero_lede"),
      ctaPrimary: str(formData, "hero_cta_primary"),
      ctaSecondary: str(formData, "hero_cta_secondary"),
      bookPages: str(formData, "hero_book_pages"),
    },
    features: DEFAULT_CONTENT.features.map((_, i) => ({
      title: str(formData, `feature_${i}_title`),
      text: str(formData, `feature_${i}_text`),
    })),
    chapters: DEFAULT_CONTENT.chapters.map((_, i) => ({
      title: str(formData, `chapter_${i}_title`),
      text: str(formData, `chapter_${i}_text`),
    })),
    priceSection: {
      tag: str(formData, "price_tag"),
      note: str(formData, "price_note"),
      bullets: linesToArray(formData, "price_bullets"),
      cta: str(formData, "price_cta"),
      hint: str(formData, "price_hint"),
    },
    impact: {
      title: str(formData, "impact_title"),
      text: str(formData, "impact_text"),
      // Não editável: é o marcador {comunicadores} usado dentro do texto
      // acima para destacar a palavra em negrito. Editar o texto mantendo
      // "{comunicadores}" no lugar certo continua funcionando.
      highlight: DEFAULT_CONTENT.impact.highlight,
    },
    network: {
      title: str(formData, "network_title"),
      cardTitle: str(formData, "network_card_title"),
      text: str(formData, "network_text"),
      refExample: DEFAULT_CONTENT.network.refExample,
      bullets: linesToArray(formData, "network_bullets"),
      formTitle: str(formData, "network_form_title"),
      formText: str(formData, "network_form_text"),
      ctaLabel: str(formData, "network_cta_label"),
      avatars: str(formData, "network_avatars")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      moreLabel: str(formData, "network_more_label"),
    },
    faq: DEFAULT_CONTENT.faq.map((_, i) => ({
      q: str(formData, `faq_${i}_q`),
      a: str(formData, `faq_${i}_a`),
    })),
    legal: {
      updatedAt: str(formData, "legal_updated_at"),
      privacy: {
        intro: str(formData, "legal_privacy_intro"),
        sections: DEFAULT_CONTENT.legal.privacy.sections.map((_, i) => ({
          title: str(formData, `legal_privacy_section_${i}_title`),
          paragraphs: paragraphsToArray(formData, `legal_privacy_section_${i}_paragraphs`),
          bullets: linesToArray(formData, `legal_privacy_section_${i}_bullets`),
          footer: str(formData, `legal_privacy_section_${i}_footer`),
        })),
      },
      terms: {
        sections: DEFAULT_CONTENT.legal.terms.sections.map((_, i) => ({
          title: str(formData, `legal_terms_section_${i}_title`),
          paragraphs: paragraphsToArray(formData, `legal_terms_section_${i}_paragraphs`),
        })),
      },
    },
    contact: {
      email: str(formData, "contact_email"),
      instagram: str(formData, "contact_instagram"),
    },
    footer: {
      text: str(formData, "footer_text"),
      credit: {
        text: str(formData, "footer_credit_text"),
        label: str(formData, "footer_credit_label"),
        href: str(formData, "footer_credit_href"),
      },
    },
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("conteudo_site")
    .upsert({ id: "default", dados, atualizado_em: new Date().toISOString() });

  if (error) {
    redirect(`/admin/site?senha=${encodeURIComponent(senha)}&erro=salvar`);
  }

  // Revalida todas as páginas que mostram esse conteúdo, para a edição
  // aparecer na hora, sem precisar de novo deploy.
  revalidatePath("/");
  revalidatePath("/contato");
  revalidatePath("/politica-de-privacidade");
  revalidatePath("/termos-de-uso");
  revalidatePath("/seja-comunicador");
  revalidatePath("/comunicador/[ref]", "page");
  revalidatePath("/admin/site");

  redirect(`/admin/site?senha=${encodeURIComponent(senha)}&salvo=1`);
}
