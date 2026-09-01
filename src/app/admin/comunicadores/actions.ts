"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { isValidAdminPassword } from "@/lib/comunicadores/refCode";

async function requireAdmin(formData: FormData) {
  const senha = String(formData.get("senha") || "");
  if (!isValidAdminPassword(senha)) {
    throw new Error("Senha de administrador inválida.");
  }
}

export async function approveComunicador(formData: FormData) {
  await requireAdmin(formData);
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("comunicadores").update({ status: "aprovado" }).eq("id", id);
  revalidatePath("/admin/comunicadores");
}

export async function rejectComunicador(formData: FormData) {
  await requireAdmin(formData);
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("comunicadores").update({ status: "recusado" }).eq("id", id);
  revalidatePath("/admin/comunicadores");
}

/**
 * Edita os dados cadastrais de um comunicador (nome, e-mail, Instagram,
 * chave Pix). O código de indicação (codigo_ref) nunca é editado por aqui:
 * ele já pode estar divulgado em links que o comunicador está usando, e
 * mudar o código quebraria esses links.
 */
export async function updateComunicador(
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin(formData);
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Cadastro não encontrado." };

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const chavePix = String(formData.get("chave_pix") || "").trim() || null;

  if (!nome || !email) {
    return { error: "Nome e e-mail são obrigatórios." };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("comunicadores")
    .update({ nome, email, instagram, chave_pix: chavePix })
    .eq("id", id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Já existe outro comunicador cadastrado com esse e-mail."
          : `Não foi possível salvar: ${error.message}`,
    };
  }

  revalidatePath("/admin/comunicadores");
  return {};
}

/**
 * Exclui um comunicador definitivamente. Se ele já tiver vendas registradas
 * (histórico de comissões), o banco impede a exclusão para não perder esse
 * histórico — nesse caso orientamos a "Recusar" em vez de excluir.
 */
export async function deleteComunicador(
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin(formData);
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Cadastro não encontrado." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("comunicadores").delete().eq("id", id);

  if (error) {
    return {
      error: error.message.includes("foreign key")
        ? "Este comunicador já tem vendas registradas e não pode ser excluído (o histórico de comissões seria perdido). Use \"Recusar\" para desativá-lo em vez de excluir."
        : `Não foi possível excluir: ${error.message}`,
    };
  }

  revalidatePath("/admin/comunicadores");
  return {};
}
