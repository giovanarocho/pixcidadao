# Pix Cidadão — v1 (landing page + checkout Pix + Rede de Comunicadores)

Versão completa do projeto Pix Cidadão: landing page mobile-first com o
conteúdo real enviado pelo cliente (28/08/2026), checkout Pix seguro e
automático, e a Rede de Comunicadores funcional (cadastro, aprovação e
painel de vendas por comunicador).

Só falta uma coisa: o **PDF real do e-book**. Até lá, o site usa o arquivo
de teste em `src/private-content/ebook.pdf` — é só substituir esse arquivo
quando o PDF final estiver pronto, nenhum outro ponto do código precisa
mudar.

## O que já está pronto e funcionando

- **Conteúdo real**: título, proposta, FAQ, política de privacidade e
  termos de uso com o texto definitivo enviado pelo cliente — não é mais
  placeholder (`src/lib/ebook/content.ts`).
- **Identidade visual real**: logo e ícone do site usam a marca enviada
  (pasta `pixcidadão` do Drive), aplicada no cabeçalho, rodapé e favicon.
- **Preço real**: R$ 37,90, pagamento único via Pix.
- **Pagamento seguro e automático**: cobrança Pix criada na API do Mercado
  Pago, confirmação consultada ao vivo (nunca confiando só no que o
  navegador diz), e-book liberado **somente depois** da confirmação —
  ver "Como o pagamento funciona" abaixo.
- **E-mail obrigatório no checkout**: pedido antes de gerar o Pix (exigência
  da própria API do Mercado Pago, e também usado para suporte).
- **Rede de Comunicadores funcional**: cadastro público, aprovação num
  painel admin, link de indicação individual, e painel de vendas/comissão
  por comunicador — ver "Ativando a Rede de Comunicadores" abaixo.
- **LGPD**: Política de Privacidade descreve, de forma real (não mais
  placeholder), quais dados são coletados, para quê, por quanto tempo, e
  quais direitos o titular tem — ver `src/lib/ebook/content.ts` (`legal`).

## Como o pagamento funciona (resumo de segurança)

1. O comprador informa o e-mail e um Pix é gerado na API do Mercado Pago.
2. Nenhum dado da venda fica em memória do servidor (que não sobrevive em
   produção na Vercel) — tudo viaja assinado (HMAC) dentro do próprio link,
   ver `src/lib/store/saleToken.ts`.
3. Enquanto o comprador está na tela, o navegador consulta
   `/api/status/[id]` a cada ~1,5s — e essa rota, por sua vez, consulta o
   **status real do pagamento direto na API do Mercado Pago**, nunca um
   valor guardado localmente.
4. Só quando o Mercado Pago confirma "approved" é que a rota de download
   (`/api/download/[id]`) libera o PDF — e ela reconfirma o pagamento de
   novo, ao vivo, antes de servir o arquivo (nunca confia só no token).
5. O webhook do Mercado Pago (`/api/webhook/mercadopago`) é a rede de
   segurança: mesmo que o comprador feche a aba antes da confirmação
   aparecer, a venda é atualizada no banco quando o pagamento é aprovado.

O código já faz chamadas reais à API do Mercado Pago — funciona assim que
`MERCADO_PAGO_ACCESS_TOKEN` está configurado (ver seção mais abaixo). Sem
essa variável, o site roda em **modo simulado**: Pix falso, confirmado
sozinho depois de alguns segundos, sem depender de nada externo — bom para
testar design e fluxo.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 no navegador (ou no celular, usando o modo de
visualização mobile do navegador).

## Estrutura do projeto

```
src/
  app/
    page.tsx                      landing page
    seja-comunicador/             formulário de cadastro na Rede de Comunicadores
    comunicador/[ref]/            painel de vendas do comunicador (link com token)
    admin/comunicadores/          painel de aprovação (protegido por senha)
    politica-de-privacidade/      LGPD — texto real
    termos-de-uso/                texto real
    contato/
    api/
      checkout/route.ts           cria a cobranca Pix (real ou simulada)
      status/[id]/route.ts        consultado pelo frontend (polling)
      download/[id]/route.ts      entrega segura do PDF (sem URL pública)
      webhook/mercadopago/route.ts webhook do Mercado Pago
      comunicadores/route.ts      cadastro público de comunicadores
  components/                     seções da landing page + checkout + formulário
  lib/
    ebook/content.ts              TODO O CONTEÚDO da landing (texto real)
    payments/                     integração de pagamento (mock + Mercado Pago real)
    store/saleToken.ts            "saleId" assinado, sem depender de banco
    vendas.ts                     registro de vendas/comissões no Supabase
    comunicadores/refCode.ts      geração de código de indicação e tokens de acesso
    supabase/client.ts            cliente Supabase (service role, só no servidor)
  private-content/ebook.pdf       PDF de teste — nunca fica em URL pública
public/
  logo-mark.png, icon-*.png       marca real do Pix Cidadão (favicon, logo)
supabase-schema.sql               schema das tabelas comunicadores/vendas
```

## Ativando o Mercado Pago de verdade

1. **Pegue o Access Token.** No painel do Mercado Pago da conta que vai
   receber os pagamentos: https://www.mercadopago.com.br/developers/panel/app
   → crie uma aplicação (se ainda não tiver) → copie o **Access Token**.
   Existe um de **teste** e um de **produção** — comece pelo de teste.
2. **Coloque a chave na Vercel.** Settings → Environment Variables →
   `MERCADO_PAGO_ACCESS_TOKEN` → Save → Redeploy.
3. **Teste com o token de teste primeiro**, depois troque pelo de produção.

Não é preciso configurar nada manualmente do lado do Mercado Pago para o
webhook — cada cobrança já informa a URL correta automaticamente.

## Ativando a Rede de Comunicadores (Supabase)

O código de cadastro, aprovação, link de indicação e painel de vendas já
está pronto — falta só criar o banco de dados (gratuito no plano free do
Supabase) e conectar 2 chaves + uma senha de admin.

1. **Crie um projeto no Supabase.** Em https://supabase.com → New Project.
   Guarde a senha do banco que você definir ali (não é a mesma coisa que as
   chaves de API do passo 3).
2. **Rode o schema.** No painel do projeto: SQL Editor → New query → cole o
   conteúdo do arquivo `supabase-schema.sql` (na raiz deste projeto) → Run.
   Isso cria as tabelas `comunicadores` e `vendas`.
3. **Copie as chaves.** Em Project Settings → API:
   - `Project URL` → variável `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key (não a `anon`/pública!) → variável
     `SUPABASE_SERVICE_ROLE_KEY`
4. **Defina uma senha de admin.** Escolha uma senha longa e única → variável
   `ADMIN_PASSWORD`.
5. **Coloque as 3 variáveis na Vercel** (Settings → Environment Variables) e
   faça um redeploy.

Depois disso:

- Qualquer pessoa pode se cadastrar em `/seja-comunicador`.
- Você aprova ou recusa cada cadastro em
  `SEU_SITE/admin/comunicadores?senha=SUA_SENHA` — guarde esse link, é o seu
  painel administrativo (não tem botão de login visível de propósito, para
  manter simples; a senha vem sempre na URL).
- Ao aprovar, o admin mostra o **link de indicação** do comunicador
  (`SEU_SITE/?ref=codigo`) e o **link do painel dele**
  (`SEU_SITE/comunicador/codigo?token=...`) — envie esses dois links para a
  pessoa (por e-mail ou WhatsApp; o envio automático por e-mail ainda não
  está implementado, ver "O que ainda falta" abaixo).
- Cada venda feita por um link de indicação de comunicador **aprovado**
  gera uma comissão de 90% do valor, registrada automaticamente.
- O comunicador acompanha suas vendas e comissão pelo próprio link do
  painel — sem precisar de login/senha (o token no link já autentica ele).

Sem essas variáveis configuradas, o e-book continua vendendo normalmente —
só a Rede de Comunicadores fica indisponível (o site avisa isso, não quebra
nada).

## Segurança e LGPD — resumo

- Pagamento processado exclusivamente pelo Mercado Pago (instituição
  autorizada pelo Banco Central) — o site nunca vê nem guarda dados de
  cartão (não há cartão: só Pix).
- O e-book só é liberado depois de reconfirmar o pagamento ao vivo — nunca
  a partir de um valor guardado que poderia ser adulterado.
- O link de download é pessoal, assinado (HMAC) e não fica em nenhuma URL
  pública ou indexável.
- As tabelas do Supabase (`comunicadores`, `vendas`) ficam com Row Level
  Security ativado e sem nenhuma política pública — só a chave de serviço
  (usada exclusivamente no servidor) consegue acessá-las.
- A Política de Privacidade (`/politica-de-privacidade`) documenta, em
  conformidade com a LGPD, quais dados são coletados, para quê, com quem
  podem ser compartilhados (só prestadores técnicos, nunca vendidos) e quais
  direitos o titular pode exercer.

## O que ainda falta para a versão 100% completa

- **PDF real do e-book** — trocar `src/private-content/ebook.pdf` pelo
  arquivo final. É a única peça de conteúdo que falta.
- **E-mail automático para o comunicador aprovado** — hoje o admin mostra os
  links prontos, mas o envio é manual (copiar e mandar por WhatsApp/e-mail).
  Dá pra automatizar depois com um serviço como o Resend (já há um espaço
  reservado em `.env.example`).
- **E-mail de confirmação para o comprador** — hoje a confirmação e o link
  de download aparecem na própria tela; um e-mail de backup (caso a pessoa
  feche a aba) também pode ser plugado com o Resend futuramente.
- **Confirmação final do e-mail e Instagram de contato** — o e-mail
  `contato@pixcidadao.app.br` e o Instagram `@pixcidadao` em
  `src/lib/ebook/content.ts` (`contact`) são um palpite razoável; confirme
  com o cliente antes de publicar.
- **Domínio próprio** — quando quiser, aponte `pixcidadao.app.br` (ou o
  domínio escolhido) nas configurações de Domains da Vercel, e atualize
  `NEXT_PUBLIC_SITE_URL` nas variáveis de ambiente para esse domínio (isso
  também corrige os links gerados no painel admin).

## Deploy no GitHub + Vercel (recomendado)

Rodar só localmente (`npm run dev`) prova que o design e o fluxo
funcionam, mas o ideal é manter o código no GitHub conectado à Vercel: toda
atualização (`git push`) gera um novo deploy automaticamente, sempre no
mesmo projeto e mantendo as variáveis de ambiente já configuradas.

```bash
cd pix-cidadao-site
git init
git add .
git commit -m "Pix Cidadão"
git remote add origin https://github.com/SEU-USUARIO/pix-cidadao.git
git branch -M main
git push -u origin main
```

Depois, no painel da Vercel: **Add New → Project → Import** o repositório.
A Vercel detecta o Next.js automaticamente.

### Alternativa sem GitHub (Vercel Drop)

Também é possível arrastar a pasta do projeto direto em
https://vercel.com/new sem usar GitHub — mais rápido para um teste pontual,
mas sem histórico de versões nem redeploy automático. Ao repetir esse
processo para atualizar o site, confirme que o novo deployment está indo
para o **mesmo projeto** já existente (para não perder as variáveis de
ambiente já configuradas).
