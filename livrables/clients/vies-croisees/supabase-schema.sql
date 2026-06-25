-- ============================================================
--  Vies Croisées — Schéma Supabase
--  À exécuter dans le SQL Editor du dashboard Supabase
--  (projet lgdgbrivnhgeupqhkckd)
-- ============================================================

-- ── ÉPISODES ─────────────────────────────────────────────────────
create table if not exists vc_episodes (
  id             uuid    default gen_random_uuid() primary key,
  titre          text    not null,
  description    text    default '',
  invites        text    default '',
  tags           text    default '',          -- séparés par virgule
  youtube_teaser text    default '',          -- URL YouTube teaser
  youtube_episode text   default '',          -- URL YouTube épisode complet
  duree_teaser   text    default '',          -- ex : "1 min 30"
  duree_episode  text    default '',          -- ex : "42 min"
  statut         text    default 'brouillon'
                         check (statut in ('publie','programme','brouillon')),
  created_at     timestamptz default now()
);

-- ── ARTICLES ─────────────────────────────────────────────────────
create table if not exists vc_articles (
  id             uuid    default gen_random_uuid() primary key,
  titre          text    not null,
  contenu        text    default '',           -- texte libre
  lien_episode   text    default '',           -- titre de l'épisode lié (libre)
  duree_lecture  text    default '',           -- ex : "4 min"
  statut         text    default 'brouillon'
                         check (statut in ('publie','brouillon')),
  created_at     timestamptz default now()
);

-- ── TÉMOIGNAGES ───────────────────────────────────────────────────
-- Reçus depuis le formulaire "Rejoindre" du site public
create table if not exists vc_temoignages (
  id          uuid    default gen_random_uuid() primary key,
  prenom      text    not null,
  message     text    not null,
  traite      boolean default false,           -- marqué traité par Andréa
  created_at  timestamptz default now()
);

-- ── COMMENTAIRES ─────────────────────────────────────────────────
-- Commentaires sous les épisodes, modérés avant affichage
create table if not exists vc_commentaires (
  id          uuid    default gen_random_uuid() primary key,
  episode_id  uuid    references vc_episodes(id) on delete cascade,
  prenom      text    default '',              -- vide = affiché "Anonyme"
  message     text    not null,
  visible     boolean default false,           -- false = en attente validation Andréa
  created_at  timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────────
alter table vc_episodes    enable row level security;
alter table vc_articles    enable row level security;
alter table vc_temoignages enable row level security;
alter table vc_commentaires enable row level security;

-- Episodes et articles : lecture publique, écriture anon (admin côté client)
create policy "vc_ep_read"    on vc_episodes    for select using (true);
create policy "vc_ep_write"   on vc_episodes    for all    using (true) with check (true);
create policy "vc_art_read"   on vc_articles    for select using (true);
create policy "vc_art_write"  on vc_articles    for all    using (true) with check (true);

-- Témoignages : insert public, lecture/update anon (admin)
create policy "vc_temo_insert" on vc_temoignages for insert with check (true);
create policy "vc_temo_admin"  on vc_temoignages for select using (true);
create policy "vc_temo_update" on vc_temoignages for update using (true) with check (true);

-- Commentaires : insert public (tout le monde peut commenter)
--                select public (uniquement visible=true côté public, admin voit tout)
--                update/delete anon (Andréa approuve/supprime)
create policy "vc_com_insert"  on vc_commentaires for insert with check (true);
create policy "vc_com_read"    on vc_commentaires for select using (true);
create policy "vc_com_update"  on vc_commentaires for update using (true) with check (true);
create policy "vc_com_delete"  on vc_commentaires for delete using (true);

-- ── DONNÉES INITIALES ─────────────────────────────────────────────
insert into vc_episodes (titre, description, invites, tags, duree_teaser, duree_episode, statut) values
  ('Entre Force et Vulnérabilité',
   'Sur la force que cache la vulnérabilité — et la liberté qui vient quand on s''y autorise enfin.',
   'Avec Aïcha M.',
   'Transformation,Authenticité',
   '1 min 30', '42 min', 'publie'),
  ('Partir ou rester : 3 destins croisés',
   'Trois chemins, trois choix de vie, une seule question : comment savoir où est sa place ?',
   'Avec Karim S., Fatou B. et Yves D.',
   'Diaspora,Choix de vie',
   '1 min 45', '', 'programme'),
  ('Le jour où j''ai tout reconstruit',
   'Recommencer après avoir tout perdu — ce que ça enlève, ce que ça donne.',
   'Avec Moussa K.',
   'Résilience,Recommencement',
   '', '', 'brouillon');

-- ── ABONNÉS NOTIFICATIONS ────────────────────────────────────────
-- Visiteurs inscrits pour recevoir les nouveaux épisodes
create table if not exists vc_abonnes (
  id          uuid    default gen_random_uuid() primary key,
  prenom      text    default '',
  contact     text    not null,               -- email ou numéro WhatsApp
  created_at  timestamptz default now()
);

alter table vc_abonnes enable row level security;
create policy "vc_ab_insert" on vc_abonnes for insert with check (true);
create policy "vc_ab_admin"  on vc_abonnes for select using (true);
create policy "vc_ab_delete" on vc_abonnes for delete using (true);

insert into vc_articles (titre, contenu, lien_episode, duree_lecture, statut) values
  ('Ta vulnérabilité n''est pas une faiblesse. C''est une porte.',
   'Le premier réflexe est souvent de cacher ce qui fait mal. De montrer la force, de tenir, de ne rien laisser paraître. Comme si la vulnérabilité était une information à protéger, un aveu de faiblesse qu''on ne peut pas se permettre.

Ce que cet épisode révèle, c''est l''inverse. C''est que la vulnérabilité est souvent le seul chemin vers quelque chose de vrai.

Quand Aïcha parle, elle ne cherche pas à convaincre. Elle raconte. Et dans ce récit honnête, quelque chose se dénoue — pour elle, et pour ceux qui écoutent.',
   'Entre Force et Vulnérabilité', '4 min', 'publie'),
  ('Et si leur chemin éclairait le tien ?',
   'Il y a quelque chose de particulier dans le fait d''entendre quelqu''un raconter ce qu''il a traversé. Pas une leçon, pas un conseil — juste un chemin raconté honnêtement.

Ce chemin-là a souvent plus de pouvoir que dix livres de développement personnel. Parce qu''il est réel. Parce qu''on sent que la personne en face l''a vraiment vécu.',
   '', '3 min', 'publie'),
  ('5 questions à te poser avant de tout changer',
   '', '', '5 min', 'brouillon');
