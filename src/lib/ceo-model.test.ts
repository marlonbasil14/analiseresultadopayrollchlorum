import { describe, expect, it } from "bun:test";
import { leituraCeo, totalCeo, resumoPlano, estiloCeo, type LinhaCeo, type ReviewCeo } from "./ceo-model";

const linha: LinhaCeo = { chave: "teste", nome: "Teste", mesR: 120, mesO: 100, ytdR: 900, ytdO: 800, hcR: 11, hcO: 10, ajuste: 30, fyO: 1200, fyRF: 1300, venda: null, producao: null };
describe("CEO financial presentation", () => {
  it("defaults to adjusted values without modifying source", () => {
    expect(leituraCeo(linha, "mes").real).toBe(90);
    expect(leituraCeo(linha, "ytd").desvio).toBe(70);
    expect(leituraCeo(linha, "mes", true).desvio).toBe(20);
    expect(leituraCeo(linha, "fy").real).toBe(1270);
    expect(linha.mesR).toBe(120);
  });
  it("totals every row independently of the visible top five", () => {
    const linhas = Array.from({ length: 8 }, () => ({ ...linha }));
    expect(totalCeo(linhas).ytdR).toBe(7200);
    expect(leituraCeo(totalCeo(linhas), "ytd").real).toBe(6960);
  });
  it("keeps the shared thresholds with gray neutral presentation", () => {
    expect(estiloCeo(-2).leitura).toBe("Favorável");
    expect(estiloCeo(0.6).leitura).toBe("Em linha");
    expect(estiloCeo(0.6).texto).toBe("text-muted-foreground");
    expect(estiloCeo(2).leitura).toBe("Desfavorável");
  });
  it("provides compact plan status and responsible owner", () => {
    expect(resumoPlano().status).toBe("Sem justificativa");
    const r: ReviewCeo = { unit_slug: "teste", parecer_diretoria: null, justificativa_bp: "Motivo", ofensores_diretoria: [], justificativas: [], acoes_recomendadas_bp: [], acoes_recomendadas_diretoria: [], plano_de_acao: [{ item: "Ação", status: "concluido", responsavel: "Responsável" }], status: "aberto", fluxo_status: "rascunho", autor: null };
    expect(resumoPlano(r).status).toBe("Concluído");
    expect(resumoPlano(r).responsavel).toBe("Responsável");
  });
});