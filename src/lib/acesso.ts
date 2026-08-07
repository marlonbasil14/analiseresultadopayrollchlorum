import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const DOMINIO_PERMITIDO = "@chlorumsolutions.com";
/** Desvio (em %) a partir do qual a justificativa da BP é obrigatória. */
export const THRESHOLD_JUSTIFICATIVA = 5;

export type Papel = "bp" | "lider" | "admin";

export type Perfil = {
  id: string;
  user_id: string | null;
  email: string;
  nome: string | null;
  role: Papel;
  unidades: string[];
};

export function emailAutorizado(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith(DOMINIO_PERMITIDO));
}

type Sessao = { userId: string; email: string | null } | null;

export function useAcesso() {
  const [sessao, setSessao] = useState<Sessao | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    const aplicar = (s: { user: { id: string; email?: string | undefined } } | null) => {
      if (!ativo) return;
      setSessao(s ? { userId: s.user.id, email: s.user.email ?? null } : null);
    };
    supabase.auth.getSession().then(({ data }) => aplicar(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => aplicar(s));
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const autenticado = Boolean(sessao);

  const perfilQuery = useQuery({
    enabled: autenticado,
    queryKey: ["perfil", sessao?.userId],
    queryFn: async (): Promise<Perfil | null> => {
      const { data: vinculado } = await supabase.rpc("claim_my_role");
      if (vinculado) return vinculado as Perfil;
      const { data } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", sessao!.userId)
        .maybeSingle();
      return (data as Perfil | null) ?? null;
    },
  });

  const perfil = perfilQuery.data ?? null;
  const isAdmin = perfil?.role === "admin";

  return {
    carregando: sessao === undefined || (autenticado && perfilQuery.isLoading),
    autenticado,
    email: sessao?.email ?? null,
    userId: sessao?.userId ?? null,
    perfil,
    isAdmin,
    podeUnidade: (slug: string) =>
      Boolean(perfil && (perfil.role === "admin" || perfil.unidades.includes("*") || perfil.unidades.includes(slug))),
    recarregarPerfil: perfilQuery.refetch,
  };
}

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
  const diff = Math.ceil((alvo.getTime() - Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())) / 86400000);
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
  userId: string;
  email: string | null;
}) {
  await supabase.from("review_audit_log").insert({
    unit_slug: input.unitSlug,
    ciclo: input.ciclo,
    acao: input.acao,
    detalhe: input.detalhe ?? null,
    user_id: input.userId,
    email: input.email,
  });
}
