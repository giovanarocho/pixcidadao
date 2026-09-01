import type { CreatePixChargeParams, PaymentProvider, PixCharge } from "./types";

const MP_API = "https://api.mercadopago.com/v1/payments";

/**
 * Provedor de pagamento real via Mercado Pago.
 *
 * Ativa automaticamente quando MERCADO_PAGO_ACCESS_TOKEN está preenchido
 * (.env.local ou variáveis de ambiente do projeto na Vercel).
 *
 * Antes de usar em produção com dinheiro de verdade:
 *   1. Gere o Access Token de PRODUÇÃO (não o de teste) em
 *      https://www.mercadopago.com.br/developers/panel/app
 *   2. Faça pelo menos uma compra de teste com o token de teste primeiro
 *      (o Mercado Pago tem um modo sandbox com usuários e cartões/Pix de
 *      teste — ver "Credenciais de teste" no mesmo painel).
 *   3. Confirme que NEXT_PUBLIC_SITE_URL (ou o próprio domínio do deploy)
 *      está correto — é para lá que o Mercado Pago manda a notificação de
 *      pagamento (webhook).
 */
export class MercadoPagoProvider implements PaymentProvider {
  constructor(private accessToken: string) {}

  async createPixCharge({
    saleId,
    valorCentavos,
    payerEmail,
    notificationUrl,
  }: CreatePixChargeParams): Promise<PixCharge> {
    if (!payerEmail) {
      throw new Error(
        "O Mercado Pago exige um e-mail do pagador para gerar a cobrança Pix."
      );
    }

    const response = await fetch(MP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        // Evita cobrar duas vezes se a requisição for reenviada por algum motivo.
        "X-Idempotency-Key": saleId,
      },
      body: JSON.stringify({
        transaction_amount: Math.round(valorCentavos) / 100,
        description: "E-book Pix Cidadão",
        payment_method_id: "pix",
        payer: { email: payerEmail },
        notification_url: notificationUrl,
        external_reference: saleId,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.message || data?.error || `status HTTP ${response.status}`;
      throw new Error(`Mercado Pago recusou a criação do pagamento: ${message}`);
    }

    const qrCode: string | undefined = data?.point_of_interaction?.transaction_data?.qr_code;
    if (!qrCode) {
      throw new Error(
        "O Mercado Pago não devolveu um código Pix (qr_code) — confira se a " +
          "conta está habilitada para receber Pix e se o Access Token é válido."
      );
    }

    return {
      idTransacaoPix: String(data.id),
      pixCopiaCola: qrCode,
      expiraEm:
        data.date_of_expiration ?? new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  }
}

/**
 * Consulta ao vivo o status de um pagamento no Mercado Pago. É essa
 * consulta — não um valor guardado em algum banco — que decide se o e-book
 * pode ser liberado (ver src/app/api/status/[id] e
 * src/app/api/download/[id]).
 *
 * Status possíveis retornados pelo Mercado Pago: "pending", "approved",
 * "authorized", "in_process", "in_mediation", "rejected", "cancelled",
 * "refunded", "charged_back". Só "approved" libera o e-book.
 */
export async function getMercadoPagoPaymentStatus(
  paymentId: string,
  accessToken: string
): Promise<string> {
  const data = await getMercadoPagoPayment(paymentId, accessToken);
  return data.status;
}

/**
 * Igual a getMercadoPagoPaymentStatus, mas devolve também
 * `external_reference` — o id da venda (o mesmo uuid usado como chave na
 * tabela `vendas`), que o webhook usa para saber qual venda atualizar (ver
 * src/app/api/webhook/mercadopago/route.ts). O webhook só recebe o id do
 * pagamento no Mercado Pago, não o resto do contexto — por isso é preciso
 * essa consulta.
 */
export async function getMercadoPagoPayment(
  paymentId: string,
  accessToken: string
): Promise<{ status: string; externalReference: string | null }> {
  const response = await fetch(`${MP_API}/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Crítico: o Next.js guarda respostas de fetch em cache por padrão.
    // Essa consulta é sempre "esse pagamento já foi aprovado agora?" — nunca
    // pode responder com um valor antigo guardado em cache, senão o site
    // fica preso em "aguardando confirmação" mesmo depois do Pix ser pago de
    // verdade (foi exatamente esse bug que aconteceu).
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar o pagamento ${paymentId} no Mercado Pago (status HTTP ${response.status}).`
    );
  }

  const data = await response.json();
  return {
    status: data.status as string,
    externalReference: (data.external_reference as string) ?? null,
  };
}
