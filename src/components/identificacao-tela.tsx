import { useEffect, useState } from "react";
import { MailCheck, UserRound } from "lucide-react";

import { PILogo } from "@/components/pi-logo";
import { useCicloAtivo } from "@/lib/ciclo";
import { opcoesEscopo, salvarIdentidade } from "@/lib/identificacao";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand";

const DOMINIO = "@chlorumsolutions.com";

type Etapa = "verificando" | "email" | "codigo" | "identificacao";

/** Porta de entrada: login por código de e-mail (OTP) seguido da identificação nome + unidade. */
export function IdentificacaoTela({ aoConcluir }: { aoConcluir?: () => void }) {
  const { CICLO_LABEL } = useCicloAtivo();
  const [etapa, setEtapa] = useState<Etapa>("verificando");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [escopo, setEscopo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (ativo) setEtapa(data.session ? "identificacao" : "email");
    });
    return () => {
      ativo = false;
    };
  }, []);

  const enviarCodigo = async () => {
    const limpo = email.trim().toLowerCase();
    if (!limpo.endsWith(DOMINIO)) {
      setErro(`Use seu e-mail corporativo ${DOMINIO}.`);
      return;
    }
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: limpo,
      options: { shouldCreateUser: true },
    });
    setEnviando(false);
    if (error) {
      setErro("Não foi possível enviar o código. Tente novamente.");
      return;
    }
    setEtapa("codigo");
  };

  const validarCodigo = async () => {
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo.trim(),
      type: "email",
    });
    setEnviando(false);
    if (error) {
      setErro("Código inválido ou expirado. Confira o e-mail e tente de novo.");
      return;
    }
    setEtapa("identificacao");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-12 text-navy-foreground">
      <div className="w-full max-w-md">
        <PILogo variant="reverse" size="md" />
        <div className="mt-8 rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-6">
          <p className="eyebrow">Payroll Intelligence · {CICLO_LABEL}</p>

          {etapa === "verificando" ? (
            <p className="mt-6 text-sm text-navy-foreground/70">Verificando sua sessão…</p>
          ) : null}

          {etapa === "email" ? (
            <>
              <h1 className="mt-2 text-2xl font-extrabold">Entre com seu e-mail corporativo</h1>
              <p className="mt-2 text-sm text-navy-foreground/70">
                Enviaremos um código de 6 dígitos para o seu e-mail {DOMINIO}. Sem senha.
              </p>
              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="email">
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`voce${DOMINIO}`}
                className={`mt-2 ${inputCls} text-foreground`}
              />
              {erro ? <p className="mt-2 text-xs text-red-300">{erro}</p> : null}
              <button
                type="button"
                disabled={enviando || !email.trim()}
                onClick={enviarCodigo}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground disabled:opacity-50"
              >
                <MailCheck className="h-4 w-4" /> {enviando ? "Enviando…" : "Enviar código"}
              </button>
            </>
          ) : null}

          {etapa === "codigo" ? (
            <>
              <h1 className="mt-2 text-2xl font-extrabold">Digite o código recebido</h1>
              <p className="mt-2 text-sm text-navy-foreground/70">
                Enviamos um código de 6 dígitos para <strong>{email.trim().toLowerCase()}</strong>.
              </p>
              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="codigo">
                Código de 6 dígitos
              </label>
              <input
                id="codigo"
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`mt-2 ${inputCls} tracking-[0.5em] text-foreground`}
              />
              {erro ? <p className="mt-2 text-xs text-red-300">{erro}</p> : null}
              <button
                type="button"
                disabled={enviando || codigo.length !== 6}
                onClick={validarCodigo}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground disabled:opacity-50"
              >
                {enviando ? "Validando…" : "Validar código"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodigo("");
                  setErro(null);
                  setEtapa("email");
                }}
                className="mt-3 w-full text-xs font-semibold text-navy-foreground/70 underline"
              >
                Usar outro e-mail
              </button>
            </>
          ) : null}

          {etapa === "identificacao" ? (
            <>
              <h1 className="mt-2 text-2xl font-extrabold">Como você quer se identificar?</h1>
              <p className="mt-2 text-sm text-navy-foreground/70">
                Serve para registrar a autoria das análises que você preencher.
              </p>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="nome">
                Seu nome
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Vitória"
                className={`mt-2 ${inputCls} text-foreground`}
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide" htmlFor="escopo">
                Unidade / visão
              </label>
              <select
                id="escopo"
                value={escopo}
                onChange={(e) => setEscopo(e.target.value)}
                className={`mt-2 ${inputCls} text-foreground`}
              >
                <option value="">Selecione…</option>
                {opcoesEscopo().map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!nome.trim() || !escopo}
                onClick={() => {
                  salvarIdentidade({ nome: nome.trim(), escopo });
                  aoConcluir?.();
                }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground disabled:opacity-50"
              >
                <UserRound className="h-4 w-4" /> Entrar no ambiente
              </button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
