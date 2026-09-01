-- Pix Cidadão — schema da Rede de Comunicadores
--
-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- (Project -> SQL Editor -> New query -> cole isto -> Run).
--
-- Depois disso, copie as 3 chaves indicadas no README (seção "Ativando a
-- Rede de Comunicadores") para as variáveis de ambiente da Vercel.

create extension if not exists "pgcrypto";

create table if not exists public.comunicadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  instagram text,
  chave_pix text,
  codigo_ref text not null unique,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  criado_em timestamptz not null default now()
);

create unique index if not exists comunicadores_email_idx on public.comunicadores (email);

create table if not exists public.vendas (
  id uuid primary key,
  comunicador_ref text references public.comunicadores (codigo_ref),
  comprador_email text,
  valor_centavos integer not null,
  status_pagamento text not null default 'pendente'
    check (status_pagamento in ('pendente', 'pago', 'expirado', 'cancelado')),
  id_transacao_pix text,
  comissao_valor_centavos integer,
  criado_em timestamptz not null default now(),
  expira_em timestamptz,
  pago_em timestamptz
);

create index if not exists vendas_comunicador_ref_idx on public.vendas (comunicador_ref);
create index if not exists vendas_status_idx on public.vendas (status_pagamento);
create index if not exists vendas_id_transacao_pix_idx on public.vendas (id_transacao_pix);

-- Segurança: habilita Row Level Security e não cria nenhuma política.
-- Resultado: só a service role key (usada exclusivamente no servidor, nunca
-- no navegador) consegue ler/gravar nessas tabelas — a chave pública
-- (NEXT_PUBLIC_SUPABASE_URL / anon key) não é usada em nenhum lugar do
-- código do site, então isso efetivamente bloqueia qualquer acesso vindo do
-- navegador do visitante.
alter table public.comunicadores enable row level security;
alter table public.vendas enable row level security;
