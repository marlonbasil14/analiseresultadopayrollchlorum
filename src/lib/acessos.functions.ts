import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DOMINIO = "@chlorumsolutions.com";
const ALFABETO_MAI = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const ALFABETO_MIN = "abcdefghijkmnpqrstuvwxyz";
const ALFABETO_NUM = "23456789";
const ALFABETO_SIM = "!@#$%*?-_+";
const TODOS = ALFABETO_MAI + ALFABETO_MIN + ALFABETO_NUM + ALFABETO_SIM;

function aleatorio(max: number) {
  const limite = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0]! >= limite);
  return buf[0]! % max;
}

function gerarSenha(tamanho = 14) {
  const chars = [ALFABETO_MAI, ALFABETO_MIN, ALFABETO_NUM, ALFABETO_SIM].map(
    (a) => a[aleatorio(a.length)]!,
  );
  while (chars.length < tamanho) chars.push(TODOS[aleatorio(TODOS.length)]!);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

function normalizarEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@chlorumsolutions\.com$/.test(e)) {
    throw new Error(`Use um e-mail ${DOMINIO}.`);
  }
  return e;
}

type Ctx = { supabase: any; userId: string; claims: { email?: string } };

async function exigirAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) {
    throw new Response("Acesso restrito a administradores", { status: 403 });
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function auditar(admin: any, context: Ctx, acao: string, alvo: string) {
  const hoje = new Date().toISOString().slice(0, 7);
  await admin.from("review_audit_log").insert({
    unit_slug: "acessos",
    ciclo: hoje,
    acao,
    detalhe: alvo,
    user_id: context.userId,
    email: context.claims?.email ?? null,
    autor_nome: context.claims?.email ?? null,
  });
}

async function acharUsuario(admin: any, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("Falha ao consultar usuários.");
    const u = data.users.find((x: any) => x.email?.toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
}

export const listarAcessos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await exigirAdmin(context as Ctx);
    const { data: roles } = await admin
      .from("user_roles")
      .select("email, nome, role, unidades, user_id")
      .order("nome");
    const ultimo = new Map<string, string | null>();
    for (let page = 1; page <= 20; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      data?.users.forEach((u: any) => ultimo.set(u.email?.toLowerCase(), u.last_sign_in_at ?? null));
      if (!data || data.users.length < 200) break;
    }
    return (roles ?? []).map((r: any) => ({
      email: r.email as string,
      nome: (r.nome as string | null) ?? null,
      role: r.role as string,
      unidades: (r.unidades as string[]) ?? [],
      ultimoAcesso: ultimo.get(String(r.email).toLowerCase()) ?? null,
    }));
  });

export const criarAcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().max(255),
        nome: z.string().trim().min(1).max(120),
        perfil: z.enum(["admin", "bp"]),
        unidades: z.array(z.string().max(60)).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await exigirAdmin(context as Ctx);
    const email = normalizarEmail(data.email);
    const unidades = data.perfil === "admin" ? ["*"] : data.unidades;
    if (data.perfil === "bp" && unidades.length === 0) throw new Error("Selecione ao menos uma unidade.");
    const senha = gerarSenha();

    const { error: erroRole } = await admin
      .from("user_roles")
      .upsert({ email, nome: data.nome, role: data.perfil, unidades }, { onConflict: "email" });
    if (erroRole) {
      // índice único é em lower(email); faz update manual
      const { error: e2 } = await admin
        .from("user_roles")
        .update({ nome: data.nome, role: data.perfil, unidades })
        .ilike("email", email);
      const { data: existe } = await admin.from("user_roles").select("id").ilike("email", email);
      if (e2 || !existe?.length) {
        const { error: e3 } = await admin
          .from("user_roles")
          .insert({ email, nome: data.nome, role: data.perfil, unidades });
        if (e3) throw new Error("Não foi possível gravar o perfil.");
      }
    }

    const existente = await acharUsuario(admin, email);
    let userId: string;
    if (existente) {
      const { error } = await admin.auth.admin.updateUserById(existente.id, {
        password: senha,
        email_confirm: true,
        user_metadata: { ...(existente.user_metadata ?? {}), must_change_password: true },
      });
      if (error) throw new Error("Não foi possível atualizar o usuário.");
      userId = existente.id;
    } else {
      const { data: criado, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { must_change_password: true },
      });
      if (error || !criado.user) {
        await admin.from("user_roles").delete().ilike("email", email).is("user_id", null);
        throw new Error("Não foi possível criar o usuário.");
      }
      userId = criado.user.id;
    }
    await admin.from("user_roles").update({ user_id: userId }).ilike("email", email);
    await auditar(admin, context as Ctx, "acesso liberado", `${email} (${data.perfil})`);
    return { email, senha };
  });

export const redefinirSenha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().max(255) }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await exigirAdmin(context as Ctx);
    const email = normalizarEmail(data.email);
    const u = await acharUsuario(admin, email);
    if (!u) throw new Error("Usuário não encontrado.");
    const senha = gerarSenha();
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      password: senha,
      email_confirm: true,
      user_metadata: { ...(u.user_metadata ?? {}), must_change_password: true },
    });
    if (error) throw new Error("Não foi possível redefinir a senha.");
    await auditar(admin, context as Ctx, "senha redefinida", email);
    return { email, senha };
  });

export const removerAcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().max(255) }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await exigirAdmin(context as Ctx);
    const email = normalizarEmail(data.email);
    if (email === String((context as Ctx).claims?.email ?? "").toLowerCase()) {
      throw new Error("Você não pode remover o seu próprio acesso.");
    }
    const { data: alvo } = await admin.from("user_roles").select("role").ilike("email", email);
    if (alvo?.[0]?.role === "admin") {
      const { count } = await admin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("Não é possível remover o último administrador.");
    }
    const u = await acharUsuario(admin, email);
    if (u) {
      const { error } = await admin.auth.admin.deleteUser(u.id);
      if (error) throw new Error("Não foi possível remover o usuário.");
    }
    await admin.from("user_roles").delete().ilike("email", email);
    await auditar(admin, context as Ctx, "acesso removido", email);
    return { ok: true };
  });
