import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { urlRelatorioPdf } from "@/lib/folha.functions";

export const Route = createFileRoute("/relatorio-pdf/$ciclo")({
  head: () => ({
    meta: [
      { title: "Relatório em PDF — Payroll Intelligence" },
      { name: "description", content: "Abrindo o relatório de análise orçamentária do ciclo." },
      { property: "og:title", content: "Relatório em PDF — Payroll Intelligence" },
      { property: "og:description", content: "Relatório de análise orçamentária do ciclo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AbrirPdf,
});

function AbrirPdf() {
  const { ciclo } = Route.useParams();
  const [erro, setErro] = useState(false);
  useEffect(() => {
    urlRelatorioPdf({ data: { ciclo } })
      .then((r) => window.location.replace(r.url))
      .catch(() => setErro(true));
  }, [ciclo]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">
        {erro ? "Não foi possível abrir o relatório. Confirme seu login e tente de novo." : "Abrindo o relatório…"}
      </p>
    </main>
  );
}
