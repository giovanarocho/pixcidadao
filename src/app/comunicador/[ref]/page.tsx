import type { CSSProperties } from "react";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { dashboardTokenFor } from "@/lib/comunicadores/refCode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Painel do Comunicador — Pix Cidadão" };
export const dynamic = "force-dynamic";

export default async function PainelComunicador({
  params,
  searchParams,
}: {
  params: { ref: string };
  searchParams: { token?: string };
}) {
  const ref = params.ref;
  const token = searchParams.token || "";
  const valid = token && token === dashboardTokenFor(ref);

  if (!valid) {
    return (
      <div className="wrap">
        <Header />
        <div className="legal-page">
          <h1>Link inválido</h1>
          <p>
            Este link de painel não é válido ou está incompleto. Peça o link
            correto para a equipe do Pix Cidadão.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="wrap">
        <Header />
        <div className="legal-page">
          <h1>Painel indisponível</h1>
          <p>O painel de comunicadores ainda está sendo configurado. Tente novamente mais tarde.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: comunicador } = await supabase
    .from("comunicadores")
    .select("nome, status, codigo_ref")
    .eq("codigo_ref", ref)
    .maybeSingle();

  if (!comunicador || comunicador.status !== "aprovado") {
    return (
      <div className="wrap">
        <Header />
        <div className="legal-page">
          <h1>Cadastro não aprovado</h1>
          <p>Este cadastro ainda não foi aprovado ou não existe mais.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { data: vendas } = await supabase
    .from("vendas")
    .select("status_pagamento, valor_centavos, comissao_valor_centavos, criado_em, pago_em")
    .eq("comunicador_ref", ref)
    .order("criado_em", { ascending: false })
    .limit(100);

  const pagas = (vendas || []).filter((v) => v.status_pagamento === "pago");
  const totalComissao = pagas.reduce((acc, v) => acc + (v.comissao_valor_centavos || 0), 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pixcidadao.app.br";
  const linkIndicacao = `${siteUrl}/?ref=${ref}`;

  return (
    <div className="wrap">
      <Header />
      <div className="legal-page">
        <h1>Olá, {comunicador.nome.split(" ")[0]}</h1>
        <p className="updated">Seu painel de vendas pela Rede de Comunicadores</p>

        <div className="network-card" style={{ marginBottom: 20 }}>
          <p style={{ marginBottom: 6 }}>Seu link de indicação:</p>
          <span className="ref-pill" style={{ wordBreak: "break-all", whiteSpace: "normal" }}>
            {linkIndicacao}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={statBox}>
            <div style={statValue}>{pagas.length}</div>
            <div style={statLabel}>vendas confirmadas</div>
          </div>
          <div style={statBox}>
            <div style={statValue}>
              R$ {(totalComissao / 100).toFixed(2).replace(".", ",")}
            </div>
            <div style={statLabel}>comissão acumulada</div>
          </div>
        </div>

        <h2>Últimas vendas</h2>
        {(vendas || []).length === 0 && <p>Nenhuma venda registrada ainda.</p>}
        {(vendas || []).map((v, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
              fontSize: 13.5,
            }}
          >
            <span>{new Date(v.criado_em).toLocaleDateString("pt-BR")}</span>
            <span style={{ textTransform: "capitalize" }}>{v.status_pagamento}</span>
            <span>
              {v.status_pagamento === "pago"
                ? `+ R$ ${((v.comissao_valor_centavos || 0) / 100).toFixed(2).replace(".", ",")}`
                : "—"}
            </span>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

const statBox: CSSProperties = {
  flex: 1,
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: 16,
  textAlign: "center",
};
const statValue: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "var(--green-950)",
};
const statLabel: CSSProperties = {
  fontSize: 12,
  color: "var(--ink-soft)",
  marginTop: 4,
};
