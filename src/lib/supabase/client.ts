import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase (lado servidor, com a service role key — NUNCA usar essa
 * chave no navegador). É usado por:
 *   - src/app/api/comunicadores (cadastro de novos comunicadores)
 *   - src/app/admin/comunicadores (aprovação, painel)
 *   - src/app/comunicador/[ref] (painel do próprio comunicador)
 *   - as rotas de checkout/status/webhook, para registrar cada venda e sua
 *     comissão (ver supabase-schema.sql na raiz do projeto)
 *
 * Sem essas variáveis configuradas, o site inteiro continua funcionando
 * normalmente para vender o e-book (o fluxo de pagamento não depende do
 * Supabase — ver src/lib/store/saleToken.ts) — só a Rede de Comunicadores
 * (cadastro, aprovação, histórico de vendas por comunicador) fica
 * indisponível até o banco ser configurado. Use isSupabaseConfigured() para
 * checar isso antes de chamar getSupabaseServerClient().
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e " +
        "SUPABASE_SERVICE_ROLE_KEY no .env.local (ou nas variáveis de " +
        "ambiente da Vercel) para ativar a Rede de Comunicadores."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
