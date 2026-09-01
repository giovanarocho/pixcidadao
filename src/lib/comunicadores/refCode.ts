import { createHmac, randomInt } from "crypto";

const SECRET =
  process.env.SALE_TOKEN_SECRET ||
  process.env.MOCK_SIGNING_SECRET ||
  "pix-cidadao-demo-secret-troque-em-producao";

/**
 * Gera um código de indicação legível a partir do nome (ex.: "Maria Silva"
 * -> "maria-silva"), com um sufixo numérico para reduzir a chance de
 * colisão — a checagem de unicidade de verdade acontece na hora de gravar
 * no Supabase (ver src/app/api/comunicadores/route.ts).
 */
export function slugifyRefCode(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos (depois do normalize NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = randomInt(100, 999);
  return `${base || "comunicador"}-${suffix}`;
}

/**
 * Token assinado que dá acesso ao painel de um comunicador
 * (/comunicador/[ref]?token=...), sem exigir login/senha — o link
 * completo (com o token) é gerado pelo admin ao aprovar o cadastro e
 * repassado ao comunicador (por e-mail/WhatsApp, manualmente por enquanto).
 * Mesma lógica de assinatura usada em src/lib/store/saleToken.ts.
 */
export function dashboardTokenFor(refCode: string): string {
  return createHmac("sha256", SECRET)
    .update(`dashboard:${refCode}`)
    .digest("base64url")
    .slice(0, 24);
}

/**
 * Token assinado que autoriza ações administrativas (aprovar/recusar
 * comunicadores). Derivado da senha de admin (ADMIN_PASSWORD) — comparar
 * com o valor recebido evita deixar a senha "pura" trafegando na URL do
 * navegador (fica só no cookie/local do admin, mas ainda assim mais seguro
 * usar HTTPS sempre, o que a Vercel já garante por padrão).
 */
export function isValidAdminPassword(candidate: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  if (candidate.length !== expected.length) return false;
  // Comparação em tempo constante simples (evita timing attack básico)
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
