-- Nettoyage du jeu d'essai de la recette « quatre manques du CDC ».
-- Supprimer les deux membres emporte en cascade leurs réponses, leurs
-- sessions, leurs relations, leurs messages et leurs signalements.
-- On le vérifie plutôt que de le supposer : le compte final doit être à zéro
-- partout, et le nombre de membres revenu à ce qu'il était.
delete from public.el_membres where pseudo_norm in ('recettea','recetteb');

select
  (select count(*) from public.el_membres where pseudo_norm in ('recettea','recetteb')) as membres_restants,
  (select count(*) from public.el_sessions where jeton like 'recette-m3-suite-%')       as sessions_restantes,
  (select count(*) from public.el_reponses r
     where not exists (select 1 from public.el_membres m where m.id = r.membre_id))     as reponses_orphelines,
  (select count(*) from public.el_relations r
     where not exists (select 1 from public.el_membres m where m.id = r.demandeur_id)
        or not exists (select 1 from public.el_membres m where m.id = r.destinataire_id)) as relations_orphelines,
  (select count(*) from public.el_messages x
     where not exists (select 1 from public.el_relations r where r.id = x.relation_id)) as messages_orphelins,
  (select count(*) from public.el_signalements s
     where not exists (select 1 from public.el_membres m where m.id = s.signaleur_id)
        or not exists (select 1 from public.el_membres m where m.id = s.signale_id))    as signalements_orphelins,
  (select count(*) from public.el_membres)                                              as membres_total,
  (select count(*) from public.el_relations)                                            as relations_total,
  (select count(*) from public.el_messages)                                             as messages_total,
  (select count(*) from public.el_signalements)                                         as signalements_total;
