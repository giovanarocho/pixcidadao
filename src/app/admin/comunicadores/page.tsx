import type { CSSProperties } from "react";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isValidAdminPassword, dashboardTokenFor } from "@/lib/comunicadores/refCode";
import ComunicadoresPanel, { type ComunicadorRowData } from "./ComunicadoresPanel";

export const metadata = { title: "Admin — Rede de Comunicadores" };
export const dynamic = "force-dynamic";

interface ComunicadorRow {
  id: string;
  nome: string;
  email: string;
  instagram: string | null;
  chave_pix: string | null;
  codigo_ref: string;
  status: string;
  criado_em: string;
}

export default async function AdminComunicadores({
  searchParams,
}: {
  searchParams: { senha?: string };
}) {
  const senha = searchParams.senha || "";
  const authorized = isValidAdminPassword(senha);

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div style={pageStyle}>
        <h1>Painel administrativo</h1>
        <p>
          Defina a variável de ambiente <code>ADMIN_PASSWORD</code> (na Vercel
          ou no seu <code>.env.local</code>) para poder acessar este painel.
        </p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={pageStyle}>
        <h1>Painel administrativo</h1>
        <form method="get" style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input
            type="password"
            name="senha"
            placeholder="Senha de administrador"
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>
        {senha && <p style={{ color: "#b91c1c", marginTop: 12 }}>Senha incorreta.</p>}
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div style={pageStyle}>
        <h1>Painel administrativo</h1>
        <p>
          O Supabase ainda não está configurado neste projeto — a Rede de
          Comunicadores (cadastro, aprovação, histórico de vendas) depende
          dele. Veja a seção &quot;Ativando a Rede de Comunicadores&quot; no
          README para configurar.
        </p>
      </div>
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: comunicadores } = await supabase
    .from("comunicadores")
    .select("id, nome, email, instagram, chave_pix, codigo_ref, status, criado_em")
    .order("status", { ascending: true })
    .order("criado_em", { ascending: false });

  const { data: vendasPagas } = await supabase
    .from("vendas")
    .select("comunicador_ref, comissao_valor_centavos")
    .eq("status_pagamento", "pago");

  const comissaoPorRef = new Map<string, { total: number; qtd: number }>();
  for (const v of vendasPagas || []) {
    if (!v.comunicador_ref) continue;
    const atual = comissaoPorRef.get(v.comunicador_ref) || { total: 0, qtd: 0 };
    atual.total += v.comissao_valor_centavos || 0;
    atual.qtd += 1;
    comissaoPorRef.set(v.comunicador_ref, atual);
  }

  const rows = (comunicadores || []) as ComunicadorRow[];
  // Domínio usado para montar os links de indicação/painel. Enquanto o
  // domínio oficial (pixcidadao.app.br) não está configurado na Vercel, dá
  // pra sobrescrever com NEXT_PUBLIC_SITE_URL (ex.: a URL temporária do
  // deploy) — mas o padrão já é o domínio definitivo, então nada precisa
  // mudar aqui quando o domínio oficial entrar no ar.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pixcidadao.app.br";

  const panelRows: ComunicadorRowData[] = rows.map((c) => {
    const stats = comissaoPorRef.get(c.codigo_ref);
    return {
      id: c.id,
      nome: c.nome,
      email: c.email,
      instagram: c.instagram,
      chavePix: c.chave_pix,
      status: c.status,
      criadoEm: c.criado_em,
      linkIndicacao: `${siteUrl}/?ref=${c.codigo_ref}`,
      linkPainel: `${siteUrl}/comunicador/${c.codigo_ref}?token=${dashboardTokenFor(
        c.codigo_ref
      )}`,
      vendasQtd: stats?.qtd || 0,
      comissaoTotalCentavos: stats?.total || 0,
    };
  });

  return (
    <div style={pageStyle}>
      <h1>Rede de Comunicadores — Admin</h1>
      <p style={{ color: "#4b5d55", marginBottom: 24 }}>
        {rows.filter((r) => r.status === "pendente").length} pendente(s) de
        aprovação · {rows.length} cadastro(s) no total.
      </p>

      {rows.length === 0 ? (
        <p>Nenhum cadastro ainda.</p>
      ) : (
        <ComunicadoresPanel senha={senha} rows={panelRows} />
      )}
    </div>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "32px 20px 80px",
  fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  color: "#12201a",
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e4ece6",
  fontSize: 14,
};

const buttonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#15803d",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

