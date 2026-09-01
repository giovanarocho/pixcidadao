import { randomUUID } from "crypto";
import type { CreatePixChargeParams, PaymentProvider, PixCharge } from "./types";
import { MOCK_EXPIRATION_MS } from "@/lib/store";

/**
 * Provedor de pagamento SIMULADO — usado quando MERCADO_PAGO_ACCESS_TOKEN
 * não está definido no .env. Gera um "código Pix" com a mesma cara de um
 * código copia-e-cola real (formato EMV), mas que não é um Pix de verdade e
 * não pode ser pago em banco nenhum.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPixCharge({ saleId }: CreatePixChargeParams): Promise<PixCharge> {
    const fakeId = randomUUID().replace(/-/g, "").slice(0, 25);
    const pixCopiaCola = buildFakeEmvPayload(saleId, fakeId);

    return {
      idTransacaoPix: `mock_${fakeId}`,
      pixCopiaCola,
      expiraEm: new Date(Date.now() + MOCK_EXPIRATION_MS).toISOString(),
    };
  }
}

function buildFakeEmvPayload(saleId: string, fakeId: string): string {
  // Apenas para exibição na tela — não é um payload EMV/Pix válido.
  return `00020126580014BR.GOV.BCB.PIX0136pixcidadao-simulado-${fakeId}5204000053039865802BR5910PIXCIDADAO6009SAOPAULO62070503***6304SIMU`;
}
