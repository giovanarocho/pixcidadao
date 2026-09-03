import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { decodeSaleToken, downloadTokenFor } from "@/lib/store/saleToken";
import { getMercadoPagoPaymentStatus } from "@/lib/payments/mercadoPago";
import { atualizarStatusVendaPorId } from "@/lib/vendas";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Nunca cachear/pré-renderizar esta rota — a confirmação do pagamento
// precisa ser checada ao vivo antes de liberar o arquivo, sempre.
export const dynamic = "force-dynamic";

const MOCK_CONFIRMATION_DELAY_MS = 4000;

/**
 * Busca o PDF do e-book: primeiro tenta o arquivo trocado pelo admin em
 * /admin/site (guardado no bucket privado "ebooks" do Supabase Storage —
 * ver supabase-schema.sql), e só usa o arquivo padrão do repositório
 * (`src/private-content/ebook.pdf`) se nenhum arquivo tiver sido enviado
 * ainda, ou se o Supabase não estiver configurado. Assim o site nunca fica
 * sem e-book pra vender, mesmo antes do admin trocar o arquivo pela primeira
 * vez.
 */
async function lerEbookPdf(): Promise<Buffer> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.storage.from("ebooks").download("ebook.pdf");
      if (!error && data) {
        return Buffer.from(await data.arrayBuffer());
      }
    } catch (err) {
      console.error("Erro ao buscar e-book no Supabase Storage (usando o padrão):", err);
    }
  }

  const filePath = path.join(process.cwd(), "src/private-content/ebook.pdf");
  return readFile(filePath);
}

/**
 * Entrega segura do e-book — nenhuma URL pública aponta direto para o PDF.
 *
 * Só é servido por esta rota depois de reconfirmar (de novo, ao vivo) que o
 * pagamento foi aprovado — nunca confiando apenas no que o frontend diz.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 403 });
  }

  const decoded = decodeSaleToken(params.id);
  if (!decoded) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  }

  if (token !== downloadTokenFor(decoded.id)) {
    return NextResponse.json({ error: "Link de download inválido." }, { status: 403 });
  }

  let isPaid = false;

  if (decoded.provider === "mercadopago") {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken || !decoded.mpPaymentId) {
      return NextResponse.json({ error: "Configuração de pagamento ausente." }, { status: 500 });
    }
    try {
      const mpStatus = await getMercadoPagoPaymentStatus(decoded.mpPaymentId, accessToken);
      isPaid = mpStatus === "approved";
    } catch (err) {
      console.error("Erro ao reconfirmar pagamento antes do download:", err);
      return NextResponse.json(
        { error: "Não foi possível confirmar o pagamento agora. Tente novamente em instantes." },
        { status: 502 }
      );
    }
  } else {
    const now = Date.now();
    isPaid = now <= decoded.expiresAt && now - decoded.createdAt >= MOCK_CONFIRMATION_DELAY_MS;
  }

  if (!isPaid) {
    return NextResponse.json(
      { error: "Pagamento ainda não confirmado ou expirado." },
      { status: 402 }
    );
  }

  // Rede de segurança: garante que o Supabase fique marcado como "pago"
  // mesmo que a atualização feita durante o polling em /api/status tenha
  // falhado por algum motivo (ex.: a aba foi fechada bem na hora da
  // confirmação). Idempotente — atualizar de novo uma venda que já está
  // "pago" não tem efeito colateral nenhum.
  await atualizarStatusVendaPorId(decoded.id, "pago");

  const file = await lerEbookPdf();

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="pix-cidadao.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
