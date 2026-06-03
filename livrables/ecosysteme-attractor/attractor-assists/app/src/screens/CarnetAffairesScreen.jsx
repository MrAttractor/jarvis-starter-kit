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

function EntryCard({ entry, onEdit, onWhatsApp }) {
  const days = daysAgo(entry.derniere_interaction);
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
        {entry.notes && (
          <p className="text-[12px] text-g500 mt-1 leading-relaxed line-clamp-2">{entry.notes}</p>
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
            <Icon name="edit" size={13} /> Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

function EntrySheet({ entry, onSave, onDelete, onClose }) {
  const isNew = !entry;
  const [nom, setNom]       = useState(entry?.nom     || '');
  const [contact, setContact] = useState(entry?.contact || '');
  const [notes, setNotes]   = useState(entry?.notes   || '');
  const [statut, setStatut] = useState(entry?.statut  || 'actif');
  const [type, setType]     = useState(entry?.type    || 'client');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nom.trim()) return;
    setSaving(true);
    await onSave({ nom: nom.trim(), contact: contact.trim() || null, notes: notes.trim() || null, statut, type });
    setSaving(false);
    onClose();
  };

  return (
    <Sheet onClose={onClose} title={isNew ? "Nouveau contact" : "Modifier"}>
      <div className="flex flex-col gap-4">
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
          <label className="text-[12px] font-bold text-g500 uppercase tracking-wide mb-1.5 block">Nom</label>
          <Input placeholder="Ex : Mama Adjoua" value={nom} onChange={e => setNom(e.target.value)} autoFocus={isNew} />
        </div>
        <div>
          <label className="text-[12px] font-bold text-g500 uppercase tracking-wide mb-1.5 block">WhatsApp / Téléphone</label>
          <Input placeholder="Ex : +225 07..." value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <div>
          <label className="text-[12px] font-bold text-g500 uppercase tracking-wide mb-1.5 block">Notes</label>
          <Textarea rows={3} placeholder="Commandes en attente, préférences, contexte..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {!isNew && (
          <div>
            <label className="text-[12px] font-bold text-g500 uppercase tracking-wide mb-1.5 block">Statut</label>
            <div className="flex gap-2">
              {Object.entries(STATUT_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setStatut(k)}
                  className={`flex-1 py-2 rounded-xl font-semibold text-[12.5px] border-[1.5px] transition ${statut === k ? 'bg-charbon text-white border-charbon' : 'bg-white text-g500 border-g200'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <Btn onClick={handleSave} className="w-full" iconRight="check"
          disabled={saving || !nom.trim()}>
          {saving ? 'Enregistrement...' : isNew ? 'Ajouter' : 'Enregistrer'}
        </Btn>

        {!isNew && (
          <button onClick={() => { onDelete(entry.id); onClose(); }}
            className="text-center text-[13px] text-red-400 font-semibold py-1 hover:text-red-600">
            Supprimer ce contact
          </button>
        )}
      </div>
    </Sheet>
  );
}

export function CarnetAffairesScreen({ go }) {
  const [tab, setTab]         = useState('client');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet]     = useState(null); // null | 'new' | entry object

  const staleCount = entries.filter(e =>
    e.type === 'client' && e.statut === 'actif' &&
    daysAgo(e.derniere_interaction) >= INACTIF_DAYS
  ).length;

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('carnet_affaires')
        .select('*').eq('user_id', user.id)
        .order('derniere_interaction', { ascending: false });
      setEntries(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => e.type === tab);

  const handleSave = async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (sheet && sheet !== 'new') {
      await supabase.from('carnet_affaires').update({
        ...data,
        derniere_interaction: new Date().toISOString(),
      }).eq('id', sheet.id);
    } else {
      await supabase.from('carnet_affaires').insert({
        user_id: user.id,
        ...data,
        derniere_interaction: new Date().toISOString(),
      });
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
            <h1 className="font-display font-extrabold text-[20px] leading-tight">Carnet d'affaires</h1>
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

      <div className="px-[18px] pt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-white rounded-[14px] p-1 border border-g200">
          {[
            { id: 'client',   label: 'Clients',    count: entries.filter(e => e.type === 'client').length },
            { id: 'prospect', label: 'Prospects',  count: entries.filter(e => e.type === 'prospect').length },
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
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] border-[1.5px] border-dashed border-orange/40 bg-orange/5 text-orange font-display font-bold text-[14px] mb-4 active:bg-orange/10 transition">
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
            <p className="font-display font-bold text-[15px] text-charbon">Aucun {tab === 'client' ? 'client' : 'prospect'} pour l'instant</p>
            <p className="text-[13px] text-g400 mt-2 max-w-[240px] leading-relaxed">
              Ajoutez votre premier {tab === 'client' ? 'client' : 'prospect'} pour commencer à organiser votre activité.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(entry => (
              <EntryCard key={entry.id} entry={entry}
                onEdit={e => setSheet(e)}
                onWhatsApp={handleWhatsApp} />
            ))}
          </div>
        )}
      </div>

      {sheet !== null && (
        <EntrySheet
          entry={sheet === 'new' ? null : sheet}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
