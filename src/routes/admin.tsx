import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlarmClock, FileText, History } from "lucide-react";

import { BotoesExportar } from "@/components/botoes-exportar";
import { PILogo } from "@/components/pi-logo";
import { IdentificacaoTela } from "@/components/identificacao-tela";
import { useCicloAtivo } from "@/lib/ciclo";
import { SeletorCiclo } from "@/components/seletor-ciclo";
import { supabase } from "@/integrations/supabase/client";
import { pct } from "@/lib/format";
import { FLUXO_LABEL, diasAteVencimento } from "@/lib/acesso";
import { useIdentidade } from "@/lib/identificacao";
import type { ReviewLike } from "@/lib/exportar";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Painel do admin · Payroll Intelligence Chlorum" },
      {
        name: "description",
        content:
          "Consolidação das 8 unidades, status do fluxo, prazo do 7º dia útil e exportação do pacote para o FP&A.",
      },
      { property: "og:title", content: "Painel do admin · Payroll Intelligence Chlorum" },
      {
        property: "og:description",
        content: "Status por unidade, prazo do 7º dia útil e geração do relatório consolidado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const BADGE: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  rascunho: "bg-brand/15 text-brand",
  enviado: "bg-brand text-brand-foreground",
  consolidado: "bg-favorable/15 text-favorable",
};

type Review = {
  unit_slug: string;
  ciclo: string;
  fluxo_status: string;
  autor: string | null;
  enviado_em: string | null;
} & ReviewLike;

function AdminPage() {
  const qc = useQueryClient();
  const { ciclo: CICLO, CICLO_LABEL, dados } = useCicloAtivo();
  const unidadesOrdenadas = dados.unidadesOrdenadas;
  const { pronto, identidade, limpar } = useIdentidade();
  const prazo = diasAteVencimento(CICLO);
  const [confirmando, setConfirmando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reviews = useQuery({
    queryKey: ["reviews", CICLO],
    queryFn: async () => {
      const { data } = await supabase.from("unit_monthly_review").select("*").eq("ciclo", CICLO);
      return (data ?? []) as unknown as Review[];
    },
  });

  const historico = useQuery({
    queryKey: ["historico-ciclos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("ciclo, fluxo_status")
        .order("ciclo", { ascending: false });
      return data ?? [];
    },
  });

  const auditoria = useQuery({
    queryKey: ["auditoria"],
    queryFn: async () => {
      const { data } = await supabase
        .from("review_audit_log")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const porSlug = (slug: string) => reviews.data?.find((r) => r.unit_slug === slug) ?? null;
  const prontas = unidadesOrdenadas.filter((u) => {
    const st = porSlug(u.slug)?.fluxo_status;
    return st === "enviado" || st === "consolidado";
  });
  const todasProntas = prontas.length === unidadesOrdenadas.length;

  const pacote = unidadesOrdenadas.map((u) => ({ unidade: u, review: porSlug(u.slug) }));

  const consolidarTudo = useMutation({
    mutationFn: async () => {
      const agora = new Date().toISOString();
      for (const u of unidadesOrdenadas) {
        const { error } = await supabase
          .from("unit_monthly_review")
          .update({
            fluxo_status: "consolidado",
            consolidado_em: agora,
            consolidado_por: identidade?.nome ?? null,
          })
          .eq("unit_slug", u.slug)
          .eq("ciclo", CICLO);
        if (error) throw error;
        await supabase.from("review_audit_log").insert({
          unit_slug: u.slug,
          ciclo: CICLO,
          acao: "consolidado",
          autor_nome: identidade?.nome ?? null,
        });
      }
    },
    onSuccess: async () => {
      setConfirmando(false);
      setMsg("Relatório consolidado gerado — as 8 unidades foram marcadas como consolidadas.");
      await qc.invalidateQueries({ queryKey: ["reviews", CICLO] });
      await qc.invalidateQueries({ queryKey: ["auditoria"] });
    },
    onError: (e: Error) => setMsg(`Não foi possível consolidar: ${e.message}`),
  });

  if (!pronto) return null;
  if (!identidade) return <IdentificacaoTela />;

  const ciclosHistorico = Array.from(new Set((historico.data ?? []).map((h) => h.ciclo)));

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <PILogo variant="reverse" size="md" />
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-navy-foreground/70">{identidade.nome}</span>
            <button
              type="button"
              onClick={limpar}
              className="rounded-lg border border-navy-foreground/30 px-3 py-1.5"
            >
              Trocar identificação
            </button>
            <Link to="/" className="uppercase tracking-widest text-navy-foreground/80">
              Voltar
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <p className="eyebrow">Consolidação · {CICLO_LABEL}</p>
          <div className="mt-3">
            <SeletorCiclo variante="reverse" />
          </div>
          <h1 className="mt-2 text-4xl font-extrabold">Painel do admin</h1>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              prazo.atrasado ? "bg-unfavorable text-white" : "bg-brand-light/20 text-navy-foreground"
            }`}
          >
            <AlarmClock className="h-4 w-4" />
            {prazo.atrasado
              ? `Prazo do 7º dia útil vencido em ${prazo.alvo.toLocaleDateString("pt-BR")}`
              : `Faltam ${prazo.dias} dia(s) para o 7º dia útil (${prazo.alvo.toLocaleDateString("pt-BR")})`}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Status das 8 unidades</h2>
          <button
            type="button"
            disabled={!todasProntas}
            onClick={() => {
              setMsg(null);
              setConfirmando(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {todasProntas
              ? "Gerar relatório consolidado"
              : `Gerar relatório consolidado (${prontas.length}/8 unidades prontas)`}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Unidade</th>
                <th className="px-4 py-2">Desvio</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Autoria</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {unidadesOrdenadas.map((u) => {
                const r = porSlug(u.slug);
                const st = r?.fluxo_status ?? "pendente";
                const atrasado = prazo.atrasado && st !== "enviado" && st !== "consolidado";
                return (
                  <tr key={u.slug} className="border-t border-border">
                    <td className="px-4 py-2 font-semibold">{u.nome}</td>
                    <td className="px-4 py-2 tabular-nums">{pct(u.desvioPercentual)}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE[st]}`}>
                        {FLUXO_LABEL[st]}
                      </span>
                      {atrasado ? (
                        <span className="ml-2 rounded-full bg-unfavorable px-2 py-0.5 text-[11px] font-semibold text-white">
                          Atrasado
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {r?.autor ?? "—"}
                      {r?.enviado_em
                        ? ` · enviado ${new Date(r.enviado_em).toLocaleDateString("pt-BR")}`
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        to="/relatorio/$slug"
                        params={{ slug: u.slug }}
                        className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-accent"
                      >
                        Relatório
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {msg ? <p className="mt-3 text-xs text-muted-foreground">{msg}</p> : null}
      </section>

      {confirmando ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar geração do relatório consolidado"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6">
            <h3 className="text-lg font-bold">Confirmar e gerar consolidado</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ao confirmar, as 8 unidades passam para o status consolidado.
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {unidadesOrdenadas.map((u) => {
                const r = porSlug(u.slug);
                const st = r?.fluxo_status ?? "pendente";
                const atrasado = prazo.atrasado && st !== "enviado" && st !== "consolidado";
                return (
                  <li key={u.slug} className="flex justify-between border-b border-border py-1">
                    <span>
                      {u.nome} — {r?.autor ?? "sem autor"}
                    </span>
                    <span className={atrasado ? "text-unfavorable font-semibold" : ""}>
                      {atrasado ? "Atrasado" : FLUXO_LABEL[st]}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={consolidarTudo.isPending}
                onClick={() => consolidarTudo.mutate()}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
              >
                {consolidarTudo.isPending ? "Gerando…" : "Confirmar e gerar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="text-xl font-bold">Pacote para o FP&amp;A</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Mesmos dados estruturados nos três formatos · Material-FPeA-Payroll-{CICLO}
        </p>
        <div className="mt-3">
          <BotoesExportar
            pacote={pacote}
            nomeBase="Material-FPeA-Payroll"
            titulo="Material FP&A — Payroll Chlorum"
            autor={identidade.nome}
          />
        </div>
        <Link
          to="/relatorio-consolidado"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand"
        >
          Abrir relatório consolidado na tela
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <History className="h-5 w-5 text-brand" /> Histórico de ciclos
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
          {ciclosHistorico.map((c) => (
            <li key={c} className="rounded-full border border-border px-3 py-1 font-semibold">
              {c}
              {c === CICLO ? " · atual" : ""}
            </li>
          ))}
          {ciclosHistorico.length === 0 ? (
            <li className="text-muted-foreground">Nenhum ciclo registrado ainda.</li>
          ) : null}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-xl font-bold">Log de auditoria</h2>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {auditoria.data?.map((a) => (
            <li key={a.id} className="border-b border-border py-1">
              {new Date(a.criado_em).toLocaleString("pt-BR")} · {a.autor_nome ?? a.email ?? "—"} ·{" "}
              {a.acao} · {a.unit_slug} ({a.ciclo}) {a.detalhe ? `· ${a.detalhe}` : ""}
            </li>
          ))}
          {auditoria.data?.length === 0 ? <li>Nenhum registro ainda.</li> : null}
        </ul>
      </section>
    </main>
  );
}
