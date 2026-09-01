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
