import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { supabase } from "@/integrations/supabase/client";
import { DOMINIO_PERMITIDO, emailAutorizado } from "@/lib/acesso";

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
        content: "Receba um link de acesso no seu e-mail Chlorum para registrar as análises mensais de folha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

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

  async function enviarLink() {
    const alvo = email.trim().toLowerCase();
    setErro(null);
    if (!emailAutorizado(alvo)) {
      setErro(`Acesso restrito a colaboradores Chlorum. Use seu e-mail ${DOMINIO_PERMITIDO}.`);
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: alvo,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });
    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o link agora. Tente novamente em alguns instantes.");
      return;
    }
    setEnviado(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <ChlorumLogo className="h-9 w-auto" />
      <h1 className="mt-6 text-2xl font-extrabold">Acesso interno</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        As análises mensais de folha são restritas ao time de Gente &amp; Remuneração e às BPs das
        unidades. Informe seu e-mail corporativo ({DOMINIO_PERMITIDO}) e enviamos um link de acesso.
      </p>

      {enviado ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Link enviado para {email.trim().toLowerCase()}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Abra o e-mail e clique no link para entrar. Ele vale por tempo limitado e só funciona
            neste navegador.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="mt-4 text-xs font-semibold text-brand underline"
          >
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void enviarLink();
          }}
        >
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`seu.nome${DOMINIO_PERMITIDO}`}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={carregando || !email}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {carregando ? "Enviando link…" : "Receber link de acesso"}
          </button>
        </form>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        E-mails de outros domínios são bloqueados automaticamente, e o acesso aos dados continua
        liberado apenas para quem tem papel cadastrado pelo admin.
      </p>

      {erro ? <p className="mt-3 text-xs font-semibold text-unfavorable">{erro}</p> : null}
    </main>
  );
}
