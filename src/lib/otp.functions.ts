import { createServerFn } from "@tanstack/react-start";

import {
  OTP_MAX_TENTATIVAS,
  OTP_VALIDADE_MINUTOS,
  dominioAutorizado,
  enviarEmailCodigo,
  gerarCodigo,
  normalizarEmail,
} from "./otp.server";

export const enviarCodigoAcesso = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => ({ email: String(data?.email ?? "") }))
  .handler(async ({ data }) => {
    const email = normalizarEmail(data.email);
    if (!dominioAutorizado(email)) {
      return { ok: false as const, erro: "dominio" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Invalida códigos anteriores ainda válidos para o mesmo e-mail.
    await supabaseAdmin
      .from("login_otps")
      .update({ usado: true })
      .eq("email", email)
      .eq("usado", false);

    const codigo = gerarCodigo();
    const expira = new Date(Date.now() + OTP_VALIDADE_MINUTOS * 60_000).toISOString();

    const { error } = await supabaseAdmin
      .from("login_otps")
      .insert({ email, codigo, expira_em: expira });
    if (error) {
      console.error("Erro ao gravar OTP:", error.message);
      return { ok: false as const, erro: "interno" };
    }

    try {
      await enviarEmailCodigo(email, codigo);
    } catch (e) {
      console.error(e);
      return { ok: false as const, erro: "envio" };
    }

    return { ok: true as const };
  });

export const verificarCodigoAcesso = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; codigo: string }) => ({
    email: String(data?.email ?? ""),
    codigo: String(data?.codigo ?? ""),
  }))
  .handler(async ({ data }) => {
    const email = normalizarEmail(data.email);
    const codigo = data.codigo.replace(/\D/g, "");
    if (!dominioAutorizado(email) || codigo.length !== 6) {
      return { ok: false as const, erro: "invalido" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: registro } = await supabaseAdmin
      .from("login_otps")
      .select("*")
      .eq("email", email)
      .eq("usado", false)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!registro) return { ok: false as const, erro: "invalido" };
    if (new Date(registro.expira_em).getTime() < Date.now()) {
      return { ok: false as const, erro: "expirado" };
    }
    if (registro.tentativas >= OTP_MAX_TENTATIVAS) {
      await supabaseAdmin.from("login_otps").update({ usado: true }).eq("id", registro.id);
      return { ok: false as const, erro: "tentativas" };
    }
    if (registro.codigo !== codigo) {
      await supabaseAdmin
        .from("login_otps")
        .update({ tentativas: registro.tentativas + 1 })
        .eq("id", registro.id);
      return { ok: false as const, erro: "invalido" };
    }

    await supabaseAdmin.from("login_otps").update({ usado: true }).eq("id", registro.id);

    // Garante que o usuário existe e emite um token de sessão de uso único.
    const criado = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (criado.error && !/already/i.test(criado.error.message)) {
      console.error("Erro ao criar usuário:", criado.error.message);
      return { ok: false as const, erro: "interno" };
    }

    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link.data?.properties?.hashed_token;
    if (link.error || !tokenHash) {
      console.error("Erro ao gerar sessão:", link.error?.message);
      return { ok: false as const, erro: "interno" };
    }

    return { ok: true as const, tokenHash };
  });
