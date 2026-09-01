import type { CSSProperties } from "react";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isValidAdminPassword, dashboardTokenFor } from "@/lib/comunicadores/refCode";
import { approveComunicador, rejectComunicador } from "./actions";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <div style={pageStyle}>
      <h1>Rede de Comunicadores — Admin</h1>
      <p style={{ color: "#4b5d55", marginBottom: 24 }}>
        {rows.filter((r) => r.status === "pendente").length} pendente(s) de
        aprovação · {rows.length} cadastro(s) no total.
      </p>

      {rows.length === 0 && <p>Nenhum cadastro ainda.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((c) => {
          const stats = comissaoPorRef.get(c.codigo_ref);
          const linkIndicacao = `${siteUrl}/?ref=${c.codigo_ref}`;
          const linkPainel = `${siteUrl}/comunicador/${c.codigo_ref}?token=${dashboardTokenFor(
            c.codigo_ref
          )}`;
          return (
            <div key={c.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <strong>{c.nome}</strong>{" "}
                  <span style={badgeStyle(c.status)}>{c.status}</span>
                  <div style={{ fontSize: 13, color: "#4b5d55" }}>{c.email}</div>
                  {c.instagram && (
                    <div style={{ fontSize: 13, color: "#4b5d55" }}>{c.instagram}</div>
                  )}
                  {c.chave_pix && (
                    <div style={{ fontSize: 13, color: "#4b5d55" }}>
                      Chave Pix: {c.chave_pix}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  {c.status === "pendente" && (
                    <>
                      <form action={approveComunicador}>
                        <input type="hidden" name="senha" value={senha} />
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={buttonStyle}>
                          Aprovar
                        </button>
                      </form>
                      <form action={rejectComunicador}>
                        <input type="hidden" name="senha" value={senha} />
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={ghostButtonStyle}>
                          Recusar
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {c.status === "aprovado" && (
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  <div>
                    Vendas confirmadas: <strong>{stats?.qtd || 0}</strong> · Comissão
                    acumulada:{" "}
                    <strong>
                      R$ {(((stats?.total || 0) / 100) as number).toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                  <div style={{ marginTop: 6, wordBreak: "break-all" }}>
                    Link de indicação: <code>{linkIndicacao}</code>
                  </div>
                  <div style={{ marginTop: 4, wordBreak: "break-all" }}>
                    Link do painel (enviar para o comunicador):{" "}
                    <code>{linkPainel}</code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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

const cardStyle: CSSProperties = {
  border: "1px solid #e4ece6",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
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

const ghostButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "transparent",
  color: "#b91c1c",
  border: "1px solid #f3caca",
};

function badgeStyle(status: string): CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    pendente: { bg: "#fef3c7", fg: "#92400e" },
    aprovado: { bg: "#dcfce7", fg: "#166534" },
    recusado: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const c = colors[status] || colors.pendente;
  return {
    fontSize: 11,
    fontWeight: 700,
    background: c.bg,
    color: c.fg,
    padding: "2px 8px",
    borderRadius: 999,
    marginLeft: 6,
  };
}
