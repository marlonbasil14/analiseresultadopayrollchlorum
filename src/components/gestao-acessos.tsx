import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, Trash2, UserPlus } from "lucide-react";

import { dadosDoCiclo } from "@/data/ciclos";
import { criarAcesso, listarAcessos, redefinirSenha, removerAcesso } from "@/lib/acessos.functions";
import { rotuloUnidade } from "@/lib/identificacao";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

type Confirmacao = { tipo: "remover" | "redefinir"; email: string } | null;

function Modal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6">
        <h3 className="text-lg font-bold">{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
    >
      <Copy className="h-3.5 w-3.5" /> {ok ? "Copiado" : rotulo}
    </button>
  );
}

export function GestaoAcessos() {
  const qc = useQueryClient();
  const listar = useServerFn(listarAcessos);
  const criar = useServerFn(criarAcesso);
  const redefinir = useServerFn(redefinirSenha);
  const remover = useServerFn(removerAcesso);
  const unidades = dadosDoCiclo().unidadesOrdenadas;

  const [formAberto, setFormAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState<"bp" | "admin">("bp");
  const [sel, setSel] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<{ email: string; senha: string } | null>(null);
  const [confirmar, setConfirmar] = useState<Confirmacao>(null);

  const lista = useQuery({ queryKey: ["acessos"], queryFn: () => listar() });

  const fim = async (r: { email: string; senha: string } | null) => {
    if (r) setSenhaGerada(r);
    await qc.invalidateQueries({ queryKey: ["acessos"] });
    await qc.invalidateQueries({ queryKey: ["auditoria"] });
  };

  const mCriar = useMutation({
    mutationFn: () => criar({ data: { nome, email, perfil, unidades: perfil === "admin" ? [] : sel } }),
    onSuccess: async (r) => {
      setFormAberto(false);
      setNome("");
      setEmail("");
      setSel([]);
      setPerfil("bp");
      await fim(r);
    },
    onError: (e: Error) => setErro(e.message),
  });

  const mAcao = useMutation({
    mutationFn: async (c: NonNullable<Confirmacao>) =>
      c.tipo === "remover"
        ? (await remover({ data: { email: c.email } }), null)
        : await redefinir({ data: { email: c.email } }),
    onSuccess: async (r) => {
      setConfirmar(null);
      await fim(r);
    },
    onError: (e: Error) => {
      setConfirmar(null);
      setErro(e.message);
    },
  });

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const textoPronto = senhaGerada
    ? `Acesso ao Payroll Intelligence: ${url} · usuário: ${senhaGerada.email} · senha temporária: ${senhaGerada.senha}. No primeiro acesso você criará sua própria senha.`
    : "";

  return (
    <section className="mx-auto max-w-6xl px-6 pb-8" aria-labelledby="titulo-acessos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="titulo-acessos" className="text-xl font-bold">
          Acessos
        </h2>
        <button
          type="button"
          onClick={() => {
            setErro(null);
            setFormAberto(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
        >
          <UserPlus className="h-4 w-4" /> Liberar novo acesso
        </button>
      </div>
      {erro && !formAberto ? <p className="mt-2 text-xs text-unfavorable">{erro}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Perfil</th>
              <th className="px-4 py-2">Unidades</th>
              <th className="px-4 py-2">Último acesso</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-xs text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            ) : null}
            {lista.data?.map((a) => (
              <tr key={a.email} className="border-t border-border">
                <td className="px-4 py-2 font-semibold">{a.nome ?? "—"}</td>
                <td className="px-4 py-2 text-xs">{a.email}</td>
                <td className="px-4 py-2 text-xs">{a.role === "admin" ? "Admin" : "BP"}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {a.unidades.includes("*") ? "Todas" : a.unidades.map(rotuloUnidade).join(", ")}
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {a.ultimoAcesso ? new Date(a.ultimoAcesso).toLocaleString("pt-BR") : "Nunca"}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmar({ tipo: "redefinir", email: a.email })}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-accent"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Redefinir senha
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmar({ tipo: "remover", email: a.email })}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-unfavorable hover:bg-accent"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formAberto ? (
        <Modal titulo="Liberar novo acesso">
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setErro(null);
              mCriar.mutate();
            }}
          >
            <label className="block text-xs font-semibold uppercase" htmlFor="ac-nome">
              Nome
            </label>
            <input id="ac-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
            <label className="block text-xs font-semibold uppercase" htmlFor="ac-email">
              E-mail @chlorumsolutions.com
            </label>
            <input
              id="ac-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <label className="block text-xs font-semibold uppercase" htmlFor="ac-perfil">
              Perfil
            </label>
            <select
              id="ac-perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as "bp" | "admin")}
              className={inputCls}
            >
              <option value="bp">BP</option>
              <option value="admin">Admin</option>
            </select>
            <fieldset>
              <legend className="text-xs font-semibold uppercase">Unidades</legend>
              <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                {unidades.map((u) => (
                  <label key={u.slug} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled={perfil === "admin"}
                      checked={perfil === "admin" || sel.includes(u.slug)}
                      onChange={(e) =>
                        setSel((s) => (e.target.checked ? [...s, u.slug] : s.filter((x) => x !== u.slug)))
                      }
                    />
                    {u.nome}
                  </label>
                ))}
              </div>
            </fieldset>
            {erro ? <p className="text-xs text-unfavorable">{erro}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormAberto(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  mCriar.isPending || !nome.trim() || !email.trim() || (perfil === "bp" && sel.length === 0)
                }
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
              >
                {mCriar.isPending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {confirmar ? (
        <Modal titulo={confirmar.tipo === "remover" ? "Remover acesso" : "Redefinir senha"}>
          <p className="mt-2 text-sm text-muted-foreground">
            {confirmar.tipo === "remover"
              ? `Remover o acesso de ${confirmar.email}? A pessoa não conseguirá mais entrar.`
              : `Gerar nova senha temporária para ${confirmar.email}? A senha atual deixa de funcionar.`}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmar(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={mAcao.isPending}
              onClick={() => mAcao.mutate(confirmar)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              {mAcao.isPending ? "Aguarde…" : "Confirmar"}
            </button>
          </div>
        </Modal>
      ) : null}

      {senhaGerada ? (
        <Modal titulo="Senha temporária">
          <p className="mt-2 text-sm">
            Usuário: <strong>{senhaGerada.email}</strong>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-base" data-testid="senha-temporaria">
              {senhaGerada.senha}
            </code>
            <BotaoCopiar texto={senhaGerada.senha} rotulo="Copiar" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Esta senha aparece só agora. Envie por canal privado (Teams); a pessoa criará uma senha
            própria no primeiro acesso.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase">Mensagem pronta</p>
          <p className="mt-1 rounded-lg border border-border p-3 text-xs">{textoPronto}</p>
          <div className="mt-2 flex justify-between">
            <BotaoCopiar texto={textoPronto} rotulo="Copiar mensagem" />
            <button
              type="button"
              onClick={() => setSenhaGerada(null)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
            >
              Fechar
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
