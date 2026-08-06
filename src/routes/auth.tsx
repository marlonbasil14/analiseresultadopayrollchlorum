import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
        content: "Entre para registrar e consultar as análises mensais de folha das unidades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMsg("Cadastro criado. Confirme o e-mail para entrar.");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível concluir.");
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
        unidades.
      </p>

      <form onSubmit={submeter} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail corporativo"
          className={inputCls}
        />
        <input
          type="password"
          required
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
        >
          {modo === "entrar" ? "Entrar" : "Criar acesso"}
        </button>
      </form>

      <button
        type="button"
        onClick={() =>
          lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
        }
        className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
      >
        Continuar com Google
      </button>

      <button
        type="button"
        onClick={() => setModo((m) => (m === "entrar" ? "criar" : "entrar"))}
        className="mt-4 text-xs font-semibold text-brand"
      >
        {modo === "entrar" ? "Não tenho acesso ainda" : "Já tenho acesso"}
      </button>

      {msg ? <p className="mt-3 text-xs text-muted-foreground">{msg}</p> : null}
    </main>
  );
}
