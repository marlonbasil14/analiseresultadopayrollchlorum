# Diagnóstico — e-mail do código de login não chega

Somente leitura. Nada foi alterado.

## 1) Como o e-mail é enviado hoje
- Nenhum domínio de e-mail próprio configurado (status: "not_started").
- Logo, os e-mails de login saem pelo **remetente padrão do Lovable Cloud** (domínio do Lovable, não chlorumsolutions.com).
- Não há função de envio própria: não existe pasta de funções no backend, nem rota de e-mail de autenticação no app, nem código com Resend/SMTP.
- **Legado encontrado:** o segredo `RESEND_API_KEY` existe no projeto, mas nenhum código o usa. Pode ser removido.

## 2) Templates (código de 6 dígitos ou só link)
- Não há templates personalizados no projeto; valem os templates padrão do Cloud.
- Não consegui ler o conteúdo dos templates padrão por ferramenta, então **não confirmo** se trazem o `{{ .Token }}`. Fica como não verificado.
- Ponto importante: o primeiro acesso de um usuário novo dispara o e-mail de "Confirmar cadastro" (signup), não o de "Magic Link". Se esse template mostra só link, o campo de 6 dígitos não tem como ser preenchido, e o Safe Links do M365 pode "clicar" no link antes da pessoa.

## 3) Logs de auth (últimas 24h)
- A consulta aos logs de auth voltou **vazia** (nem eventos normais) — não há registro disponível para checar erro de envio, rate limit ou bounce.
- Usuário citado: adelini.gusmao@chlorumsolutions.com — criado 21:22:17 UTC, confirmation_sent_at 21:25:59 UTC, nunca confirmado, nunca logou. Ou seja, o backend registrou que pediu o envio (cerca de 3 min depois do cadastro, sugerindo nova tentativa); a entrega não pode ser confirmada.
- Só existem 2 usuários no total (o outro é marlon.silva, confirmado em 07/08).
- Hipótese mais provável (não confirmada): e-mail retido em quarentena/spam do M365, por vir de domínio externo.

## 4) Validação do domínio @chlorumsolutions.com
- **Só no front** para o cadastro. Não há trigger em auth.users nem hook de signup.
- No banco, a regra existe apenas na função `bootstrap_admin` (vira admin) — não impede criar conta com outro domínio.
- Na prática, dados ficam protegidos porque o acesso depende de papel em `user_roles`, mas qualquer e-mail consegue criar conta e receber código.

## 5) Caminho mais simples e seguro
Sem TI:
1. Pedir a quem não recebeu para checar Lixo eletrônico e Quarentena do M365.
2. Usar templates próprios de autenticação mostrando o código de 6 dígitos em destaque (sem depender de link), cobrindo cadastro e login.
3. Bloquear no backend contas fora de @chlorumsolutions.com (hook/trigger de cadastro).
4. Remover o segredo RESEND_API_KEY não usado.

Exige TI (DNS):
- Configurar um subdomínio remetente (ex.: notify.chlorumsolutions.com) com registros NS apontando para o Lovable. Assim os e-mails saem com a marca Chlorum e com SPF/DKIM válidos, o que melhora muito a entrega no M365.
- Opcional: TI liberar o remetente na lista de permitidos do Exchange/Defender.

Opção intermediária: subdomínio num domínio que vocês controlem sem TI (comprado no próprio Lovable), mas um remetente fora de chlorumsolutions.com tende a ter a mesma desconfiança do M365.

## Próximo passo sugerido (se aprovar)
Ao aprovar, só confirmo o diagnóstico. As correções dos itens 2 e 3 do caminho sem TI ficam para um pedido separado.
