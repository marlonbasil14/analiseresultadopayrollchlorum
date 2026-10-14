import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { registrarAuditoria } from "@/lib/acesso";

type Alvo = "orcamento_anual" | "indicadores_operacionais";

const CONFIG: Record<Alvo, { titulo: string; colunas: string; exemplo: string }> = {
  orcamento_anual: {
    titulo: "Orçamento anual (base da coluna FY e da projeção)",
    colunas: "unit_slug;mes;orcado[;diretoria_slug]",
    exemplo: "codo;2026-10-01;1250000",
  },
  indicadores_operacionais: {
    titulo: "Venda e produção (Payroll % da Venda / % da Produção)",
    colunas: "unit_slug;mes;venda;producao;producao_unidade",
    exemplo: "codo;2026-09-01;15000000;3200;t",
  },
};

const num = (s: string | undefined) => {
  const t = (s ?? "").trim();
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? n : NaN;
};

function ImportadorCsv({ alvo }: { alvo: Alvo }) {
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const cfg = CONFIG[alvo];

  const importar = async () => {
    setMsg(null);
    const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const dados = linhas.filter((l) => !/^unit_slug/i.test(l)).map((l) => l.split(/[;\t,]/).map((c) => c.trim()));
    const erros: string[] = [];
    const registros = dados.map((c, i) => {
      const mes = /^\d{4}-\d{2}(-\d{2})?$/.test(c[1] ?? "") ? (c[1]!.length === 7 ? `${c[1]}-01` : c[1]!) : null;
      if (!c[0] || !mes) erros.push(`linha ${i + 1}: unit_slug/mes inválidos`);
      if (alvo === "orcamento_anual") {
        const orcado = num(c[2]);
        if (orcado === null || Number.isNaN(orcado)) erros.push(`linha ${i + 1}: orcado inválido`);
        return { unit_slug: c[0]!, mes: mes!, orcado: Math.abs(orcado ?? 0), diretoria_slug: c[3] || null, fonte: "importação CSV /admin", atualizado_em: new Date().toISOString() };
      }
      const venda = num(c[2]);
      const producao = num(c[3]);
      if (Number.isNaN(venda) || Number.isNaN(producao)) erros.push(`linha ${i + 1}: venda/produção inválidas`);
      return { unit_slug: c[0]!, mes: mes!, venda, producao, producao_unidade: c[4] || null, fonte: "importação CSV /admin", atualizado_em: new Date().toISOString() };
    });
    if (!registros.length) return setMsg("Cole ao menos uma linha.");
    if (erros.length) return setMsg(`Corrija antes de importar: ${erros.slice(0, 5).join("; ")}`);
    const { error } = await supabase.from(alvo).upsert(registros as never, { onConflict: "unit_slug,mes" });
    if (error) return setMsg(`Falha na importação: ${error.message}`);
    await registrarAuditoria({ unitSlug: "_consolidado", ciclo: "-", acao: `importacao_${alvo}`, detalhe: `${registros.length} linhas` });
    setMsg(`${registros.length} linha(s) importada(s).`);
    setTexto("");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-bold">{cfg.titulo}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Colunas: <code>{cfg.colunas}</code> · exemplo: <code>{cfg.exemplo}</code>. Linhas repetidas (unidade + mês) são atualizadas.
      </p>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-border bg-background p-2 font-mono text-xs" placeholder={cfg.exemplo} />
      <button type="button" onClick={() => void importar()} className="mt-2 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground">
        Importar
      </button>
      {msg ? <p className="mt-1 text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

export function ImportacoesVisaoCeo() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8">
      <h2 className="text-xl font-bold">Cargas da Visão CEO</h2>
      <p className="mt-1 text-xs text-muted-foreground">Cole o conteúdo do CSV (separador ; ou ,). Visível só para admin.</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <ImportadorCsv alvo="orcamento_anual" />
        <ImportadorCsv alvo="indicadores_operacionais" />
      </div>
    </section>
  );
}
