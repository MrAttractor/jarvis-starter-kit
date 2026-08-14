-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0009 — CARNET DE CONTACTS ET RELANCES
--
-- Une relance ne se perd pas parce qu'on cherche un numéro. Le carnet
-- vit à côté du projet, chacun peut le compléter, et chaque ligne en
-- retard sait vers qui écrire.
--
-- Ce que la base fait : tenir le carnet et garder trace des relances
-- envoyées. Ce qu'elle ne fait pas : envoyer. Le message part du
-- téléphone ou de la boîte de celui qui relance, avec son identité,
-- ce qui vaut toujours mieux qu'un automate.
-- =====================================================================

create table if not exists fgp_contacts (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  structure  text not null,
  fonction   text,
  email      text,
  whatsapp   text,          -- format international, chiffres uniquement
  note       text,
  actif      boolean not null default true,
  cree_le    timestamptz not null default now(),
  maj_le     timestamptz,
  maj_par    text
);

create index if not exists fgp_contacts_struct on fgp_contacts(structure, nom);

alter table fgp_contacts enable row level security;
revoke all on fgp_contacts from anon, authenticated;

-- Trace des relances, pour ne pas relancer deux fois le même jour et
-- pour savoir qui a déjà écrit à qui.
create table if not exists fgp_relances (
  id         bigserial primary key,
  contact_id uuid references fgp_contacts(id) on delete set null,
  destinataire text,
  canal      text not null check (canal in ('whatsapp','email')),
  sujet      text,
  objet_type text,           -- information, tache, jalon, libre
  objet_ref  text,
  auteur     text,
  envoye_le  timestamptz not null default now()
);

create index if not exists fgp_relances_date on fgp_relances(envoye_le desc);

alter table fgp_relances enable row level security;
revoke all on fgp_relances from anon, authenticated;

-- ---------- SEED : ce que le dossier connaît déjà ----------
-- Les coordonnées manquantes se complètent dans l'interface. On ne met
-- ici que ce qui est écrit noir sur blanc dans les documents du dossier.

insert into fgp_contacts(nom, structure, fonction, email, whatsapp, note)
select * from (values
  ('Florence KONE','Advantage Conseils','Représentante légale, signataire',
   null,null,'Signataire du contrat. Qualité exacte à confirmer.'),
  ('Marius A.','Advantage Conseils','Directeur général adjoint',
   null,null,'Présent à la séance technique du 7 août.'),
  ('Eric Atta','Advantage Conseils','Commissaire général du Festival',
   null,null,null),
  ('Stéphane ATTA','Advantage Conseils','Responsable partenariats et sponsors',
   null,null,'Interlocuteur des contreparties et de la piste boissons.'),
  ('Secrétariat Advantage','Advantage Conseils','Accueil',
   'secretariat@advantageconseils.com','2250506755755',null),
  ('Nomagbè MEÏTE épouse CADEC','Thim Production','Présidente, signataire',
   null,null,'Signataire du contrat.'),
  ('Arnaud YORO','Thim Production','Directeur adjoint',
   null,null,'Présent à la séance technique du 7 août.'),
  ('Thim Production','Thim Production','Adresse générale',
   'thimproduction22@gmail.com',null,null),
  ('Mac Arthur','Mr Attractor','Coordination du projet',
   null,null,null)
) as v(nom,structure,fonction,email,whatsapp,note)
where not exists (select 1 from fgp_contacts);

-- ---------- LECTURE ----------

create or replace function fgp_carnet(p_jeton text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  return json_build_object(
    'contacts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'nom', c.nom, 'structure', c.structure, 'fonction', c.fonction,
        'email', c.email, 'whatsapp', c.whatsapp, 'note', c.note,
        'joignable', (coalesce(c.email,'') <> '' or coalesce(c.whatsapp,'') <> '')
      ) order by c.structure, c.nom)
      from fgp_contacts c where c.actif), '[]'::jsonb),
    'relances', coalesce((
      select jsonb_agg(jsonb_build_object(
        'destinataire', r.destinataire, 'canal', r.canal, 'sujet', r.sujet,
        'objet_type', r.objet_type, 'objet_ref', r.objet_ref,
        'auteur', r.auteur, 'envoye_le', r.envoye_le)
        order by r.envoye_le desc)
      from (select * from fgp_relances order by envoye_le desc limit 40) r), '[]'::jsonb)
  );
end $$;

-- ---------- ÉCRITURE DU CARNET ----------
-- Un identifiant nul crée, sinon met à jour. Une chaîne vide efface le champ.

create or replace function fgp_contact_maj(
  p_jeton text, p_id uuid, p_nom text, p_structure text, p_fonction text,
  p_email text, p_whatsapp text, p_note text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_auteur text; v_wa text; v_mail text;
begin
  v := fgp_seance_par_jeton(p_jeton);
  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;

  -- Un numéro WhatsApp ne garde que ses chiffres : les espaces, points et
  -- signes plus font échouer le lien wa.me sans le moindre message d'erreur.
  v_wa := nullif(regexp_replace(coalesce(p_whatsapp,''), '[^0-9]', '', 'g'), '');
  if v_wa is not null and length(v_wa) < 8 then
    raise exception 'numero trop court, indiquez l''indicatif pays sans le signe plus';
  end if;

  v_mail := nullif(trim(lower(coalesce(p_email,''))), '');
  if v_mail is not null and v_mail !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then
    raise exception 'adresse electronique invalide';
  end if;

  if p_id is null then
    if coalesce(trim(p_nom),'') = '' then raise exception 'nom requis'; end if;
    insert into fgp_contacts(nom, structure, fonction, email, whatsapp, note, maj_le, maj_par)
    values (trim(p_nom), coalesce(nullif(trim(p_structure),''),'Autre'),
            nullif(trim(coalesce(p_fonction,'')),''), v_mail, v_wa,
            nullif(trim(coalesce(p_note,'')),''), now(), v_auteur);
  else
    update fgp_contacts set
      nom       = coalesce(nullif(trim(coalesce(p_nom,'')),''), nom),
      structure = coalesce(nullif(trim(coalesce(p_structure,'')),''), structure),
      fonction  = case when p_fonction is null then fonction
                       else nullif(trim(p_fonction),'') end,
      email     = case when p_email    is null then email    else v_mail end,
      whatsapp  = case when p_whatsapp is null then whatsapp else v_wa   end,
      note      = case when p_note     is null then note
                       else nullif(trim(p_note),'') end,
      maj_le = now(), maj_par = v_auteur
    where id = p_id;
    if not found then raise exception 'contact introuvable'; end if;
  end if;

  return fgp_carnet(p_jeton);
end $$;

create or replace function fgp_contact_retirer(p_jeton text, p_id uuid, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_auteur text;
begin
  v := fgp_seance_par_jeton(p_jeton);
  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;
  -- On désactive plutôt que de supprimer : les relances déjà envoyées
  -- gardent ainsi le nom de leur destinataire.
  update fgp_contacts set actif = false, maj_le = now(), maj_par = v_auteur
   where id = p_id;
  return fgp_carnet(p_jeton);
end $$;

-- ---------- TRACE D'UNE RELANCE ----------

create or replace function fgp_relance_tracer(
  p_jeton text, p_contact uuid, p_destinataire text, p_canal text,
  p_sujet text, p_objet_type text, p_objet_ref text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_auteur text;
begin
  v := fgp_seance_par_jeton(p_jeton);
  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;

  insert into fgp_relances(contact_id, destinataire, canal, sujet,
                           objet_type, objet_ref, auteur)
  values (p_contact, nullif(trim(coalesce(p_destinataire,'')),''), p_canal,
          nullif(trim(coalesce(p_sujet,'')),''),
          nullif(trim(coalesce(p_objet_type,'')),''),
          nullif(trim(coalesce(p_objet_ref,'')),''), v_auteur);

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'relance', coalesce(p_sujet,'relance'), 'canal', null, p_canal, v_auteur);

  return fgp_carnet(p_jeton);
end $$;

grant execute on function fgp_carnet(text)                                        to anon;
grant execute on function fgp_contact_maj(text,uuid,text,text,text,text,text,text,text) to anon;
grant execute on function fgp_contact_retirer(text,uuid,text)                     to anon;
grant execute on function fgp_relance_tracer(text,uuid,text,text,text,text,text,text) to anon;
