import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { encodeSaleToken } from "@/lib/store/saleToken";
import { site } from "@/lib/ebook/content";
import { validarComunicadorAprovado, registrarVenda } from "@/lib/vendas";

// Nunca cachear/pré-renderizar esta rota — cada compra precisa gerar uma
// cobrança nova de verdade, nunca reaproveitar uma resposta antiga.
export const dynamic = "force-dynamic";

/**
 * Cria uma cobrança Pix (real ou simulada, conforme MERCADO_PAGO_ACCESS_TOKEN)
 * e devolve um "saleId" assinado, sem estado no servidor — ver
 * src/lib/store/saleToken.ts para o porquê.
 *
 * Body esperado:
 *   { ref?: string, email?: string }
 * `email` é obrigatório quando o Mercado Pago está configurado (a API dele
 * exige um e-mail do pagador); opcional no modo simulado.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ref: string | null =
      typeof body.ref === "string" && body.ref.trim() ? body.ref.trim() : null;
    const email: string | null =
      typeof body.email === "string" && body.email.trim() ? body.email.trim() : null;

    const usingRealGateway = !!process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (usingRealGateway && !email) {
      return NextResponse.json(
        { error: "Informe um e-mail para gerar a cobrança Pix." },
        { status: 400 }
      );
    }

    // Só aplica comissão se o código de indicação pertencer a um comunicador
    // com cadastro aprovado — evita que qualquer ?ref= arbitrário na URL
    // gere uma comissão fantasma. Ver src/lib/vendas.ts.
    const refValidado = await validarComunicadorAprovado(ref);

    const provider = getPaymentProvider();
    const id = randomUUID();
    const notificationUrl = `${req.nextUrl.origin}/api/webhook/mercadopago`;

    const charge = await provider.createPixCharge({
      saleId: id,
      valorCentavos: site.priceCents,
      payerEmail: email ?? undefined,
      notificationUrl,
    });

    const saleToken = encodeSaleToken({
      id,
      v: site.priceCents,
      ref: refValidado,
      email,
      provider: usingRealGateway ? "mercadopago" : "mock",
      mpPaymentId: usingRealGateway ? charge.idTransacaoPix : undefined,
      createdAt: Date.now(),
      expiresAt: new Date(charge.expiraEm).getTime(),
    });

    // Registro para a Rede de Comunicadores (histórico/comissão) — nunca
    // bloqueia nem atrasa a resposta ao comprador se falhar (ver
    // src/lib/vendas.ts).
    void registrarVenda({
      id,
      comunicadorRef: refValidado,
      compradorEmail: email,
      valorCentavos: site.priceCents,
      idTransacaoPix: usingRealGateway ? charge.idTransacaoPix : id,
      comissaoPct: site.comissaoComunicadorPct,
      expiraEm: charge.expiraEm,
    });

    return NextResponse.json({
      saleId: saleToken,
      pixCopiaCola: charge.pixCopiaCola,
      qrCodeBase64: charge.qrCodeBase64 ?? null,
      expiraEm: charge.expiraEm,
      valorCentavos: site.priceCents,
    });
  } catch (err) {
    console.error("Erro ao criar cobrança Pix:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: `Não foi possível gerar a cobrança Pix. ${message}` },
      { status: 500 }
    );
  }
}
