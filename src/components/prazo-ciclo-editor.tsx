import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { registrarAuditoria } from "@/lib/acesso";
import { cicloConfigQuery, usePrazoCiclo } from "@/lib/prazo";

/** Campo do admin: prazo de consolidação das justificativas do ciclo ativo. */
export function PrazoCicloEditor({
  ciclo,
  cicloLabel,
  autorNome,
}: {
  ciclo: string;
  cicloLabel: string;
  autorNome: string | null;
}) {
  const qc = useQueryClient();
  const prazo = usePrazoCiclo(ciclo);
  const [valor, setValor] = useState(prazo.data);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setValor(prazo.data), [prazo.data]);

  const salvar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ciclo_config").upsert({
        ciclo,
        prazo_justificativas: valor,
        atualizado_em: new Date().toISOString(),
        atualizado_por: autorNome,
      });
      if (error) throw error;
      await registrarAuditoria({
        unitSlug: "_ciclo",
        ciclo,
        acao: "prazo_alterado",
        detalhe: `Prazo de consolidação das justificativas: ${prazo.dataBr} → ${valor.split("-").reverse().join("/")}`,
        autorNome,
      });
    },
    onSuccess: async () => {
      setMsg("Prazo salvo.");
      await qc.invalidateQueries({ queryKey: cicloConfigQuery.queryKey });
      await qc.invalidateQueries({ queryKey: ["auditoria"] });
    },
    onError: (e: Error) => setMsg(`Não foi possível salvar: ${e.message}`),
  });

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="eyebrow-light">Ciclo {cicloLabel}</p>
        <label htmlFor="prazo-ciclo" className="mt-1 flex items-center gap-2 font-bold">
          <CalendarClock className="h-4 w-4" /> Prazo de consolidação das justificativas
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          {prazo.texto} · {prazo.origem === "configurado" ? "definido no painel" : "regra padrão: 7º dia útil do mês seguinte"} · atraso só após 23h59 (Brasília)
        </p>
      </div>
      <input
        id="prazo-ciclo"
        type="date"
        value={valor}
        onChange={(e) => {
          setMsg(null);
          setValor(e.target.value);
        }}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={!valor || valor === prazo.data || salvar.isPending}
        onClick={() => salvar.mutate()}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
      >
        {salvar.isPending ? "Salvando…" : "Salvar prazo"}
      </button>
      {msg ? <p className="w-full text-xs text-muted-foreground" role="status">{msg}</p> : null}
    </div>
  );
}
