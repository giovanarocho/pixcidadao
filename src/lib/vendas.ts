import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Registro de vendas no Supabase — usado para a Rede de Comunicadores
 * (histórico de vendas, cálculo e consulta de comissões).
 *
 * IMPORTANTE: isto é só um REGISTRO/relatório. O caminho crítico da compra
 * (gerar Pix -> confirmar -> liberar o e-book) nunca depende disto — ele
 * roda inteiro via o token assinado em src/lib/store/saleToken.ts, mesmo se
 * o Supabase estiver fora do ar ou mal configurado. Por isso toda função
 * aqui é "best effort": falha é logada, nunca propagada, para não quebrar
 * uma compra por causa de um problema no registro de comissão.
 */

export async function validarComunicadorAprovado(ref: string | null): Promise<string | null> {
  if (!ref || !isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("comunicadores")
      .select("codigo_ref, status")
      .eq("codigo_ref", ref)
      .maybeSingle();
    if (data && data.status === "aprovado") return data.codigo_ref;
    return null;
  } catch (err) {
    console.error("Erro ao validar comunicador:", err);
    return null;
  }
}

export async function registrarVenda(params: {
  id: string;
  comunicadorRef: string | null;
  compradorEmail: string | null;
  valorCentavos: number;
  idTransacaoPix: string;
  comissaoPct: number;
  expiraEm: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseServerClient();
    const comissao = params.comunicadorRef
      ? Math.round((params.valorCentavos * params.comissaoPct) / 100)
      : null;
    const { error } = await supabase.from("vendas").insert({
      id: params.id,
      comunicador_ref: params.comunicadorRef,
      comprador_email: params.compradorEmail,
      valor_centavos: params.valorCentavos,
      status_pagamento: "pendente",
      id_transacao_pix: params.idTransacaoPix,
      comissao_valor_centavos: comissao,
      expira_em: params.expiraEm,
    });
    if (error) console.error("Erro ao registrar venda:", error);
  } catch (err) {
    console.error("Erro ao registrar venda:", err);
  }
}

export async function atualizarStatusVendaPorId(
  id: string,
  status: "pago" | "expirado" | "cancelado"
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseServerClient();
    const patch: Record<string, unknown> = { status_pagamento: status };
    if (status === "pago") patch.pago_em = new Date().toISOString();
    const { error } = await supabase.from("vendas").update(patch).eq("id", id);
    if (error) console.error("Erro ao atualizar venda:", error);
  } catch (err) {
    console.error("Erro ao atualizar venda:", err);
  }
}

export async function atualizarStatusVendaPorTransacaoPix(
  idTransacaoPix: string,
  status: "pago" | "expirado" | "cancelado"
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseServerClient();
    const patch: Record<string, unknown> = { status_pagamento: status };
    if (status === "pago") patch.pago_em = new Date().toISOString();
    const { error } = await supabase
      .from("vendas")
      .update(patch)
      .eq("id_transacao_pix", idTransacaoPix);
    if (error) console.error("Erro ao atualizar venda (webhook):", error);
  } catch (err) {
    console.error("Erro ao atualizar venda (webhook):", err);
  }
}
