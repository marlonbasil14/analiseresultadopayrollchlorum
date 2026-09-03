import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  CICLOS_DISPONIVEIS,
  CICLO_ATUAL,
  dadosDoCiclo,
  ehCiclo,
  type CicloChave,
} from "@/data/ciclos";

const CHAVE_STORAGE = "payroll-ciclo";

/**
 * Ciclo ativo da aplicação.
 * Prioridade: `?ciclo=` na URL → localStorage → CICLO_ATUAL.
 */
export function useCicloAtivo() {
  const navigate = useNavigate();
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown> | undefined,
  });
  const [salvo, setSalvo] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSalvo(window.localStorage.getItem(CHAVE_STORAGE));
    } catch {
      /* localStorage indisponível */
    }
  }, []);

  const daUrl = search?.["ciclo"];
  const ciclo: CicloChave = ehCiclo(daUrl) ? daUrl : ehCiclo(salvo) ? salvo : CICLO_ATUAL;
  const dados = dadosDoCiclo(ciclo);

  const trocar = (novo: CicloChave) => {
    try {
      window.localStorage.setItem(CHAVE_STORAGE, novo);
    } catch {
      /* localStorage indisponível */
    }
    setSalvo(novo);
    void navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({ ...prev, ciclo: novo }),
    });
  };

  return {
    ciclo,
    dados,
    trocar,
    ciclos: CICLOS_DISPONIVEIS,
    CICLO: dados.CICLO,
    CICLO_LABEL: dados.CICLO_LABEL,
  };
}
