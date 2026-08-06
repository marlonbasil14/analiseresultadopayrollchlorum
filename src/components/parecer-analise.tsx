import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CICLO, CICLO_LABEL, type Unidade } from "@/data/payroll";
import { subcontasDe } from "@/data/subcontas";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

type Ofensor = { conta: string; resumo: string };
type AcaoBP = { acao: string; responsavel: string; prazo: string };
type PlanoItem = {
  item: string;
  responsavel: string;
  prazo: string;
  status: "pendente" | "em_andamento" | "concluido";
};

const STATUS_LABEL: Record<PlanoItem["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const STATUS_CLASSE: Record<PlanoItem["status"], string> = {
  pendente: "bg-muted text-muted-foreground",
  em_andamento: "bg-brand/15 text-brand",
  concluido: "bg-favorable/15 text-favorable",
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function ofensoresSugeridos(u: Unidade): Ofensor[] {
  return [...u.desvioPorConta]
    .filter((c) => !c.favoravel)
    .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
    .slice(0, 2)
    .map((c) => {
      const sub = subcontasDe(u.slug, c.conta, "actual");
      const principal = sub && sub.length > 0 ? sub[0] : null;
      return {
        conta: c.conta,
        resumo: principal
          ? `Desvio de ${brl(c.valor)} no mês. Maior componente: ${principal.conta} (${brl(principal.valor)}).`
          : `Desvio de ${brl(c.valor)} no mês. Composição de sub-contas indisponível para este ciclo.`,
      };
    });
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

export function ParecerAnalise({ unidade }: { unidade: Unidade }) {
  const qc = useQueryClient();
  const [ciclo] = useState(CICLO);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const autenticado = Boolean(userId);

  const { data, isLoading } = useQuery({
    enabled: autenticado,
    queryKey: ["review", unidade.slug, ciclo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_monthly_review")
        .select("*")
        .eq("unit_slug", unidade.slug)
        .eq("ciclo", ciclo)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [justificativa, setJustificativa] = useState("");
  const [autor, setAutor] = useState("");
  const [status, setStatus] = useState("aberto");
  const [acoes, setAcoes] = useState<AcaoBP[]>([]);
  const [plano, setPlano] = useState<PlanoItem[]>([]);
  const [salvo, setSalvo] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setJustificativa(data.justificativa_bp ?? "");
    setAutor(data.autor ?? "");
    setStatus(data.status ?? "aberto");
    setAcoes(asArray<AcaoBP>(data.acoes_recomendadas_bp));
    setPlano(asArray<PlanoItem>(data.plano_de_acao));
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () => {
      const { data: sessao } = await supabase.auth.getSession();
      const uid = sessao.session?.user.id;
      if (!uid) throw new Error("Sessão expirada. Entre novamente para salvar.");
      const { error } = await supabase.from("unit_monthly_review").upsert(
        {
          unit_slug: unidade.slug,
          ciclo,
          justificativa_bp: justificativa,
          acoes_recomendadas_bp: acoes,
          plano_de_acao: plano,
          status,
          autor: autor || null,
          autor_id: uid,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: "unit_slug,ciclo" },
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      setSalvo("Análise do ciclo salva.");
      await qc.invalidateQueries({ queryKey: ["review", unidade.slug, ciclo] });
    },
    onError: (e: Error) => setSalvo(`Não foi possível salvar: ${e.message}`),
  });

  if (userId === null) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">Parecer da Diretoria &amp; sua análise</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conteúdo interno restrito. Entre com seu e-mail corporativo para consultar o parecer da
            diretoria e registrar a análise do ciclo.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Entrar para ver
          </Link>
        </div>
      </section>
    );
  }


  const parecer = data?.parecer_diretoria ?? null;
  const ofensores = parecer
    ? asArray<Ofensor>(data?.ofensores_diretoria)
    : ofensoresSugeridos(unidade);
  const acoesDiretoria = asArray<AcaoBP>(data?.acoes_recomendadas_diretoria);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">Parecer da Diretoria &amp; sua análise</h2>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
          Ciclo {CICLO_LABEL}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Parecer da diretoria (somente leitura) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Parecer da Diretoria de Gente &amp; Remuneração
          </p>
          {parecer ? (
            <p className="mt-3 text-sm leading-relaxed">{parecer}</p>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-border bg-muted/50 p-3 text-sm text-muted-foreground">
              Aguardando consolidação do relatório mensal de Gente &amp; Remuneração. Enquanto isso,
              os ofensores abaixo são um rascunho gerado a partir dos próprios dados do ciclo.
            </p>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {parecer ? "Ofensores" : "Ofensores sugeridos automaticamente"}
          </p>
          <ul className="mt-2 space-y-2">
            {ofensores.map((o) => (
              <li key={o.conta} className="rounded-lg border border-border p-3 text-sm">
                <span className="font-semibold">{o.conta}</span>
                <p className="mt-1 text-xs text-muted-foreground">{o.resumo}</p>
              </li>
            ))}
            {ofensores.length === 0 ? (
              <li className="text-xs text-muted-foreground">Sem ofensores relevantes no ciclo.</li>
            ) : null}
          </ul>

          {acoesDiretoria.length > 0 ? (
            <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ações recomendadas pela diretoria
              </p>
              <ul className="mt-2 space-y-2">
                {acoesDiretoria.map((a, i) => (
                  <li key={i} className="rounded-lg border border-border p-3 text-sm">
                    {a.acao}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.responsavel} · prazo {a.prazo}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {/* Formulário da BP */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sua análise (BP / líder de operação)
          </p>

          <label className="mt-3 block text-sm font-semibold" htmlFor="justificativa">
            O que você encontrou
          </label>
          <textarea
            id="justificativa"
            rows={5}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Causa-raiz identificada depois de rodar o roteiro de 6 perguntas e o drill-down por sub-conta."
            className={`mt-2 ${inputCls}`}
          />

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-semibold">Ações recomendadas</p>
            <button
              type="button"
              onClick={() => setAcoes((p) => [...p, { acao: "", responsavel: "", prazo: "" }])}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {acoes.map((a, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={a.acao}
                  onChange={(e) =>
                    setAcoes((p) => p.map((x, j) => (j === i ? { ...x, acao: e.target.value } : x)))
                  }
                  placeholder="Ação"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setAcoes((p) => p.filter((_, j) => j !== i))}
                  aria-label="Remover ação"
                  className="justify-self-end rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-2 sm:grid-cols-2 sm:col-span-2">
                  <input
                    value={a.responsavel}
                    onChange={(e) =>
                      setAcoes((p) =>
                        p.map((x, j) => (j === i ? { ...x, responsavel: e.target.value } : x)),
                      )
                    }
                    placeholder="Responsável"
                    className={inputCls}
                  />
                  <input
                    type="date"
                    value={a.prazo}
                    onChange={(e) =>
                      setAcoes((p) => p.map((x, j) => (j === i ? { ...x, prazo: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            ))}
            {acoes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma ação registrada ainda.</p>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-semibold">Plano de ação</p>
            <button
              type="button"
              onClick={() =>
                setPlano((p) => [
                  ...p,
                  { item: "", responsavel: "", prazo: "", status: "pendente" },
                ])
              }
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {plano.map((it, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <input
                    value={it.item}
                    onChange={(e) =>
                      setPlano((p) => p.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))
                    }
                    placeholder="Item do plano"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setPlano((p) => p.filter((_, j) => j !== i))}
                    aria-label="Remover item"
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <input
                    value={it.responsavel}
                    onChange={(e) =>
                      setPlano((p) =>
                        p.map((x, j) => (j === i ? { ...x, responsavel: e.target.value } : x)),
                      )
                    }
                    placeholder="Responsável"
                    className={inputCls}
                  />
                  <input
                    type="date"
                    value={it.prazo}
                    onChange={(e) =>
                      setPlano((p) => p.map((x, j) => (j === i ? { ...x, prazo: e.target.value } : x)))
                    }
                    className={inputCls}
                  />
                  <select
                    value={it.status}
                    onChange={(e) =>
                      setPlano((p) =>
                        p.map((x, j) =>
                          j === i ? { ...x, status: e.target.value as PlanoItem["status"] } : x,
                        ),
                      )
                    }
                    className={inputCls}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASSE[it.status]}`}
                >
                  {STATUS_LABEL[it.status]}
                </span>
              </div>
            ))}
            {plano.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum item de plano registrado ainda.</p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Seu nome"
              className={inputCls}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="aberto">Aberto</option>
              <option value="em_revisao">Em revisão</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>

          <button
            type="button"
            disabled={salvar.isPending || isLoading}
            onClick={() => {
              setSalvo(null);
              salvar.mutate();
            }}
            className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {salvar.isPending ? "Salvando…" : "Salvar análise do ciclo"}
          </button>

          {salvo ? <p className="mt-2 text-xs text-muted-foreground">{salvo}</p> : null}
          {data?.atualizado_em ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Última atualização por {data.autor ?? "—"} em{" "}
              {new Date(data.atualizado_em).toLocaleString("pt-BR")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
