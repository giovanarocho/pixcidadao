import { NextRequest, NextResponse } from "next/server";
import { decodeSaleToken, downloadTokenFor } from "@/lib/store/saleToken";
import { getMercadoPagoPaymentStatus } from "@/lib/payments/mercadoPago";
import { atualizarStatusVendaPorId } from "@/lib/vendas";

// Nunca cachear/pré-renderizar esta rota — cada consulta precisa ir buscar o
// status real na hora, nunca devolver um valor antigo guardado.
export const dynamic = "force-dynamic";

const MOCK_CONFIRMATION_DELAY_MS = 4000;

/**
 * Consultada pelo frontend em polling curto (a cada ~1,5s) enquanto o
 * comprador está na tela de pagamento.
 *
 * A fonte da verdade é sempre consultada ao vivo:
 *   - modo simulado: o tempo decorrido desde a criação;
 *   - Mercado Pago: o status atual do pagamento, direto na API deles.
 * Nenhum dos dois depende de um banco de dados local.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const decoded = decodeSaleToken(params.id);
  if (!decoded) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 404 });
  }

  if (decoded.provider === "mercadopago") {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken || !decoded.mpPaymentId) {
      return NextResponse.json(
        { error: "Configuração de pagamento ausente." },
        { status: 500 }
      );
    }

    try {
      const mpStatus = await getMercadoPagoPaymentStatus(decoded.mpPaymentId, accessToken);

      if (mpStatus === "approved") {
        void atualizarStatusVendaPorId(decoded.id, "pago");
        return NextResponse.json({
          status: "pago",
          downloadToken: downloadTokenFor(decoded.id),
        });
      }
      if (["rejected", "cancelled", "refunded", "charged_back"].includes(mpStatus)) {
        void atualizarStatusVendaPorId(decoded.id, "cancelado");
        return NextResponse.json({ status: "cancelado", downloadToken: null });
      }
      if (Date.now() > decoded.expiresAt) {
        void atualizarStatusVendaPorId(decoded.id, "expirado");
        return NextResponse.json({ status: "expirado", downloadToken: null });
      }
      return NextResponse.json({ status: "pendente", downloadToken: null });
    } catch (err) {
      console.error("Erro ao consultar status no Mercado Pago:", err);
      return NextResponse.json(
        { error: "Não foi possível confirmar o pagamento agora. Tente novamente." },
        { status: 502 }
      );
    }
  }

  // Modo simulado
  const now = Date.now();
  if (now > decoded.expiresAt) {
    void atualizarStatusVendaPorId(decoded.id, "expirado");
    return NextResponse.json({ status: "expirado", downloadToken: null });
  }
  if (now - decoded.createdAt >= MOCK_CONFIRMATION_DELAY_MS) {
    void atualizarStatusVendaPorId(decoded.id, "pago");
    return NextResponse.json({
      status: "pago",
      downloadToken: downloadTokenFor(decoded.id),
    });
  }
  return NextResponse.json({ status: "pendente", downloadToken: null });
}
