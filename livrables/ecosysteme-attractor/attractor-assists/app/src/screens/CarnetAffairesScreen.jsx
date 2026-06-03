import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Btn, Input, Textarea, Sheet, Spinner } from '../components/ui';

const STATUT_LABELS = { actif: 'Actif', inactif: 'Inactif', en_attente: 'En attente' };
const STATUT_COLORS = {
  actif:      'bg-green-100 text-green-700',
  inactif:    'bg-g100 text-g400',
  en_attente: 'bg-amber-100 text-amber-700',
};
const INACTIF_DAYS = 14;

function daysAgo(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' });
}

// ─── Carte client ─────────────────────────────────────────────────────────────

function EntryCard({ entry, lastPurchase, onEdit, onWhatsApp }) {
  const days  = daysAgo(entry.derniere_interaction);
  const stale = entry.type === 'client' && entry.statut === 'actif' && days !== null && days >= INACTIF_DAYS;

  return (
    <div className={`bg-white rounded-[18px] border p-4 flex items-start gap-3 transition ${stale ? 'border-amber-200' : 'border-g200'}`}>
      <div className="w-10 h-10 rounded-full bg-orange/12 flex items-center justify-center text-orange font-display font-extrabold text-[13px] flex-shrink-0">
        {entry.nom.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display font-bold text-[15px] text-charbon truncate">{entry.nom}</p>
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUT_COLORS[entry.statut]}`}>
            {STATUT_LABELS[entry.statut]}
          </span>
        </div>
        {entry.contact && (
          <p className="text-[12px] text-g400 mt-0.5 truncate">{entry.contact}</p>
        )}
        {/* Dernier achat */}
        {entry.type === 'client' && (
          <p className="text-[11.5px] mt-1 font-medium">
            {lastPurchase
              ? <span className="text-growth">Dernier achat : {lastPurchase.produit_nom} · {formatDate(lastPurchase.date_achat)}</span>
              : <span className="text-g400">Aucun achat enregistré</span>
            }
          </p>
        )}
        {stale && (
          <p className="text-[11.5px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
            <Icon name="clock" size={12} /> Pas de contact depuis {days} jours
          </p>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          {entry.contact && entry.contact.match(/\d{8,}/) && (
            <button onClick={() => onWhatsApp(entry)}
              className="flex items-center gap-1 text-[12px] text-green-600 font-bold hover:underline">
              <Icon name="send" size={13} /> WhatsApp
            </button>
          )}
          <button onClick={() => onEdit(entry)}
            className="flex items-center gap-1 text-[12px] text-g400 font-semibold hover:text-charbon">
            <Icon name="edit" size={13} /> Voir fiche
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sheet ajout / édition client ────────────────────────────────────────────

function EntrySheet({ entry, produits, purchases, onSave, onDelete, onClose, onAddPurchase, onGoAttractor }) {
  const isNew = !entry;
  const [nom, setNom]         = useState(entry?.nom     || '');
  const [contact, setContact] = useState(entry?.contact || '');
  const [notes, setNotes]     = useState(entry?.notes   || '');
  const [statut, setStatut]   = useState(entry?.statut  || 'actif');
  const [type, setType]       = useState(entry?.type    || 'client');
  const [saving, setSaving]   = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const handleSave = async () => {
    if (!nom.trim()) return;
    setSaving(true);
    await onSave({ nom: nom.trim(), contact: contact.trim() || null, notes: notes.trim() || null, statut, type });
    setSaving(false);
    onClose();
  };

  const myPurchases = purchases.filter(p => p.contact_id === entry?.id);

  return (
    <Sheet onClose={onClose} title={isNew ? 'Nouveau contact' : entry.nom}>
      <div className="flex flex-col gap-4">

        {/* Bouton flow Mr Attractor */}
        {!isNew && entry.type === 'client' && (
          <button
            onClick={() => { onClose(); onGoAttractor(entry); }}
            className="flex items-center gap-3 p-3.5 rounded-[16px] border border-orange/25 bg-orange/5 active:bg-orange/10 transition text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-orange/15 flex items-center justify-center flex-shrink-0">
              <Icon name="spark" size={18} className="text-orange" />
            </div>
            <div>
              <p className="font-display font-bold text-[13.5px] text-orange">Enregistrer via Mr Attractor</p>
              <p className="text-[11.5px] text-g400">Dis-lui ce que tu veux, il gère tout.</p>
            </div>
          </button>
        )}

        {/* Type (nouveau seulement) */}
        {isNew && (
          <div className="flex gap-2">
            {['client', 'prospect'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl font-display font-bold text-[13.5px] border-[1.5px] transition ${type === t ? 'bg-orange text-white border-orange' : 'bg-white text-charbon border-g200'}`}>
                {t === 'client' ? 'Client' : 'Prospect'}
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="text-[12px] font-bold text-g400 uppercase tracking-wide mb-1.5 block">Nom</label>
          <Input placeholder="Ex : Mama Adjoua" value={nom} onChange={e => setNom(e.target.value)} autoFocus={isNew} />
        </div>
        <div>
          <label className="text-[12px] font-bold text-g400 uppercase tracking-wide mb-1.5 block">WhatsApp / Téléphone</label>
          <Input placeholder="Ex : +225 07..." value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <div>
          <label className="text-[12px] font-bold text-g400 uppercase tracking-wide mb-1.5 block">Notes</label>
          <Textarea rows={2} placeholder="Préférences, contexte..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {!isNew && (
          <div>
            <label className="text-[12px] font-bold text-g400 uppercase tracking-wide mb-1.5 block">Statut</label>
            <div className="flex gap-2">
              {Object.entries(STATUT_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setStatut(k)}
                  className={`flex-1 py-2 rounded-xl font-semibold text-[12px] border-[1.5px] transition ${statut === k ? 'bg-charbon text-white border-charbon' : 'bg-white text-g400 border-g200'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historique achats (clients seulement) */}
        {!isNew && entry.type === 'client' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold text-g400 uppercase tracking-wide">Historique achats</label>
              <button
                onClick={() => setPurchaseOpen(true)}
                className="flex items-center gap-1 text-[12px] font-bold text-orange"
              >
                <Icon name="plus" size={13} /> Ajouter
              </button>
            </div>
            {myPurchases.length === 0 ? (
              <p className="text-[13px] text-g400 text-center py-3">Aucun achat enregistré</p>
            ) : (
              <div className="flex flex-col gap-2">
                {myPurchases.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-sable rounded-[12px] px-3.5 py-2.5 border border-g200">
                    <div>
                      <p className="font-semibold text-[13.5px] text-charbon">{p.produit_nom}</p>
                      <p className="text-[11.5px] text-g400">{formatDate(p.date_achat)}{p.montant ? ` · ${Number(p.montant).toLocaleString('fr-FR')} FCFA` : ''}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-growth flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Btn onClick={handleSave} className="w-full" iconRight="check" disabled={saving || !nom.trim()}>
          {saving ? 'Enregistrement...' : isNew ? 'Ajouter' : 'Enregistrer'}
        </Btn>

        {!isNew && (
          <button onClick={() => { onDelete(entry.id); onClose(); }}
            className="text-center text-[13px] text-red-400 font-semibold py-1 hover:text-red-600">
            Supprimer ce contact
          </button>
        )}
      </div>

      {purchaseOpen && (
        <PurchaseForm
          produits={produits}
          onAdd={(data) => { onAddPurchase({ ...data, contact_id: entry.id }); setPurchaseOpen(false); }}
          onClose={() => setPurchaseOpen(false)}
        />
      )}
    </Sheet>
  );
}

// ─── Form ajout achat ─────────────────────────────────────────────────────────

function PurchaseForm({ produits, onAdd, onClose }) {
  const [produitId, setProduitId]     = useState('');
  const [produitNom, setProduitNom]   = useState('');
  const [dateAchat, setDateAchat]     = useState(new Date().toISOString().slice(0, 10));
  const [montant, setMontant]         = useState('');
  const [useCustom, setUseCustom]     = useState(produits.length === 0);

  const selectedProduit = produits.find(p => p.id === produitId);

  const handleAdd = () => {
    const nom = useCustom ? produitNom.trim() : (selectedProduit?.nom || '');
    if (!nom) return;
    onAdd({
      produit_id:  useCustom ? null : produitId || null,
      produit_nom: nom,
      date_achat:  dateAchat,
      montant:     montant ? parseFloat(montant) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-charbon/50 z-[60] flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-[24px] p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-g200 rounded-full mx-auto mb-4" />
        <h3 className="font-display font-extrabold text-[17px] text-charbon mb-4">Ajouter un achat</h3>

        {produits.length > 0 && (
          <div className="flex gap-2 mb-3">
            <button onClick={() => setUseCustom(false)}
              className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-[1.5px] transition ${!useCustom ? 'bg-orange text-white border-orange' : 'text-g400 border-g200'}`}>
              Mes produits
            </button>
            <button onClick={() => setUseCustom(true)}
              className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-[1.5px] transition ${useCustom ? 'bg-orange text-white border-orange' : 'text-g400 border-g200'}`}>
              Texte libre
            </button>
          </div>
        )}

        {!useCustom && produits.length > 0 ? (
          <select
            value={produitId}
            onChange={e => setProduitId(e.target.value)}
            className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-3"
          >
            <option value="">Choisir un produit...</option>
            {produits.map(p => (
              <option key={p.id} value={p.id}>{p.nom}{p.prix ? ` — ${Number(p.prix).toLocaleString('fr-FR')} FCFA` : ''}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Nom du produit ou service..."
            value={produitNom}
            onChange={e => setProduitNom(e.target.value)}
            className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-3"
          />
        )}

        <input
          type="date"
          value={dateAchat}
          onChange={e => setDateAchat(e.target.value)}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-3"
        />
        <input
          type="number"
          placeholder="Montant (optionnel, FCFA)"
          value={montant}
          onChange={e => setMontant(e.target.value)}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-4"
        />

        <Btn onClick={handleAdd} className="w-full" iconRight="check"
          disabled={useCustom ? !produitNom.trim() : !produitId}>
          Enregistrer l'achat
        </Btn>
      </div>
    </div>
  );
}

// ─── Section Mes Produits ─────────────────────────────────────────────────────

function MesProduits({ produits, onAdd, onDelete }) {
  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [nom, setNom]         = useState('');
  const [prix, setPrix]       = useState('');
  const [unite, setUnite]     = useState('unité');
  const [saving, setSaving]   = useState(false);

  const handleAdd = async () => {
    if (!nom.trim()) return;
    setSaving(true);
    await onAdd({ nom: nom.trim(), prix: prix ? parseFloat(prix) : null, unite });
    setNom(''); setPrix(''); setUnite('unité'); setAdding(false);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-[18px] border border-g200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3.5"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center">
            <Icon name="flag" size={16} className="text-orange" />
          </div>
          <span className="font-display font-bold text-[14px] text-charbon">Mes produits / services</span>
          {produits.length > 0 && (
            <span className="text-[11px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full">{produits.length}</span>
          )}
        </div>
        <Icon name={open ? 'chevdown' : 'chevron'} size={16} className="text-g400" />
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-g200 pt-3">
          {produits.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-sable rounded-[12px] px-3.5 py-2.5">
              <div>
                <p className="font-semibold text-[13.5px] text-charbon">{p.nom}</p>
                {p.prix && <p className="text-[11.5px] text-g400">{Number(p.prix).toLocaleString('fr-FR')} FCFA / {p.unite}</p>}
              </div>
              <button onClick={() => onDelete(p.id)} className="text-g300 hover:text-red-400 transition p-1">
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}

          {adding ? (
            <div className="flex flex-col gap-2 mt-1">
              <input
                type="text" placeholder="Nom du produit" value={nom} onChange={e => setNom(e.target.value)} autoFocus
                className="w-full border-2 border-g200 rounded-[12px] px-3 py-2.5 text-[13.5px] text-charbon outline-none focus:border-orange transition"
              />
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Prix (FCFA)" value={prix} onChange={e => setPrix(e.target.value)}
                  className="flex-1 border-2 border-g200 rounded-[12px] px-3 py-2.5 text-[13.5px] text-charbon outline-none focus:border-orange transition"
                />
                <select value={unite} onChange={e => setUnite(e.target.value)}
                  className="border-2 border-g200 rounded-[12px] px-2 py-2.5 text-[13px] text-charbon outline-none focus:border-orange transition">
                  {['unité','heure','mois','projet'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Btn onClick={handleAdd} disabled={!nom.trim() || saving} className="flex-1 text-[13px]">
                  {saving ? '...' : 'Ajouter'}
                </Btn>
                <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl border border-g200 text-[13px] text-g400 font-semibold">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] border-dashed border-[1.5px] border-orange/35 text-orange font-bold text-[13px] mt-1 active:bg-orange/5 transition">
              <Icon name="plus" size={15} /> Ajouter un produit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function CarnetAffairesScreen({ go }) {
  const [tab, setTab]           = useState('client');
  const [entries, setEntries]   = useState([]);
  const [produits, setProduits] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sheet, setSheet]       = useState(null);
  const [userId, setUserId]     = useState(null);

  const staleCount = entries.filter(e =>
    e.type === 'client' && e.statut === 'actif' &&
    daysAgo(e.derniere_interaction) >= INACTIF_DAYS
  ).length;

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const [carnetRes, produitsRes, purchasesRes] = await Promise.all([
        supabase.from('carnet_affaires').select('*').eq('user_id', user.id).order('derniere_interaction', { ascending: false }),
        supabase.from('produits_user').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('client_purchases').select('*').eq('user_id', user.id).order('date_achat', { ascending: false }),
      ]);
      setEntries(carnetRes.data || []);
      setProduits(produitsRes.data || []);
      setPurchases(purchasesRes.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => e.type === tab);

  const lastPurchaseByContact = {};
  purchases.forEach(p => {
    if (!lastPurchaseByContact[p.contact_id]) lastPurchaseByContact[p.contact_id] = p;
  });

  const handleSave = async (data) => {
    if (!userId) return;
    if (sheet && sheet !== 'new') {
      await supabase.from('carnet_affaires').update({ ...data, derniere_interaction: new Date().toISOString() }).eq('id', sheet.id);
    } else {
      await supabase.from('carnet_affaires').insert({ user_id: userId, ...data, derniere_interaction: new Date().toISOString() });
    }
    load();
  };

  const handleDelete = async (id) => {
    await supabase.from('carnet_affaires').delete().eq('id', id);
    load();
  };

  const handleWhatsApp = (entry) => {
    const phone = entry.contact.replace(/\s+/g, '').replace(/^\+/, '');
    window.open(`https://wa.me/${phone}`, '_blank');
    supabase.from('carnet_affaires').update({ derniere_interaction: new Date().toISOString() }).eq('id', entry.id);
  };

  const handleAddProduit = async (data) => {
    if (!userId) return;
    const { data: p } = await supabase.from('produits_user').insert({ user_id: userId, ...data }).select().single();
    if (p) setProduits(prev => [...prev, p]);
  };

  const handleDeleteProduit = async (id) => {
    await supabase.from('produits_user').delete().eq('id', id);
    setProduits(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPurchase = async (data) => {
    if (!userId) return;
    const { data: p } = await supabase.from('client_purchases').insert({ user_id: userId, ...data }).select().single();
    if (p) setPurchases(prev => [p, ...prev]);
  };

  const handleGoAttractor = (entry) => {
    go('conversation', {
      assistant: 'coach',
      prefill: `Je veux enregistrer un achat pour mon client ${entry.nom}. Dis-moi ce dont tu as besoin.`,
    });
  };

  return (
    <div className="min-h-screen bg-sable pb-2">
      {/* Header */}
      <div className="relative overflow-hidden text-white rounded-b-[26px] px-5 pt-7 pb-6"
        style={{ background: "linear-gradient(150deg,#FF7A2E 0%,#F25C05 52%,#D94703 100%)" }}>
        <div className="absolute -right-16 -top-12 w-52 h-52 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => go('dashboard')} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Icon name="back" size={18} className="text-white" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-[20px] leading-tight">Suivi Clients</h1>
            <p className="text-[12px] text-white/80">{entries.length} contact{entries.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {staleCount > 0 && (
          <div className="relative mt-4 bg-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <Icon name="clock" size={16} className="text-amber-200 flex-shrink-0" />
            <p className="text-[12.5px] font-semibold text-white">
              {staleCount} client{staleCount > 1 ? 's' : ''} sans contact depuis {INACTIF_DAYS}+ jours
            </p>
          </div>
        )}
      </div>

      <div className="px-[18px] pt-4 flex flex-col gap-3">

        {/* Mes produits/services */}
        <MesProduits produits={produits} onAdd={handleAddProduit} onDelete={handleDeleteProduit} />

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-[14px] p-1 border border-g200">
          {[
            { id: 'client',   label: 'Clients',   count: entries.filter(e => e.type === 'client').length },
            { id: 'prospect', label: 'Prospects', count: entries.filter(e => e.type === 'prospect').length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-display font-bold text-[13.5px] transition ${tab === t.id ? 'bg-orange text-white shadow-sm' : 'text-g400'}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/25 text-white' : 'bg-g100 text-g400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bouton ajout */}
        <button onClick={() => setSheet('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] border-[1.5px] border-dashed border-orange/40 bg-orange/5 text-orange font-display font-bold text-[14px] active:bg-orange/10 transition">
          <Icon name="plus" size={18} /> Ajouter un {tab === 'client' ? 'client' : 'prospect'}
        </button>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-[18px] bg-g100 flex items-center justify-center mb-4">
              <Icon name="users" size={24} className="text-g300" />
            </div>
            <p className="font-display font-bold text-[15px] text-charbon">
              Aucun {tab === 'client' ? 'client' : 'prospect'} pour l'instant
            </p>
            <p className="text-[13px] text-g400 mt-2 max-w-[240px] leading-relaxed">
              Ajoutez votre premier {tab === 'client' ? 'client' : 'prospect'} pour commencer à organiser votre activité.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-6">
            {filtered.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                lastPurchase={lastPurchaseByContact[entry.id] || null}
                onEdit={e => setSheet(e)}
                onWhatsApp={handleWhatsApp}
              />
            ))}
          </div>
        )}
      </div>

      {sheet !== null && (
        <EntrySheet
          entry={sheet === 'new' ? null : sheet}
          produits={produits}
          purchases={purchases}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
          onAddPurchase={handleAddPurchase}
          onGoAttractor={handleGoAttractor}
        />
      )}
    </div>
  );
}
