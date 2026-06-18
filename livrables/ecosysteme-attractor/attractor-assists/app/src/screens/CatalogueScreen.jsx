import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner, VoiceMic } from '../components/ui';

export function CatalogueScreen({ go, notify, profile }) {
  const [produits, setProduits]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('Tout');
  const [showSheet, setShowSheet]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]             = useState({ nom: '', prix: '', unite: 'unité', categorie: '', photo_url: '' });
  const [uploading, setUploading]   = useState(false);
  const [lastPhotoFile, setLastPhotoFile] = useState(null);
  const [cleaning, setCleaning]     = useState(false);
  const [cleanStatus, setCleanStatus] = useState('');

  // Scan IA
  const [scanning, setScanning]       = useState(false);
  const [scanResults, setScanResults] = useState(null); // [{ nom, prix, unite, categorie, selected, editable }]
  const [showScanSheet, setShowScanSheet] = useState(false);
  const [savingScan, setSavingScan]   = useState(false);

  const fileRef     = useRef(null);
  const scanFileRef = useRef(null);

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
  const filtered   = filterCat === 'Tout' ? produits : produits.filter(p => p.categorie === filterCat);
  const activeCount = produits.filter(p => p.actif !== false).length;

  // ── Scan IA ──────────────────────────────────────────────────────────────

  const handleScanFile = async (file) => {
    if (!file) return;
    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl  = e.target.result;
        const base64   = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        const { data, error } = await supabase.functions.invoke('catalog-from-photos', {
          body: { image_base64: base64, image_type: mimeType, zone: profile?.zone || 'CI' },
        });

        if (error || !data?.produits) {
          notify('Impossible d\'analyser la photo. Réessaie.');
          setScanning(false);
          return;
        }

        setScanResults(data.produits.map(p => ({ ...p, selected: true })));
        setShowScanSheet(true);
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch {
      notify('Erreur lors de l\'analyse.');
      setScanning(false);
    }
  };

  const updateScanRow = (i, field, value) => {
    setScanResults(r => r.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const saveScanResults = async () => {
    const toSave = (scanResults || []).filter(p => p.selected && p.nom?.trim());
    if (toSave.length === 0) { notify('Aucun produit sélectionné.'); return; }
    setSavingScan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { notify('Session expirée'); return; }
      const rows = toSave.map(p => ({
        user_id:   user.id,
        nom:       p.nom.trim(),
        prix:      p.prix ? parseInt(p.prix) : 0,
        unite:     p.unite || 'unité',
        categorie: p.categorie || null,
        actif:     true,
      }));
      const { error } = await supabase.from('produits_user').insert(rows);
      if (error) throw error;
      notify(`${rows.length} produit${rows.length > 1 ? 's' : ''} ajouté${rows.length > 1 ? 's' : ''}`);
      setShowScanSheet(false);
      setScanResults(null);
      loadProduits();
    } catch (e) {
      notify(e?.message || 'Erreur lors de la sauvegarde');
    }
    setSavingScan(false);
  };

  // ── Gestion manuelle ──────────────────────────────────────────────────────

  const toggleActif = async (p) => {
    await supabase.from('produits_user').update({ actif: !p.actif }).eq('id', p.id);
    loadProduits();
  };

  const openNew = () => {
    setEditProduct(null);
    setForm({ nom: '', prix: '', unite: 'unité', categorie: '', photo_url: '' });
    setShowSheet(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ nom: p.nom || '', prix: String(p.prix || ''), unite: p.unite || 'unité', categorie: p.categorie || '', photo_url: p.photo_url || '' });
    setShowSheet(true);
  };

  const closeSheet = () => { setShowSheet(false); setEditProduct(null); };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setLastPhotoFile(file);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { notify('Session expirée'); return; }
      const ext  = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('catalogue-photos').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('catalogue-photos').getPublicUrl(path);
      setForm(x => ({ ...x, photo_url: publicUrl }));
    } catch (e) {
      notify(e?.message || 'Erreur upload photo');
    }
    setUploading(false);
  };

  const handleCleanPhoto = async () => {
    const source = lastPhotoFile || form.photo_url;
    if (!source) return;
    setCleaning(true);
    setCleanStatus('');
    try {
      const { cleanPhotoBackground } = await import('../lib/photoUtils');
      const cleanedBlob = await cleanPhotoBackground(source, setCleanStatus);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session');
      const path = `${user.id}/${Date.now()}_clean.jpg`;
      const { error } = await supabase.storage.from('catalogue-photos').upload(path, cleanedBlob, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('catalogue-photos').getPublicUrl(path);
      setForm(x => ({ ...x, photo_url: publicUrl }));
      setLastPhotoFile(null);
    } catch {
      notify('Erreur lors du traitement. Réessaie.');
    }
    setCleaning(false);
    setCleanStatus('');
  };

  const handleSave = async () => {
    if (!form.nom.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { notify('Session expirée, reconnecte-toi'); return; }
      if (editProduct) {
        const { error } = await supabase.from('produits_user').update({
          nom:       form.nom.trim(),
          prix:      parseInt(form.prix) || 0,
          unite:     form.unite,
          categorie: form.categorie,
          photo_url: form.photo_url,
        }).eq('id', editProduct.id);
        if (error) throw error;
        notify('Produit modifié');
      } else {
        const { data: { user: u } } = await supabase.auth.getUser();
        const { error } = await supabase.from('produits_user').insert({
          user_id:   u.id,
          nom:       form.nom.trim(),
          prix:      parseInt(form.prix) || 0,
          unite:     form.unite,
          categorie: form.categorie,
          photo_url: form.photo_url,
          actif:     true,
        });
        if (error) throw error;
        notify('Produit ajouté');
      }
      closeSheet();
      loadProduits();
    } catch (e) {
      notify(e?.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!editProduct) return;
    try {
      await supabase.from('produits_user').delete().eq('id', editProduct.id);
      closeSheet();
      loadProduits();
      notify('Produit supprimé');
    } catch { notify('Erreur lors de la suppression'); }
  };

  return (
    <div className="flex flex-col h-full bg-sable">

      {/* AppBar */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3 bg-sable">
        <div>
          <div className="font-display font-bold text-[19px] text-charbon">Mon catalogue</div>
          <div className="text-[12.5px] text-g500 mt-0.5">{activeCount} produit{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Choisir modèle boutique */}
          <button
            onClick={() => go('galerie-templates')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-g200 bg-white text-charbon text-[12.5px] font-bold active:bg-g100 transition"
            title="Choisir le modèle de ma boutique"
          >
            <Icon name="grid" size={15} className="text-orange" />
            Modèle
          </button>
          {/* Bouton scan IA */}
          <input
            ref={scanFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleScanFile(e.target.files?.[0])}
          />
          <button
            onClick={() => scanFileRef.current?.click()}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-g200 bg-white text-charbon text-[12.5px] font-bold active:bg-g100 transition disabled:opacity-60"
          >
            {scanning
              ? <Spinner className="w-4 h-4" />
              : <Icon name="camera" size={15} className="text-orange" />
            }
            {scanning ? 'Analyse…' : 'Scanner'}
          </button>
          {/* Bouton ajout manuel */}
          <button
            onClick={openNew}
            className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:scale-95 transition"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
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
                : 'bg-white text-g700 border-g200'
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
            <p className="text-[13px] text-g500 max-w-[220px] leading-relaxed">
              Scanne ta carte ou ajoute un produit avec le bouton +
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft ${p.actif === false ? 'opacity-50' : ''}`}>
                <div className="w-full aspect-square bg-g100 flex items-center justify-center relative">
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.nom} className="w-full h-full object-cover" />
                    : <Icon name="camera" size={28} className="text-g400" />
                  }
                  <button
                    onClick={() => openEdit(p)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-g200 flex items-center justify-center shadow-sm active:bg-g100 transition"
                  >
                    <Icon name="edit" size={13} className="text-charbon" />
                  </button>
                </div>
                <div className="p-2.5">
                  <div className="font-display font-bold text-[13px] text-charbon leading-tight">{p.nom}</div>
                  <div className="text-[12px] font-bold text-orange mt-1">
                    {p.prix ? `${p.prix.toLocaleString('fr-FR')} F` : 'Prix sur demande'}
                    {p.unite && p.unite !== 'unité' && p.unite !== 'pièce' ? `/${p.unite}` : ''}
                  </div>
                  <button
                    onClick={() => toggleActif(p)}
                    className={`mt-2 w-full text-[11px] font-bold py-1.5 rounded-lg transition ${
                      p.actif !== false ? 'bg-vert/10 text-vert' : 'bg-g100 text-g400'
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

      {/* ── Sheet scan IA ─────────────────────────────────────────────────── */}
      {showScanSheet && scanResults && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => { setShowScanSheet(false); setScanResults(null); }}>
          <div className="w-full bg-white rounded-t-[28px] flex flex-col max-h-[88vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-g200" />
            </div>
            <div className="px-5 pt-2 pb-3 border-b border-g200 flex-shrink-0">
              <div className="font-display font-bold text-[17px] text-charbon">Produits détectés</div>
              <div className="text-[12.5px] text-g500 mt-0.5">
                {scanResults.filter(p => p.selected).length} sélectionné{scanResults.filter(p => p.selected).length > 1 ? 's' : ''} sur {scanResults.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
              {scanResults.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-3 transition ${p.selected ? 'border-orange/30 bg-orange/5' : 'border-g200 bg-g100 opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateScanRow(i, 'selected', !p.selected)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${p.selected ? 'bg-orange border-orange' : 'border-g300 bg-white'}`}
                    >
                      {p.selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <input
                        value={p.nom}
                        onChange={e => updateScanRow(i, 'nom', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-g200 bg-white text-[13.5px] font-bold text-charbon outline-none focus:border-orange"
                        placeholder="Nom du produit"
                      />
                      <div className="flex gap-2">
                        <input
                          value={p.prix ?? ''}
                          onChange={e => updateScanRow(i, 'prix', e.target.value)}
                          type="number"
                          className="flex-1 px-3 py-2 rounded-lg border border-g200 bg-white text-[13px] text-charbon outline-none focus:border-orange"
                          placeholder="Prix"
                        />
                        <input
                          value={p.categorie ?? ''}
                          onChange={e => updateScanRow(i, 'categorie', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-g200 bg-white text-[13px] text-charbon outline-none focus:border-orange"
                          placeholder="Catégorie"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pt-3 pb-8 border-t border-g200 flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={saveScanResults}
                disabled={savingScan || scanResults.filter(p => p.selected).length === 0}
                className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(242,92,5,.5)] disabled:opacity-50 transition"
              >
                {savingScan ? <Spinner className="w-5 h-5 border-white" /> : null}
                Ajouter {scanResults.filter(p => p.selected).length} produit{scanResults.filter(p => p.selected).length > 1 ? 's' : ''}
              </button>
              <button
                onClick={() => { setShowScanSheet(false); setScanResults(null); }}
                className="w-full py-3 text-[13px] text-g400 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sheet ajout / modif manuel ───────────────────────────────────── */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={closeSheet}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="flex items-center justify-between">
              <div className="font-display font-bold text-[17px] text-charbon">
                {editProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </div>
              {editProduct && (
                <button onClick={handleDelete} className="text-[12.5px] font-bold text-red-500 active:opacity-70 transition">
                  Supprimer
                </button>
              )}
            </div>

            {/* Photo */}
            <div>
              <label className="text-[12px] font-bold text-g500 block mb-1.5">Photo du produit</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handlePhotoUpload(e.target.files?.[0])}
              />
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl bg-g100 border border-g200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.photo_url
                    ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                    : <Icon name="camera" size={22} className="text-g400" />
                  }
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || cleaning}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-[1.5px] border-dashed border-g300 text-[13px] font-bold text-g600 bg-sable active:bg-g100 transition disabled:opacity-60"
                  >
                    {uploading ? <Spinner className="w-4 h-4" /> : <Icon name="camera" size={15} />}
                    {uploading ? 'Chargement…' : form.photo_url ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                  {form.photo_url && (
                    <button
                      type="button"
                      onClick={handleCleanPhoto}
                      disabled={cleaning || uploading}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-[1.5px] border-dashed border-orange/40 text-[13px] font-bold text-orange bg-orange/5 active:bg-orange/10 transition disabled:opacity-60"
                    >
                      {cleaning
                        ? <><Spinner className="w-3.5 h-3.5" /> <span>{cleanStatus || 'Traitement…'}</span></>
                        : 'Nettoyer le fond'
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>

            {[
              { label: 'Nom du produit *', key: 'nom', placeholder: 'Ex : Attiéké poisson', voice: true },
              { label: 'Prix (FCFA)', key: 'prix', placeholder: 'Ex : 2000', type: 'number' },
              { label: 'Catégorie', key: 'categorie', placeholder: 'Ex : Plats, Jus, Desserts', voice: true },
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
              {editProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
