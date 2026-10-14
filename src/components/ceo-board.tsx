import { AlertTriangle, ArrowUpRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MarcacaoContabil } from "@/components/marcacao-contabil";
import {
  leituraCeo,
  totalCeo,
  resumoPlano,
  estiloCeo,
  itensCeo,
  textoCeo,
  type LinhaCeo,
  type ReviewCeo,
  type PeriodoCeo,
  type MetricaCeo,
} from "@/lib/ceo-model";
import { pct } from "@/lib/format";

export const dinheiroCeo = (v: number) =>
  `R$ ${(Math.abs(v) / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} mi`;
export function SeloCeo({ p, hc = false }: { p: number; hc?: boolean }) {
  const c = estiloCeo(hc && p > 0 ? Math.max(2, p) : p);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold ${c.selo}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.barra}`} />
      {c.leitura}
    </span>
  );
}
export function AjudaCeo({ texto, label = "Mais informações" }: { texto: string; label?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={label}>
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[calc(100vw-2rem)] text-sm leading-relaxed">
        {texto}
      </PopoverContent>
    </Popover>
  );
}
export function SegmentoCeo<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(v) => {
        if (options.some((o) => o.value === v)) onChange(v as T);
      }}
      className="w-fit max-w-full justify-start rounded-md bg-muted p-1"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="h-8 px-3 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
export function QuadroCeo({
  linhas,
  periodo,
  metrica,
  reportado,
  reviews,
  onOpen,
  limite,
  print = false,
}: {
  linhas: LinhaCeo[];
  periodo: PeriodoCeo;
  metrica: MetricaCeo;
  reportado: boolean;
  reviews: ReviewCeo[];
  onOpen: (l: LinhaCeo) => void;
  print?: boolean;
  limite?: number | undefined;
}) {
  const total = totalCeo(linhas);
  const visiveis = limite ? linhas.slice(0, limite) : linhas;
  const nome = (l: LinhaCeo) => (
    <div className="flex items-center gap-1">
      <span className="min-w-0">{l.nome}</span>
      {l.revisar && (
        <span
          title="Revisar: estorno no mês ou HC acima do orçado com desvio YTD superior a 10%."
          aria-label="Revisar valores"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </span>
      )}
      {!!l.ajuste && (
        <span className="print:hidden">
          <AjudaCeo
            label={`ajustado: contábil — ${l.nome}`}
            texto={`Desvio reportado: ${dinheiroCeo(leituraCeo(l, periodo, true).desvio)} (${pct(leituraCeo(l, periodo, true).percentual)}). Efeito contábil: ${dinheiroCeo(l.ajuste)} (${l.ajuste < 0 ? "estorno" : "custo"}). Desvio ajustado: ${dinheiroCeo(leituraCeo(l, periodo).desvio)} (${pct(leituraCeo(l, periodo).percentual)}).`}
          />
          <span className="block text-[10px] font-normal text-muted-foreground">
            ajustado: contábil
          </span>
        </span>
      )}
    </div>
  );
  const cells = (l: LinhaCeo) => {
    const v = leituraCeo(l, periodo, reportado),
      p = resumoPlano(reviews.find((r) => r.unit_slug === l.chave));
    if (metrica === "hc")
      return (
        <>
          <td>{l.hcR}</td>
          <td>{l.hcO}</td>
          <td>
            {l.hcR - l.hcO > 0 ? "+" : ""}
            {l.hcR - l.hcO}
          </td>
          <td>
            <SeloCeo p={l.hcR - l.hcO} hc />
          </td>
        </>
      );
    if (metrica === "planos")
      return (
        <>
          <td>
            <SeloCeo p={v.percentual} />
            <span className="mt-1 block text-[11px] text-muted-foreground">{p["status"]}</span>
          </td>
          <td>
            <span className="block max-w-48 truncate" title={p.motivo}>
              {p.motivo || "Sem justificativa"}
            </span>
          </td>
          <td>
            <span className="block max-w-48 truncate" title={p["acao"]}>
              {p["acao"] || "Não informada"}
            </span>
          </td>
          <td>
            <span className="block max-w-32 truncate">{p["responsavel"]}</span>
          </td>
        </>
      );
    return (
      <>
        <td>{l.fyRF === null && periodo === "fy" ? "Não carregado" : dinheiroCeo(v.real)}</td>
        <td>{l.fyO === null && periodo === "fy" ? "Não carregado" : dinheiroCeo(v.orcado)}</td>
        <td className={estiloCeo(v.percentual).texto}>
          {dinheiroCeo(v.desvio)}
          <span className="mt-0.5 block text-xs">{pct(v.percentual)}</span>
        </td>
        <td>
          <SeloCeo p={v.percentual} />
        </td>
      </>
    );
  };
  const headings =
    metrica === "hc"
      ? ["Nome", "HC real", "HC orçado", "Delta", "Selo"]
      : metrica === "planos"
        ? ["Nome", "Desvio / status", "Motivo", "Ação proposta", "Responsável"]
        : ["Nome", "Real", "Orçado", "Delta", "Selo"];
  return (
    <>
      <div className={print ? "ceo-table" : "ceo-table hidden md:block"}>
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr>
              {headings.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr
                key={l.chave}
                onClick={metrica === "planos" ? () => onOpen(l) : undefined}
                className={metrica === "planos" ? "cursor-pointer hover:bg-muted/60" : ""}
              >
                <td className="font-semibold">
                  {metrica === "planos" ? (
                    <Button
                      variant="link"
                      className="h-auto max-w-full justify-start whitespace-normal p-0 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(l);
                      }}
                    >
                      {nome(l)}
                      <ArrowUpRight className="shrink-0" />
                    </Button>
                  ) : (
                    nome(l)
                  )}
                </td>
                {cells(l)}
              </tr>
            ))}
          </tbody>
          {metrica !== "planos" && (
            <tfoot>
              <tr>
                <td className="font-bold">Total</td>
                {cells(total)}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {!print && (
        <div className="divide-y divide-border md:hidden">
          {[...visiveis, ...(metrica === "planos" ? [] : [total])].map((l) => {
            const v = leituraCeo(l, periodo, reportado),
              p = resumoPlano(reviews.find((r) => r.unit_slug === l.chave));
            return (
              <article key={l.chave} className="py-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-bold">
                  {nome(l)}
                  <SeloCeo
                    p={metrica === "hc" ? l.hcR - l.hcO : v.percentual}
                    hc={metrica === "hc"}
                  />
                </div>
                {metrica === "planos" ? (
                  <>
                    <p className="truncate text-sm">{p.motivo || "Sem justificativa"}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {p["acao"] || "Ação não informada"}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span>
                        {p["status"]} · {p["responsavel"]}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Abrir plano de ${l.nome}`}
                        onClick={() => onOpen(l)}
                      >
                        <ArrowUpRight />
                      </Button>
                    </div>
                  </>
                ) : (
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Real</dt>
                      <dd className="mt-1 font-bold">
                        {metrica === "hc" ? l.hcR : dinheiroCeo(v.real)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Orçado</dt>
                      <dd className="mt-1 font-bold">
                        {metrica === "hc" ? l.hcO : dinheiroCeo(v.orcado)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Delta</dt>
                      <dd className="mt-1 font-bold">
                        {metrica === "hc" ? (
                          l.hcR - l.hcO
                        ) : (
                          <>
                            {dinheiroCeo(v.desvio)}
                            <span className="block text-xs">{pct(v.percentual)}</span>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
export function PlanoCeo({
  linha,
  review,
  ciclo,
  prazo,
  isAdmin,
  onClose,
}: {
  linha: LinhaCeo | null;
  review?: ReviewCeo | undefined;
  ciclo: string;
  prazo: string;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const p = resumoPlano(review);
  const bloco = (titulo: string, texto: string) => (
    <section className="border-t border-border py-5">
      <h3 className="mb-2 text-sm font-bold">{titulo}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {texto || "Não informado"}
      </p>
    </section>
  );
  return (
    <Sheet
      open={!!linha}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle>{linha?.nome}</SheetTitle>
          <SheetDescription>
            {p["status"]} · {p["responsavel"]} · Prazo do ciclo: {prazo}
          </SheetDescription>
        </SheetHeader>
        {bloco("Parecer Gente e Gestão", textoCeo(review?.parecer_diretoria))}
        {bloco(
          "Ofensores",
          [
            ...itensCeo(review?.ofensores_diretoria).map((o) =>
              [textoCeo(o["conta"]), textoCeo(o["resumo"])].filter(Boolean).join(" — "),
            ),
            ...p.justificativas.map((j) =>
              [textoCeo(j["conta"]), textoCeo(j["ofensor"]) || textoCeo(j["texto"])]
                .filter(Boolean)
                .join(" — "),
            ),
          ].join("\n"),
        )}
        {bloco("Justificativa do BP", textoCeo(review?.justificativa_bp))}
        {bloco("Ação proposta", p["acao"])}
        <section className="border-t border-border py-5">
          <h3 className="mb-3 text-sm font-bold">Plano de ação e conclusão</h3>
          {p.planos.length ? (
            p.planos.map((x, i) => (
              <div key={i} className="mb-4 text-sm">
                <p className="font-semibold">{textoCeo(x["item"])}</p>
                <p className="mt-1 text-muted-foreground">
                  {textoCeo(x["responsavel"]) || p["responsavel"]} · {textoCeo(x["prazo"]) || prazo}{" "}
                  · {textoCeo(x["status"]) || "Pendente"}
                </p>
                <p className="mt-1 whitespace-pre-line">
                  {textoCeo(x["conclusao"]) || textoCeo(x["observacao"])}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Plano não informado</p>
          )}
          <p className="text-xs text-muted-foreground">
            Status: {review?.status || "Pendente"} · Fluxo: {review?.fluxo_status || "Pendente"}
          </p>
        </section>
        {isAdmin && linha && <MarcacaoContabil slug={linha.chave} ciclo={ciclo} compacto />}
      </SheetContent>
    </Sheet>
  );
}
