import { supabase } from "@/integrations/supabase/client";

/** Desvio (em %) a partir do qual a justificativa da BP é obrigatória. */
export const THRESHOLD_JUSTIFICATIVA = 5;

const FERIADOS_2026 = [
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-04-03",
  "2026-04-21",
  "2026-05-01",
  "2026-06-04",
  "2026-09-07",
  "2026-10-12",
  "2026-11-02",
  "2026-11-15",
  "2026-11-20",
  "2026-12-25",
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** 7º dia útil do mês seguinte ao ciclo (AAAA-MM), ignorando fins de semana e feriados nacionais. */
export function setimoDiaUtil(ciclo: string): Date {
  const [ano, mes] = ciclo.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(ano, mes, 1));
  let uteis = 0;
  while (uteis < 7) {
    const dia = d.getUTCDay();
    if (dia !== 0 && dia !== 6 && !FERIADOS_2026.includes(iso(d))) uteis += 1;
    if (uteis < 7) d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

export function diasAteVencimento(ciclo: string) {
  const alvo = setimoDiaUtil(ciclo);
  const hoje = new Date();
  const diff = Math.ceil(
    (alvo.getTime() - Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())) /
      86400000,
  );
  return { alvo, dias: diff, atrasado: diff < 0 };
}

export const FLUXO_LABEL: Record<string, string> = {
  pendente: "Pendente",
  rascunho: "Rascunho",
  enviado: "Enviado",
  consolidado: "Consolidado",
};

export async function registrarAuditoria(input: {
  unitSlug: string;
  ciclo: string;
  acao: string;
  detalhe?: string | null;
  autorNome?: string | null;
}) {
  await supabase.from("review_audit_log").insert({
    unit_slug: input.unitSlug,
    ciclo: input.ciclo,
    acao: input.acao,
    detalhe: input.detalhe ?? null,
    autor_nome: input.autorNome ?? null,
  });
}
