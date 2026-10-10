import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** URL assinada (10 min) do PDF de análise do ciclo — só para usuários com papel. */
export const urlRelatorioPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ ciclo: z.string().regex(/^\d{4}-\d{2}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: papel } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!papel) throw new Response("Acesso não liberado", { status: 403 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assinada, error } = await supabaseAdmin.storage
      .from("relatorios")
      .createSignedUrl(`${data.ciclo}.pdf`, 600);
    if (error || !assinada) throw new Error("Relatório indisponível");
    return { url: assinada.signedUrl };
  });
