import { createHmac } from "crypto";

/**
 * "saleId" sem estado no servidor.
 *
 * Por que isso existe: na Vercel (e em qualquer ambiente serverless), cada
 * rota de API roda como uma função isolada, sem memória compartilhada entre
 * si nem entre requisições. Guardar a venda num Map em memória funcionaria
 * rodando localmente (`npm run dev`), mas quebraria em produção — a venda
 * criada em /api/checkout podia não existir mais quando /api/status ou
 * /api/download fossem chamados em seguida.
 *
 * Solução: todo o estado necessário (valor, e-mail, comunicador de origem,
 * horários, e o id do pagamento no Mercado Pago quando houver) viaja
 * assinado dentro do próprio "saleId" devolvido ao navegador. Cada rota
 * decodifica e confere a assinatura — sem precisar de banco nem de memória
 * compartilhada. O status do pagamento real é sempre consultado ao vivo na
 * API do Mercado Pago (usando o id salvo aqui dentro), então a fonte da
 * verdade é sempre o Mercado Pago, nunca um cache local.
 *
 * O que isso NÃO resolve: manter um histórico de vendas para consulta
 * depois (quantas vendas por comunicador, exportar planilha, etc.) — isso
 * ainda depende de um banco de dados de verdade (Supabase, conforme já
 * documentado em src/lib/store/index.ts). O que está aqui resolve só o
 * caminho crítico "gerar Pix → confirmar → liberar o e-book", que já
 * funciona sem depender do banco.
 */

const SECRET =
  process.env.SALE_TOKEN_SECRET ||
  process.env.MOCK_SIGNING_SECRET ||
  "pix-cidadao-demo-secret-troque-em-producao";

export type ProviderKind = "mock" | "mercadopago";

export interface SaleTokenPayload {
  id: string;
  v: number; // valor em centavos
  ref: string | null; // codigo_ref do comunicador (fase 2)
  email: string | null;
  provider: ProviderKind;
  mpPaymentId?: string; // presente quando provider === "mercadopago"
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
}

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url").slice(0, 22);
}

export function encodeSaleToken(payload: SaleTokenPayload): string {
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${json}.${sign(json)}`;
}

export function decodeSaleToken(token: string): SaleTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [json, sig] = parts;
  if (!json || !sig || sign(json) !== sig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(json, "base64url").toString("utf8"));
    if (
      typeof parsed?.id === "string" &&
      typeof parsed?.v === "number" &&
      typeof parsed?.createdAt === "number" &&
      typeof parsed?.expiresAt === "number" &&
      (parsed?.provider === "mock" || parsed?.provider === "mercadopago")
    ) {
      return parsed as SaleTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function downloadTokenFor(saleId: string): string {
  return sign(`dl:${saleId}`);
}
