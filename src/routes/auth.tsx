import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
        content: "Entre com sua conta Chlorum para registrar e consultar as análises mensais de folha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user.email ?? null;
      if (!data.session) return;
      if (!emailAutorizado(email)) {
        await supabase.auth.signOut();
        setMsg(`Acesso restrito a colaboradores Chlorum (${DOMINIO_PERMITIDO}).`);
        return;
      }
      navigate({ to: "/" });
    });
  }, [navigate]);

  async function entrarComGoogle() {
    setMsg(null);
    setCarregando(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { hd: DOMINIO_PERMITIDO.replace("@", ""), prompt: "select_account" },
      });
      if (result.error) {
        setMsg("Não foi possível entrar com o Google. Tente novamente.");
        return;
      }
      if (result.redirected) return;

      const { data } = await supabase.auth.getSession();
      if (!emailAutorizado(data.session?.user.email)) {
        await supabase.auth.signOut();
        setMsg(`Acesso restrito a colaboradores Chlorum (${DOMINIO_PERMITIDO}).`);
        return;
      }
      navigate({ to: "/" });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <ChlorumLogo className="h-9 w-auto" />
      <h1 className="mt-6 text-2xl font-extrabold">Acesso interno</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        As análises mensais de folha são restritas ao time de Gente &amp; Remuneração e às BPs das
        unidades. Entre com sua conta corporativa Google ({DOMINIO_PERMITIDO}).
      </p>

      <button
        type="button"
        onClick={entrarComGoogle}
        disabled={carregando}
        className="mt-6 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
      >
        {carregando ? "Abrindo o Google…" : "Entrar com Google Chlorum"}
      </button>

      <p className="mt-3 text-xs text-muted-foreground">
        Contas de outros domínios são bloqueadas automaticamente.
      </p>

      {msg ? <p className="mt-3 text-xs font-semibold text-unfavorable">{msg}</p> : null}
    </main>
  );
}
