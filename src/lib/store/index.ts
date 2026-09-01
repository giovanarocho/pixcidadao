/**
 * Constantes do modo simulado (sem Mercado Pago configurado).
 *
 * O registro de vendas de verdade (para a Rede de Comunicadores) já foi
 * implementado com Supabase — ver src/lib/vendas.ts e supabase-schema.sql
 * na raiz do projeto. Este arquivo ficou só com as constantes de tempo do
 * modo simulado; o antigo armazenamento em Map (que só funcionava
 * localmente, nunca em produção na Vercel) foi removido depois que o
 * caminho real passou a usar tokens assinados (src/lib/store/saleToken.ts)
 * + Supabase.
 */

// Tempo para o Pix "simulado" expirar, e tempo até a confirmação
// automática simulada — só se aplica quando não há gateway real configurado
// (ver src/lib/payments).
export const MOCK_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos
export const MOCK_CONFIRMATION_DELAY_MS = 4000; // 4 segundos
