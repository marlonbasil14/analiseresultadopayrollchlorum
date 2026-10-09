import { useEffect, useState } from "react";
import { KeyRound, LogIn, LogOut, ShieldAlert } from "lucide-react";

import { PILogo } from "@/components/pi-logo";
import { useCicloAtivo } from "@/lib/ciclo";
import { recarregarIdentidade, sair, useIdentidade } from "@/lib/identificacao";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand";
const btnCls =
  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground disabled:opacity-50";

const DOMINIO = "@chlorumsolutions.com";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 60_000;
const MIN_SENHA = 10;

function forcaSenha(s: string) {
  let p = 0;
  if (s.length >= MIN_SENHA) p++;
  if (s.length >= 14) p++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) p++;
  if (/\d/.test(s)) p++;
  if (/[^A-Za-z0-9]/.test(s)) p++;
  if (p <= 2) return { nivel: 1, rotulo: "Fraca", cor: "bg-unfavorable" };
  if (p <= 3) return { nivel: 2, rotulo: "Média", cor: "bg-brand-light" };
  return { nivel: 3, rotulo: "Forte", cor: "bg-favorable" };
}

function Moldura({ children }: { children: React.ReactNode }) {
  const { CICLO_LABEL } = useCicloAtivo();
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-12 text-navy-foreground">
      <div className="w-full max-w-md">
        <PILogo variant="reverse" size="md" />
        <div className="mt-8 rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-6">
          <p className="eyebrow">Payroll Intelligence · {CICLO_LABEL}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [falhas, setFalhas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState(0);
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    if (bloqueadoAte <= Date.now()) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [bloqueadoAte]);

  const restante = Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000));
  const bloqueado = restante > 0;

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });
    setEnviando(false);
    if (error) {
      const n = falhas + 1;
      if (n >= MAX_TENTATIVAS) {
        setFalhas(0);
        setBloqueadoAte(Date.now() + BLOQUEIO_MS);
        setAgora(Date.now());
      } else setFalhas(n);
      setErro("E-mail ou senha incorretos.");
      return;
    }
    setFalhas(0);
    await recarregarIdentidade();
  };

  return (
    <form onSubmit={entrar}>
      <h1 className="mt-2 text-2xl font-extrabold">Entrar</h1>
      <p className="mt-2 text-sm text-navy-foreground/70">Acesso restrito a colaboradores convidados.</p>
      <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="email">
        E-mail corporativo
      </label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={`voce${DOMINIO}`}
        className={`mt-2 ${inputCls}`}
      />
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide" htmlFor="senha">
        Senha
      </label>
      <input
        id="senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={`mt-2 ${inputCls}`}
      />
      {erro ? <p className="mt-2 text-xs text-red-300">{erro}</p> : null}
      {bloqueado ? (
        <p className="mt-2 text-xs text-red-300">
          Muitas tentativas seguidas. Tente novamente em {restante}s.
        </p>
      ) : null}
      <button type="submit" disabled={enviando || bloqueado || !email.trim() || !senha} className={btnCls}>
        <LogIn className="h-4 w-4" /> {enviando ? "Entrando…" : "Entrar"}
      </button>
      <p className="mt-5 text-xs text-navy-foreground/70">
        Primeiro acesso ou esqueceu a senha? Peça ao time de Gente e Gestão (Marlon ou Antonio) — a
        senha temporária é entregue por eles.
      </p>
    </form>
  );
}

function CriarSenha() {
  const [senha, setSenha] = useState("");
  const [conf, setConf] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const f = forcaSenha(senha);
  const valida = senha.length >= MIN_SENHA && senha === conf;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valida) return;
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({
      password: senha,
      data: { must_change_password: false },
    });
    setEnviando(false);
    if (error) {
      setErro(
        /pwned|leak|compromis|weak/i.test(error.message)
          ? "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra."
          : "Não foi possível salvar a senha. Tente outra.",
      );
      return;
    }
    await supabase.auth.refreshSession();
    await recarregarIdentidade();
  };

  return (
    <form onSubmit={salvar}>
      <h1 className="mt-2 text-2xl font-extrabold">Crie sua senha</h1>
      <p className="mt-2 text-sm text-navy-foreground/70">
        No primeiro acesso, troque a senha temporária por uma senha só sua (mínimo {MIN_SENHA}{" "}
        caracteres).
      </p>
      <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="nova">
        Nova senha
      </label>
      <input
        id="nova"
        type="password"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={`mt-2 ${inputCls}`}
      />
      {senha ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1.5 flex-1 rounded-full ${n <= f.nivel ? f.cor : "bg-navy-foreground/15"}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-navy-foreground/70">{f.rotulo}</span>
        </div>
      ) : null}
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide" htmlFor="conf">
        Confirme a nova senha
      </label>
      <input
        id="conf"
        type="password"
        autoComplete="new-password"
        value={conf}
        onChange={(e) => setConf(e.target.value)}
        className={`mt-2 ${inputCls}`}
      />
      {senha && senha.length < MIN_SENHA ? (
        <p className="mt-2 text-xs text-red-300">Use pelo menos {MIN_SENHA} caracteres.</p>
      ) : null}
      {conf && senha !== conf ? <p className="mt-2 text-xs text-red-300">As senhas não conferem.</p> : null}
      {erro ? <p className="mt-2 text-xs text-red-300">{erro}</p> : null}
      <button type="submit" disabled={!valida || enviando} className={btnCls}>
        <KeyRound className="h-4 w-4" /> {enviando ? "Salvando…" : "Salvar senha e entrar"}
      </button>
      <button
        type="button"
        onClick={() => void sair()}
        className="mt-3 w-full text-xs font-semibold text-navy-foreground/70 underline"
      >
        Sair
      </button>
    </form>
  );
}

function SemAcesso() {
  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold">
        <ShieldAlert className="h-6 w-6" /> Seu acesso ainda não foi liberado
      </h1>
      <p className="mt-2 text-sm text-navy-foreground/70">
        Peça ao time de Gente e Gestão para liberar o seu perfil.
      </p>
      <button type="button" onClick={() => void sair()} className={btnCls}>
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </>
  );
}

/** Porta de entrada: login por e-mail + senha (acesso somente por convite). */
export function IdentificacaoTela() {
  const { estado } = useIdentidade();
  return (
    <Moldura>
      {estado === "carregando" ? (
        <p className="mt-6 text-sm text-navy-foreground/70">Verificando sua sessão…</p>
      ) : estado === "trocar-senha" ? (
        <CriarSenha />
      ) : estado === "sem-acesso" ? (
        <SemAcesso />
      ) : (
        <Login />
      )}
    </Moldura>
  );
}
