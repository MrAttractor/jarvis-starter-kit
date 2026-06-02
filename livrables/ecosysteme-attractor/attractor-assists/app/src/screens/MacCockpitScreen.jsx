import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Card, SectionLabel, Btn, Pill, Textarea, Sheet } from '../components/ui';

// ─── Données agents ─────────────────────────────────────────────────────────

const AGENTS_JARVIS = [
  // Pôle R&D
  { id: 'pilote',       pole: 'R&D',        nom: 'Pilote R&D',          role: 'Head of R&D / CTO',                    mecanisme: 'Reçoit les idées → reformule en plan exécutable → lance la chaîne R&D → attend GO avant toute livraison', accent: 'bg-[#2B6CB0]/10 text-[#2B6CB0]' },
  { id: 'eclaireur',    pole: 'R&D',        nom: 'Éclaireur',           role: 'Veille et benchmark',                  mecanisme: 'Analyse tendances, concurrents, opportunités marché → synthèse actionnables pour le Pilote', accent: 'bg-growth/10 text-growth' },
  { id: 'gardien',      pole: 'R&D',        nom: 'Gardien',             role: 'Validation et qualité',                mecanisme: 'Relit chaque livrable avant envoi client — vérifie cohérence, encodage, routes, prix', accent: 'bg-amber/10 text-amber' },
  { id: 'programmeur',  pole: 'R&D',        nom: 'Programmeur Senior',  role: 'Dev fullstack',                        mecanisme: 'Reçoit brief technique → code HTML/React/Supabase → livre fichiers propres', accent: 'bg-[#2B6CB0]/10 text-[#2B6CB0]' },
  { id: 'qa',           pole: 'R&D',        nom: 'QA Agent',            role: 'Tests et validation',                  mecanisme: 'Teste les livrables en conditions réelles → liste bugs → valide avant déploiement', accent: 'bg-amber/10 text-amber' },
  // Pôle Stratégie
  { id: 'commercial',   pole: 'Stratégie',  nom: 'Commercial',          role: 'Closing et relances',                  mecanisme: 'Pipeline prospects → séquences WhatsApp → relances → closing. Connaît le barème et les scripts prouvés', accent: 'bg-orange/10 text-orange' },
  { id: 'daf',          pole: 'Stratégie',  nom: 'DAF',                 role: 'Direction financière',                 mecanisme: 'Suit CA, projette revenus, analyse rentabilité, prépare déclarations URSSAF, alerte sur les risques', accent: 'bg-charbon/8 text-charbon' },
  { id: 'analyste',     pole: 'Stratégie',  nom: 'Analyste',            role: 'Analyse données et KPIs',              mecanisme: 'Lit données brutes → synthèse actionnables → alerte sur tendances importantes et ce qui freine', accent: 'bg-info/10 text-info' },
  { id: 'boussole',     pole: 'Stratégie',  nom: 'Boussole',            role: 'Orientation stratégique',              mecanisme: 'Analyse situation → recommande la direction prioritaire → aide à ne pas se disperser', accent: 'bg-orange/10 text-orange' },
  { id: 'comptes',      pole: 'Stratégie',  nom: 'Comptes',             role: 'Suivi facturation',                    mecanisme: 'Génère devis, factures, suivi paiements. Barème officiel embarqué. Jamais de prix hors barème', accent: 'bg-charbon/8 text-charbon' },
  { id: 'edito',        pole: 'Stratégie',  nom: 'Édito',               role: 'Stratégie de contenu',                 mecanisme: 'Tracke tendances → mappe sur offres → produit note opportunité quotidienne transmise au DAF et au Commercial', accent: 'bg-[#2B6CB0]/10 text-[#2B6CB0]' },
  // Pôle Contenu
  { id: 'cm',           pole: 'Contenu',    nom: 'Community Manager',   role: 'Voix et contenu',                      mecanisme: 'Posts Facebook/Instagram, scripts vidéo, messages WhatsApp broadcast, séquences email, calendrier éditorial', accent: 'bg-amber/10 text-amber' },
  { id: 'da',           pole: 'Contenu',    nom: 'Directeur Artistique', role: 'Design et visuels',                   mecanisme: 'Direction créative visuels — Canva Pro, direction photo, maquettes, design system orange/charbon/sable', accent: 'bg-orange/10 text-orange' },
  { id: 'crea',         pole: 'Contenu',    nom: 'Créa IA',             role: 'Génération créative IA',               mecanisme: 'Prompts Midjourney/DALL·E, storyboards, maquettes visuelles, identités visuelles clients', accent: 'bg-growth/10 text-growth' },
  { id: 'mediab',       pole: 'Contenu',    nom: 'Média Buyer',         role: 'Publicité payante',                    mecanisme: 'Structure campagnes Facebook/Meta Ads, audiences CI/diaspora, optimisation CPC, analyse ROAS', accent: 'bg-info/10 text-info' },
  { id: 'ambassadeur',  pole: 'Contenu',    nom: 'Ambassadeur',         role: 'LinkedIn / RSE / Impact',              mecanisme: 'Développe le volet RSE via LinkedIn, identifie partenaires/financeurs, lien avec entrepreneurs engagés', accent: 'bg-growth/10 text-growth' },
  // Pôle Opérations
  { id: 'chef-projet',  pole: 'Opérations', nom: 'Chef de Projet',      role: 'Coordination livraison',               mecanisme: 'Qualification brief → audit Tally → validation scope → suivi jalons → livraison V2. Jamais de code sans audit signé', accent: 'bg-charbon/8 text-charbon' },
  { id: 'maquette',     pole: 'Opérations', nom: 'Maquette Closer',     role: 'Closing par la preuve',                mecanisme: 'Brief client → maquette HTML complète → lien démo tiiny.host (jamais fichier brut) → closing', accent: 'bg-orange/10 text-orange' },
  { id: 'devis',        pole: 'Opérations', nom: 'Devis Express',       role: 'Chiffrage et facturation',             mecanisme: 'Barème officiel Famille A/B/C → calcul setup+MRR+acompte → devis numéroté ATR-2026-NNNN → envoi client', accent: 'bg-orange/10 text-orange' },
  { id: 'rgpd',         pole: 'Opérations', nom: 'Agent RGPD',          role: 'Conformité légale',                    mecanisme: 'Vérifie conformité RGPD France/Europe + CI, produit mentions légales, CGU, CGV, clauses contrats', accent: 'bg-[#D64545]/10 text-[#D64545]' },
  // Transverses
  { id: 'miroir-agent', pole: 'Transverse', nom: 'MIROIR',              role: 'Apprentissage continu Mac Arthur',     mecanisme: 'Observe décisions validées → extrait principes → injecte dans tous les agents. Réveil toutes les 30 min', accent: 'bg-charbon/8 text-charbon' },
  { id: 'pont',         pole: 'Transverse', nom: 'PONT',                role: 'Synchronisation entre agents',         mecanisme: 'Relie les agents entre eux, s\'assure que les décisions circulent. Critique : aucun agent ne travaille en silo', accent: 'bg-charbon/8 text-charbon' },
  { id: 'cos',          pole: 'Transverse', nom: 'Chef de Cabinet',     role: 'Orchestration globale',                mecanisme: 'Coordonne toute l\'équipe, gère priorités, suit projets clients, prépare briefs, s\'assure que rien ne tombe à l\'eau', accent: 'bg-charbon/8 text-charbon' },
];

const AGENTS_APP = [
  { id: 'awa',     pole: 'App · Attractor Assists', nom: 'Awa',     role: 'Prospection & vente',            mecanisme: 'Surveille prospects actifs, relance 48h, construit séquences closing, analyse réponses — observe les patterns de vente Mac Arthur', accent: 'bg-info/10 text-info',    hasJournal: true },
  { id: 'carelle', pole: 'App · Attractor Assists', nom: 'Carelle', role: 'Chief of Staff · Coordination',  mecanisme: 'Coordonne l\'équipe, route Fam. A → maquette et Fam. B → séquence consulting, génère briefings hebdo, pilote le portefeuille projets', accent: 'bg-charbon/8 text-charbon', hasJournal: true },
  { id: 'miriam',  pole: 'App · Attractor Assists', nom: 'Miriam',  role: 'Présence digitale',              mecanisme: 'Planifie semaine éditoriale, programme broadcasts WA, répond communauté selon ton et consignes Mac Arthur', accent: 'bg-amber/10 text-amber',  hasJournal: true },
  { id: 'serge',   pole: 'App · Attractor Assists', nom: 'Serge',   role: 'Organisation & agenda',          mecanisme: 'Brief de semaine lundi, surveille engagements pris, alerte deadline, trie priorités avant le café', accent: 'bg-growth/10 text-growth', hasJournal: true },
  { id: 'roland',  pole: 'App · Attractor Assists', nom: 'Roland',  role: 'Finance & marges',               mecanisme: 'Point financier mensuel CA/marges/ratio, alerte si marge sous seuil rentabilité, projection en 2 min', accent: 'bg-charbon/8 text-charbon', hasJournal: true },
  { id: 'kofi',    pole: 'App · Attractor Assists', nom: 'Kofi',    role: 'Storytelling & Campagnes',       mecanisme: 'Film de marque (script 5 actes), séquence posts, broadcasts WA. Chaque message ancré dans l\'histoire réelle', accent: 'bg-info/10 text-info',    hasJournal: true },
];

const ALL_AGENTS = [...AGENTS_JARVIS, ...AGENTS_APP];

// ─── Helpers ────────────────────────────────────────────────────────────────

const SEGMENTS = [
  { id: 'all',        label: 'Tous les utilisateurs',  filter: () => true },
  { id: 'incomplete', label: 'Onboarding incomplet',   filter: p => !p.onboarding_done },
  { id: 'decouverte', label: 'Plan Découverte',        filter: p => p.plan_code === 'decouverte' || !p.plan_code },
  { id: 'manager',    label: 'Plan Manager',           filter: p => p.plan_code === 'manager' },
  { id: 'ci',         label: 'Zone Côte d\'Ivoire',    filter: p => p.zone === 'CI' },
  { id: 'eu',         label: 'Zone Europe / diaspora', filter: p => p.zone === 'EU' },
];

const NOTIF_TYPES = [
  { id: 'info',    label: 'Info',    color: 'bg-orange/10 text-orange' },
  { id: 'success', label: 'Succès',  color: 'bg-growth/10 text-growth' },
  { id: 'alert',   label: 'Alerte',  color: 'bg-amber/10 text-amber' },
  { id: 'agent',   label: 'Agent',   color: 'bg-blue-100 text-blue-600' },
];

const FB_FILTERS = [
  { id: 'all',    label: 'Tous' },
  { id: 'bug',    label: 'Bug' },
  { id: 'besoin', label: 'Besoin' },
  { id: 'autre',  label: 'Autre' },
];

function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

// ─── MacCockpitScreen ────────────────────────────────────────────────────────

export function MacCockpitScreen({ go, notify, section, profile }) {

  // ── État partagé ──
  const [journal,   setJournal]   = useState([]);
  const [prospects, setProspects] = useState([]);
  const [miroir,    setMiroir]    = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [agentStats, setAgentStats] = useState([]);
  const [loaded,    setLoaded]    = useState(false);
  const [openSegments, setOpenSegments] = useState({});
  const toggleSeg = (id) => setOpenSegments(s => ({ ...s, [id]: !s[id] }));

  // ── Agent sélectionné (Sheet) ──
  const [selectedAgent,      setSelectedAgent]      = useState(null);
  const [agentJournal,       setAgentJournal]       = useState([]);
  const [agentJournalLoad,   setAgentJournalLoad]   = useState(false);
  const [awaTraining,        setAwaTraining]        = useState({ miroir: [], closings: [] });
  const [awaTrainingLoad,    setAwaTrainingLoad]    = useState(false);

  // ── Pipeline ──
  const [prospectsLoading, setProspectsLoading] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [prospectSeq,      setProspectSeq]      = useState(null);
  const [seqLoading,       setSeqLoading]       = useState(false);
  const [copiedIdx,        setCopiedIdx]        = useState(null);
  const [maquetteUrl,      setMaquetteUrl]      = useState('');
  const [maquettePreview,  setMaquettePreview]  = useState(null);
  const [maquetteMsg,      setMaquetteMsg]      = useState('');
  const [maquetteCopied,   setMaquetteCopied]   = useState(false);
  const maquetteFileRef = useRef(null);
  const [pPrenom,    setPPrenom]   = useState('');
  const [pActivite,  setPActivite] = useState('');
  const [pBesoin,    setPBesoin]   = useState('');
  const [pContexte,  setPContexte] = useState('');
  const [pCanal,     setPCanal]    = useState('WhatsApp');
  const [pZone,      setPZone]     = useState('CI');
  const [pWa,        setPWa]       = useState('');
  const [pType,      setPType]     = useState('A');
  const [pNbUsers,   setPNbUsers]  = useState('1');
  const [pSaving,    setPSaving]   = useState(false);
  const [showForm,   setShowForm]  = useState(false);
  const [devis,      setDevis]     = useState(null);
  const [devisLoading, setDevisLoading] = useState(false);
  const [devisProspectId, setDevisProspectId] = useState(null);

  // ── MIROIR ──
  const [dSujet,   setDSujet]   = useState('');
  const [dContexte, setDContexte] = useState('');
  const [dSending,  setDSending] = useState(false);

  // ── Broadcasts ──
  const [bTitle,   setBTitle]   = useState('');
  const [bBody,    setBBody]    = useState('');
  const [bType,    setBType]    = useState('info');
  const [bSeg,     setBSeg]     = useState('all');
  const [bSending, setBSending] = useState(false);

  // ── Feedbacks ──
  const [fbFilter, setFbFilter] = useState('all');

  // ── Carelle chat ──
  const [carelleMsgs,    setCarelleMsgs]    = useState([]);
  const [carelleInput,   setCarelleInput]   = useState('');
  const [carelleSending, setCarelleSending] = useState(false);
  const [listening,      setListening]      = useState(false);
  const [transcript,     setTranscript]     = useState('');
  const [ttsActive,      setTtsActive]      = useState(false);
  const carelleBottomRef = useRef(null);
  const recognitionRef   = useRef(null);

  // ─── Chargement initial ──────────────────────────────────────────────────

  const loadAll = async () => {
    try {
      const [
        { data: jnl },
        { data: pros },
        { data: ref },
        { data: dec },
        { data: fb },
        { data: uList },
      ] = await Promise.all([
        supabase.from('journal_agent').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('prospects').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('methode_miroir').select('*').order('created_at', { ascending: false }).limit(60),
        supabase.from('decisions').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('id, prenom, zone, plan_code, onboarding_done, created_at, last_seen').order('created_at', { ascending: false }),
      ]);
      setJournal(jnl || []);
      setProspects(pros || []);
      setMiroir(ref || []);
      setDecisions(dec || []);
      setFeedbacks(fb || []);
      setUsers(uList || []);
    } catch (e) {
      console.error('MacCockpit loadAll', e);
    }
    // Tendances utilisation — agrégation conversations par agent
    try {
      const { data: convs } = await supabase
        .from('conversations')
        .select('agent_id, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());
      if (convs) {
        const counts = {};
        convs.forEach(c => {
          if (!c.agent_id) return;
          counts[c.agent_id] = (counts[c.agent_id] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setAgentStats(sorted);
      }
    } catch {}
    setLoaded(true);
  };

  useEffect(() => {
    loadAll();
    // Alerte temps réel quand un visiteur du site remplit le chat
    const channel = supabase
      .channel('cockpit-new-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prospects' }, (payload) => {
        setProspects(prev => [payload.new, ...prev]);
        setJournal(prev => [{
          id: Date.now(), agent_id: 'carelle', type: 'site_lead',
          titre: `Nouveau lead site — ${payload.new.prenom}`,
          created_at: new Date().toISOString(),
        }, ...prev]);
        notify(`Nouveau lead : ${payload.new.prenom} · ${payload.new.besoin || 'site'}`);
      })
      .subscribe();
    return () => channel.unsubscribe();
  }, []);

  // ─── Données dérivées ────────────────────────────────────────────────────

  const arbitrer    = miroir.filter(m => m.a_arbitrer && !m.arbitre);
  const referentiel = miroir.filter(m => m.type !== 'CONTRADICTION' || m.arbitre);
  const categories  = [...new Set(referentiel.map(m => m.categorie))].sort();
  const decNonTraitees = decisions.filter(d => !d.traite).length;
  const filteredFeedbacks = fbFilter === 'all' ? feedbacks : feedbacks.filter(f => f.type === fbFilter);
  const pendingCount = feedbacks.filter(f => f.status === 'nouveau').length;
  const stats = {
    total:     users.length,
    onboarded: users.filter(u => u.onboarding_done).length,
    online:    users.filter(u => u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < 5 * 60000).length,
    newWeek:   users.filter(u => u.created_at && (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length,
  };
  const maxStatCount = agentStats.length > 0 ? agentStats[0].count : 1;

  // ─── Actions agents ──────────────────────────────────────────────────────

  const openAgentSheet = async (agent) => {
    setSelectedAgent(agent);
    setAgentJournal([]);
    if (agent.hasJournal) {
      setAgentJournalLoad(true);
      const { data } = await supabase
        .from('journal_agent').select('*')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setAgentJournal(data || []);
      setAgentJournalLoad(false);
    }
    if (agent.id === 'awa') {
      setAwaTrainingLoad(true);
      const [{ data: mRef }, { data: closings }] = await Promise.all([
        supabase.from('methode_miroir')
          .select('principe_detecte, confiance, created_at')
          .eq('arbitre', false)
          .in('confiance', ['haute'])
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('prospects')
          .select('prenom, activite, besoin, canal, created_at')
          .eq('statut', 'closé')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setAwaTraining({ miroir: mRef || [], closings: closings || [] });
      setAwaTrainingLoad(false);
    }
  };

  // ─── Actions pipeline ────────────────────────────────────────────────────

  const buildMaquetteMsg = (prenom, url) => {
    const urlPart = url?.trim() ? `\n\nVoilà à quoi ça pourrait ressembler pour ton activité : ${url.trim()}` : '';
    return `Salut ${prenom} 👋\n\nJ'ai bossé sur quelque chose pour toi.${urlPart}\n\nTu veux qu'on en parle ? Je t'explique comment ça fonctionnerait concrètement pour ton projet.`;
  };

  const deleteProspect = async (id) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (error) { notify('Erreur suppression'); return; }
    setProspects(prev => prev.filter(p => p.id !== id));
    closeMaquetteSheet();
    notify('Prospect supprimé');
  };

  const generateDevis = async (pid) => {
    setDevisProspectId(pid); setDevis(null); setDevisLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-devis', { body: { prospect_id: pid } });
      if (error || !data) { notify('Erreur génération devis'); }
      else { setDevis(data); await loadAll(); }
    } catch { notify('Erreur réseau'); }
    setDevisLoading(false);
  };

  const saveProspect = async () => {
    if (!pPrenom.trim() || pSaving) return;
    setPSaving(true);
    const { data, error } = await supabase.from('prospects').insert({
      prenom: pPrenom.trim(), activite: pActivite.trim(), besoin: pBesoin.trim(),
      contexte: pContexte.trim(), canal: pCanal, zone: pZone, whatsapp: pWa.trim(),
      type_projet: pType, nb_users: pNbUsers,
    }).select().single();
    if (error) { notify('Erreur enregistrement prospect'); setPSaving(false); return; }
    setProspects(prev => [data, ...prev]);
    setPPrenom(''); setPActivite(''); setPBesoin(''); setPContexte(''); setPWa('');
    setShowForm(false); setPSaving(false);
    generateSequence(data);
    generateDevis(data.id);
  };

  const generateSequence = async (prospect) => {
    setSelectedProspect(prospect); setProspectSeq(null); setSeqLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sequence', { body: { prospect_id: prospect.id } });
      if (error || !data?.messages) { notify('Erreur génération séquence'); }
      else { setProspectSeq(data); await loadAll(); }
    } catch { notify('Erreur réseau'); }
    setSeqLoading(false);
  };

  const loadExistingSeq = async (prospect) => {
    setSelectedProspect(prospect); setProspectSeq(null); setSeqLoading(true);
    setMaquetteMsg(buildMaquetteMsg(prospect.prenom, ''));
    try {
      const { data } = await supabase.from('sequences_vente').select('*')
        .eq('prospect_id', prospect.id).order('created_at', { ascending: false }).limit(1).single();
      if (data) setProspectSeq({ messages: data.messages });
    } catch {}
    setSeqLoading(false);
  };

  const closeMaquetteSheet = () => {
    setSelectedProspect(null); setProspectSeq(null);
    setMaquetteUrl(''); setMaquettePreview(null);
    setMaquetteMsg(''); setMaquetteCopied(false);
  };

  const handleMaquetteFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMaquettePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const copyMaquetteMsg = async () => {
    try {
      await navigator.clipboard.writeText(maquetteMsg);
      setMaquetteCopied(true);
      setTimeout(() => setMaquetteCopied(false), 2500);
      if (selectedProspect) {
        await supabase.from('journal_agent').insert({
          agent_id: 'carelle', type: 'maquette_envoyee',
          titre: `Maquette proposée à ${selectedProspect.prenom}`,
          details: { prospect_id: selectedProspect.id, url: maquetteUrl || null },
        }).catch(() => {});
      }
    } catch { notify('Impossible de copier'); }
  };

  const validerDevis = async (devis_id) => {
    await supabase.from('devis_prospects').update({ statut: 'valide' }).eq('id', devis_id);
    setDevis(d => ({ ...d, statut: 'valide' }));
    notify('Devis validé');
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1800);
    });
  };

  // ─── Actions MIROIR ──────────────────────────────────────────────────────

  const addDecision = async (statut) => {
    if (!dSujet.trim() || !dContexte.trim() || dSending) return;
    setDSending(true);
    const { error } = await supabase.from('decisions').insert({ sujet: dSujet.trim(), contexte: dContexte.trim(), statut });
    if (error) { notify('Erreur — vérifie la policy decisions'); setDSending(false); return; }
    notify(`Décision ${statut} enregistrée — MIROIR va analyser`);
    setDSujet(''); setDContexte('');
    const { data } = await supabase.from('decisions').select('*').order('created_at', { ascending: false }).limit(20);
    setDecisions(data || []);
    setDSending(false);
  };

  const resolveArbitrage = async (id) => {
    await supabase.from('methode_miroir').update({ arbitre: true }).eq('id', id);
    setMiroir(prev => prev.map(m => m.id === id ? { ...m, arbitre: true } : m));
  };

  // ─── Actions feedbacks ───────────────────────────────────────────────────

  const markHandled = async (id) => {
    const { error } = await supabase.from('feedback').update({ status: 'traité' }).eq('id', id);
    if (error) { notify('Erreur — policy update manquante ?'); return; }
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'traité' } : f));
  };

  // ─── Broadcast ───────────────────────────────────────────────────────────

  const sendBroadcast = async () => {
    if (!bTitle.trim() || !bBody.trim()) return;
    setBSending(true);
    try {
      const seg = SEGMENTS.find(s => s.id === bSeg);
      const targets = users.filter(u => u.onboarding_done && seg.filter(u));
      if (targets.length === 0) { notify('Aucun utilisateur dans ce segment.'); setBSending(false); return; }
      const inserts = targets.map(u => ({ user_id: u.id, type: bType, titre: bTitle.trim(), corps: bBody.trim() }));
      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;
      notify(`Envoyé à ${targets.length} utilisateur${targets.length > 1 ? 's' : ''}`);
      setBTitle(''); setBBody('');
    } catch { notify('Erreur lors de l\'envoi'); }
    setBSending(false);
  };

  // ─── Carelle chat ────────────────────────────────────────────────────────

  const sendCarelle = async (msgOverride = null) => {
    const msg = (msgOverride ?? carelleInput).trim();
    if (!msg || carelleSending) return;
    if (!msgOverride) setCarelleInput('');
    setCarelleSending(true);
    setCarelleMsgs(prev => [...prev, { role: 'user', content: msg }]);
    try {
      // Contexte agence injecté dans le premier message système
      const contextDigest = [
        `[COCKPIT MAC ARTHUR — CHEF DE CABINET]`,
        `RÈGLE ABSOLUE : pose UNE seule question à la fois. Jamais deux questions dans le même message. Attends la réponse avant d'avancer.`,
        `Prospects actifs : ${prospects.filter(p => ['nouveau','contacté','relancé'].includes(p.statut)).length}`,
        `Décisions MIROIR en attente d'analyse : ${decNonTraitees}`,
        `Feedbacks nouveaux : ${feedbacks.filter(f => f.status === 'nouveau').length}`,
        journal.length > 0 ? `Dernières actions :\n${journal.slice(0, 3).map(j => `• ${j.titre}`).join('\n')}` : '',
      ].filter(Boolean).join('\n');

      // Format attendu par chat-assistant : messages = [{ from: 'me'|'assistant', text: '...' }]
      const history = carelleMsgs.slice(-10).map(m => ({
        from: m.role === 'user' ? 'me' : 'assistant',
        text: m.content,
      }));
      const messages = [
        ...history,
        { from: 'me', text: `${contextDigest}\n\n${msg}` },
      ];

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages,
          assistant_id: 'carelle',
          user_id: profile?.id,
          profile: profile || {},
        },
      });
      if (error || !data?.reply) {
        notify('Erreur Carelle — réessaie');
        setCarelleMsgs(prev => prev.slice(0, -1));
      } else {
        setCarelleMsgs(prev => [...prev, { role: 'assistant', content: data.reply }]);
        speakCarelle(data.reply);
      }
    } catch { notify('Erreur réseau'); setCarelleMsgs(prev => prev.slice(0, -1)); }
    setCarelleSending(false);
    setTimeout(() => carelleBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const speakCarelle = (text) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const clean = text.slice(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'fr-FR'; u.rate = 1.05; u.pitch = 0.97;
    u.onstart = () => setTtsActive(true);
    u.onend   = () => setTtsActive(false);
    speechSynthesis.speak(u);
  };

  const stopSpeech = () => { speechSynthesis?.cancel(); setTtsActive(false); };

  const toggleVoice = () => {
    if (carelleSending) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); setTranscript(''); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { notify('Voix non supportée — utilise Chrome ou installe l\'app'); return; }
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = false; rec.interimResults = true;
    rec.onstart  = () => setListening(true);
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setTranscript(''); setListening(false);
        if (t.trim()) sendCarelle(t.trim());
      }
    };
    rec.onerror = (e) => {
      setListening(false); setTranscript('');
      if (e.error === 'not-allowed') notify('Micro non autorisé — vérifie les permissions');
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  // ─── RENDU ───────────────────────────────────────────────────────────────

  // ── Section Carelle ──────────────────────────────────────────────────────

  if (section === 'carelle') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg,#0d0b09 0%,#111009 60%,#0c0907 100%)' }}>

        {/* Header */}
        <div className="px-5 pt-12 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="font-display font-extrabold text-[16px] text-white tracking-wide">CARELLE</p>
            <p className="text-[11px] text-white/35 tracking-[.12em] uppercase mt-0.5">Chief of Staff · Ton bras droit direct</p>
          </div>
          {ttsActive && (
            <button onClick={stopSpeech} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange/15 border border-orange/30 active:scale-95 transition">
              <Icon name="volume" size={13} className="text-orange animate-pulse" />
              <span className="text-[11px] font-bold text-orange">Stop</span>
            </button>
          )}
        </div>

        {/* Zone conversation */}
        <div className="flex-1 px-5 pb-2 flex flex-col gap-3 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Suggestions initiales */}
          {carelleMsgs.length === 0 && !listening && (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[.15em]">Suggestions</p>
              {[
                { label: 'Agence',     text: 'Brief du jour — quoi prioriser ?' },
                { label: 'Pipeline',   text: `Prospects à relancer — ${prospects.filter(p => p.statut === 'contacté').length} en attente` },
                { label: 'MIROIR',     text: `${decNonTraitees} décision${decNonTraitees > 1 ? 's' : ''} MIROIR en attente` },
                { label: 'Éclaireur', text: 'Quelles apps métiers cartonnent en CI en ce moment ?' },
              ].map(s => (
                <button key={s.text} onClick={() => sendCarelle(`${s.label}, ${s.text}`)}
                  className="text-left px-4 py-3 rounded-[14px] border border-white/8 bg-white/4 active:bg-white/8 transition active:scale-[.99]">
                  <span className="text-[10.5px] font-extrabold text-orange/70 uppercase tracking-wider">{s.label}</span>
                  <p className="text-[13px] text-white/70 mt-0.5 leading-snug">{s.text}</p>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {carelleMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
              style={{ animation: 'fadeUp .3s ease both' }}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-extrabold text-white/60 flex-shrink-0 mt-1">
                  CAR
                </div>
              )}
              <div className={`max-w-[84%] px-4 py-3 text-[13.5px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-orange/25 border border-orange/30 text-white rounded-[16px] rounded-br-[4px]'
                  : 'bg-white/6 border border-white/10 text-white/88 rounded-[16px] rounded-bl-[4px]'
              }`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === 'assistant' && window.speechSynthesis && (
                  <button onClick={() => speakCarelle(m.content)} className="mt-2 flex items-center gap-1 text-[11px] text-white/30 hover:text-orange/70 transition">
                    <Icon name="volume" size={12} /> Écouter
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {carelleSending && (
            <div className="flex gap-2 items-center" style={{ animation: 'fadeUp .3s ease both' }}>
              <div className="w-7 h-7 rounded-full bg-orange/15 flex items-center justify-center">
                <Icon name="spark" size={13} className="text-orange animate-spin" style={{ animationDuration: '1.2s' }} />
              </div>
              <div className="bg-white/6 border border-white/10 rounded-[16px] rounded-bl-[4px] px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-orange/50 animate-pulse" style={{ animationDelay: `${i * 0.18}s` }} />
                  ))}
                  <span className="text-[12px] text-white/35 ml-1">Carelle prépare ta réponse</span>
                </div>
              </div>
            </div>
          )}

          {/* Transcript voix */}
          {transcript && (
            <div className="flex justify-end" style={{ animation: 'fadeUp .2s ease both' }}>
              <div className="max-w-[84%] bg-orange/15 border border-orange/25 rounded-[16px] rounded-br-[4px] px-4 py-3">
                <p className="text-[13.5px] text-white/70 italic">"{transcript}"</p>
              </div>
            </div>
          )}

          <div ref={carelleBottomRef} />
        </div>

        {/* Input bas */}
        <div className="flex-shrink-0 px-5 pt-4 pb-8 flex flex-col items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>

          {/* Orb micro */}
          <div className="relative flex items-center justify-center">
            {listening && <>
              <div className="absolute w-[110px] h-[110px] rounded-full border border-orange/30"
                style={{ animation: 'orbRing 1.4s ease-out infinite' }} />
              <div className="absolute w-[110px] h-[110px] rounded-full border border-orange/20"
                style={{ animation: 'orbRing 1.4s ease-out infinite', animationDelay: '.5s' }} />
            </>}
            <button onClick={toggleVoice} disabled={carelleSending}
              className="relative w-[78px] h-[78px] rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: listening
                  ? 'radial-gradient(circle at 40% 35%, #FF7A2E, #D94703)'
                  : 'radial-gradient(circle at 40% 35%, #2a1a0a, #18100a)',
                animation: listening ? 'glowPulse 1.8s ease-in-out infinite' : undefined,
                boxShadow: listening
                  ? '0 0 32px 8px rgba(242,92,5,.6)'
                  : '0 0 22px 4px rgba(242,92,5,.28), inset 0 1px 0 rgba(255,255,255,.07)',
              }}>
              <Icon name="mic" size={28} className={listening ? 'text-white' : 'text-orange'} />
            </button>
          </div>

          <p className="text-[12px] font-semibold tracking-wide"
            style={{ color: listening ? '#FF7A2E' : carelleSending ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.3)' }}>
            {listening ? 'Je t\'écoute…' : carelleSending ? 'Traitement en cours…' : 'Appuie pour parler'}
          </p>

          <div className="w-full flex gap-2 items-center">
            <input value={carelleInput} onChange={e => setCarelleInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && carelleInput.trim()) sendCarelle(); }}
              placeholder="Ou écris ici…"
              className="flex-1 rounded-[14px] px-4 py-3 text-[13.5px] outline-none transition"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.10)', color: 'rgba(255,255,255,.85)', caretColor: '#F25C05' }} />
            {carelleInput.trim() && (
              <button onClick={() => sendCarelle()} disabled={carelleSending}
                className="flex-shrink-0 w-11 h-11 rounded-[13px] bg-orange flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
                style={{ boxShadow: '0 6px 16px -4px rgba(242,92,5,.55)' }}>
                <Icon name="send" size={17} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Section Agence ───────────────────────────────────────────────────────

  if (section === 'agence') {
    const poles = [...new Set(ALL_AGENTS.map(a => a.pole))];
    const lastSeenByAgent = {};
    journal.forEach(j => {
      if (!lastSeenByAgent[j.agent_id]) lastSeenByAgent[j.agent_id] = j.created_at;
    });

    return (
      <div className="min-h-screen bg-sable pb-6">
        <div className="px-[18px] pt-14 pb-3">
          <p className="font-display font-extrabold text-[20px] text-charbon">L'Agence</p>
          <p className="text-[12.5px] text-g400 mt-0.5">{ALL_AGENTS.length} agents — clic pour fiche + historique</p>
        </div>

        {/* Strip activité récente */}
        {journal.length > 0 && (
          <div className="flex gap-2 px-[18px] overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
            {journal.slice(0, 6).map(j => (
              <div key={j.id} className="flex-shrink-0 flex items-center gap-2 bg-white border border-g200 rounded-[12px] px-3 py-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 bg-orange/10 text-orange`}>
                  {(j.agent_id || 'SYS').toUpperCase().slice(0,3)}
                </span>
                <p className="text-[11.5px] text-g700 max-w-[160px] truncate">{j.titre}</p>
                <span className="text-[10px] text-g300 flex-shrink-0">{timeAgo(j.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="px-[18px] flex flex-col gap-3">
          {poles.map(pole => {
            const agents = ALL_AGENTS.filter(a => a.pole === pole);
            const isOpen = openSegments[`pole_${pole}`] !== false; // ouvert par défaut
            return (
              <div key={pole} className="flex flex-col gap-1">
                <button onClick={() => toggleSeg(`pole_${pole}`)}
                  className="flex items-center justify-between py-1">
                  <span className="text-[11px] font-bold text-g400 uppercase tracking-widest">{pole}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-g300">{agents.length} agents</span>
                    <Icon name={isOpen ? 'chevdown' : 'chevron'} size={13} className="text-g300" />
                  </div>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-2">
                    {agents.map(agent => {
                      const lastSeen = lastSeenByAgent[agent.id];
                      const isRecent = lastSeen && (Date.now() - new Date(lastSeen).getTime()) < 86400000;
                      return (
                        <button key={agent.id} onClick={() => openAgentSheet(agent)}
                          className="flex items-center gap-3 bg-white border border-g200 rounded-[14px] px-4 py-3 text-left active:scale-[.99] transition hover:border-orange/30">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold ${agent.accent}`}>
                            {agent.nom.slice(0,3).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-[14px] text-charbon">{agent.nom}</span>
                              {isRecent && <span className="w-2 h-2 rounded-full bg-growth flex-shrink-0" />}
                            </div>
                            <p className="text-[12px] text-g400 truncate mt-0.5">{agent.role}</p>
                          </div>
                          <Icon name="chevron" size={14} className="text-g300 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sheet agent */}
        {selectedAgent && (
          <Sheet title={selectedAgent.nom} onClose={() => setSelectedAgent(null)}>
            <div className="flex flex-col gap-5">
              {/* Header agent */}
              <div className={`flex items-center gap-3 p-3 rounded-[14px] ${selectedAgent.accent}`}>
                <div className="flex flex-col gap-0.5 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{selectedAgent.pole}</p>
                  <p className="font-display font-bold text-[15px]">{selectedAgent.role}</p>
                </div>
              </div>

              {/* Mécanisme */}
              <div>
                <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-1.5">Comment il/elle fonctionne</p>
                <p className="text-[13.5px] text-charbon leading-relaxed">{selectedAgent.mecanisme}</p>
              </div>

              {/* Historique journal (agents app uniquement) */}
              {selectedAgent.hasJournal && (
                <div>
                  <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-2">Tâches effectuées</p>
                  {agentJournalLoad ? (
                    <p className="text-[13px] text-g400 text-center py-4">Chargement…</p>
                  ) : agentJournal.length === 0 ? (
                    <p className="text-[13px] text-g400 py-2">Aucune tâche enregistrée.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {agentJournal.map(j => (
                        <div key={j.id} className="flex items-start gap-2.5 bg-sable rounded-[12px] px-3 py-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-charbon leading-snug">{j.titre}</p>
                            <p className="text-[11px] text-g300 mt-0.5">{timeAgo(j.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section Entraînement continu — Awa uniquement */}
              {selectedAgent.id === 'awa' && (
                <div className="border-t border-g200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-growth animate-pulse" />
                    <p className="text-[12px] font-bold text-growth uppercase tracking-wider">Entraînement continu</p>
                  </div>
                  <p className="text-[12px] text-g400 mb-3 leading-snug">Awa intègre ces données en temps réel via MIROIR — injection active dans tous ses prompts via <code className="bg-sable px-1 rounded text-[11px]">chat-assistant</code>.</p>
                  {awaTrainingLoad ? (
                    <p className="text-[13px] text-g400 text-center py-3">Chargement…</p>
                  ) : (
                    <>
                      {awaTraining.miroir.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-1.5">Principes MIROIR haute confiance ({awaTraining.miroir.length})</p>
                          <div className="flex flex-col gap-1.5">
                            {awaTraining.miroir.map((m, i) => (
                              <div key={i} className="flex items-start gap-2 bg-sable rounded-[10px] px-3 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-growth mt-1.5 flex-shrink-0" />
                                <p className="text-[12.5px] text-charbon leading-snug">{m.principe_detecte}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {awaTraining.closings.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-1.5">Cas de vente closés ({awaTraining.closings.length})</p>
                          <div className="flex flex-col gap-1.5">
                            {awaTraining.closings.map((c, i) => (
                              <div key={i} className="flex items-start gap-2 bg-sable rounded-[10px] px-3 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange mt-1.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[13px] font-bold text-charbon">{c.prenom}</p>
                                  <p className="text-[11.5px] text-g400">{c.activite || c.besoin || '—'} · {c.canal}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {awaTraining.miroir.length === 0 && awaTraining.closings.length === 0 && (
                        <p className="text-[13px] text-g400 text-center py-2">Aucun élément d'entraînement pour l'instant.</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Pour agents Jarvis — pas de journal */}
              {!selectedAgent.hasJournal && (
                <div className="bg-sable rounded-[12px] px-4 py-3">
                  <p className="text-[11.5px] text-g400 text-center">Cet agent est actif dans Claude Code (Jarvis). Son historique n'est pas enregistré en base Supabase.</p>
                </div>
              )}
            </div>
          </Sheet>
        )}
      </div>
    );
  }

  // ── Section Pipeline ─────────────────────────────────────────────────────

  if (section === 'pipeline') {
    const groupes = [
      { id: 'nouveau',  label: 'Nouveaux',  badge: 'bg-orange/15 text-orange',  border: 'border-orange/25' },
      { id: 'contacté', label: 'Contactés', badge: 'bg-info/10 text-info',       border: 'border-g200' },
      { id: 'relancé',  label: 'Relancés',  badge: 'bg-amber/15 text-amber',     border: 'border-amber/25' },
      { id: 'closé',    label: 'Closés',    badge: 'bg-growth/15 text-growth',   border: 'border-growth/25' },
      { id: 'perdu',    label: 'Perdus',    badge: 'bg-g100 text-g400',          border: 'border-g200' },
    ];

    return (
      <div className="min-h-screen bg-sable pb-6">
        <div className="px-[18px] pt-14 pb-3">
          <p className="font-display font-extrabold text-[20px] text-charbon">Pipeline</p>
          <p className="text-[12.5px] text-g400 mt-0.5">{prospects.length} prospects · {prospects.filter(p => p.statut === 'closé').length} closés</p>
        </div>

        <div className="px-[18px] flex flex-col gap-4">
          {/* Activité Carelle */}
          {journal.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {journal.slice(0, 3).map(j => (
                <div key={j.id} className="flex items-center gap-2.5 px-3 py-2 bg-white border border-g200 rounded-[12px]">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    j.agent_id === 'carelle' ? 'bg-charbon/8 text-charbon' :
                    j.agent_id === 'miroir'  ? 'bg-g100 text-g500' : 'bg-orange/10 text-orange'
                  }`}>{(j.agent_id || 'SYS').toUpperCase().slice(0,3)}</span>
                  <p className="text-[12px] text-g700 truncate flex-1">{j.titre}</p>
                  <span className="text-[10px] text-g300 flex-shrink-0">{timeAgo(j.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Devis flottant */}
          {(devisLoading || devis) && (
            <Card className={`p-4 flex flex-col gap-3 ${devis?.statut === 'valide' ? 'border-growth/40' : 'border-orange/30'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-charbon">
                  {devisLoading ? 'Calcul du devis…' : `Devis ${devis?.numero}`}
                </p>
                {devis?.statut === 'valide' && <span className="text-[11px] font-bold text-growth bg-growth/10 px-2 py-0.5 rounded-full">Validé</span>}
              </div>
              {devisLoading ? (
                <p className="text-[12px] text-g400">Roland applique le barème…</p>
              ) : devis?.message_si_freemium ? (
                <p className="text-[13px] text-g400 italic">{devis.message_si_freemium}</p>
              ) : (
                <>
                  <div className="bg-sable rounded-xl px-4 py-3 flex flex-col gap-1.5">
                    <div className="flex justify-between"><span className="text-[12.5px] text-g400">Famille / Niveau</span><span className="text-[13px] font-bold text-charbon">{devis?.famille} — {devis?.niveau}</span></div>
                    {devis?.setup_ht && <div className="flex justify-between"><span className="text-[12.5px] text-g400">Setup</span><span className="text-[13px] font-bold text-charbon">{devis.setup_ht.toLocaleString('fr-FR')} {devis.devise}</span></div>}
                    {devis?.mrr && <div className="flex justify-between"><span className="text-[12.5px] text-g400">MRR</span><span className="text-[13px] font-bold text-charbon">{devis.mrr.toLocaleString('fr-FR')} {devis.devise}</span></div>}
                    <div className="border-t border-g200 my-1" />
                    {devis?.acompte && <div className="flex justify-between"><span className="text-[12.5px] text-g400">Acompte 50%</span><span className="text-[13px] font-bold text-orange">{devis.acompte.toLocaleString('fr-FR')} {devis.devise}</span></div>}
                    {devis?.total_m1 && <div className="flex justify-between"><span className="text-[12.5px] font-bold text-charbon">Total M1</span><span className="text-[14px] font-extrabold text-charbon">{devis.total_m1.toLocaleString('fr-FR')} {devis.devise}</span></div>}
                  </div>
                  {devis?.raisonnement && <p className="text-[12px] text-g400 italic">"{devis.raisonnement}"</p>}
                  {devis?.questions_manquantes && devis.questions_manquantes !== 'null' && (
                    <div className="bg-amber/10 border border-amber/20 rounded-xl px-3 py-2.5">
                      <p className="text-[11.5px] font-bold text-amber mb-0.5">Info manquante</p>
                      <p className="text-[12.5px] text-charbon">{devis.questions_manquantes}</p>
                    </div>
                  )}
                  {devis?.statut !== 'valide' && (
                    <button onClick={() => validerDevis(devis.devis_id || devis.id)}
                      className="w-full py-3 rounded-xl bg-growth text-white text-[14px] font-bold active:scale-[.98] transition">
                      Valider ce devis
                    </button>
                  )}
                </>
              )}
            </Card>
          )}

          {/* Bouton nouveau prospect */}
          <button onClick={() => setShowForm(o => !o)}
            className={`w-full py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${showForm ? 'bg-charbon text-white border-charbon' : 'bg-orange/10 text-orange border-orange/30'}`}>
            {showForm ? 'Fermer' : '+ Nouveau prospect'}
          </button>

          {/* Formulaire */}
          {showForm && (
            <Card className="p-4 flex flex-col gap-3">
              <input value={pPrenom} onChange={e => setPPrenom(e.target.value)} placeholder="Prénom *"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
              <input value={pActivite} onChange={e => setPActivite(e.target.value)} placeholder="Activité / secteur"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
              <textarea value={pBesoin} onChange={e => setPBesoin(e.target.value)} rows={2}
                placeholder="Besoin exprimé"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] resize-none outline-none focus:border-orange transition" />
              <textarea value={pContexte} onChange={e => setPContexte(e.target.value)} rows={2}
                placeholder="Contexte — réseau, budget, opportunité…"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] resize-none outline-none focus:border-orange transition" />
              <div className="grid grid-cols-2 gap-2">
                <select value={pCanal} onChange={e => setPCanal(e.target.value)}
                  className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none">
                  {['WhatsApp','Facebook','Instagram','LinkedIn','Email','Autre'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={pZone} onChange={e => setPZone(e.target.value)}
                  className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none">
                  {['CI','EU','MA','SN','CM','Autre'].map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-g400 uppercase tracking-wider">Famille</label>
                  <select value={pType} onChange={e => setPType(e.target.value)}
                    className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none focus:border-orange transition">
                    <option value="A">App sur mesure (A)</option>
                    <option value="B">Consulting (B)</option>
                    <option value="C">Attractor Assists (C)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-g400 uppercase tracking-wider">Utilisateurs</label>
                  <select value={pNbUsers} onChange={e => setPNbUsers(e.target.value)}
                    className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none focus:border-orange transition">
                    <option value="1">1 · SOLO</option>
                    <option value="2-5">2-5 · ÉQUIPE</option>
                    <option value="5+">5+ · ENTERPRISE</option>
                  </select>
                </div>
              </div>
              <input value={pWa} onChange={e => setPWa(e.target.value)} placeholder="WhatsApp"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
              <button onClick={saveProspect} disabled={!pPrenom.trim() || pSaving}
                className="w-full py-3 rounded-xl bg-orange text-white text-[14px] font-bold disabled:opacity-40 active:scale-[.98] transition">
                {pSaving ? 'Enregistrement…' : 'Ajouter au pipeline'}
              </button>
            </Card>
          )}

          {/* Pipeline par statut */}
          {prospectsLoading ? (
            <div className="py-6 text-center text-[13px] text-g400">Chargement…</div>
          ) : prospects.length === 0 ? (
            <Card className="p-5 text-center">
              <p className="text-[13px] text-g400">Pipeline vide.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {groupes.map(g => {
                const list = prospects.filter(p => p.statut === g.id);
                if (list.length === 0) return null;
                const isOpen = openSegments[`pipe_${g.id}`];
                return (
                  <div key={g.id} className={`rounded-[16px] border overflow-hidden ${g.border} bg-white`}>
                    <button onClick={() => toggleSeg(`pipe_${g.id}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-charbon">{g.label}</span>
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${g.badge}`}>{list.length}</span>
                      </div>
                      <Icon name={isOpen ? 'chevdown' : 'chevron'} size={14} className="text-g400" />
                    </button>
                    {isOpen && (
                      <div className="flex flex-col divide-y divide-g100">
                        {list.map(p => (
                          <button key={p.id} onClick={() => loadExistingSeq(p)}
                            className="flex items-center gap-3 px-4 py-3 bg-white text-left active:bg-sable transition">
                            <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center font-display font-extrabold text-[13px] text-orange flex-shrink-0">
                              {p.prenom.slice(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[14px]">{p.prenom}</div>
                              <div className="text-[12px] text-g400 truncate">{p.activite || p.besoin || '—'}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[10.5px] text-g400">{p.canal}</span>
                              {p.type_projet && <span className="text-[10px] font-bold text-orange">Fam. {p.type_projet}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sheet séquence / maquette */}
        {selectedProspect && (
          <Sheet title={selectedProspect.type_projet === 'A' ? `Closing — ${selectedProspect.prenom}` : `Séquence — ${selectedProspect.prenom}`} onClose={closeMaquetteSheet}>
            {/* Statut + suppression */}
            <div className="flex items-center gap-2 mb-4">
              <select
                defaultValue={selectedProspect.statut}
                onChange={async (e) => {
                  const s = e.target.value;
                  await supabase.from('prospects').update({ statut: s }).eq('id', selectedProspect.id);
                  setProspects(prev => prev.map(p => p.id === selectedProspect.id ? { ...p, statut: s } : p));
                  notify(`Statut → ${s}`);
                }}
                className="flex-1 bg-sable border border-g200 rounded-xl px-3 py-2.5 text-[13px] text-charbon outline-none focus:border-orange transition"
              >
                {['nouveau','contacté','relancé','closé','perdu'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button
                onClick={() => { if (window.confirm(`Supprimer ${selectedProspect.prenom} ?`)) deleteProspect(selectedProspect.id); }}
                className="px-3 py-2.5 rounded-xl border border-[#D64545]/30 text-[#D64545] text-[12.5px] font-bold bg-[#D64545]/5 hover:bg-[#D64545]/10 transition active:scale-95 flex-shrink-0"
              >
                Supprimer
              </button>
            </div>
            {seqLoading ? (
              <div className="py-10 text-center">
                <div className="text-[13px] text-g400 mb-2">Awa prépare la séquence…</div>
                <div className="text-[11px] text-g300">10-15 secondes</div>
              </div>
            ) : !prospectSeq ? (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-g400 text-center py-4">Pas encore de séquence.</p>
                <button onClick={() => generateSequence(selectedProspect)}
                  className="w-full py-3 rounded-xl bg-orange text-white text-[14px] font-bold active:scale-[.98] transition">
                  Générer la séquence Awa
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Maquette closer — Famille A */}
                {selectedProspect.type_projet === 'A' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-charbon rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-orange animate-pulse flex-shrink-0" />
                      <span className="text-[12px] font-bold text-white">Mode Maquette · Famille A</span>
                    </div>
                    <p className="text-[11px] font-bold text-g400 uppercase tracking-wider">Étape 1 — Référence visuelle</p>
                    <div className="flex gap-2">
                      <input type="file" ref={maquetteFileRef} onChange={handleMaquetteFile} accept="image/*" className="hidden" />
                      <button onClick={() => maquetteFileRef.current?.click()}
                        className="flex-1 py-3 rounded-xl border-[1.5px] border-dashed border-g200 text-[13px] text-g400 bg-sable active:bg-g100 transition text-center">
                        Uploader image
                      </button>
                      <input value={maquetteUrl} onChange={e => { setMaquetteUrl(e.target.value); setMaquetteMsg(buildMaquetteMsg(selectedProspect.prenom, e.target.value)); }}
                        placeholder="Ou URL maquette"
                        className="flex-1 bg-sable border border-g200 rounded-xl px-3 py-3 text-[13px] outline-none focus:border-orange transition" />
                    </div>
                    {maquettePreview && (
                      <img src={maquettePreview} alt="preview" className="w-full rounded-xl object-cover max-h-[160px]" />
                    )}
                    <p className="text-[11px] font-bold text-g400 uppercase tracking-wider">Étape 2 — Message Awa</p>
                    <textarea
                      value={maquetteMsg}
                      onChange={e => setMaquetteMsg(e.target.value)}
                      rows={5}
                      className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13px] resize-none outline-none focus:border-orange transition"
                    />
                    <button onClick={copyMaquetteMsg}
                      className={`w-full py-3 rounded-xl text-[14px] font-bold active:scale-[.98] transition ${maquetteCopied ? 'bg-growth text-white' : 'bg-orange text-white'}`}>
                      {maquetteCopied ? 'Copié !' : 'Copier le message'}
                    </button>
                  </div>
                )}

                {/* Messages séquence */}
                {prospectSeq.messages?.map((msg, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-g500 uppercase tracking-wider">{msg.titre || `Message ${idx + 1}`}</p>
                      <button onClick={() => copyMessage(msg.message, idx)}
                        className={`text-[11.5px] font-bold px-3 py-1 rounded-full border transition ${copiedIdx === idx ? 'bg-growth/10 text-growth border-growth/30' : 'border-g200 text-g400 hover:border-orange/40 hover:text-orange'}`}>
                        {copiedIdx === idx ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <p className="text-[13.5px] text-charbon leading-relaxed whitespace-pre-wrap bg-sable rounded-[12px] px-4 py-3">{msg.message}</p>
                    {msg.date_envoi && (
                      <p className="text-[11px] text-g400">À envoyer le : {msg.date_envoi}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Sheet>
        )}
      </div>
    );
  }

  // ── Section Hub ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sable pb-6">
      <div className="px-[18px] pt-14 pb-3">
        <p className="font-display font-extrabold text-[20px] text-charbon">Hub</p>
        <p className="text-[12.5px] text-g400 mt-0.5">Métriques · Broadcasts · MIROIR · Feedbacks</p>
      </div>

      <div className="px-[18px] flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total inscrits',      val: stats.total,     tone: 'bg-orange/10 text-orange',       icon: 'user'  },
            { label: 'Onboarding terminé',  val: stats.onboarded, tone: 'bg-growth/10 text-growth',       icon: 'check' },
            { label: 'En ligne maintenant', val: stats.online,    tone: 'bg-[#25D366]/10 text-[#25D366]', icon: 'bolt'  },
            { label: 'Nouveaux (7j)',        val: stats.newWeek,   tone: 'bg-info/10 text-info',           icon: 'trend' },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                <Icon name={s.icon} size={17} />
              </div>
              <div>
                <div className="font-display font-extrabold text-[22px] leading-none">{!loaded ? '…' : s.val}</div>
                <div className="text-[11px] text-g400 mt-0.5 leading-tight">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tendances utilisation agents */}
        {agentStats.length > 0 && (
          <>
            <SectionLabel>Tendances utilisation — 30 jours</SectionLabel>
            <Card className="p-4 flex flex-col gap-3">
              {agentStats.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-[12.5px] font-bold text-charbon w-[80px] flex-shrink-0 capitalize">{s.id}</span>
                  <div className="flex-1 bg-g100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-orange rounded-full transition-all"
                      style={{ width: `${Math.round((s.count / maxStatCount) * 100)}%` }} />
                  </div>
                  <span className="text-[11.5px] font-bold text-g400 w-[30px] text-right flex-shrink-0">{s.count}</span>
                </div>
              ))}
              <p className="text-[11px] text-g300 text-right">nb conversations / agent</p>
            </Card>
          </>
        )}

        {/* Broadcasts */}
        <SectionLabel>Envoyer un message</SectionLabel>
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {NOTIF_TYPES.map(t => (
              <button key={t.id} onClick={() => setBType(t.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border-[1.5px] transition ${bType === t.id ? t.color + ' border-current' : 'border-g200 text-g500'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <select value={bSeg} onChange={e => setBSeg(e.target.value)}
            className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition">
            {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <input value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="Titre du message"
            className="w-full bg-white border-[1.5px] border-g200 rounded-xl px-4 py-3 text-[14.5px] outline-none focus:border-orange transition" />
          <Textarea rows={3} value={bBody} onChange={e => setBBody(e.target.value)} placeholder="Corps du message…" />
          {bSeg !== 'all' && (
            <p className="text-[12px] text-g400">
              Cible : <b className="text-charbon">{users.filter(u => u.onboarding_done && SEGMENTS.find(s => s.id === bSeg).filter(u)).length} utilisateurs</b>
            </p>
          )}
          <Btn onClick={sendBroadcast} disabled={!bTitle.trim() || !bBody.trim() || bSending} className="w-full" icon="send">
            {bSending ? 'Envoi en cours…' : 'Envoyer la notification'}
          </Btn>
        </Card>

        {/* MIROIR */}
        <SectionLabel>MIROIR</SectionLabel>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Principes',  val: referentiel.length,   tone: 'text-charbon' },
            { label: 'En attente', val: decNonTraitees,        tone: 'text-amber' },
            { label: 'Arbitrer',   val: arbitrer.length,      tone: arbitrer.length > 0 ? 'text-[#D64545]' : 'text-charbon' },
          ].map(s => (
            <Card key={s.label} className="p-3 text-center">
              <div className={`text-[22px] font-display font-extrabold ${s.tone}`}>{!loaded ? '…' : s.val}</div>
              <div className="text-[10px] text-g400 mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {arbitrer.length > 0 && (
          <>
            <p className="text-[11px] font-bold text-[#D64545] uppercase tracking-wider">À arbitrer — ta décision est requise</p>
            {arbitrer.map(m => (
              <Card key={m.id} className="p-4 border-amber/30 flex flex-col gap-2.5">
                <p className="text-[13.5px] text-charbon font-semibold leading-snug">{m.principe_detecte}</p>
                <div className="bg-amber/8 rounded-xl px-3 py-2.5 border border-amber/15">
                  <p className="text-[12px] font-bold text-amber mb-1">Question pour toi</p>
                  <p className="text-[13px] text-charbon leading-snug">{m.a_arbitrer}</p>
                </div>
                <button onClick={() => resolveArbitrage(m.id)}
                  className="w-full py-2.5 rounded-xl bg-charbon text-white text-[13px] font-bold active:scale-[.98] transition">
                  Arbitré — marquer résolu
                </button>
              </Card>
            ))}
          </>
        )}

        <Card className="p-4 flex flex-col gap-3">
          <p className="text-[13px] font-bold text-charbon">Nouvelle décision</p>
          <input value={dSujet} onChange={e => setDSujet(e.target.value)}
            placeholder="Sujet — ex : Ne pas accepter sans acompte"
            className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition" />
          <textarea value={dContexte} onChange={e => setDContexte(e.target.value)}
            rows={3} placeholder="Contexte — enjeu + options + pourquoi cette décision"
            className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] text-charbon outline-none focus:border-orange transition resize-none" />
          <div className="flex gap-2">
            <button onClick={() => addDecision('VALIDE')} disabled={!dSujet.trim() || !dContexte.trim() || dSending}
              className="flex-1 py-3 rounded-xl bg-growth text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition">Validé</button>
            <button onClick={() => addDecision('REJETE')} disabled={!dSujet.trim() || !dContexte.trim() || dSending}
              className="flex-1 py-3 rounded-xl bg-[#D64545] text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition">Rejeté</button>
          </div>
        </Card>

        {referentiel.length > 0 && (
          <>
            <SectionLabel>Référentiel actif ({referentiel.length} principes)</SectionLabel>
            {categories.map(cat => (
              <div key={cat} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-px flex-1 bg-g200" />
                  <span className="text-[10px] font-bold text-g400 uppercase tracking-widest px-2">{cat}</span>
                  <div className="h-px flex-1 bg-g200" />
                </div>
                {referentiel.filter(m => m.categorie === cat).map(m => (
                  <Card key={m.id} className="px-4 py-3 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13.5px] text-charbon font-semibold leading-snug flex-1">{m.principe_detecte}</p>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          m.type === 'NOUVEAU' ? 'bg-orange/10 text-orange' :
                          m.type === 'CONFIRMATION' ? 'bg-growth/10 text-growth' :
                          m.type === 'NUANCE' ? 'bg-info/10 text-info' : 'bg-amber/10 text-amber'
                        }`}>{m.type}</span>
                        <span className={`text-[10px] font-medium ${m.confiance === 'haute' ? 'text-growth' : m.confiance === 'faible' ? 'text-[#D64545]' : 'text-g400'}`}>{m.confiance}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-g400 leading-snug">{m.referentiel}</p>
                  </Card>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Feedbacks */}
        <SectionLabel>Feedbacks {pendingCount > 0 && <span className="ml-1.5 bg-[#D64545] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}</SectionLabel>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-[18px] px-[18px]" style={{ scrollbarWidth: 'none' }}>
          {FB_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFbFilter(f.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-bold border-[1.5px] transition ${fbFilter === f.id ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {filteredFeedbacks.length === 0 ? (
          <p className="text-center text-[13px] text-g400 py-4">Aucun feedback.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredFeedbacks.map(fb => {
              const ctx = fb.context || {};
              const isPending = fb.status === 'nouveau';
              const typeStyle = fb.type === 'bug' ? 'bg-red-100 text-red-600' : fb.type === 'besoin' ? 'bg-blue-100 text-blue-600' : 'bg-g100 text-g500';
              return (
                <Card key={fb.id} className={`px-4 py-3 flex flex-col gap-2 ${isPending ? 'border-orange/30' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${typeStyle}`}>{fb.type}</span>
                      <span className="text-[11px] text-g400 flex-shrink-0">{timeAgo(fb.created_at)}</span>
                    </div>
                    {isPending ? (
                      <button onClick={() => markHandled(fb.id)}
                        className="flex-shrink-0 text-[11px] font-bold text-growth border border-growth/40 rounded-full px-2.5 py-1 hover:bg-growth/10 transition">
                        Traité
                      </button>
                    ) : (
                      <span className="text-[10px] text-g400 font-medium flex-shrink-0">traité</span>
                    )}
                  </div>
                  <p className="text-[13px] text-charbon leading-snug">{fb.message}</p>
                  {ctx.agent_id && <p className="text-[11px] text-g400">Agent : {ctx.agent_id}{ctx.nb_messages ? ` · ${ctx.nb_messages} msg` : ''}</p>}
                </Card>
              );
            })}
          </div>
        )}

        {/* Déconnexion */}
        <button onClick={() => supabase.auth.signOut()}
          className="w-full py-3 rounded-xl border-[1.5px] border-g200 text-[13.5px] font-bold text-g400 hover:border-[#D64545]/40 hover:text-[#D64545] transition active:scale-[.98]">
          Se déconnecter
        </button>

        {/* Accès rapide */}
        <SectionLabel>Accès rapide</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Supabase', url: 'https://supabase.com/dashboard/project/lgdgbrivnhgeupqhkckd', tone: 'text-growth', icon: 'sheet' },
            { label: 'Netlify',  url: 'https://app.netlify.com',                                     tone: 'text-info',   icon: 'bolt' },
            { label: 'GitHub',   url: 'https://github.com/MrAttractor/jarvis-starter-kit',           tone: 'text-charbon', icon: 'code' },
            { label: 'demo.agenceattractor.com', url: 'https://demo.agenceattractor.com',            tone: 'text-orange',  icon: 'target' },
          ].map(r => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white border border-g200 rounded-[14px] px-3 py-3 active:scale-[.99] transition hover:border-orange/30">
              <Icon name={r.icon} size={15} className={`flex-shrink-0 ${r.tone}`} />
              <span className={`text-[13px] font-bold ${r.tone} truncate`}>{r.label}</span>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
