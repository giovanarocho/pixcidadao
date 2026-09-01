import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mockProvider";
import { MercadoPagoProvider } from "./mercadoPago";

/**
 * Desenho atual (MVP): toda cobrança Pix é gerada nesta conta central
 * (Mercado Pago). O site recebe 100% do valor, confirma o pagamento
 * automaticamente via webhook, registra a comissão de cada comunicador na
 * venda (campo `comunicador_ref` / `comissao_valor`, ver src/lib/store) e o
 * repasse dos 90% sai manual por enquanto — exatamente como pedido no
 * briefing.
 *
 * Caminho futuro considerado e DELIBERADAMENTE não implementado agora: cada
 * comunicador recebendo 100% direto na própria chave Pix, e devolvendo 10%
 * depois. Isso é tecnicamente viável (ex.: uma chave Pix por comunicador
 * cadastrada em `comunicadores.chave_pix`, ou um recurso de split de
 * pagamento tipo o de marketplace do Mercado Pago), mas exige uma conta/
 * integração de pagamento por comunicador — bem mais complexo que uma
 * função a mais aqui.
 *
 * O ponto importante: essa troca não exige reconstruir o site. Tanto a
 * landing page quanto a tabela de vendas (Sale) já são agnósticas a QUEM
 * recebe o Pix — só esta função (getPaymentProvider) e a lógica de criação
 * da cobrança (que hoje sempre usa a conta central) precisariam mudar para,
 * quando a venda tiver um comunicador_ref, escolher a chave/conta Pix dele
 * em vez da conta central. O resto do sistema (registro da venda, cálculo
 * de comissão, entrega do e-book) continua igual.
 */
export function getPaymentProvider(): PaymentProvider {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (token) {
    return new MercadoPagoProvider(token);
  }
  return new MockPaymentProvider();
}

export type { PaymentProvider, PixCharge } from "./types";
