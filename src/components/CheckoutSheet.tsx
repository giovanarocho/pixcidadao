"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon, CheckBigIcon, DownloadIcon, AlertIcon } from "./Icons";
import { site } from "@/lib/ebook/content";

type Phase = "email" | "loading" | "pending" | "paid" | "expired" | "error";

interface CheckoutState {
  saleId: string | null;
  pixCopiaCola: string | null;
  expiraEm: string | null;
  downloadToken: string | null;
}

const POLL_INTERVAL_MS = 1500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutSheet({
  open,
  onClose,
  refCode,
}: {
  open: boolean;
  onClose: () => void;
  refCode: string | null;
}) {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [state, setState] = useState<CheckoutState>({
    saleId: null,
    pixCopiaCola: null,
    expiraEm: null,
    downloadToken: null,
  });
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhase("email");
    setErrorMessage(null);
    setEmailTouched(false);
    return stopTimers;
  }, [open]);

  function stopTimers() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }

  const emailIsValid = EMAIL_RE.test(email.trim());

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    if (!emailIsValid) return;
    startCheckout();
  }

  async function startCheckout() {
    setPhase("loading");
    setErrorMessage(null);
    setCopied(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: refCode, email: email.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Falha ao criar cobrança.");
      }

      setState({
        saleId: data.saleId,
        pixCopiaCola: data.pixCopiaCola,
        expiraEm: data.expiraEm,
        downloadToken: null,
      });
      setPhase("pending");
      startPolling(data.saleId);
      startCountdown(data.expiraEm);
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido.");
      setPhase("error");
    }
  }

  function startPolling(saleId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${saleId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "pago") {
          setState((s) => ({ ...s, downloadToken: data.downloadToken }));
          setPhase("paid");
          stopTimers();
        } else if (data.status === "expirado") {
          setPhase("expired");
          stopTimers();
        } else if (data.status === "cancelado") {
          setErrorMessage("O pagamento foi cancelado ou recusado.");
          setPhase("error");
          stopTimers();
        }
      } catch (err) {
        console.error(err);
      }
    }, POLL_INTERVAL_MS);
  }

  function startCountdown(expiraEm: string) {
    const update = () => {
      const diff = new Date(expiraEm).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(diff / 1000)));
    };
    update();
    tickRef.current = setInterval(update, 1000);
  }

  function handleClose() {
    stopTimers();
    onClose();
  }

  function copyPix() {
    if (!state.pixCopiaCola) return;
    navigator.clipboard?.writeText(state.pixCopiaCola).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const timerLabel =
    secondsLeft !== null
      ? `Expira em ${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
          secondsLeft % 60
        ).padStart(2, "0")}`
      : "";

  return (
    <div
      className={`overlay${open ? " show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-hidden={!open}
    >
      <div className="sheet">
        <div className="sheet-close" onClick={handleClose} role="button" aria-label="Fechar">
          <XIcon />
        </div>
        <div className="sheet-handle" />

        {phase === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <h2>Só mais um passo</h2>
            <p className="sub">
              Informe seu e-mail para gerar o Pix e receber o link do e-book.
            </p>
            <input
              type="email"
              inputMode="email"
              autoFocus
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className="copy-input"
              style={{ width: "100%", padding: "13px 14px", fontSize: 14.5, marginBottom: 6 }}
            />
            {emailTouched && !emailIsValid && (
              <p style={{ fontSize: 12, color: "#b91c1c", margin: "0 0 12px" }}>
                Digite um e-mail válido.
              </p>
            )}
            {!(emailTouched && !emailIsValid) && <div style={{ marginBottom: 12 }} />}
            <button className="btn btn-primary" type="submit">
              Gerar Pix · {site.priceLabel}
            </button>
            <p style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 14 }}>
              Usamos seu e-mail só para enviar o link do e-book e dar suporte,
              caso precise.
            </p>
          </form>
        )}

        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }} />
            <p className="sub" style={{ margin: 0 }}>
              Gerando sua cobrança Pix…
            </p>
          </div>
        )}

        {phase === "pending" && state.pixCopiaCola && (
          <>
            <h2>Pague com Pix para liberar o e-book</h2>
            <p className="sub">
              Escaneie o QR code ou copie o código abaixo no app do seu banco.
            </p>
            <div className="qr-box">
              <div className="qr-mock" />
              {secondsLeft !== null && <div className="timer">{timerLabel}</div>}
            </div>
            <div className="copy-row">
              <div className="copy-input">{state.pixCopiaCola}</div>
              <button className="copy-btn" onClick={copyPix}>
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="status-row" style={{ marginTop: 18 }}>
              <span className="spinner" /> Aguardando confirmação do
              pagamento…
            </div>
            <div className="steps">
              <div className="step">
                <span className="dot">1</span>O código Pix já está pronto —
                pague pelo app do seu banco.
              </div>
              <div className="step">
                <span className="dot">2</span>Assim que o pagamento é
                aprovado, confirmamos automaticamente.
              </div>
              <div className="step">
                <span className="dot">3</span>O link do e-book aparece aqui
                na hora, sem precisar atualizar a página.
              </div>
            </div>
          </>
        )}

        {phase === "paid" && state.saleId && state.downloadToken && (
          <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
            <div className="success-icon">
              <CheckBigIcon />
            </div>
            <h2>Pagamento confirmado!</h2>
            <p className="sub">Seu e-book já está pronto para download.</p>
            <a
              className="btn btn-primary"
              href={`/api/download/${state.saleId}?token=${state.downloadToken}`}
            >
              <DownloadIcon /> Baixar o e-book (PDF)
            </a>
            <p style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 14 }}>
              Este link é pessoal, temporário e não pode ser acessado
              publicamente.
            </p>
          </div>
        )}

        {phase === "expired" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="success-icon" style={{ color: "#b45309", background: "#fef3c7", borderColor: "#fde68a" }}>
              <AlertIcon />
            </div>
            <h2>O código Pix expirou</h2>
            <p className="sub">Sem problema — gere um novo código, sem custo.</p>
            <button className="btn btn-primary" onClick={startCheckout}>
              Gerar novo código Pix
            </button>
          </div>
        )}

        {phase === "error" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="success-icon" style={{ color: "#b91c1c", background: "#fee2e2", borderColor: "#fecaca" }}>
              <AlertIcon />
            </div>
            <h2>Não foi possível gerar o Pix</h2>
            <p className="sub">{errorMessage || "Tente novamente em instantes."}</p>
            <button className="btn btn-primary" onClick={startCheckout}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
