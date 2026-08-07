import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { supabase } from "@/integrations/supabase/client";
import { useAcesso } from "@/lib/acesso";

export const Route = createFileRoute("/aguardando")({
  component: AguardandoPage,
  head: () => ({
    meta: [
      { title: "Aguardando liberação de acesso · Payroll Intelligence Chlorum" },
      {
        name: "description",
        content:
          "Sua conta Chlorum foi autenticada e está aguardando a liberação de um administrador do Payroll Intelligence.",
      },
      { property: "og:title", content: "Aguardando liberação de acesso · Payroll Intelligence" },
      {
        property: "og:description",
        content: "Um administrador precisa atribuir seu papel e suas unidades antes do primeiro acesso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AguardandoPage() {
  const { email, recarregarPerfil } = useAcesso();

  const bootstrap = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("bootstrap_admin");
      if (error) throw error;
      await recarregarPerfil();
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <ChlorumLogo className="h-9 w-auto" />
      <h1 className="mt-6 text-2xl font-extrabold">Aguardando liberação de acesso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sua conta {email ? <strong>{email}</strong> : null} foi autenticada, mas ainda não tem papel
        atribuído. Um administrador de Gente &amp; Remuneração precisa liberar suas unidades.
      </p>

      <button
        type="button"
        onClick={() => bootstrap.mutate()}
        disabled={bootstrap.isPending}
        className="mt-6 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent disabled:opacity-60"
      >
        Sou o primeiro administrador
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        Disponível apenas enquanto nenhum admin existir no ambiente.
      </p>
      {bootstrap.isError ? (
        <p className="mt-2 text-xs font-semibold text-unfavorable">
          Já existe um administrador — peça a liberação do seu acesso.
        </p>
      ) : null}

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/auth";
        }}
        className="mt-6 text-xs font-semibold text-brand"
      >
        Sair desta conta
      </button>
      <Link to="/" className="mt-2 text-xs text-muted-foreground">
        Voltar à página inicial
      </Link>
    </main>
  );
}
