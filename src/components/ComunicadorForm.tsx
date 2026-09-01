"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckBigIcon, AlertIcon } from "./Icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "form" | "sending" | "done" | "error";

export default function ComunicadorForm() {
  const [phase, setPhase] = useState<Phase>("form");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = nome.trim().length >= 2 && emailValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/comunicadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          instagram: instagram.trim() || undefined,
          chavePix: chavePix.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível enviar seu cadastro.");
      }
      setAlreadyRegistered(!!data.alreadyRegistered);
      setPhase("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido.");
      setPhase("error");
    }
  }

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div className="success-icon">
          <CheckBigIcon />
        </div>
        <h2 style={{ marginBottom: 8 }}>
          {alreadyRegistered ? "Você já está cadastrado" : "Cadastro recebido!"}
        </h2>
        <p className="sub" style={{ marginBottom: 0 }}>
          {alreadyRegistered
            ? "Encontramos um cadastro com esse e-mail. Se ainda não recebeu seu link de indicação, aguarde o contato da equipe."
            : "Vamos revisar seu cadastro e te enviar o link individual de indicação e o acesso ao seu painel assim que for aprovado."}
        </p>
        <Link href="/" className="btn btn-ghost" style={{ marginTop: 20 }}>
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Nome
      </label>
      <input
        className="copy-input"
        style={{ width: "100%", padding: "13px 14px", fontSize: 14.5, marginBottom: 14 }}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome ou nome do canal"
      />

      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        E-mail
      </label>
      <input
        type="email"
        inputMode="email"
        className="copy-input"
        style={{ width: "100%", padding: "13px 14px", fontSize: 14.5, marginBottom: 14 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seuemail@exemplo.com"
      />

      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Instagram ou outra rede (opcional)
      </label>
      <input
        className="copy-input"
        style={{ width: "100%", padding: "13px 14px", fontSize: 14.5, marginBottom: 14 }}
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="@seuperfil"
      />

      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Chave Pix para recebimento (opcional por enquanto)
      </label>
      <input
        className="copy-input"
        style={{ width: "100%", padding: "13px 14px", fontSize: 14.5, marginBottom: 6 }}
        value={chavePix}
        onChange={(e) => setChavePix(e.target.value)}
        placeholder="CPF, e-mail, telefone ou chave aleatória"
      />
      <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "0 0 18px" }}>
        Usada futuramente para o repasse da sua comissão. Você pode informar depois.
      </p>

      {phase === "error" && errorMessage && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
          <AlertIcon />
          <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>{errorMessage}</p>
        </div>
      )}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={!canSubmit || phase === "sending"}
      >
        {phase === "sending" ? "Enviando…" : "Enviar cadastro"}
      </button>
    </form>
  );
}
