-- 0001_init.sql — Attractor Assists, schéma fondations (Phase 0)
-- Sécurité : RLS activée partout, chaque utilisateur ne voit que ses données.

create extension if not exists vector;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  zone text not null default 'CI',
  ton_prefere text not null default 'tutoiement',
  activite text,
  canal_principal text,
  nom_assistant text not null default 'Attractor',
  role text not null default 'user',
  plan_code text not null default 'decouverte',
  statut text not null default 'actif',
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Helper admin (défini après profiles car il la référence)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create policy "profiles self read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- Auto-création du profil à l'inscription
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, prenom) values (new.id, coalesce(new.raw_user_meta_data->>'prenom',''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PLANS (catalogue public)
create table public.plans (
  code text primary key,
  nom text not null,
  zone text not null,
  prix_base integer not null default 0,
  prix_promo integer,
  engagement_mois integer,
  devise text not null,
  messages_jour integer,
  proactif boolean not null default false,
  agents text[] not null default '{}',
  ordre integer not null default 0
);
alter table public.plans enable row level security;
create policy "plans public read" on public.plans for select using (true);

-- AGENTS (catalogue public)
create table public.agents (
  code text primary key,
  nom text not null,
  description text,
  niveau_acces text not null default 'gratuit',
  modele text not null default 'haiku',
  actif boolean not null default true
);
alter table public.agents enable row level security;
create policy "agents public read" on public.agents for select using (true);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  statut text not null default 'actif',
  debut timestamptz not null default now(),
  fin timestamptz,
  promo_appliquee boolean not null default false
);
alter table public.subscriptions enable row level security;
create policy "subs self" on public.subscriptions for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);

-- USAGE quota journalier
create table public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  jour date not null default current_date,
  nb_messages integer not null default 0,
  primary key (user_id, jour)
);
alter table public.usage_daily enable row level security;
create policy "usage self" on public.usage_daily for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CONVERSATIONS / MESSAGES
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text,
  created_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  contenu text not null,
  modele text,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
create policy "conv self" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "msg self" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PPSD (un par utilisateur)
create table public.ppsd (
  user_id uuid primary key references auth.users(id) on delete cascade,
  problemes text, peurs text, souhaits text, desirs text,
  lieux_cible text, declencheurs text,
  updated_at timestamptz not null default now()
);
alter table public.ppsd enable row level security;
create policy "ppsd self" on public.ppsd for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AGENDA / TODOS
create table public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null, description text,
  debut timestamptz not null, fin timestamptz,
  created_at timestamptz not null default now()
);
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null, priorite text default 'normale',
  done boolean not null default false, echeance date,
  created_at timestamptz not null default now()
);
alter table public.agenda_events enable row level security;
alter table public.todos enable row level security;
create policy "agenda self" on public.agenda_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "todos self" on public.todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PARCOURS
create table public.parcours (
  code text primary key, nom text not null, description text,
  nb_etapes integer not null default 0, ordre integer not null default 0
);
alter table public.parcours enable row level security;
create policy "parcours public read" on public.parcours for select using (true);
create table public.parcours_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  parcours_code text not null references public.parcours(code),
  etape integer not null default 0,
  termine boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, parcours_code)
);
alter table public.parcours_progress enable row level security;
create policy "progress self" on public.parcours_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GAMIFICATION
create table public.gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  niveau integer not null default 1,
  streak integer not null default 0,
  dernier_jour date,
  badges text[] not null default '{}'
);
alter table public.gamification enable row level security;
create policy "gami self" on public.gamification for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AGENT OUTPUTS (livrables produits par les agents)
create table public.agent_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_code text not null,
  type text, titre text, contenu text,
  created_at timestamptz not null default now()
);
alter table public.agent_outputs enable row level security;
create policy "outputs self" on public.agent_outputs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COMMUNAUTE
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  besoin text not null,
  created_at timestamptz not null default now()
);
alter table public.community_posts enable row level security;
create policy "community read all" on public.community_posts for select using (true);
create policy "community insert self" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "community update self" on public.community_posts for update using (auth.uid() = user_id);

-- BASE DE CONNAISSANCE (RAG, écrits Attractor) — admin seulement
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source text, contenu text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
alter table public.knowledge_chunks enable row level security;
create policy "knowledge admin" on public.knowledge_chunks for all using (public.is_admin()) with check (public.is_admin());

-- SEED forfaits
insert into public.plans (code,nom,zone,prix_base,prix_promo,engagement_mois,devise,messages_jour,proactif,agents,ordre) values
 ('decouverte','Découverte','CI',0,null,null,'FCFA',20,false,'{coach}',0),
 ('bras_droit','Bras Droit','CI',5000,null,null,'FCFA',null,true,'{coach,digital_manager}',1),
 ('manager','Manager','CI',15000,null,null,'FCFA',null,true,'{coach,digital_manager,community_manager,chief_of_staff,daf}',2),
 ('decouverte_eu','Découverte','EU',0,null,null,'EUR',20,false,'{coach}',0),
 ('bras_droit_eu','Bras Droit','EU',9,null,null,'EUR',null,true,'{coach,digital_manager}',1),
 ('manager_eu','Manager','EU',99,29,null,'EUR',null,true,'{coach,digital_manager,community_manager,chief_of_staff,daf}',2);

-- SEED agents
insert into public.agents (code,nom,description,niveau_acces,modele) values
 ('coach','Coach Attractor','Le cerveau nourri de la méthode. Réactif en gratuit, proactif en payant.','gratuit','haiku'),
 ('digital_manager','Digital Manager','Veille, analyse concurrence, ciblage des news, rapport quotidien pour adapter le contenu.','bras_droit','sonnet'),
 ('community_manager','Community Manager','Produit et programme les publications, prêtes à poster.','manager','sonnet'),
 ('chief_of_staff','Chief of Staff','Orchestration, priorités, suivi des objectifs.','manager','sonnet'),
 ('daf','DAF / Stratège financier','Structure les idées en argent : pricing, promos, MRR, suivi du CA.','manager','sonnet');

-- SEED parcours
insert into public.parcours (code,nom,description,nb_etapes,ordre) values
 ('couloir','#1dansmoncouloir','Trouver ton couloir d''appel et ta zone de génie.',22,0),
 ('ventes','Booster mes ventes','PPSD, message émotionnel, offre irrésistible, plan 30 jours.',4,1);
