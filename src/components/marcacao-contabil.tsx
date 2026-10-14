import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { registrarAuditoria } from "@/lib/acesso";
import { useIdentidade } from "@/lib/identificacao";

/** Linha de review usada para guardar a marcação (unidade = slug; diretoria = "diretoria:<slug>"). */
export function useMarcacoesContabeis(ciclo: string) {
  return useQuery({
    queryKey: ["desvio-contabil", ciclo],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("unit_slug, desvio_contabil, desvio_contabil_valor, desvio_contabil_nota, desvio_contabil_marcado_por")
        .eq("ciclo", ciclo)
        .eq("desvio_contabil", true);
      return data ?? [];
    },
  });
}

export function MarcacaoContabil({ slug, ciclo, compacto }: { slug: string; ciclo: string; compacto?: boolean }) {
  const qc = useQueryClient();
  const { nome, isExecutivo } = useIdentidade();
  const { data } = useQuery({
    queryKey: ["desvio-contabil-item", slug, ciclo],
    queryFn: async () => {
      const { data } = await supabase
        .from("unit_monthly_review")
        .select("desvio_contabil, desvio_contabil_valor, desvio_contabil_nota")
        .eq("unit_slug", slug)
        .eq("ciclo", ciclo)
        .maybeSingle();
      return data;
    },
  });
  const [ativo, setAtivo] = useState(false);
  const [valor, setValor] = useState("");
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setAtivo(data?.desvio_contabil ?? false);
    setValor(data?.desvio_contabil_valor != null ? String(data.desvio_contabil_valor) : "");
    setNota(data?.desvio_contabil_nota ?? "");
  }, [data]);

  const salvar = async () => {
    setMsg(null);
    const v = valor.trim() ? Number(valor.replace(/\./g, "").replace(",", ".")) : null;
    if (ativo && (v === null || !Number.isFinite(v))) return setMsg("Informe o valor do efeito contábil em R$.");
    const campos = {
      desvio_contabil: ativo,
      desvio_contabil_valor: ativo ? v : null,
      desvio_contabil_nota: ativo ? nota.trim() || null : null,
      desvio_contabil_marcado_por: nome ?? null,
      desvio_contabil_marcado_em: new Date().toISOString(),
    };
    const r = data
      ? await supabase.from("unit_monthly_review").update(campos).eq("unit_slug", slug).eq("ciclo", ciclo)
      : await supabase.from("unit_monthly_review").insert({ unit_slug: slug, ciclo, ...campos });
    if (r.error) return setMsg(`Não foi possível salvar: ${r.error.message}`);
    await registrarAuditoria({
      unitSlug: slug,
      ciclo,
      acao: ativo ? "desvio_contabil_marcado" : "desvio_contabil_removido",
      detalhe: ativo ? `Efeito contábil informado${nota.trim() ? " com nota" : ""}` : null,
      autorNome: nome,
    });
    setMsg("Marcação salva.");
    await qc.invalidateQueries({ queryKey: ["desvio-contabil-item", slug, ciclo] });
    await qc.invalidateQueries({ queryKey: ["desvio-contabil", ciclo] });
  };

  const cls = "rounded-lg border border-border bg-background px-2 py-1.5 text-sm";
  return (
    <div className={`rounded-xl border border-border bg-muted/40 ${compacto ? "p-3" : "mt-5 p-4"}`}>
      <label className="flex items-start gap-2 text-sm font-semibold">
        <input type="checkbox" checked={ativo} disabled={isExecutivo} onChange={(e) => setAtivo(e.target.checked)} className="mt-1" />
        Desvio por motivo contábil (não é desvio operacional)
      </label>
      {ativo ? (
        <div className="mt-2 grid gap-2 md:grid-cols-[180px_1fr]">
          <input className={cls} inputMode="decimal" placeholder="Valor (R$)" value={valor} disabled={isExecutivo} onChange={(e) => setValor(e.target.value)} aria-label="Valor do efeito contábil" />
          <input className={cls} placeholder="Nota (ex.: estorno de provisão)" value={nota} disabled={isExecutivo} onChange={(e) => setNota(e.target.value)} aria-label="Nota do efeito contábil" />
        </div>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        Valor positivo = parte do realizado que é efeito contábil (reduz o desvio). Negativo = efeito que aumenta o custo operacional (ex.: estorno).
      </p>
      {!isExecutivo ? (
        <button type="button" onClick={() => void salvar()} className="mt-2 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground">
          Salvar marcação
        </button>
      ) : null}
      {msg ? <p className="mt-1 text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
