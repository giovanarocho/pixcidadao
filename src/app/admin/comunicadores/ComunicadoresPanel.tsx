"use client";

import { useMemo, useState, useTransition, type CSSProperties } from "react";
import {
  approveComunicador,
  rejectComunicador,
  updateComunicador,
  deleteComunicador,
} from "./actions";
import { CopyIcon, EditIcon, TrashIcon, SearchIcon, CheckIcon } from "@/components/Icons";

export interface ComunicadorRowData {
  id: string;
  nome: string;
  email: string;
  instagram: string | null;
  chavePix: string | null;
  status: string;
  criadoEm: string;
  linkIndicacao: string;
  linkPainel: string;
  vendasQtd: number;
  comissaoTotalCentavos: number;
}

export default function ComunicadoresPanel({
  senha,
  rows,
}: {
  senha: string;
  rows: ComunicadorRowData[];
}) {
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return rows;
    return rows.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        (c.instagram || "").toLowerCase().includes(termo)
    );
  }, [busca, rows]);

  return (
    <div>
      <div style={searchBoxStyle}>
        <SearchIcon style={{ color: "#6b7d73", flexShrink: 0 }} />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar comunicador por nome, e-mail ou Instagram…"
          style={searchInputStyle}
        />
      </div>

      {filtradas.length === 0 && (
        <p style={{ color: "#6b7d73", marginTop: 16 }}>
          Nenhum comunicador encontrado para essa busca.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {filtradas.map((c) => (
          <ComunicadorCard key={c.id} senha={senha} c={c} />
        ))}
      </div>
    </div>
  );
}

function ComunicadorCard({ senha, c }: { senha: string; c: ComunicadorRowData }) {
  const [editando, setEditando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      try {
        const result = await updateComunicador(formData);
        if (result?.error) {
          setErro(result.error);
        } else {
          setEditando(false);
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  function handleDelete(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      try {
        const result = await deleteComunicador(formData);
        if (result?.error) {
          setErro(result.error);
          setConfirmandoExclusao(false);
        }
        // Sucesso: revalidatePath já atualiza a lista, o card some sozinho.
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Não foi possível excluir.");
        setConfirmandoExclusao(false);
      }
    });
  }

  if (editando) {
    return (
      <div style={cardStyle}>
        <form action={handleUpdate}>
          <input type="hidden" name="senha" value={senha} />
          <input type="hidden" name="id" value={c.id} />
          <Field label="Nome">
            <input name="nome" defaultValue={c.nome} style={fieldInputStyle} required />
          </Field>
          <Field label="E-mail">
            <input
              name="email"
              type="email"
              defaultValue={c.email}
              style={fieldInputStyle}
              required
            />
          </Field>
          <Field label="Instagram">
            <input
              name="instagram"
              defaultValue={c.instagram || ""}
              style={fieldInputStyle}
              placeholder="@usuario"
            />
          </Field>
          <Field label="Chave Pix">
            <input
              name="chave_pix"
              defaultValue={c.chavePix || ""}
              style={fieldInputStyle}
            />
          </Field>
          {erro && <p style={{ color: "#b91c1c", fontSize: 13, margin: "4px 0 10px" }}>{erro}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="submit" style={buttonStyle} disabled={pending}>
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => {
                setEditando(false);
                setErro(null);
              }}
              disabled={pending}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <strong>{c.nome}</strong> <span style={badgeStyle(c.status)}>{c.status}</span>
          <LabeledLine label="E-mail" value={c.email} />
          {c.instagram && <LabeledLine label="Instagram" value={c.instagram} />}
          {c.chavePix && <LabeledLine label="Chave Pix" value={c.chavePix} copiavel />}
        </div>
        <div style={{ display: "flex", gap: 8, flexDirection: "column", flexShrink: 0 }}>
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
          <button type="button" style={iconButtonStyle} onClick={() => setEditando(true)}>
            <EditIcon /> Editar
          </button>
          {!confirmandoExclusao ? (
            <button
              type="button"
              style={dangerIconButtonStyle}
              onClick={() => setConfirmandoExclusao(true)}
            >
              <TrashIcon /> Excluir
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#b91c1c" }}>Confirmar exclusão?</span>
              <form action={handleDelete}>
                <input type="hidden" name="senha" value={senha} />
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" style={dangerButtonStyle} disabled={pending}>
                  {pending ? "Excluindo…" : "Sim, excluir"}
                </button>
              </form>
              <button
                type="button"
                style={ghostButtonStyle}
                onClick={() => setConfirmandoExclusao(false)}
                disabled={pending}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {erro && !editando && (
        <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 10 }}>{erro}</p>
      )}

      {c.status === "aprovado" && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          <div>
            Vendas confirmadas: <strong>{c.vendasQtd}</strong> · Comissão acumulada:{" "}
            <strong>R$ {(c.comissaoTotalCentavos / 100).toFixed(2).replace(".", ",")}</strong>
          </div>
          <LabeledLine label="Link de indicação" value={c.linkIndicacao} copiavel breakAll />
          <LabeledLine
            label="Link do painel (enviar para o comunicador)"
            value={c.linkPainel}
            copiavel
            breakAll
          />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

function LabeledLine({
  label,
  value,
  copiavel,
  breakAll,
}: {
  label: string;
  value: string;
  copiavel?: boolean;
  breakAll?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  return (
    <div
      style={{
        fontSize: 13,
        color: "#4b5d55",
        marginTop: 4,
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        wordBreak: breakAll ? "break-all" : "normal",
      }}
    >
      <span style={{ flex: 1 }}>
        <strong style={{ color: "#12201a" }}>{label}:</strong> {value}
      </span>
      {copiavel && (
        <button
          type="button"
          onClick={copiar}
          title={`Copiar ${label.toLowerCase()}`}
          style={copyIconButtonStyle}
        >
          {copiado ? <CheckIcon style={{ color: "#15803d" }} /> : <CopyIcon />}
        </button>
      )}
    </div>
  );
}

const searchBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid #e4ece6",
  borderRadius: 10,
  padding: "10px 12px",
  background: "#fff",
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: 14,
};

const cardStyle: CSSProperties = {
  border: "1px solid #e4ece6",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
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

const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#b91c1c",
};

const iconButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e4ece6",
  background: "#fff",
  color: "#12201a",
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
};

const dangerIconButtonStyle: CSSProperties = {
  ...iconButtonStyle,
  color: "#b91c1c",
  border: "1px solid #f3caca",
};

const copyIconButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 4,
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "#4b5d55",
  cursor: "pointer",
  flexShrink: 0,
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "#4b5d55",
  marginBottom: 4,
};

const fieldInputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid #e4ece6",
  fontSize: 13.5,
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
