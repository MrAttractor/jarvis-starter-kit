-- ════════════════════════════════════════════════════════════════════════
-- 0010 — Module 3, le moteur : comment deux membres se correspondent
--
-- CE QUE CE MOTEUR FAIT, ET CE QU'IL NE FAIT PAS
--
-- Il ne classe pas des gens. Il écarte d'abord ce qui ne peut pas marcher,
-- puis il explique ce qui rapproche les autres. La différence est le cœur du
-- positionnement : une application de masse pousse du volume et laisse le
-- membre trier ; un club privé montre peu, et dit pourquoi.
--
-- DEUX ÉTAGES, DANS CET ORDRE
--
-- 1. Les écarts. Des faits, pas des nuances : aucune langue commune, des
--    tranches d'âge qui ne se recouvrent pas, aucune intention partagée,
--    une personne qui a demandé à ne pas être découverte. Un seul suffit à
--    retirer le profil, et aucun score ne le rattrape. Une bonne note ne
--    doit jamais faire passer devant une impossibilité.
--
-- 2. Le score, et surtout SES RAISONS. Le score sert à ordonner, les raisons
--    sont ce qu'on montre : « trois sujets en commun, toutes deux à Paris,
--    même rythme de vie ». Un score nu ne vaut rien pour la membre, et il
--    est indéfendable le jour où elle demande pourquoi ce profil-là.
--
-- Le poids de chaque question vit dans `el_questions.poids`, pas ici : la
-- Cliente peut donc changer l'importance d'une question sans redéploiement,
-- et une question retirée sort du calcul toute seule.
--
-- Aucune décision automatique n'est prise sur une personne : le moteur
-- propose un ordre d'affichage, la mise en relation reste demandée et
-- acceptée par des humains (Avenant n°1, Art. 15, absence de décision
-- automatisée).
-- ════════════════════════════════════════════════════════════════════════

-- ── Lecture d'une réponse ───────────────────────────────────────────────
create or replace function public.el_rep(p_membre uuid, p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select valeur from public.el_reponses
   where membre_id = p_membre and question_code = p_code;
$$;

-- ── Les éléments communs à deux réponses de type liste ──────────────────
create or replace function public.el_communs(a jsonb, b jsonb)
returns text[] language sql immutable as $$
  select coalesce(array_agg(x), '{}')
    from (select jsonb_array_elements_text(a) intersect
          select jsonb_array_elements_text(b)) t(x);
$$;

-- ── Distance entre deux réponses sur une échelle ordonnée ───────────────
-- Les options sont ordonnées dans la définition de la question : la distance
-- est l'écart de rang, ramené entre 0 et 1.
create or replace function public.el_distance_echelle(p_code text, a jsonb, b jsonb)
returns numeric language plpgsql stable security definer set search_path = public as $$
declare opts jsonb; ia int; ib int; n int;
begin
  select options into opts from public.el_questions where code = p_code;
  if opts is null or jsonb_array_length(opts) < 2 then return null; end if;
  n := jsonb_array_length(opts);

  select ord - 1 into ia from (
    select o, row_number() over () as ord from jsonb_array_elements_text(opts) o
  ) t where o = (a #>> '{}');
  select ord - 1 into ib from (
    select o, row_number() over () as ord from jsonb_array_elements_text(opts) o
  ) t where o = (b #>> '{}');

  if ia is null or ib is null then return null; end if;
  return abs(ia - ib)::numeric / (n - 1);
end $$;

-- ── L'âge, jamais affiché, seulement comparé ────────────────────────────
create or replace function public.el_age(p_membre uuid)
returns int language sql stable security definer set search_path = public as $$
  select extract(year from age(date_naissance))::int
    from public.el_membres where id = p_membre;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- L'AFFINITÉ ENTRE DEUX MEMBRES
-- Retourne { ecarte, motif, score, raisons[] }.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.el_affinite(p_a uuid, p_b uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  q             record;
  va            jsonb;
  vb            jsonb;
  communs       text[];
  dist          numeric;
  gagne         numeric := 0;   -- points obtenus
  total         numeric := 0;   -- points possibles
  raisons       jsonb   := '[]'::jsonb;
  age_a         int;
  age_b         int;
  tranche_a     jsonb;
  tranche_b     jsonb;
  intentions_a  jsonb;
  intentions_b  jsonb;
  top_a         text[];
  top_b         text[];
begin
  if p_a = p_b then
    return jsonb_build_object('ecarte', true, 'motif', 'même membre', 'score', 0, 'raisons', '[]'::jsonb);
  end if;

  -- ══ Étage 1 : les écarts ══════════════════════════════════════════════

  -- Une langue commune, sinon la conversation n'existe pas.
  communs := el_communs(el_rep(p_a,'langues'), el_rep(p_b,'langues'));
  if el_rep(p_a,'langues') is not null and el_rep(p_b,'langues') is not null
     and cardinality(communs) = 0 then
    return jsonb_build_object('ecarte', true, 'motif', 'aucune langue commune', 'score', 0, 'raisons', '[]'::jsonb);
  end if;

  -- Les tranches d'âge doivent se convenir DANS LES DEUX SENS.
  age_a := el_age(p_a); age_b := el_age(p_b);
  tranche_a := el_rep(p_a,'tranche_age'); tranche_b := el_rep(p_b,'tranche_age');
  if tranche_a is not null and age_b is not null then
    if age_b < (tranche_a->>'min')::int or age_b > (tranche_a->>'max')::int then
      return jsonb_build_object('ecarte', true, 'motif', 'hors de la tranche d''âge souhaitée', 'score', 0, 'raisons', '[]'::jsonb);
    end if;
  end if;
  if tranche_b is not null and age_a is not null then
    if age_a < (tranche_b->>'min')::int or age_a > (tranche_b->>'max')::int then
      return jsonb_build_object('ecarte', true, 'motif', 'hors de la tranche d''âge souhaitée', 'score', 0, 'raisons', '[]'::jsonb);
    end if;
  end if;

  -- Au moins une intention partagée dans les deux premiers rangs. Sans cela,
  -- une membre venue chercher un cercle professionnel se verrait proposer
  -- quelqu'un qui cherche une rencontre amoureuse.
  intentions_a := el_rep(p_a,'intentions'); intentions_b := el_rep(p_b,'intentions');
  if intentions_a is not null and intentions_b is not null then
    select coalesce(array_agg(x), '{}') into top_a
      from (select jsonb_array_elements_text(intentions_a) x limit 2) t;
    select coalesce(array_agg(x), '{}') into top_b
      from (select jsonb_array_elements_text(intentions_b) x limit 2) t;
    if not (top_a && top_b) then
      return jsonb_build_object('ecarte', true, 'motif', 'vous ne cherchez pas la même chose', 'score', 0, 'raisons', '[]'::jsonb);
    end if;
  end if;

  -- Qui a demandé à valider avant d'être visible n'est pas découvert.
  if (el_rep(p_b,'discretion') #>> '{}') = 'Je veux valider avant d''être visible' then
    return jsonb_build_object('ecarte', true, 'motif', 'ce membre valide avant d''être visible', 'score', 0, 'raisons', '[]'::jsonb);
  end if;

  -- Le genre souhaité, quand la question est ouverte (elle attend le juriste).
  if exists (select 1 from public.el_questions where code = 'rencontrer_qui' and active) then
    declare
      genre_a text := (select genre from public.el_membres where id = p_a);
      genre_b text := (select genre from public.el_membres where id = p_b);
      veut_a  jsonb := el_rep(p_a,'rencontrer_qui');
      veut_b  jsonb := el_rep(p_b,'rencontrer_qui');
      souhait text;
    begin
      souhait := case genre_b when 'femme' then 'Des femmes' when 'homme' then 'Des hommes' end;
      if veut_a is not null and souhait is not null
         and not (veut_a ? souhait or veut_a ? 'Les deux') then
        return jsonb_build_object('ecarte', true, 'motif', 'hors de ce que vous recherchez', 'score', 0, 'raisons', '[]'::jsonb);
      end if;
      souhait := case genre_a when 'femme' then 'Des femmes' when 'homme' then 'Des hommes' end;
      if veut_b is not null and souhait is not null
         and not (veut_b ? souhait or veut_b ? 'Les deux') then
        return jsonb_build_object('ecarte', true, 'motif', 'hors de ce que recherche ce membre', 'score', 0, 'raisons', '[]'::jsonb);
      end if;
    end;
  end if;

  -- ══ Étage 2 : le score, et ses raisons ════════════════════════════════
  for q in
    select code, poids, comparaison, libelle
      from public.el_questions
     where active and poids > 0
     order by numero
  loop
    va := el_rep(p_a, q.code);
    vb := el_rep(p_b, q.code);
    -- Une question sans réponse des deux côtés ne compte ni pour ni contre :
    -- elle sort du total, sinon un profil peu rempli pénaliserait l'autre.
    if va is null or vb is null then continue; end if;
    total := total + q.poids;

    if q.comparaison = 'egalite' then
      if va = vb then
        gagne := gagne + q.poids;
        if q.code = 'ville' then
          raisons := raisons || jsonb_build_object('quoi','ville','texte','Vous vivez dans la même ville');
        elsif q.code = 'soiree' then
          raisons := raisons || jsonb_build_object('quoi','soiree','texte','Vous aimez le même genre de soirées');
        elsif q.code = 'parcours' then
          raisons := raisons || jsonb_build_object('quoi','parcours','texte','Vous en êtes au même moment de votre parcours');
        elsif q.code = 'secteur' then
          raisons := raisons || jsonb_build_object('quoi','secteur','texte','Vous travaillez dans le même domaine');
        end if;
      end if;

    elsif q.comparaison = 'intersection' then
      communs := el_communs(va, vb);
      if cardinality(communs) > 0 then
        -- Proportion de ce qui est partagé, rapportée au plus petit des deux
        -- choix : deux personnes qui cochent peu et pareil se correspondent
        -- davantage que deux personnes qui cochent tout.
        gagne := gagne + q.poids * least(1.0,
          cardinality(communs)::numeric /
          greatest(1, least(jsonb_array_length(va), jsonb_array_length(vb))));
        if q.code = 'sujets' then
          raisons := raisons || jsonb_build_object('quoi','sujets',
            'texte', case when cardinality(communs) = 1
              then 'Un sujet en commun : ' || communs[1]
              else cardinality(communs) || ' sujets en commun : ' || array_to_string(communs, ', ') end);
        elsif q.code = 'langues' then
          raisons := raisons || jsonb_build_object('quoi','langues',
            'texte','Vous parlez ' || array_to_string(communs, ' et '));
        elsif q.code = 'villes_attaches' then
          raisons := raisons || jsonb_build_object('quoi','villes',
            'texte','Une ville vous relie : ' || array_to_string(communs, ', '));
        elsif q.code = 'intentions' then
          -- L'intention citée est celle que LE MEMBRE a classée le plus haut
          -- parmi les communes, pas la première venue de l'intersection :
          -- « vous cherchez la même chose » doit parler de ce qui compte le
          -- plus pour lui, sinon la phrase sonne faux.
          declare mieux text;
          begin
            select x into mieux
              from jsonb_array_elements_text(va) with ordinality t(x, rang)
             where x = any(communs)
             order by rang limit 1;
            raisons := raisons || jsonb_build_object('quoi','intentions',
              'texte','Vous cherchez la même chose : ' || lower(coalesce(mieux, communs[1])));
          end;
        elsif q.code = 'temperament' then
          raisons := raisons || jsonb_build_object('quoi','temperament',
            'texte','Vous êtes à l''aise avec le même genre de personnes');
        elsif q.code = 'disponibilite' then
          raisons := raisons || jsonb_build_object('quoi','disponibilite',
            'texte','Vous êtes disponibles aux mêmes moments');
        end if;
      end if;

    elsif q.comparaison = 'proximite_echelle' then
      dist := el_distance_echelle(q.code, va, vb);
      if dist is not null then
        gagne := gagne + q.poids * (1 - dist);
        if dist = 0 then
          if q.code = 'place_travail' then
            raisons := raisons || jsonb_build_object('quoi','rythme','texte','Vous donnez la même place à votre travail');
          elsif q.code = 'voyages' then
            raisons := raisons || jsonb_build_object('quoi','voyages','texte','Vous voyagez au même rythme');
          elsif q.code = 'sport' then
            raisons := raisons || jsonb_build_object('quoi','sport','texte','Même rapport au sport');
          end if;
        end if;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'ecarte',  false,
    'motif',   null,
    -- Sur 100, arrondi : un score au centième donnerait une fausse précision.
    'score',   case when total = 0 then 0 else round(100 * gagne / total) end,
    'compare', total,
    'raisons', raisons
  );
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- LES PROFILS À PROPOSER À UN MEMBRE
-- Vérifiés uniquement, écartés retirés, les meilleurs d'abord.
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

-- ── Fermeture ───────────────────────────────────────────────────────────
-- Rien de tout cela ne s'appelle depuis un navigateur : tout passe par
-- l'edge function, qui sait qui est connecté (R-68).
revoke all on function public.el_rep(uuid,text)                       from public, anon, authenticated;
revoke all on function public.el_communs(jsonb,jsonb)                 from public, anon, authenticated;
revoke all on function public.el_distance_echelle(text,jsonb,jsonb)   from public, anon, authenticated;
revoke all on function public.el_age(uuid)                            from public, anon, authenticated;
revoke all on function public.el_affinite(uuid,uuid)                  from public, anon, authenticated;
revoke all on function public.el_profils_compatibles(uuid,int)        from public, anon, authenticated;

comment on function public.el_affinite is
  'Affinité entre deux membres : écarts d''abord, puis score et ses raisons. '
  'Les poids viennent de el_questions, pas d''ici : la Cliente peut les changer '
  'sans redéploiement.';
