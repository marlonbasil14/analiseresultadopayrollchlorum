import { useState } from "react";
import { UserRound } from "lucide-react";

import { PILogo } from "@/components/pi-logo";
import { useCicloAtivo } from "@/lib/ciclo";
import { opcoesEscopo, salvarIdentidade } from "@/lib/identificacao";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand";

/** Tela de identificação simples: nome livre + unidade/visão. Não bloqueia nada, só registra autoria. */
export function IdentificacaoTela({ aoConcluir }: { aoConcluir?: () => void }) {
  const { CICLO_LABEL } = useCicloAtivo();
  const [nome, setNome] = useState("");
  const [escopo, setEscopo] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-12 text-navy-foreground">
      <div className="w-full max-w-md">
        <PILogo variant="reverse" size="md" />
        <div className="mt-8 rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-6">
          <p className="eyebrow">Payroll Intelligence · {CICLO_LABEL}</p>
          <h1 className="mt-2 text-2xl font-extrabold">Como você quer se identificar?</h1>
          <p className="mt-2 text-sm text-navy-foreground/70">
            Sem senha. Serve apenas para registrar a autoria das análises que você preencher.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide" htmlFor="nome">
            Seu nome
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Vitória"
            className={`mt-2 ${inputCls} text-foreground`}
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide" htmlFor="escopo">
            Unidade / visão
          </label>
          <select
            id="escopo"
            value={escopo}
            onChange={(e) => setEscopo(e.target.value)}
            className={`mt-2 ${inputCls} text-foreground`}
          >
            <option value="">Selecione…</option>
            {opcoesEscopo().map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!nome.trim() || !escopo}
            onClick={() => {
              salvarIdentidade({ nome: nome.trim(), escopo });
              aoConcluir?.();
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-light-foreground disabled:opacity-50"
          >
            <UserRound className="h-4 w-4" /> Entrar no ambiente
          </button>
        </div>
      </div>
    </main>
  );
}
