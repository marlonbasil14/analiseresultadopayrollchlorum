import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Progresso da jornada "Primeiros passos", guardado em user_metadata.jornada. */
export type Jornada = {
  video?: boolean;
  guia?: boolean;
  /** Ciclos (AAAA-MM) em que o relatório foi aberto. */
  relatorio?: string[];
  /** Ciclos (AAAA-MM) em que a página da unidade (ou /admin) foi visitada. */
  unidade?: string[];
  /** Ciclos em que os 4 passos foram concluídos (ISO da conclusão). */
  concluidaEm?: Record<string, string>;
  boasVindasVista?: boolean;
  /** Guia rápido da unidade: recolhido pela pessoa (true) ou aberto (false). */
  guiaRapidoRecolhido?: boolean;
  /** Já enviou ao menos uma análise. */
  primeiroEnvio?: boolean;
};

export type Passo = "video" | "guia" | "relatorio" | "unidade";

type Estado = { carregado: boolean; existe: boolean; jornada: Jornada };

let atual: Estado = { carregado: false, existe: false, jornada: {} };
let iniciado = false;
const ouvintes = new Set<(e: Estado) => void>();

function publicar(e: Estado) {
  atual = e;
  ouvintes.forEach((f) => f(e));
}

let carregando: Promise<void> | null = null;

function carregar() {
  carregando = (async () => {
    const { data } = await supabase.auth.getUser();
  const j = data.user?.user_metadata?.["jornada"] as Jornada | undefined;
    publicar({ carregado: !!data.user, existe: !!j, jornada: j ?? {} });
  })();
  return carregando;
}

/** Garante que o progresso salvo foi lido antes de qualquer gravação (evita sobrescrever). */
async function garantir() {
  iniciar();
  await carregando;
}

function iniciar() {
  if (iniciado) return;
  iniciado = true;
  void carregar();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => void carregar(), 0);
  });
}

async function gravar(prox: Jornada) {
  publicar({ carregado: true, existe: true, jornada: prox });
  await supabase.auth.updateUser({ data: { jornada: prox } });
}

export function passosConcluidos(j: Jornada, ciclo: string) {
  return {
    video: !!j.video,
    guia: !!j.guia,
    relatorio: !!j.relatorio?.includes(ciclo),
    unidade: !!j.unidade?.includes(ciclo),
  };
}

export async function marcarPasso(passo: Passo, ciclo: string) {
  await garantir();
  const j = { ...atual.jornada };
  if (passo === "video" || passo === "guia") {
    if (j[passo]) return;
    j[passo] = true;
  } else {
    const lista = j[passo] ?? [];
    if (lista.includes(ciclo)) return;
    j[passo] = [...lista, ciclo];
  }
  const p = passosConcluidos(j, ciclo);
  if (p.video && p.guia && p.relatorio && p.unidade) {
    j.concluidaEm = { ...(j.concluidaEm ?? {}), [ciclo]: new Date().toISOString() };
  }
  await gravar(j);
}

export async function atualizarJornada(parcial: Partial<Jornada>) {
  await garantir();
  await gravar({ ...atual.jornada, ...parcial });
}

export function useJornada(ciclo: string) {
  const [estado, setEstado] = useState<Estado>(atual);
  useEffect(() => {
    iniciar();
    setEstado(atual);
    ouvintes.add(setEstado);
    return () => {
      ouvintes.delete(setEstado);
    };
  }, []);
  const passos = passosConcluidos(estado.jornada, ciclo);
  const feitos = Object.values(passos).filter(Boolean).length;
  return { ...estado, passos, feitos, concluida: feitos === 4 };
}

/** "2026-09" → "09/26". */
export function mmaa(ciclo: string) {
  const [ano, mes] = ciclo.split("-");
  return `${mes}/${ano?.slice(2)}`;
}

export function tituloRelatorio(ciclo: string) {
  return `Relatório com Pré-Análise do Resultado de ${mmaa(ciclo)} de Gente e Gestão`;
}

export const SUBTITULO_RELATORIO =
  "Leitura prévia do resultado do mês, preparada por Gente e Gestão · PDF em nova aba";
