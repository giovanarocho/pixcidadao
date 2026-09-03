import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import * as defaults from "./content";

/**
 * Conteúdo do site (todo texto visível + preço) com suporte a edição pelo
 * admin em /admin/site, sem precisar mexer em código nem fazer novo deploy.
 *
 * Como funciona: src/lib/ebook/content.ts continua sendo o "padrão de
 * fábrica" (o que aparece se nada nunca foi editado, ou se o Supabase
 * estiver fora do ar). Quando o admin salva alterações em /admin/site, elas
 * são gravadas na tabela `conteudo_site` do Supabase (uma linha só, com um
 * JSON). Esta função busca essa linha e mescla por cima do padrão — campo
 * que nunca foi editado continua vindo do padrão, então não é preciso editar
 * tudo de uma vez.
 *
 * IMPORTANTE: toda página que usa isto precisa de
 * `export const dynamic = "force-dynamic"` — sem isso o Next.js poderia
 * deixar a página "engessada" com o conteúdo de quando foi feito o deploy,
 * e uma edição salva no painel não apareceria no site.
 */

export interface SiteContent {
  site: typeof defaults.site;
  hero: typeof defaults.hero;
  features: typeof defaults.features;
  chapters: typeof defaults.chapters;
  priceSection: typeof defaults.priceSection;
  impact: typeof defaults.impact;
  network: typeof defaults.network;
  faq: typeof defaults.faq;
  legal: typeof defaults.legal;
  contact: typeof defaults.contact;
  footer: typeof defaults.footer;
}

export const DEFAULT_CONTENT: SiteContent = {
  site: defaults.site,
  hero: defaults.hero,
  features: defaults.features,
  chapters: defaults.chapters,
  priceSection: defaults.priceSection,
  impact: defaults.impact,
  network: defaults.network,
  faq: defaults.faq,
  legal: defaults.legal,
  contact: defaults.contact,
  footer: defaults.footer,
};

// Mescla um valor customizado por cima do padrão, campo a campo (nível 1),
// sem apagar campos que não vieram no customizado.
function mergeShallow<T extends object>(base: T, override: Partial<T> | undefined): T {
  if (!override) return base;
  return { ...base, ...override };
}

function mergeArray<T>(base: T[], override: T[] | undefined): T[] {
  if (!Array.isArray(override) || override.length === 0) return base;
  // Mescla item a item pelo índice (mesma posição), preservando o tamanho
  // da lista padrão — assim um item que não foi editado continua com o
  // texto original.
  return base.map((item, i) => {
    const custom = override[i];
    if (!custom) return item;
    return typeof item === "object" && item !== null && !Array.isArray(item)
      ? ({ ...item, ...custom } as T)
      : custom;
  });
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return DEFAULT_CONTENT;

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("conteudo_site")
      .select("dados")
      .eq("id", "default")
      .maybeSingle();

    const custom = (data?.dados || {}) as Partial<{
      site: Partial<SiteContent["site"]>;
      hero: Partial<SiteContent["hero"]>;
      features: SiteContent["features"];
      chapters: SiteContent["chapters"];
      priceSection: Partial<SiteContent["priceSection"]> & { bullets?: string[] };
      impact: Partial<SiteContent["impact"]>;
      network: Partial<SiteContent["network"]>;
      faq: SiteContent["faq"];
      legal: {
        updatedAt?: string;
        privacy?: { intro?: string; sections?: SiteContent["legal"]["privacy"]["sections"] };
        terms?: { sections?: SiteContent["legal"]["terms"]["sections"] };
      };
      contact: Partial<SiteContent["contact"]>;
      footer: Partial<SiteContent["footer"]> & { credit?: Partial<SiteContent["footer"]["credit"]> };
    }>;

    if (!data?.dados) return DEFAULT_CONTENT;

    return {
      site: mergeShallow(DEFAULT_CONTENT.site, custom.site),
      hero: mergeShallow(DEFAULT_CONTENT.hero, custom.hero),
      features: mergeArray(DEFAULT_CONTENT.features, custom.features),
      chapters: mergeArray(DEFAULT_CONTENT.chapters, custom.chapters),
      priceSection: {
        ...mergeShallow(DEFAULT_CONTENT.priceSection, custom.priceSection),
        bullets:
          Array.isArray(custom.priceSection?.bullets) && custom.priceSection!.bullets!.length > 0
            ? custom.priceSection!.bullets!
            : DEFAULT_CONTENT.priceSection.bullets,
      },
      impact: mergeShallow(DEFAULT_CONTENT.impact, custom.impact),
      network: mergeShallow(DEFAULT_CONTENT.network, custom.network),
      faq: mergeArray(DEFAULT_CONTENT.faq, custom.faq),
      legal: {
        updatedAt: custom.legal?.updatedAt || DEFAULT_CONTENT.legal.updatedAt,
        privacy: {
          intro: custom.legal?.privacy?.intro || DEFAULT_CONTENT.legal.privacy.intro,
          sections: mergeArray(
            DEFAULT_CONTENT.legal.privacy.sections,
            custom.legal?.privacy?.sections
          ),
        },
        terms: {
          sections: mergeArray(
            DEFAULT_CONTENT.legal.terms.sections,
            custom.legal?.terms?.sections
          ),
        },
      },
      contact: mergeShallow(DEFAULT_CONTENT.contact, custom.contact),
      footer: {
        ...mergeShallow(DEFAULT_CONTENT.footer, custom.footer),
        credit: mergeShallow(DEFAULT_CONTENT.footer.credit, custom.footer?.credit),
      },
    };
  } catch (err) {
    console.error("Erro ao carregar conteúdo do site (usando o padrão):", err);
    return DEFAULT_CONTENT;
  }
}
