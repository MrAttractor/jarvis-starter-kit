-- =====================================================================
-- ESPACE COACHING - notification de fin de questionnaire
--
-- Quand une personne accompagnee valide son questionnaire, un message part
-- vers le coach. C'est le seul moment du tunnel ou une action se produit
-- sans lui, donc le seul qui a besoin d'etre annonce.
--
-- Le declenchement se fait dans la base, au moment exact de la validation.
-- Pas de scrutation periodique : une automatisation qui interroge toutes les
-- heures est une automatisation de plus a surveiller.
--
-- La cle Resend n'est PAS dans ce fichier. Elle vit dans le coffre du projet
-- sous le nom « resend_api_key », et se pose une seule fois, hors migration.
-- =====================================================================

-- Adresse de destination. Une seule ligne a changer si elle evolue.
create or replace function public.pm_destinataire_notifications()
returns text language sql immutable as $$
  select 'myattractor1@gmail.com'
$$;

create or replace function public.pm_notifier_fin_questionnaire(p_parcours uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_cle    text;
  v_p      public.pm_parcours;
  v_sujet  text;
  v_corps  text;
  v_req    bigint;
begin
  select * into v_p from public.pm_parcours where id = p_parcours;
  if not found then return; end if;

  select decrypted_secret into v_cle
  from vault.decrypted_secrets where name = 'resend_api_key';

  if v_cle is null then
    insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
    values (p_parcours, 'notification', 'envoi', 'impossible : cle absente du coffre', 'systeme');
    return;
  end if;

  v_sujet := trim(coalesce(v_p.prenom, '') || ' ' || coalesce(v_p.nom, ''))
             || ' a terminé son questionnaire';

  -- Volontairement sans les scores. Un profil se restitue de vive voix, et un
  -- resultat lu dans une boite mail avant la seance change la seance.
  v_corps :=
    '<p>' || coalesce(v_p.prenom, 'La personne accompagnée') ||
    ' vient de valider son questionnaire.</p>' ||
    '<p>Le dépouillement est calculé et son décryptage est ouvert dans l''espace coaching.</p>' ||
    '<p><a href="https://coaching.agenceattractor.com">Ouvrir l''espace coaching</a></p>' ||
    '<hr><p style="color:#8A8F97;font-size:13px">Message automatique de l''espace coaching. ' ||
    'Les réponses et les scores ne sont jamais envoyés par message : ils se consultent ' ||
    'dans l''espace, et se restituent en séance.</p>';

  -- Envoi sans attente de reponse. Si Resend est indisponible, la validation
  -- de la personne accompagnee ne doit surtout pas echouer pour autant :
  -- elle vient de repondre a 135 affirmations.
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_cle,
      'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Espace coaching <noreply@agenceattractor.com>',
      'to', jsonb_build_array(public.pm_destinataire_notifications()),
      'subject', v_sujet,
      'html', v_corps),
    timeout_milliseconds := 5000
  ) into v_req;

  -- La trace de l'envoi est ecrite dans le journal, avec l'identifiant de la
  -- requete. Sans elle, une notification qui ne part pas ne se voit nulle part,
  -- et une automatisation qu'on ne peut pas verifier est une dette.
  insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
  values (p_parcours, 'notification', 'envoi', 'demandé, requête ' || v_req, 'systeme');
end $$;

revoke all on function public.pm_notifier_fin_questionnaire(uuid) from public, anon, authenticated;
revoke all on function public.pm_destinataire_notifications() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Branchement dans la validation
-- ---------------------------------------------------------------------

create or replace function public.pm_questionnaire_valider(p_jeton text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v      public.pm_parcours;
  q      public.pm_questionnaires;
  v_att  int;
  v_scores jsonb;
begin
  v := pm_parcours_par_jeton(p_jeton);

  select * into q from public.pm_questionnaires where parcours_id = v.id for update;
  if not found then raise exception 'questionnaire introuvable'; end if;
  if q.statut = 'rempli' then raise exception 'questionnaire deja valide'; end if;

  select count(*) into v_att from public.pm_items;
  if (select count(*) from jsonb_object_keys(q.reponses)) <> v_att then
    raise exception 'questionnaire incomplet';
  end if;

  select jsonb_object_agg(t.type::text, t.somme) into v_scores
  from (
    select i.type, sum((q.reponses ->> i.numero::text)::int) as somme
    from public.pm_items i
    group by i.type
  ) t;

  update public.pm_questionnaires
     set scores = v_scores, statut = 'rempli', rempli_le = now()
   where id = q.id;

  update public.pm_parcours set jeton_actif = false where id = v.id;

  insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
  values (v.id, 'questionnaire', 'statut', 'rempli', 'la personne accompagnee');

  -- La notification ne peut jamais faire echouer la validation.
  begin
    perform public.pm_notifier_fin_questionnaire(v.id);
  exception when others then
    insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
    values (v.id, 'notification', 'envoi', 'echec : ' || left(SQLERRM, 120), 'systeme');
  end;

  return jsonb_build_object('valide', true);
end $$;

grant execute on function public.pm_questionnaire_valider(text) to anon, authenticated;
