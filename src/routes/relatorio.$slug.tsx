import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { RelatorioUnidade, type ReviewRow } from "@/components/relatorio-unidade";
import { CICLO, CICLO_LABEL, getUnidade } from "@/data/payroll";
import { supabase } from "@/integrations/supabase/client";
import { useAcesso } from "@/lib/acesso";

export const Route = createFileRoute("/relatorio/$slug")({
  component: RelatorioPage,
  head: () => ({
    meta: [
      { title: "Relatório padrão de payroll · Chlorum Solutions" },
      {
        name: "description",
        content:
          "Relatório mensal padronizado de payroll por unidade, com parecer, ofensores, justificativas e plano de ação para o FP&A.",
      },
      { property: "og:title", content: "Relatório padrão de payroll · Chlorum Solutions" },
      {
        property: "og:description",
        content: "Documento padronizado por unidade enviado ao FP&A no 7º dia útil.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function RelatorioPage() {
  const { slug } = Route.useParams();
  const unidade = getUnidade(slug);
  const { carregando, autenticado, podeUnidade, perfil } = useAcesso();

  const { data } = useQuery({
    enabled: Boolean(unidade) && Boolean(perfil),
    queryKey: ["review", slug, CICLO],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("*")
        .eq("unit_slug", slug)
        .eq("ciclo", CICLO)
        .maybeSingle();
      return (data ?? null) as ReviewRow;
    },
  });

  if (!unidade) return <Aviso texto="Unidade não encontrada." />;
  if (carregando) return <Aviso texto="Carregando…" />;
  if (!autenticado) return <Aviso texto="Entre com sua conta Chlorum para ver o relatório." login />;
  if (!podeUnidade(slug)) return <Aviso texto="Você não tem acesso a esta unidade." />;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <ChlorumLogo className="h-8 w-auto" />
        <div className="flex items-center gap-2">
          <Link
            to="/unidade/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar à unidade
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            <Printer className="h-4 w-4" /> Exportar PDF
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground print:hidden">
        Salve como <code>Relatorio-Payroll-{unidade.nome.replace(/\s+/g, "")}-{CICLO}.pdf</code> · ciclo{" "}
        {CICLO_LABEL}
      </p>
      <div className="mt-4">
        <RelatorioUnidade unidade={unidade} review={data ?? null} />
      </div>
    </main>
  );
}

function Aviso({ texto, login }: { texto: string; login?: boolean }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <p className="text-sm text-muted-foreground">{texto}</p>
      {login ? (
        <Link
          to="/auth"
          className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground"
        >
          Entrar
        </Link>
      ) : null}
    </main>
  );
}
