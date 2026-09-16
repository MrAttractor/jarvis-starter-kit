-- ════════════════════════════════════════════════════════════════════════
-- 0013 — Qui a le droit d'être proposé dans la découverte
--
-- TROUVÉ EN RECETTE DU MODULE 3, LE 16/09/2026, ET MESURÉ
--
-- Le compte d'équipe `EquipeElevia` était proposé à une membre comme une
-- correspondance, avec un score de 0 et aucune raison à afficher. Deux
-- défauts distincts se rejoignaient sur la même carte.
--
-- 1. LE COMPTE D'ÉQUIPE EST UN PROFIL DE RENCONTRE.
--    Le dossier notait cet angle mort dès le 06/08 : « administrer
--    imposerait un profil de rencontre visible dans la découverte ». La
--    migration 0007 a créé le rôle sans fermer la porte, donc l'angle mort
--    est devenu un défaut le jour où la découverte est passée en ligne.
--    La Cliente l'aurait vu à sa première ouverture.
--
-- 2. QUI N'A RIEN RÉPONDU PASSE TOUS LES ÉCARTS.
--    Chaque règle d'écart du moteur est gardée par `is not null` des DEUX
--    côtés, ce qui est juste pris une par une : on n'écarte pas quelqu'un
--    sur une information qu'on n'a pas. Mais l'effet cumulé est l'inverse
--    de l'intention : un membre sans aucune réponse ne déclenche AUCUN
--    écart, et se retrouve proposé à tout le monde, partout, avec un score
--    de 0. Le profil le plus vide possible est le plus facile à proposer.
--
--    Mesuré : EquipeElevia, 0 réponse, `ecarte` faux, score 0. RecetteB,
--    20 réponses, score 92. La carte vide était présentée comme la seconde
--    meilleure correspondance parce qu'il n'y en avait que deux.
--
-- L'ASYMÉTRIE QUI EST LA CAUSE. Pour VOIR la découverte, il faut avoir
-- terminé le questionnaire : la fonction de bord le vérifie. Pour Y ÊTRE
-- PROPOSÉ, rien n'était demandé. On exige donc désormais la même chose des
-- deux côtés, ce qui est aussi ce que promet l'écran : « Choisis parmi les
-- membres vérifiés, et présentés avec la raison pour laquelle ils vous sont
-- proposés. » Sans réponses, il n'y a aucune raison à présenter.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.el_profils_compatibles(p_membre uuid, p_limite int default 12)
returns table (
  membre_id uuid, pseudo text, ville jsonb, parcours jsonb,
  trois_mots jsonb, score int, raisons jsonb
)
language sql stable security definer set search_path = public as $$
  with autres as (
    select m.id, m.pseudo
      from public.el_membres m
     where m.id <> p_membre
       and m.statut_verif = 'valide'      -- le Club ne propose que des membres vérifiés
       and m.statut = 'actif'
       -- Un compte d'équipe administre, il ne se fait pas rencontrer.
       and m.role <> 'agent'
       -- Et on ne propose que quelqu'un qui a dit ce qu'il cherche : c'est
       -- déjà exigé pour ENTRER dans la découverte, ça manquait pour Y ÊTRE.
       and (public.el_avancee_questionnaire(m.id)->>'complet')::boolean
       and not exists (                   -- retrait immédiat le temps de l'examen
         select 1 from public.el_signalements s
          where s.signale_id = m.id and s.statut = 'ouvert'
       )
  ), notes as (
    select a.id, a.pseudo, public.el_affinite(p_membre, a.id) as a_score
      from autres a
  )
  select n.id, n.pseudo,
         public.el_rep(n.id,'ville'),
         public.el_rep(n.id,'parcours'),
         public.el_rep(n.id,'trois_mots'),
         (n.a_score->>'score')::int,
         n.a_score->'raisons'
    from notes n
   where (n.a_score->>'ecarte')::boolean is false
   order by (n.a_score->>'score')::int desc, n.pseudo
   limit greatest(1, least(p_limite, 50));
$$;

revoke all on function public.el_profils_compatibles(uuid,int) from public, anon, authenticated;

select 'migration 0013 appliquee' as resultat;
