import { useEffect, useState } from "react";

import { dadosDoCiclo } from "@/data/ciclos";

export type Identidade = {
  nome: string;
  /** slug da unidade, ou "admin" (visão geral) / "diretoria" (visão diretoria). */
  escopo: string;
};

const CHAVE = "payroll-identidade";

export const ESCOPOS_ESPECIAIS = [
  { valor: "admin", rotulo: "Admin / Visão Geral" },
  { valor: "diretoria", rotulo: "Visão Diretoria" },
];

export function opcoesEscopo() {
  return [
    ...dadosDoCiclo().unidadesOrdenadas.map((u) => ({ valor: u.slug, rotulo: u.nome })),
    ...ESCOPOS_ESPECIAIS,
  ];
}

export function rotuloEscopo(escopo: string) {
  return opcoesEscopo().find((o) => o.valor === escopo)?.rotulo ?? escopo;
}

function ler(): Identidade | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const v = JSON.parse(bruto) as Identidade;
    return v?.nome ? v : null;
  } catch {
    return null;
  }
}

const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((f) => f());
}

export function salvarIdentidade(identidade: Identidade) {
  window.localStorage.setItem(CHAVE, JSON.stringify(identidade));
  avisar();
}

export function limparIdentidade() {
  window.localStorage.removeItem(CHAVE);
  avisar();
}

/** Identificação simples por nome + unidade (sem senha, sem bloqueio de acesso). */
export function useIdentidade() {
  const [identidade, setIdentidade] = useState<Identidade | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const sincronizar = () => setIdentidade(ler());
    sincronizar();
    setPronto(true);
    ouvintes.add(sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      ouvintes.delete(sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  return {
    pronto,
    identidade,
    nome: identidade?.nome ?? null,
    escopo: identidade?.escopo ?? null,
    salvar: salvarIdentidade,
    limpar: limparIdentidade,
  };
}
