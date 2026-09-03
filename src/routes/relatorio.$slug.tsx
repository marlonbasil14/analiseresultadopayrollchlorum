import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { RelatorioUnidade, type ReviewRow } from "@/components/relatorio-unidade";
import { useCicloAtivo } from "@/lib/ciclo";
import { supabase } from "@/integrations/supabase/client";
import { BotoesExportar } from "@/components/botoes-exportar";

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
  const { ciclo, CICLO_LABEL, dados } = useCicloAtivo();
  const unidade = dados.getUnidade(slug);

  const { data } = useQuery({
    enabled: Boolean(unidade),
    queryKey: ["review", slug, ciclo],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("*")
        .eq("unit_slug", slug)
        .eq("ciclo", ciclo)
        .maybeSingle();
      return (data ?? null) as ReviewRow;
    },
  });

  if (!unidade) return <Aviso texto="Unidade não encontrada." />;

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
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>
      <div className="mt-4 print:hidden">
        <BotoesExportar
          compacto
          pacote={[{ unidade, review: data ?? null }]}
          nomeBase={`Relatorio-Payroll-${unidade.nome.replace(/\s+/g, "")}`}
          titulo={`Relatório de Payroll — ${unidade.nome}`}
          autor={data?.autor ?? null}
        />
        <p className="mt-2 text-xs text-muted-foreground">Ciclo {CICLO_LABEL}</p>
      </div>
      <div className="mt-4">
        <RelatorioUnidade unidade={unidade} review={data ?? null} cicloLabel={CICLO_LABEL} />
      </div>
    </main>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <p className="text-sm text-muted-foreground">{texto}</p>
    </main>
  );
}
