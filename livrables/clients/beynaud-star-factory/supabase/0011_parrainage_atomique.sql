-- ════════════════════════════════════════════════════════════════════════
-- 0011 — Le compteur de parrainage ne perd plus de points
--
-- LE DÉFAUT, TROUVÉ EN LISANT LE CODE LE 17/09/2026
--
-- `bey-public`, action « join », créditait le parrain en DEUX temps :
--
--     const p = await sb(`bey_membres?code_ambassadeur=eq.${ref}&select=...`)
--     const nf = (p[0].filleuls || 0) + 1;
--     await sb(`bey_membres?id=eq.${p[0].id}`, { method: "PATCH", ... })
--
-- Entre la lecture et l'écriture, rien ne protège la ligne. Deux personnes qui
-- s'inscrivent au même instant sur le même lien lisent toutes les deux 5, et
-- écrivent toutes les deux 6. **Le deuxième parrainage est perdu**, sans trace,
-- sans erreur, et sans moyen de reconstituer la vérité après coup.
--
-- Aucune dérive constatée à ce jour : 3 parrainages en tout, jamais simultanés.
-- C'est précisément pour ça qu'on corrige maintenant. Le jour où le concours
-- aura un prix et où le lien circulera, les inscriptions arriveront par paquets,
-- et c'est exactement ce dont les Ambassadeurs se plaindront en premier.
--
-- LA CORRECTION
--
-- Un seul UPDATE. PostgreSQL verrouille la ligne le temps de l'écriture, donc
-- deux appels simultanés se mettent en file au lieu de s'écraser. Le passage au
-- grade Ambassadeur est calculé dans le même mouvement : le séparer rouvrirait
-- la même fenêtre pour le grade.
--
-- Le seuil est passé en paramètre plutôt qu'écrit ici. Il vaut 5 dans
-- `bey-public` (AMB_THRESHOLD) et une valeur en dur dans la base finirait par
-- diverger de celle du code, sans que personne ne s'en aperçoive.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.bey_crediter_parrain(p_code text, p_seuil int)
returns table (id uuid, filleuls int, grade text)
language sql volatile security definer set search_path = public as $$
  update public.bey_membres
     set filleuls = coalesce(filleuls, 0) + 1,
         grade = case
                   when coalesce(filleuls, 0) + 1 >= p_seuil and grade <> 'ambassadeur'
                     then 'ambassadeur'
                   else grade
                 end
   where code_ambassadeur = p_code
  returning bey_membres.id, bey_membres.filleuls, bey_membres.grade;
$$;

-- Personne n'appelle ça depuis le navigateur : le crédit d'un parrainage se
-- décide dans la fonction d'inscription, jamais à la demande du client. Sans
-- ce retrait, n'importe qui pourrait s'auto-créditer autant de filleuls qu'il
-- veut avec la clé publique lisible dans la page.
revoke all on function public.bey_crediter_parrain(text, int) from public, anon, authenticated;

-- ── La réparation, pour l'écart déjà creusé s'il y en a un ──
-- Le compteur est une copie : la vérité est le nombre de membres qui portent le
-- code du parrain. Cette fonction recale la copie sur la vérité. Elle ne sert
-- pas au fonctionnement courant, elle sert le jour où l'on doute du classement.
create or replace function public.bey_recaler_parrainages(p_seuil int)
returns table (code_ambassadeur text, avant int, apres int)
language sql volatile security definer set search_path = public as $$
  with verite as (
    select m.id,
           m.code_ambassadeur,
           m.filleuls as avant,
           (select count(*) from public.bey_membres f where f.parraine_par = m.code_ambassadeur)::int as apres
      from public.bey_membres m
  ), corriges as (
    update public.bey_membres m
       set filleuls = v.apres,
           grade = case
                     when v.apres >= p_seuil then 'ambassadeur'
                     when m.grade = 'ambassadeur' then m.grade   -- on ne rétrograde jamais quelqu'un
                     else m.grade
                   end
      from verite v
     where m.id = v.id and m.filleuls is distinct from v.apres
    returning m.code_ambassadeur, v.avant, v.apres
  )
  select * from corriges;
$$;

revoke all on function public.bey_recaler_parrainages(int) from public, anon, authenticated;

select 'migration 0011 appliquee' as resultat;
