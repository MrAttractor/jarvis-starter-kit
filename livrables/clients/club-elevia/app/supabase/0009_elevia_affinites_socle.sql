-- ════════════════════════════════════════════════════════════════════════
-- 0009 — Module 3, le socle : le questionnaire et les réponses
--
-- POURQUOI LES QUESTIONS SONT EN BASE ET NON DANS LE CODE
--
-- Le questionnaire d'affinités attend l'arbitrage de la Cliente depuis le
-- 07/08/2026, et c'est légitime : il porte son regard sur les gens, pas le
-- nôtre. Mais l'attendre les bras croisés coûtait un mois de retard sur un
-- prototype dû le 28/09.
--
-- La sortie est de ne jamais écrire une question dans le code. Une question
-- est une ligne de cette table : son libellé, son type de réponse, ses
-- options, son poids dans le calcul. L'écran se construit tout seul à partir
-- de ce qu'il lit ici.
--
-- Conséquence concrète : quand la Cliente répond « je retire la 20, je
-- reformule la 9 », personne ne touche au code, ne redéploie rien et ne
-- reteste rien. C'est un UPDATE. Et les quatre questions sensibles au sens de
-- l'article 9 du RGPD entrent déjà ici, inactives, prêtes à être ouvertes le
-- jour où son juriste s'est prononcé.
--
-- Les trente questions insérées plus bas sont la PROPOSITION du 14/09/2026,
-- pas un choix de l'agence : elles existent pour que le module se construise
-- et se teste. Les vingt-six non sensibles sont actives, les quatre autres
-- attendent. Rien ici n'est montré à une membre avant validation de la
-- Cliente (drapeau `publie` de el_questionnaire_etat).
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. La définition des questions ──────────────────────────────────────
create table if not exists public.el_questions (
  code          text primary key,
  numero        int  not null,
  partie        text not null check (partie in ('identite','rythme','attentes','affinites','cadre')),
  libelle       text not null,
  aide          text,
  -- Types rendus par l'écran. En ajouter un demande de toucher au code, en
  -- ajouter une question non.
  type          text not null check (type in (
                  'ville','villes','liste_multi','liste','choix','choix_multi',
                  'texte_court','texte_long','mots_cles','classement','tranche_age'
                )),
  options       jsonb not null default '[]'::jsonb,
  max_choix     int,
  obligatoire   boolean not null default false,
  -- Sensible au sens de l'article 9 du RGPD : consentement distinct exigé,
  -- « je préfère ne pas répondre » toujours proposé, jamais obligatoire.
  sensible      boolean not null default false,
  active        boolean not null default true,
  -- 0 = la réponse est affichée mais n'entre pas dans le calcul d'affinités.
  poids         numeric(4,2) not null default 0,
  -- Comment la réponse se compare à celle d'un autre membre.
  comparaison   text not null default 'aucune' check (comparaison in (
                  'aucune','egalite','intersection','proximite_echelle','reciproque'
                )),
  -- Pour 'proximite_echelle' : l'ordre des options fait la distance.
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);

create index if not exists el_questions_ordre on public.el_questions (numero);

comment on table public.el_questions is
  'Définition du questionnaire d''affinités. Modifiable sans redéploiement : '
  'une question retirée ou reformulée par la Cliente est un UPDATE ici.';

-- ── 2. Les réponses des membres ─────────────────────────────────────────
create table if not exists public.el_reponses (
  membre_id     uuid not null references public.el_membres(id) on delete cascade,
  question_code text not null references public.el_questions(code) on delete cascade,
  valeur        jsonb not null,
  maj_le        timestamptz not null default now(),
  primary key (membre_id, question_code)
);

create index if not exists el_reponses_membre on public.el_reponses (membre_id);

comment on table public.el_reponses is
  'Réponses au questionnaire. La suppression d''un membre emporte ses réponses '
  '(cascade), conformément à ce que promet la politique de confidentialité.';

-- ── 3. L'état du questionnaire, côté Cliente ────────────────────────────
-- Tant que `publie` est faux, aucune membre ne voit le questionnaire. Il
-- passe à vrai le jour où la Cliente a validé sa liste de questions.
create table if not exists public.el_questionnaire_etat (
  id            boolean primary key default true check (id),
  publie        boolean not null default false,
  valide_le     timestamptz,
  valide_par    text,
  note          text,
  maj_le        timestamptz not null default now()
);

insert into public.el_questionnaire_etat (id, publie, note)
values (true, false, 'Proposition du 14/09/2026 envoyée à la Cliente, en attente de sa validation. Aucune question n''est montrée aux membres tant que publie est faux.')
on conflict (id) do nothing;

-- ── 4. Fermeture : rien n'est lisible ni modifiable en direct ───────────
-- Tout passe par l'edge function, qui porte le jeton de session. Même
-- principe que le reste de l'application : la clé anon ne donne accès à rien.
alter table public.el_questions            enable row level security;
alter table public.el_reponses             enable row level security;
alter table public.el_questionnaire_etat   enable row level security;

revoke all on public.el_questions          from anon, authenticated;
revoke all on public.el_reponses           from anon, authenticated;
revoke all on public.el_questionnaire_etat from anon, authenticated;

-- ── 5. La proposition du 14/09/2026 ─────────────────────────────────────
-- Vingt-six actives, quatre inactives parce que sensibles. Les libellés sont
-- ceux du document remis à la Cliente, au mot près : s'ils divergent, c'est
-- le document qu'elle a lu qui fait foi.
insert into public.el_questions
  (code, numero, partie, libelle, aide, type, options, max_choix, obligatoire, sensible, active, poids, comparaison)
values
-- ═══ Première partie : qui vous êtes ═══
('ville', 1, 'identite', 'Dans quelle ville vivez-vous aujourd''hui ?', null,
 'ville', '[]', null, true, false, true, 1.50, 'egalite'),

('villes_attaches', 2, 'identite', 'Quelles autres villes comptent dans votre vie ?',
 'Jusqu''à trois villes. C''est ce qui rapproche deux membres qui ne vivent pas au même endroit mais qui retournent au même endroit.',
 'villes', '[]', 3, false, false, true, 1.00, 'intersection'),

('langues', 3, 'identite', 'Quelles langues parlez-vous couramment ?', null,
 'liste_multi',
 '["Français","Anglais","Espagnol","Portugais","Italien","Allemand","Arabe","Néerlandais","Créole","Lingala","Wolof","Bambara","Baoulé","Dioula","Peul","Swahili","Autre"]',
 null, true, false, true, 3.00, 'intersection'),

('secteur', 4, 'identite', 'Quel est votre domaine d''activité ?',
 'Le secteur, jamais le nom de votre employeur : la discrétion est une promesse du Club.',
 'liste',
 '["Entrepreneuriat","Finance et investissement","Droit","Santé","Technologie","Immobilier","Commerce et distribution","Industrie","Conseil","Art et création","Médias et communication","Éducation","Sport","Hôtellerie et restauration","Institutions et secteur public","Autre"]',
 null, true, false, true, 0.50, 'egalite'),

('parcours', 5, 'identite', 'Où en êtes-vous dans votre parcours ?', null,
 'choix',
 '["Je construis quelque chose","Je dirige","Je transmets et j''accompagne","Je me réinvente"]',
 null, true, false, true, 1.50, 'egalite'),

('trois_mots', 6, 'identite', 'En trois mots, comment vos proches vous décriraient-ils ?',
 'Ces trois mots apparaissent sur votre profil.',
 'mots_cles', '[]', 3, false, false, true, 0, 'aucune'),

-- ═══ Deuxième partie : votre vie et votre rythme ═══
('voyages', 7, 'rythme', 'Combien de fois quittez-vous votre pays dans l''année ?', null,
 'choix',
 '["Rarement","Deux ou trois fois","Souvent","Je vis entre plusieurs pays"]',
 null, true, false, true, 1.50, 'proximite_echelle'),

('nature_voyages', 8, 'rythme', 'Vos déplacements sont surtout…', null,
 'choix_multi',
 '["Professionnels","Familiaux","De loisir","Je ne me déplace pas beaucoup"]',
 null, false, false, true, 0.50, 'intersection'),

('soiree', 9, 'rythme', 'Une soirée réussie, pour vous, ressemble plutôt à…', null,
 'choix',
 '["Une table de six","Un tête-à-tête","Un grand événement","Recevoir chez soi"]',
 null, true, false, true, 2.00, 'egalite'),

('disponibilite', 10, 'rythme', 'Quand êtes-vous le plus disponible ?', null,
 'choix_multi',
 '["En semaine","Le week-end","Cela dépend des périodes"]',
 null, true, false, true, 1.50, 'intersection'),

('place_travail', 11, 'rythme', 'Quelle place tient votre travail dans votre vie en ce moment ?', null,
 'choix',
 '["Il passe avant le reste","Il compte beaucoup mais j''ai trouvé un équilibre","Je lève le pied","Je suis dans une autre étape"]',
 null, true, false, true, 1.50, 'proximite_echelle'),

-- ═══ Troisième partie : ce que vous venez chercher ═══
('intentions', 12, 'attentes', 'Qu''attendez-vous d''abord du Club ?',
 'Classez par ordre d''importance. C''est ce qui évite qu''une membre venue chercher un cercle professionnel reçoive des propositions amoureuses.',
 'classement',
 '["Des amitiés de qualité","Un cercle professionnel","Du conseil et du mentorat","Une rencontre amoureuse","Des lieux et des expériences"]',
 null, true, false, true, 5.00, 'intersection'),

('rayon', 13, 'attentes', 'Préférez-vous rencontrer des membres de votre ville, ou partout dans le monde ?', null,
 'choix',
 '["Ma ville d''abord","Mon pays","Partout, la distance ne me gêne pas"]',
 null, true, false, true, 0, 'aucune'),

('rythme_rencontres', 14, 'attentes', 'Combien de nouvelles personnes souhaitez-vous rencontrer par mois ?', null,
 'choix',
 '["Une","Deux ou trois","Davantage","Je préfère ne pas me fixer de nombre"]',
 null, true, false, true, 0, 'aucune'),

('initiative', 15, 'attentes', 'Comment préférez-vous que les rencontres se fassent ?', null,
 'choix',
 '["Je découvre les profils et je fais le premier pas","On me propose des profils choisis","Les deux"]',
 null, true, false, true, 0, 'aucune'),

('reussite', 16, 'attentes', 'Dans six mois, qu''est-ce qui vous fera dire que le Club en valait la peine ?',
 'Cette réponse n''entre dans aucun calcul. Elle est lue par l''équipe à l''admission.',
 'texte_long', '[]', null, false, false, true, 0, 'aucune'),

-- ═══ Quatrième partie : vos affinités ═══
('sujets', 17, 'affinites', 'Sur quels sujets aimez-vous échanger ?',
 'Cinq au maximum. La limite est volontaire : sans elle, tout le monde coche tout et la question ne distingue plus personne.',
 'choix_multi',
 '["Entrepreneuriat","Investissement","Art et culture","Sport","Gastronomie","Voyage","Éducation","Philanthropie","Technologie","Mode","Immobilier","Santé et bien-être"]',
 5, true, false, true, 4.00, 'intersection'),

('temps_libre', 18, 'affinites', 'Que faites-vous de votre temps libre ?',
 'Deux ou trois lignes. C''est souvent cette phrase qui déclenche le premier message.',
 'texte_long', '[]', null, false, false, true, 0, 'aucune'),

('sport', 19, 'affinites', 'Quel est votre rapport au sport ?', null,
 'choix',
 '["C''est un pilier de ma vie","Je pratique régulièrement","De temps en temps","Ce n''est pas mon sujet"]',
 null, true, false, true, 1.00, 'proximite_echelle'),

('spiritualite', 20, 'affinites', 'Quelle place la spiritualité ou la foi tient-elle dans votre vie ?',
 'Facultatif. Cette information est sensible au sens de la loi européenne : elle n''est enregistrée qu''avec votre accord exprès.',
 'choix',
 '["Centrale","Présente","Discrète","Aucune","Je préfère ne pas répondre"]',
 null, false, true, false, 1.50, 'proximite_echelle'),

('attaches', 21, 'affinites', 'Quelle importance donnez-vous à vos attaches culturelles ?',
 'Facultatif. La question porte sur l''importance que vous leur donnez, jamais sur lesquelles. Information sensible au sens de la loi européenne.',
 'choix',
 '["Elles structurent ma vie","Elles comptent","Elles sont une partie de moi parmi d''autres","Je préfère ne pas répondre"]',
 null, false, true, false, 1.50, 'proximite_echelle'),

('temperament', 22, 'affinites', 'Auprès de quel type de personne vous sentez-vous à l''aise ?', null,
 'choix_multi',
 '["Les gens réservés","Les gens expansifs","Ceux qui font rire","Ceux qui écoutent","Ceux qui bousculent","Ceux qui rassurent"]',
 3, true, false, true, 2.00, 'intersection'),

('sujets_eviter', 23, 'affinites', 'Y a-t-il des sujets que vous préférez éviter ?',
 'Facultatif. Lu par l''équipe, jamais par un automate.',
 'texte_long', '[]', null, false, false, true, 0, 'aucune'),

-- ═══ Cinquième partie : le cadre que vous posez ═══
('rencontrer_qui', 24, 'cadre', 'Souhaitez-vous être mise en relation avec…',
 'Facultatif dès lors qu''une intention amoureuse est retenue : cette combinaison est sensible au sens de la loi européenne.',
 'choix_multi', '["Des femmes","Des hommes","Les deux"]',
 null, false, true, false, 0, 'reciproque'),

('tranche_age', 25, 'cadre', 'Quelle tranche d''âge vous convient ?',
 'Votre âge exact n''est jamais affiché. Seule la tranche entre dans les rapprochements.',
 'tranche_age', '[]', null, true, false, true, 0, 'reciproque'),

('situation', 26, 'cadre', 'Quelle est votre situation aujourd''hui ?',
 'Facultatif. N''a de sens que si vous avez retenu une intention amoureuse. Information sensible au sens de la loi européenne.',
 'choix',
 '["Célibataire","En couple","C''est plus compliqué que cela","Je préfère ne pas répondre"]',
 null, false, true, false, 0, 'aucune'),

('non_negociable', 27, 'cadre', 'Y a-t-il quelque chose que vous ne transigez pas ?',
 'Facultatif. Lu par l''équipe, jamais par un automate.',
 'texte_long', '[]', null, false, false, true, 0, 'aucune'),

('discretion', 28, 'cadre', 'Quelle discrétion attendez-vous ?', null,
 'choix',
 '["Mon profil peut être découvert par tous les membres vérifiés","Uniquement par ceux à qui le Club me propose","Je veux valider avant d''être visible"]',
 null, true, false, true, 0, 'aucune'),

('alertes', 29, 'cadre', 'Souhaitez-vous être prévenue lorsqu''un profil vous correspond ?', null,
 'choix',
 '["Oui, par e-mail","Oui, uniquement dans le Club","Non, je viendrai voir moi-même"]',
 null, true, false, true, 0, 'aucune'),

('autre_chose', 30, 'cadre', 'Y a-t-il autre chose que nous devrions savoir ?',
 'Facultatif.',
 'texte_long', '[]', null, false, false, true, 0, 'aucune')

on conflict (code) do nothing;

-- ── 6. Contrôle ─────────────────────────────────────────────────────────
select
  count(*)                                    as total,
  count(*) filter (where active)              as actives,
  count(*) filter (where sensible)            as sensibles,
  count(*) filter (where poids > 0)           as entrent_dans_le_calcul,
  (select publie from public.el_questionnaire_etat) as montre_aux_membres
from public.el_questions;
