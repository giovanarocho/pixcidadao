import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoPayment } from "@/lib/payments/mercadoPago";
import { atualizarStatusVendaPorId, atualizarStatusVendaPorTransacaoPix } from "@/lib/vendas";

export const dynamic = "force-dynamic";

/**
 * Endpoint de webhook do Mercado Pago.
 *
 * Configurado automaticamente: cada cobrança criada em /api/checkout já
 * informa esta URL ao Mercado Pago (`notification_url`), então não é
 * preciso cadastrar nada manualmente no painel deles para o funcionamento
 * básico.
 *
 * Papel deste endpoint: o caminho crítico da compra (liberar o e-book) não
 * depende dele — o frontend confirma consultando ao vivo /api/status/[id],
 * que também consulta a API do Mercado Pago diretamente. Este webhook serve
 * para dois papéis complementares:
 *   1. Atualizar o registro da venda no Supabase (histórico/comissão da
 *      Rede de Comunicadores) mesmo se o comprador fechar a página antes da
 *      confirmação aparecer na tela.
 *   2. Servir de reforço/rede de segurança caso o polling do frontend falhe
 *      por algum motivo.
 *
 * Nunca confiamos apenas no conteúdo do payload do webhook — sempre
 * reconsultamos o pagamento na API do Mercado Pago antes de considerar
 * qualquer coisa como aprovada (o payload em si pode ser forjado).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  console.log("[webhook/mercadopago] notificação recebida:", JSON.stringify(body));

  const paymentId: string | undefined = body?.data?.id ? String(body.data.id) : undefined;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!paymentId || !accessToken) {
    // Notificação de outro tipo (ex.: teste do painel) ou gateway não
    // configurado — nada a fazer, mas respondemos 200 para o Mercado Pago
    // não ficar reenviando.
    return NextResponse.json({ received: true });
  }

  try {
    const { status, externalReference } = await getMercadoPagoPayment(paymentId, accessToken);

    let mapped: "pago" | "cancelado" | null = null;
    if (status === "approved") mapped = "pago";
    else if (["rejected", "cancelled", "refunded", "charged_back"].includes(status)) {
      mapped = "cancelado";
    }

    if (mapped) {
      if (externalReference) {
        await atualizarStatusVendaPorId(externalReference, mapped);
      } else {
        await atualizarStatusVendaPorTransacaoPix(paymentId, mapped);
      }
    }
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
    // Ainda respondemos 200: o Mercado Pago reenvia notificações que falham
    // com erro, e o polling do frontend já cobre o caminho crítico mesmo se
    // isto aqui falhar.
  }

  return NextResponse.json({ received: true });
}
