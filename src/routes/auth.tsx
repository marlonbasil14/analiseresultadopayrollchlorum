import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { supabase } from "@/integrations/supabase/client";
import { DOMINIO_PERMITIDO, emailAutorizado } from "@/lib/acesso";
import { enviarCodigoAcesso, verificarCodigoAcesso } from "@/lib/otp.functions";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso restrito · Payroll Intelligence Chlorum" },
      {
        name: "description",
        content:
          "Área de acesso do Payroll Intelligence da Chlorum Solutions para registrar análises mensais de folha.",
      },
      { property: "og:title", content: "Acesso restrito · Payroll Intelligence Chlorum" },
      {
        property: "og:description",
        content: "Receba um código de 6 dígitos no seu e-mail Chlorum para registrar as análises mensais de folha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand";

function AuthPage() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [digitos, setDigitos] = useState<string[]>(["", "", "", "", "", ""]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [reenviarEm, setReenviarEm] = useState(0);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (reenviarEm <= 0) return;
    const t = setTimeout(() => setReenviarEm((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [reenviarEm]);

  useEffect(() => {
    let ativo = true;
    const checar = async (sessionEmail: string | null | undefined, temSessao: boolean) => {
      if (!temSessao || !ativo) return;
      if (!emailAutorizado(sessionEmail)) {
        await supabase.auth.signOut();
        setErro(`Acesso restrito a colaboradores Chlorum (${DOMINIO_PERMITIDO}).`);
        return;
      }
      navigate({ to: "/" });
    };
    supabase.auth.getSession().then(({ data }) => {
      void checar(data.session?.user.email, Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void checar(s?.user.email, Boolean(s));
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function enviarCodigo() {
    const alvo = email.trim().toLowerCase();
    setErro(null);
    if (!emailAutorizado(alvo)) {
      setErro(
        `Não conseguimos identificar esse e-mail como um endereço Chlorum. Verifique se digitou seu e-mail corporativo (${DOMINIO_PERMITIDO}).`,
      );
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: alvo,
      options: { shouldCreateUser: true },
    });
    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o código agora. Tente novamente em alguns instantes.");
      return;
    }
    setDigitos(["", "", "", "", "", ""]);
    setEtapa("codigo");
    setReenviarEm(30);
    setTimeout(() => refs.current[0]?.focus(), 50);
  }

  async function confirmar(codigo: string) {
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo,
      type: "email",
    });
    setCarregando(false);
    if (error) {
      const expirado = /expired/i.test(error.message);
      setErro(
        expirado
          ? "Esse código expirou. Clique em 'Reenviar código' para receber um novo."
          : "Código inválido. Verifique os números e tente novamente.",
      );
      return;
    }
    navigate({ to: "/" });
  }

  function aplicarDigito(i: number, valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (!limpo) {
      setDigitos((p) => p.map((d, idx) => (idx === i ? "" : d)));
      return;
    }
    setDigitos((p) => {
      const novo = [...p];
      limpo.split("").forEach((c, k) => {
        if (i + k < 6) novo[i + k] = c;
      });
      const proximo = Math.min(i + limpo.length, 5);
      setTimeout(() => refs.current[proximo]?.focus(), 0);
      const completo = novo.join("");
      if (completo.length === 6 && !novo.includes("")) void confirmar(completo);
      return novo;
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <ChlorumLogo className="h-9 w-auto" />

      {etapa === "email" ? (
        <>
          <h1 className="mt-6 text-2xl font-extrabold">Faça login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso restrito a colaboradores Chlorum. Informe seu e-mail corporativo e enviamos um
            código de 6 dígitos.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void enviarCodigo();
            }}
          >
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              E-mail corporativo
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`seu.nome${DOMINIO_PERMITIDO}`}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={carregando || !email}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              {carregando ? "Enviando código…" : "Enviar código"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-extrabold">Digite o código</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para <strong>{email.trim().toLowerCase()}</strong>. Ele
            chega em instantes — confira também a caixa de spam.
          </p>

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void confirmar(digitos.join(""));
            }}
          >
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Código de verificação
            </label>
            <div className="flex gap-2">
              {digitos.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={6}
                  value={d}
                  onChange={(e) => aplicarDigito(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digitos[i] && i > 0) refs.current[i - 1]?.focus();
                  }}
                  className="h-12 w-full rounded-lg border border-border bg-background text-center text-lg font-bold tabular-nums outline-none focus:border-brand"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">O código expira em 10 minutos.</p>
            <button
              type="submit"
              disabled={carregando || digitos.join("").length < 6}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              {carregando ? "Confirmando…" : "Confirmar"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={reenviarEm > 0 || carregando}
              onClick={() => void enviarCodigo()}
              className="font-semibold text-brand underline disabled:text-muted-foreground disabled:no-underline"
            >
              {reenviarEm > 0
                ? `Reenviar em 0:${String(reenviarEm).padStart(2, "0")}`
                : "Reenviar código"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEtapa("email");
                setErro(null);
              }}
              className="font-semibold text-muted-foreground underline"
            >
              ← Usar outro e-mail
            </button>
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        E-mails de outros domínios são bloqueados automaticamente, e o acesso aos dados continua
        liberado apenas para quem tem papel cadastrado pelo admin.
      </p>

      {erro ? <p className="mt-3 text-xs font-semibold text-unfavorable">{erro}</p> : null}
    </main>
  );
}
