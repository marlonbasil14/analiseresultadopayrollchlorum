import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { CATALOGO_UNIDADES } from "@/data/ciclos";
import { supabase } from "@/integrations/supabase/client";

export type Identidade = {
  nome: string;
  /** "admin" (visão geral) ou slugs das unidades separados por vírgula. */
  escopo: string;
  email: string;
  role: "admin" | "bp" | "lider" | "executivo";
  unidades: string[];
};

export type EstadoAcesso = "carregando" | "anonimo" | "trocar-senha" | "sem-acesso" | "ok";

export const ESCOPOS_ESPECIAIS = [
  { valor: "admin", rotulo: "Admin / Visão Geral" },
  { valor: "diretoria", rotulo: "Visão Diretoria" },
];

export function opcoesEscopo() {
  return [
    ...[...CATALOGO_UNIDADES].sort((a, b) => parseInt(a.ordem, 10) - parseInt(b.ordem, 10)).map((u) => ({ valor: u.slug, rotulo: u.nome })),
    ...ESCOPOS_ESPECIAIS,
  ];
}

export function rotuloUnidade(slug: string) {
  return CATALOGO_UNIDADES.find((u) => u.slug === slug)?.nome ?? slug;
}

export function rotuloEscopo(escopo: string) {
  if (escopo === "admin") return "Admin";
  const lista = escopo.split(",").filter(Boolean);
  return `BP · ${lista.map(rotuloUnidade).join(", ")}`;
}

type Snapshot = { estado: EstadoAcesso; identidade: Identidade | null };

let atual: Snapshot = { estado: "carregando", identidade: null };
let iniciado = false;
const ouvintes = new Set<(s: Snapshot) => void>();

function publicar(s: Snapshot) {
  atual = s;
  ouvintes.forEach((f) => f(s));
}

async function resolver(session: Session | null) {
  if (!session) return publicar({ estado: "anonimo", identidade: null });
  if (session.user.user_metadata?.["must_change_password"] === true) {
    return publicar({ estado: "trocar-senha", identidade: null });
  }
  await supabase.rpc("claim_my_role");
  const { data } = await supabase
    .from("user_roles")
    .select("nome, role, unidades, email")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!data) return publicar({ estado: "sem-acesso", identidade: null });
  const email = session.user.email ?? data.email;
  const unidades = (data.unidades ?? []) as string[];
  // Executivo: leitura total (vê tudo), mas sem painel admin nem edição.
  const isAdmin = data.role === "admin" || data.role === "executivo" || unidades.includes("*");
  publicar({
    estado: "ok",
    identidade: {
      nome: data.nome?.trim() || email.split("@")[0]!,
      escopo: isAdmin ? "admin" : unidades.join(","),
      email,
      role: data.role as Identidade["role"],
      unidades,
    },
  });
}

export async function recarregarIdentidade() {
  const { data } = await supabase.auth.getSession();
  await resolver(data.session);
}

function iniciar() {
  if (iniciado) return;
  iniciado = true;
  void recarregarIdentidade();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      setTimeout(() => void resolver(session), 0);
    }
  });
}

export async function sair() {
  await supabase.auth.signOut();
  publicar({ estado: "anonimo", identidade: null });
}

/** Identidade derivada da sessão + user_roles (acesso por convite). */
export function useIdentidade() {
  const [snap, setSnap] = useState<Snapshot>(atual);

  useEffect(() => {
    iniciar();
    setSnap(atual);
    ouvintes.add(setSnap);
    return () => {
      ouvintes.delete(setSnap);
    };
  }, []);

  const identidade = snap.identidade;
  return {
    pronto: snap.estado !== "carregando",
    estado: snap.estado,
    identidade,
    nome: identidade?.nome ?? null,
    escopo: identidade?.escopo ?? null,
    isAdmin: identidade?.role === "admin",
    isExecutivo: identidade?.role === "executivo",
    /** Vê todas as unidades e a visão consolidada (admin, executivo ou "*"). */
    veTudo: identidade?.escopo === "admin",
    limpar: sair,
  };
}
