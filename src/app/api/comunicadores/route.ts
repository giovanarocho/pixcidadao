import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { slugifyRefCode } from "@/lib/comunicadores/refCode";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cadastro público de um novo comunicador na rede.
 *
 * Body esperado: { nome, email, instagram?, chavePix? }
 *
 * O registro entra com status "pendente" — só passa a valer (e só passa a
 * aparecer publicamente com um link funcional) depois de aprovado no painel
 * /admin/comunicadores. Isso evita que qualquer pessoa gere um link de
 * indicação sem revisão.
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "O cadastro da Rede de Comunicadores ainda não está ativado neste site. Tente novamente mais tarde ou entre em contato pela página de Contato.",
      },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const instagram = typeof body.instagram === "string" ? body.instagram.trim() : null;
  const chavePix = typeof body.chavePix === "string" ? body.chavePix.trim() : null;

  if (!nome || nome.length < 2) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Evita cadastro duplicado pelo mesmo e-mail.
  const { data: existing } = await supabase
    .from("comunicadores")
    .select("id, codigo_ref, status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyRegistered: true,
      status: existing.status,
    });
  }

  // Gera um código de indicação único (tenta algumas vezes em caso de colisão).
  let codigoRef = slugifyRefCode(nome);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await supabase
      .from("comunicadores")
      .select("id")
      .eq("codigo_ref", codigoRef)
      .maybeSingle();
    if (!clash) break;
    codigoRef = slugifyRefCode(nome);
  }

  const { error } = await supabase.from("comunicadores").insert({
    nome,
    email,
    instagram,
    chave_pix: chavePix,
    codigo_ref: codigoRef,
    status: "pendente",
  });

  if (error) {
    console.error("Erro ao cadastrar comunicador:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, alreadyRegistered: false });
}
