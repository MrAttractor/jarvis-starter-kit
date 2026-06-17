import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';
import { detectPlatform } from './InstallScreen';

function Divider() {
  return <div className="h-px bg-g200 mx-4" />;
}

function Row({ label, sub, right, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition active:bg-g100 ${danger ? 'active:bg-red-50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-g400 uppercase tracking-[.08em]">{label}</div>
        {sub && <div className="text-[13.5px] font-semibold text-charbon mt-0.5 truncate">{sub}</div>}
      </div>
      {right
        ? <span className={`text-[13px] font-bold flex-shrink-0 ${danger ? 'text-red-500' : 'text-orange'}`}>{right}</span>
        : <Icon name="chevron" size={18} className="text-g300 flex-shrink-0" />
      }
    </button>
  );
}

export function ProfilScreen({ go, notify, dark, setDark, profile, reloadProfile }) {
  const [sheetOpen, setSheetOpen]     = useState(null);
  const [fieldValue, setFieldValue]   = useState('');
  const [saving, setSaving]           = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [regenerating, setRegenerating]    = useState(false);
  const [feedbackType, setFeedbackType]    = useState('bug');
  const [feedbackText, setFeedbackText]    = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [confirmDelete, setConfirmDelete]  = useState(false);
  const [slugValue, setSlugValue]           = useState('');
  const [slugChecking, setSlugChecking]     = useState(false);
  const [isSlugAvail, setIsSlugAvail]       = useState(null);

  const photoInputRef = useRef(null);
  const canInstall = !['installed', 'desktop'].includes(detectPlatform());

  // Vérification disponibilité slug (debounce 600ms, exclut le slug actuel)
  useEffect(() => {
    if (sheetOpen !== 'slug') return;
    if (!slugValue || slugValue.length < 3) { setIsSlugAvail(null); return; }
    if (slugValue === profile?.public_slug) { setIsSlugAvail(true); return; }
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('public_slug', slugValue).maybeSingle();
      setIsSlugAvail(!data);
      setSlugChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [slugValue, sheetOpen]);

  const slug        = profile?.public_slug;
  const boutiqueUrl = slug ? `${window.location.origin}/b/${slug}` : null;
  const initials    = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();
  const photoUrl    = profile?.photo_url || null;

  const openSheet = (key, current = '') => {
    setFieldValue(current);
    setSheetOpen(key);
  };

  const saveField = async (fields) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update(fields).eq('id', user.id);
        notify('Sauvegardé');
        if (reloadProfile) reloadProfile();
      }
    } catch { notify('Erreur lors de la sauvegarde'); }
    setSaving(false);
    setSheetOpen(null);
  };

  // ── Photo de profil ───────────────────────────────────────────────────────

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { notify('Session expirée'); return; }
      const ext  = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      // Ajouter un cache-buster pour forcer le rechargement
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ photo_url: urlWithBust }).eq('id', user.id);
      notify('Photo mise à jour');
      if (reloadProfile) reloadProfile();
    } catch (e) {
      notify(e?.message || 'Erreur lors du chargement');
    }
    setUploadingPhoto(false);
  };

  // ── Régénérer l'assistant client ──────────────────────────────────────────

  const regenerateAssistant = async () => {
    if (!profile?.id) return;
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-client-assistant', {
        body: { user_id: profile.id },
      });
      if (error || !data?.slug) throw new Error(error?.message || 'Échec de la génération');
      notify('Assistant mis à jour');
      if (reloadProfile) reloadProfile();
    } catch (e) {
      notify(e?.message || 'Erreur lors de la régénération');
    }
    setRegenerating(false);
  };

  // ── Feedback ──────────────────────────────────────────────────────────────

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback').insert({
          user_id: user.id, type: feedbackType,
          message: feedbackText.trim(),
          context: { screen: 'profil', plan: profile?.plan_code, prenom: profile?.prenom },
        });
        setSheetOpen(null); setFeedbackText('');
        notify('Merci, c\'est bien reçu !');
      }
    } catch { notify('Erreur lors de l\'envoi'); }
    setFeedbackSending(false);
  };

  // ── Supprimer le compte ───────────────────────────────────────────────────

  const deleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Supprime le profil (cascade sur les données via FK ON DELETE CASCADE)
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
    } catch { notify('Erreur — contacte myattractor1@gmail.com'); }
  };

  return (
    <div className="flex flex-col min-h-full bg-sable pb-10">

      {/* Hero — photo + infos */}
      <div className="px-4 pt-14 pb-5 flex flex-col items-center gap-3">

        {/* Avatar cliquable */}
        <div className="relative">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handlePhotoUpload(e.target.files?.[0])}
          />
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="relative w-[84px] h-[84px] rounded-[26px] overflow-hidden flex-shrink-0 active:opacity-85 transition"
          >
            {photoUrl
              ? <img src={photoUrl} alt="Photo profil" className="w-full h-full object-cover" />
              : (
                <div
                  className="w-full h-full flex items-center justify-center font-display font-extrabold text-[26px] text-white"
                  style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
                >
                  {initials}
                </div>
              )
            }
            {/* Overlay caméra */}
            <div className="absolute inset-0 flex items-end justify-center pb-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 60%)' }}>
              {uploadingPhoto
                ? <Spinner className="w-4 h-4 border-white border-t-transparent" />
                : <Icon name="camera" size={14} className="text-white" />
              }
            </div>
          </button>
        </div>

        <div className="text-center">
          <div className="font-display font-bold text-[20px] text-charbon leading-tight">{profile?.prenom || 'Mon profil'}</div>
          <div className="text-[13px] text-g400 mt-0.5">{profile?.activite || 'Ton activité'}</div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">

        {/* Carte boutique */}
        {boutiqueUrl ? (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
            <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Ma boutique</div>
                <div className="text-[13px] font-bold text-orange mt-0.5">/b/{slug}</div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-vert/10 flex items-center justify-center">
                <Icon name="check" size={14} className="text-vert" />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-3.5 pt-2.5">
              <button
                onClick={() => { navigator.clipboard.writeText(boutiqueUrl); notify('Lien copié !'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <Icon name="copy" size={13} /> Copier
              </button>
              <button
                onClick={() => {
                  const text = encodeURIComponent(`Commande ici\n${boutiqueUrl}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WA
              </button>
              <button
                onClick={regenerateAssistant}
                disabled={regenerating}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-orange/25 text-[12.5px] font-bold text-orange bg-orange/5 active:bg-orange/10 transition disabled:opacity-50"
              >
                {regenerating ? <Spinner className="w-3.5 h-3.5 border-orange border-t-transparent" /> : <Icon name="spark" size={13} />}
                Regen.
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft p-4">
            <p className="text-[12.5px] font-bold text-g500 mb-1">Ta boutique n'est pas encore créée</p>
            <p className="text-[12px] text-g400 leading-relaxed">
              Dis à ton Assists "crée ma boutique" pour générer ton lien en quelques secondes.
            </p>
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Configuration</span>
          </div>
          <Row
            label="Prénom"
            sub={profile?.prenom || 'Non défini'}
            right="Modifier"
            onClick={() => openSheet('prenom', profile?.prenom || '')}
          />
          <Divider />
          <Row
            label="Mon activité"
            sub={profile?.activite || 'Non définie'}
            right="Modifier"
            onClick={() => openSheet('activite', profile?.activite || '')}
          />
          <Divider />
          <Row
            label="Nom de mon assistant"
            sub={profile?.nom_assistant || 'Assists'}
            right="Modifier"
            onClick={() => openSheet('nom_assistant', profile?.nom_assistant || '')}
          />
          <Divider />
          <Row
            label="Lien boutique"
            sub={slug ? `/b/${slug}` : 'Créer un identifiant'}
            right="Modifier"
            onClick={() => { setSlugValue(profile?.public_slug || ''); setIsSlugAvail(null); setSheetOpen('slug'); }}
          />
        </div>

        {/* Application */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Application</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13.5px] font-semibold text-charbon">Mode sombre</span>
            <button
              onClick={() => setDark(!dark)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${dark ? 'bg-orange' : 'bg-g200'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <Divider />

          {canInstall && (
            <>
              <Row label="Installer l'app" sub="Ajouter à l'écran d'accueil" onClick={() => go('install')} />
              <Divider />
            </>
          )}

          <Row label="Notifications" onClick={() => go('notifications')} />
          <Divider />
          <Row label="Un bug ou une idée ?" onClick={() => openSheet('feedback')} />
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => go('logout')}
          className="w-full py-3.5 text-[14px] font-bold text-[#D64545] rounded-xl bg-white border border-g200 active:bg-red-50 transition"
        >
          Se déconnecter
        </button>

        {/* Supprimer le compte */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 text-[13px] text-g400 font-medium"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-red-200 p-4 flex flex-col gap-3">
            <p className="text-[13.5px] font-bold text-charbon">Supprimer définitivement ton compte ?</p>
            <p className="text-[12.5px] text-g500 leading-relaxed">
              Toutes tes données (profil, catalogue, commandes, mémoires) seront effacées. Action irréversible.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl border border-g200 text-[13px] font-bold text-charbon"
              >
                Annuler
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[13px] font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-g400 leading-relaxed pb-2">
          Attractor Assists · Agence Attractor
        </p>
      </div>

      {/* ── Sheets ───────────────────────────────────────────────────────────── */}

      {sheetOpen === 'slug' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Ton lien boutique</div>

            {/* Aperçu */}
            <div className="bg-charbon rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Aperçu</p>
              <p className="text-white font-mono text-[13px] break-all">
                assists.agenceattractor.com/b/<span className="text-orange font-bold">{slugValue || '...'}</span>
              </p>
            </div>

            {/* Input */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={slugValue}
                  onChange={e => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);
                    setSlugValue(val);
                    setIsSlugAvail(null);
                  }}
                  placeholder="ex: macarthur"
                  className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[15px] font-mono text-charbon outline-none focus:border-orange pr-10"
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugChecking && <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />}
                  {!slugChecking && isSlugAvail === true && <span className="text-vert font-bold">✓</span>}
                  {!slugChecking && isSlugAvail === false && <span className="text-red-500 font-bold">✗</span>}
                </div>
              </div>
              {isSlugAvail === true && slugValue !== profile?.public_slug && (
                <p className="text-[12px] text-vert font-semibold mt-1.5">Disponible.</p>
              )}
              {isSlugAvail === false && (
                <p className="text-[12px] text-red-500 mt-1.5">
                  Déjà pris. Essaie <button className="font-bold underline" onClick={() => setSlugValue(slugValue + '2')}>{slugValue}2</button>.
                </p>
              )}
              <p className="text-[11px] text-g400 mt-2">Minuscules, chiffres et tirets. 3 à 20 caractères.</p>
            </div>

            <button
              onClick={() => saveField({ public_slug: slugValue.trim() })}
              disabled={saving || slugValue.length < 3 || !isSlugAvail || slugChecking}
              className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] disabled:opacity-50"
            >
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {sheetOpen && sheetOpen !== 'feedback' && sheetOpen !== 'slug' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">
              {sheetOpen === 'prenom' && 'Mon prénom'}
              {sheetOpen === 'activite' && 'Mon activité'}
              {sheetOpen === 'nom_assistant' && 'Nom de mon assistant'}
            </div>
            <input
              type="text"
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              placeholder={
                sheetOpen === 'prenom' ? 'Ex : Aïcha' :
                sheetOpen === 'activite' ? 'Ex : Restauration · Abidjan' :
                'Ex : Aya, Max, Stella…'
              }
              className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[15px] text-charbon outline-none focus:border-orange"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && saveField({ [sheetOpen]: fieldValue.trim() })}
            />
            <button
              onClick={() => saveField({ [sheetOpen]: fieldValue.trim() })}
              disabled={saving || !fieldValue.trim()}
              className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] disabled:opacity-50"
            >
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {sheetOpen === 'feedback' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Un bug ou une idée ?</div>
            <div className="flex gap-2">
              {[['bug', 'Un bug'], ['besoin', 'Une idée']].map(([k, l]) => (
                <button key={k} onClick={() => setFeedbackType(k)}
                  className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${feedbackType === k ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
                  {l}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder={feedbackType === 'bug' ? 'Décris ce qui ne fonctionne pas…' : 'Qu\'est-ce qui manque ou pourrait être mieux ?'}
              className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[14px] text-charbon outline-none focus:border-orange resize-none"
            />
            <button
              onClick={sendFeedback}
              disabled={!feedbackText.trim() || feedbackSending}
              className="w-full py-4 rounded-2xl bg-charbon text-white font-display font-bold text-[15px] disabled:opacity-50"
            >
              {feedbackSending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
