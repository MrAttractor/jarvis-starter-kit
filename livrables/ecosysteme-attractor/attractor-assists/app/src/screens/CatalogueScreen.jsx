import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner, VoiceMic } from '../components/ui';

export function CatalogueScreen({ go, notify, profile }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('Tout');
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState({ nom: '', prix: '', unite: 'unité', categorie: '', photo_url: '' });

  const loadProduits = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('produits_user')
        .select('*')
        .order('created_at', { ascending: false });
      setProduits(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadProduits(); }, []);

  const categories = ['Tout', ...new Set((produits || []).map(p => p.categorie).filter(Boolean))];
  const filtered = filterCat === 'Tout' ? produits : produits.filter(p => p.categorie === filterCat);

  const toggleActif = async (p) => {
    await supabase.from('produits_user').update({ actif: !p.actif }).eq('id', p.id);
    loadProduits();
  };

  const handleSave = async () => {
    if (!form.nom.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { notify('Session expirée, reconnecte-toi'); return; }
      const { error } = await supabase.from('produits_user').insert({
        user_id: user.id,
        nom: form.nom.trim(),
        prix: parseInt(form.prix) || 0,
        unite: form.unite,
        categorie: form.categorie,
        photo_url: form.photo_url,
        actif: true,
      });
      if (error) throw error;
      setForm({ nom: '', prix: '', unite: 'unité', categorie: '', photo_url: '' });
      setShowSheet(false);
      notify('Produit ajouté');
      loadProduits();
    } catch (e) {
      notify(e?.message || "Erreur lors de l'ajout du produit");
    }
  };

  const activeCount = produits.filter(p => p.actif !== false).length;

  return (
    <div className="flex flex-col h-full bg-sable">
      {/* AppBar */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3 bg-sable">
        <div>
          <div className="font-display font-bold text-[19px] text-charbon">Mon catalogue</div>
          <div className="text-[12.5px] text-g500 mt-0.5">{activeCount} produit{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''}</div>
        </div>
        <button
          onClick={() => setShowSheet(true)}
          className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:scale-95 transition"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      {/* Chips catégories */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap border transition ${
              filterCat === c
                ? 'bg-charbon text-white border-charbon'
                : 'bg-white text-g700 border-g200 hover:border-g500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grille produits */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-g100 flex items-center justify-center">
              <Icon name="package" size={26} className="text-g400" />
            </div>
            <p className="font-display font-bold text-[15px] text-charbon">Aucun produit</p>
            <p className="text-[13px] text-g500">Ajoute ton premier produit avec le bouton +</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft ${p.actif === false ? 'opacity-50' : ''}`}>
                <div className="w-full aspect-square bg-g100 flex items-center justify-center">
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.nom} className="w-full h-full object-cover" />
                    : <Icon name="camera" size={28} className="text-g400" />
                  }
                </div>
                <div className="p-2.5">
                  <div className="font-display font-bold text-[13px] text-charbon leading-tight">{p.nom}</div>
                  <div className="text-[12px] font-bold text-orange mt-1">
                    {p.prix?.toLocaleString('fr-FR')} {p.unite === 'unité' || p.unite === 'pièce' ? 'F' : `F/${p.unite}`}
                  </div>
                  <button
                    onClick={() => toggleActif(p)}
                    className={`mt-2 w-full text-[11px] font-bold py-1.5 rounded-lg transition ${
                      p.actif !== false
                        ? 'bg-vert/10 text-vert'
                        : 'bg-g100 text-g400'
                    }`}
                  >
                    {p.actif !== false ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet ajout produit */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setShowSheet(false)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Nouveau produit</div>
            {[
              { label: 'Nom du produit *', key: 'nom', placeholder: 'Ex : Attiéké poisson', voice: true },
              { label: 'Prix (FCFA)', key: 'prix', placeholder: 'Ex : 2000', type: 'number' },
              { label: 'Catégorie', key: 'categorie', placeholder: 'Ex : Plats, Jus, Desserts', voice: true },
              { label: 'Lien photo (URL)', key: 'photo_url', placeholder: 'https://…' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[12px] font-bold text-g500 block mb-1.5">{f.label}</label>
                <div className="flex gap-2">
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-xl border border-g200 bg-sable text-[14px] text-charbon outline-none focus:border-orange"
                  />
                  {f.voice && <VoiceMic onTranscript={t => setForm(x => ({ ...x, [f.key]: t }))} className="self-center" />}
                </div>
              </div>
            ))}
            <div>
              <label className="text-[12px] font-bold text-g500 block mb-1.5">Unité</label>
              <select
                value={form.unite}
                onChange={e => setForm(x => ({ ...x, unite: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[14px] text-charbon outline-none focus:border-orange"
              >
                {['unité', 'pièce', 'kg', 'litre', 'heure', 'mois', 'service'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] mt-1"
            >
              Ajouter le produit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
