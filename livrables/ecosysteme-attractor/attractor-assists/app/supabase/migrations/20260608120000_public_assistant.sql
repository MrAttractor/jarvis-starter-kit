-- Pivot V2 — Tranche 1 : assistant client généré par l'entrepreneur et
-- partagé à SES clients via un lien public (assists.agenceattractor.com/?c={slug})

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS client_assistant_prompt text,
  ADD COLUMN IF NOT EXISTS client_assistant_ready boolean NOT NULL DEFAULT false;

-- Anamnèse métier — base de la génération du system_prompt personnalisé
CREATE TABLE IF NOT EXISTS public.business_anamnese (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ce_quil_vend text,
  clients text,
  faq jsonb,
  stock text,
  paiement text,
  livraison text,
  ce_qui_fatigue text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_anamnese ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anamnese self" ON public.business_anamnese
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Conversations publiques : un client externe (sans compte) discute avec
-- l'assistant de l'entrepreneur — la conversation reste rattachée à son
-- propre compte (user_id = entrepreneur) pour apparaître dans son dashboard
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS client_contact text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
