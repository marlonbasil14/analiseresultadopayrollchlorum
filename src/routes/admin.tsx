import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlarmClock, FileText, ShieldCheck } from "lucide-react";

import { ChlorumLogo } from "@/components/chlorum-logo";
import { CICLO, CICLO_LABEL, unidadesOrdenadas } from "@/data/payroll";
import { supabase } from "@/integrations/supabase/client";
import { pct } from "@/lib/format";
import { FLUXO_LABEL, diasAteVencimento, useAcesso, type Papel } from "@/lib/acesso";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Painel do admin · Payroll Intelligence Chlorum" },
      {
        name: "description",
        content:
          "Consolidação das 8 unidades, status do fluxo, papéis de acesso e auditoria das análises mensais de payroll.",
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

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

const BADGE: Record<string, string> = {
  pendente: "bg-muted text-muted-foreground",
  rascunho: "bg-brand/15 text-brand",
  enviado: "bg-brand text-brand-foreground",
  consolidado: "bg-favorable/15 text-favorable",
};

function AdminPage() {
  const qc = useQueryClient();
  const { carregando, autenticado, isAdmin, perfil, email, userId } = useAcesso();
  const prazo = diasAteVencimento(CICLO);

  const reviews = useQuery({
    enabled: Boolean(perfil?.role === "admin"),
    queryKey: ["reviews", CICLO],
    queryFn: async () => {
      const { data } = await supabase.from("unit_monthly_review").select("*").eq("ciclo", CICLO);
      return data ?? [];
    },
  });

  const papeis = useQuery({
    enabled: Boolean(perfil?.role === "admin"),
    queryKey: ["papeis"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*").order("email");
      return data ?? [];
    },
  });

  const auditoria = useQuery({
    enabled: Boolean(perfil?.role === "admin"),
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

  const [novoEmail, setNovoEmail] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoPapel, setNovoPapel] = useState<Papel>("bp");
  const [novasUnidades, setNovasUnidades] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const salvarPapel = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_roles").insert({
        email: novoEmail.trim().toLowerCase(),
        nome: novoNome || null,
        role: novoPapel,
        unidades: novoPapel === "admin" ? ["*"] : novasUnidades,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setMsg("Acesso liberado. A pessoa entra com o Google e o papel é vinculado automaticamente.");
      setNovoEmail("");
      setNovoNome("");
      setNovasUnidades([]);
      await qc.invalidateQueries({ queryKey: ["papeis"] });
    },
    onError: (e: Error) => setMsg(`Não foi possível salvar: ${e.message}`),
  });

  const consolidar = useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase
        .from("unit_monthly_review")
        .update({
          fluxo_status: "consolidado",
          consolidado_em: new Date().toISOString(),
          consolidado_por: email,
          autor_id: userId,
        })
        .eq("unit_slug", slug)
        .eq("ciclo", CICLO);
      if (error) throw error;
      await supabase.from("review_audit_log").insert({
        unit_slug: slug,
        ciclo: CICLO,
        acao: "consolidado",
        user_id: userId!,
        email,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["reviews", CICLO] });
      await qc.invalidateQueries({ queryKey: ["auditoria"] });
    },
  });

  if (carregando) return <Aviso texto="Carregando…" />;
  if (!autenticado) return <Aviso texto="Entre com sua conta Chlorum." login />;
  if (!isAdmin) return <Aviso texto="Área restrita ao perfil admin." />;

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <ChlorumLogo className="text-navy-foreground" />
          <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-navy-foreground/80">
            Voltar
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <p className="eyebrow">Consolidação · {CICLO_LABEL}</p>
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
          <Link
            to="/relatorio-consolidado"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            <FileText className="h-4 w-4" /> Gerar relatório consolidado
          </Link>
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
                const r = reviews.data?.find((x) => x.unit_slug === u.slug);
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
                      {r?.enviado_em ? ` · enviado ${new Date(r.enviado_em).toLocaleDateString("pt-BR")}` : ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        to="/relatorio/$slug"
                        params={{ slug: u.slug }}
                        className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-accent"
                      >
                        Relatório
                      </Link>
                      {st === "enviado" ? (
                        <button
                          type="button"
                          onClick={() => consolidar.mutate(u.slug)}
                          className="ml-2 rounded-lg bg-brand px-2 py-1 text-xs font-semibold text-brand-foreground"
                        >
                          Consolidar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-brand" /> Papéis de acesso
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Liberar acesso</p>
            <div className="mt-3 space-y-2">
              <input
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="e-mail @chlorumsolutions.com"
                className={inputCls}
              />
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome de exibição"
                className={inputCls}
              />
              <select
                value={novoPapel}
                onChange={(e) => setNovoPapel(e.target.value as Papel)}
                className={inputCls}
              >
                <option value="bp">BP</option>
                <option value="lider">Líder da operação</option>
                <option value="admin">Admin (todas as unidades)</option>
              </select>
              {novoPapel !== "admin" ? (
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-3 text-xs">
                  {unidadesOrdenadas.map((u) => (
                    <label key={u.slug} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={novasUnidades.includes(u.slug)}
                        onChange={(e) =>
                          setNovasUnidades((p) =>
                            e.target.checked ? [...p, u.slug] : p.filter((s) => s !== u.slug),
                          )
                        }
                      />
                      {u.nome}
                    </label>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                disabled={!novoEmail || salvarPapel.isPending}
                onClick={() => {
                  setMsg(null);
                  salvarPapel.mutate();
                }}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
              >
                Liberar acesso
              </button>
              {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Pessoas com acesso</p>
            <ul className="mt-3 space-y-2 text-sm">
              {papeis.data?.map((p) => (
                <li key={p.id} className="rounded-lg border border-border p-3">
                  <span className="font-semibold">{p.nome || p.email}</span>{" "}
                  <span className="text-xs uppercase text-brand">{p.role}</span>
                  <p className="text-xs text-muted-foreground">
                    {p.email} · {p.unidades.includes("*") ? "todas as unidades" : p.unidades.join(", ") || "sem unidade"}
                    {p.user_id ? "" : " · aguardando 1º login"}
                  </p>
                </li>
              ))}
              {papeis.data?.length === 0 ? (
                <li className="text-xs text-muted-foreground">Nenhum acesso cadastrado ainda.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-xl font-bold">Log de auditoria</h2>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {auditoria.data?.map((a) => (
            <li key={a.id} className="border-b border-border py-1">
              {new Date(a.criado_em).toLocaleString("pt-BR")} · {a.email ?? "—"} · {a.acao} ·{" "}
              {a.unit_slug} ({a.ciclo}) {a.detalhe ? `· ${a.detalhe}` : ""}
            </li>
          ))}
          {auditoria.data?.length === 0 ? <li>Nenhum registro ainda.</li> : null}
        </ul>
      </section>
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
