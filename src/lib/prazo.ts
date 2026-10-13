import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { setimoDiaUtil } from "@/lib/acesso";

/** Fuso oficial dos prazos (Brasil sem horário de verão desde 2019: UTC−3). */
const OFFSET_SP = "-03:00";

export type CicloConfig = { ciclo: string; prazo_justificativas: string; encerrado: boolean };

export type Prazo = {
  /** Data do prazo, AAAA-MM-DD. */
  data: string;
  dataBr: string;
  /** Dias de calendário (São Paulo) até o prazo; 0 = vence hoje; negativo = passou. */
  dias: number;
  /** Só verdadeiro depois de 23h59min59s do dia do prazo, em São Paulo. */
  atrasado: boolean;
  venceHoje: boolean;
  encerrado: boolean;
  origem: "configurado" | "regra 7º dia útil";
  /** Texto curto: "no prazo — vence em 15/10 (2 dias)", "vence hoje", "atrasado desde 15/10". */
  texto: string;
};

function hojeSP(agora: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

const br = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const brCurto = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Fim do dia (23h59min59s, São Paulo) de uma data AAAA-MM-DD já passou? */
export function prazoVencido(dataIso: string, agora: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dataIso)) return false;
  return agora.getTime() > new Date(`${dataIso.slice(0, 10)}T23:59:59.999${OFFSET_SP}`).getTime();
}

/** Função única de prazo do ciclo: config do banco ou fallback "7º dia útil do mês seguinte". */
export function calcularPrazo(ciclo: string, config?: CicloConfig | null, agora: Date = new Date()): Prazo {
  const data = config?.prazo_justificativas ?? setimoDiaUtil(ciclo).toISOString().slice(0, 10);
  const encerrado = config?.encerrado ?? false;
  const dias = Math.round(
    (Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hojeSP(agora)}T00:00:00Z`)) / 86400000,
  );
  const atrasado = !encerrado && prazoVencido(data, agora);
  const venceHoje = !encerrado && dias === 0;
  const texto = encerrado
    ? `ciclo encerrado — prazo era ${br(data)}`
    : atrasado
      ? `atrasado — prazo venceu em ${br(data)}`
      : venceHoje
        ? `vence hoje (${br(data)})`
        : `no prazo — vence em ${brCurto(data)} (${dias} dia${dias === 1 ? "" : "s"})`;
  return {
    data,
    dataBr: br(data),
    dias,
    atrasado,
    venceHoje,
    encerrado,
    origem: config ? "configurado" : "regra 7º dia útil",
    texto,
  };
}

export const cicloConfigQuery = {
  queryKey: ["ciclo-config"] as const,
  queryFn: async (): Promise<CicloConfig[]> => {
    const { data } = await supabase
      .from("ciclo_config")
      .select("ciclo, prazo_justificativas, encerrado");
    return (data ?? []) as CicloConfig[];
  },
  staleTime: 60_000,
};

export function usePrazoCiclo(ciclo: string): Prazo {
  const { data } = useQuery(cicloConfigQuery);
  return calcularPrazo(ciclo, data?.find((c) => c.ciclo === ciclo));
}
