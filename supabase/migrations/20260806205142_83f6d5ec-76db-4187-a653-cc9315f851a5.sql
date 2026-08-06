CREATE TABLE public.unit_monthly_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_slug text NOT NULL,
  ciclo text NOT NULL,
  parecer_diretoria text,
  ofensores_diretoria jsonb NOT NULL DEFAULT '[]'::jsonb,
  acoes_recomendadas_diretoria jsonb NOT NULL DEFAULT '[]'::jsonb,
  justificativa_bp text,
  acoes_recomendadas_bp jsonb NOT NULL DEFAULT '[]'::jsonb,
  plano_de_acao jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'aberto',
  autor text,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_slug, ciclo)
);

GRANT SELECT, INSERT, UPDATE ON public.unit_monthly_review TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_monthly_review TO authenticated;
GRANT ALL ON public.unit_monthly_review TO service_role;

ALTER TABLE public.unit_monthly_review ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura aberta das analises" ON public.unit_monthly_review
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Criacao aberta das analises" ON public.unit_monthly_review
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Atualizacao aberta das analises" ON public.unit_monthly_review
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.unit_monthly_review (unit_slug, ciclo, parecer_diretoria, ofensores_diretoria, acoes_recomendadas_diretoria, autor)
VALUES
 ('igarassu', '2026-07',
  'À primeira vista parece contraditório — mais gente e, ainda assim, muito mais hora extra. A leitura correta é: o quadro cresceu em áreas administrativas e de segurança, não necessariamente nas posições operacionais que geram a pressão de turno, então a fábrica seguiu comprando hora extra para cobrir a operação contínua, ao mesmo tempo em que outras áreas cresceram acima do plano.',
  '[{"conta":"Hora Extra","resumo":"Operação contínua coberta por hora extra apesar do crescimento de quadro em áreas administrativas."},{"conta":"Benefícios","resumo":"Assistência médica e odontológica concentra a maior parte do gasto do bloco."}]'::jsonb,
  '[{"acao":"Revisar dimensionamento de turno frente ao quadro operacional aprovado","responsavel":"BP + Operação","prazo":"2026-08-29"},{"acao":"Validar com o Antonio a duplicidade de contas SAP de assistência médica","responsavel":"Remuneração & Orçamento","prazo":"2026-08-15"}]'::jsonb,
  'Diretoria de Gente & Remuneração'),
 ('solutions', '2026-07',
  'Resultado favorável no total do mês, mas a leitura precisa separar o efeito de timing (contas sazonais lidas em YTD) do ganho real. Parte relevante da economia vem de ICP e Rescisão ainda não realizados no mês, enquanto o bloco Administrativo/G&G segue como ponto de atenção estrutural.',
  '[{"conta":"ICP","resumo":"Provisão de PLR orçada e ainda não lançada no mês — efeito de calendário, não economia."},{"conta":"Benefícios","resumo":"Assistência médica/odontológica é o maior componente do bloco."}]'::jsonb,
  '[{"acao":"Confirmar cronograma de provisionamento de ICP com Orçamento","responsavel":"Remuneração & Orçamento","prazo":"2026-08-20"},{"acao":"Revisar quadro de Administrativo/G&G frente ao orçado","responsavel":"BP Solutions","prazo":"2026-08-29"}]'::jsonb,
  'Diretoria de Gente & Remuneração');