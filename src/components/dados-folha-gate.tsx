import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { IdentificacaoTela } from "@/components/identificacao-tela";
import { carregarDadosFolha, limparDadosFolha, type LinhaDados } from "@/data/ciclos";
import { supabase } from "@/integrations/supabase/client";
import { useIdentidade } from "@/lib/identificacao";

/** Rotas que não exibem números da folha. */
const PUBLICAS = ["/cartilha"];

/**
 * Exige login e carrega do banco os números que o usuário pode ver
 * (RLS por unidade) antes de renderizar as telas.
 */
export function DadosFolhaGate({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { estado, identidade } = useIdentidade();
  const ok = estado === "ok" && !!identidade;

  const q = useQuery({
    queryKey: ["dados-folha", "leitura-desvio-v2", identidade?.email],
    enabled: ok,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ciclo_unidade_dados")
        .select("ciclo, unit_slug, payload");
      if (error) throw error;
      return (data ?? []) as LinhaDados[];
    },
  });

  if (PUBLICAS.some((p) => path.startsWith(p))) return <>{children}</>;
  if (estado === "carregando") return null;
  if (!ok) {
    limparDadosFolha();
    return <IdentificacaoTela />;
  }
  if (q.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando os números do ciclo…</p>
      </main>
    );
  }
  if (q.isError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os números agora. Verifique sua conexão e tente de novo.
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Tentar de novo
        </button>
      </main>
    );
  }
  carregarDadosFolha(q.data);
  if (q.data.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Seu acesso ainda não tem unidades liberadas. Fale com o admin de Gente e Gestão.
        </p>
      </main>
    );
  }
  return <>{children}</>;
}

/** Aviso padrão para telas restritas à visão da companhia (admin). */
export function SemPermissao({ texto }: { texto?: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold">Acesso restrito</h1>
      <p className="text-sm text-muted-foreground">
        {texto ?? "Esta visão é exclusiva do admin. Você vê apenas as unidades liberadas para o seu acesso."}
      </p>
      <a href="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Voltar ao início
      </a>
    </main>
  );
}
