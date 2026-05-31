-- 0004_whatsapp_messages.sql — Table des messages WhatsApp (V1 assistée)
-- Logique : l'app prépare le message, l'utilisateur envoie en 1 tap via deeplink.
-- Aucune API Meta. Aucune validation externe. Zero dépendance.

create table public.whatsapp_messages (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references public.profiles(id) on delete cascade,
  assistant_id text        not null,
  message_text text        not null,
  sent_at      timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;

create policy "wa self read"   on public.whatsapp_messages for select using (auth.uid() = user_id);
create policy "wa self insert" on public.whatsapp_messages for insert with check (auth.uid() = user_id);
