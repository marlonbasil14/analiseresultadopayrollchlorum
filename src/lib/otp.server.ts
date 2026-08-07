import { DOMINIO_PERMITIDO } from "./acesso-dominio";

export const OTP_VALIDADE_MINUTOS = 10;
export const OTP_MAX_TENTATIVAS = 5;

export function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function dominioAutorizado(email: string) {
  return normalizarEmail(email).endsWith(DOMINIO_PERMITIDO);
}

export function gerarCodigo() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0]! % 1000000).padStart(6, "0");
}

const REMETENTE = "Payroll Intelligence <onboarding@resend.dev>";

function corpoEmail(codigo: string) {
  return {
    subject: `Seu código de acesso é: ${codigo}`,
    text: `Seu código de acesso é: ${codigo}\n\nEle expira em ${OTP_VALIDADE_MINUTOS} minutos. Se você não solicitou o acesso, ignore esta mensagem.`,
    html: `<div style="font-family:Nunito,Arial,sans-serif;color:#202848;padding:24px">
  <p style="font-size:15px;font-weight:300;margin:0 0 12px">Payroll Intelligence &middot; Chlorum Solutions</p>
  <p style="font-size:16px;font-weight:300;margin:0 0 8px">Seu código de acesso é:</p>
  <p style="font-size:34px;font-weight:800;letter-spacing:8px;color:#2a4999;margin:0 0 16px">${codigo}</p>
  <p style="font-size:13px;font-weight:300;color:#54607a;margin:0">O código expira em ${OTP_VALIDADE_MINUTOS} minutos. Não compartilhe com ninguém.</p>
</div>`,
  };
}

/** Envia o código pela API HTTP do Resend (gateway da Lovable, com fallback direto). */
export async function enviarEmailCodigo(email: string, codigo: string) {
  const resendKey = process.env["RESEND_API_KEY"];
  if (!resendKey) throw new Error("RESEND_API_KEY não configurada");

  const payload = { from: REMETENTE, to: [email], ...corpoEmail(codigo) };
  const lovableKey = process.env["LOVABLE_API_KEY"];

  const tentativas: Array<{ url: string; headers: Record<string, string> }> = [];
  if (lovableKey) {
    tentativas.push({
      url: "https://connector-gateway.lovable.dev/resend/emails",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
    });
  }
  tentativas.push({
    url: "https://api.resend.com/emails",
    headers: { Authorization: `Bearer ${resendKey}` },
  });

  let ultimoErro = "";
  for (const tentativa of tentativas) {
    const res = await fetch(tentativa.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...tentativa.headers },
      body: JSON.stringify(payload),
    });
    if (res.ok) return;
    ultimoErro = `[${res.status}] ${await res.text()}`;
    console.error(`Falha ao enviar OTP via ${tentativa.url}: ${ultimoErro}`);
  }
  throw new Error(`Não foi possível enviar o e-mail: ${ultimoErro}`);
}
