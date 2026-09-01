import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { decodeSaleToken, downloadTokenFor } from "@/lib/store/saleToken";
import { getMercadoPagoPaymentStatus } from "@/lib/payments/mercadoPago";

// Nunca cachear/pré-renderizar esta rota — a confirmação do pagamento
// precisa ser checada ao vivo antes de liberar o arquivo, sempre.
export const dynamic = "force-dynamic";

const MOCK_CONFIRMATION_DELAY_MS = 4000;

/**
 * Entrega segura do e-book — nenhuma URL pública aponta direto para o PDF.
 *
 * O arquivo fica em `src/private-content/ebook.pdf`, fora de `public/`, e
 * só é servido por esta rota depois de reconfirmar (de novo, ao vivo) que o
 * pagamento foi aprovado — nunca confiando apenas no que o frontend diz.
 *
 * Quando o Supabase Storage entrar, troque a leitura do arquivo local por
 * uma `supabase.storage.from('ebooks').createSignedUrl(...)` mantendo a
 * mesma verificação de status feita aqui antes.
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

  const filePath = path.join(process.cwd(), "src/private-content/ebook.pdf");
  const file = await readFile(filePath);

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="pix-cidadao.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
