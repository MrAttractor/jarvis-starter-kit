import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';
import { detectPlatform } from './InstallScreen';
import { checkSlug } from '../lib/slug';
import { boutiqueUrl, BOUTIQUE_BASE } from '../lib/boutique';
import { Anamnese } from '../components/Anamnese';
import { PitchModal } from '../components/Pitch';

// Le WhatsApp de l'agence, pour les demandes de nom de domaine.
const WA_AGENCE = '2250576877070';

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
  const [feedbackType, setFeedbackType]    = useState('bug');
  const [feedbackText, setFeedbackText]    = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [confirmDelete, setConfirmDelete]  = useState(false);
  const [slugValue, setSlugValue]           = useState('');
  const [slugChecking, setSlugChecking]     = useState(false);
  const [isSlugAvail, setIsSlugAvail]       = useState(null);
  const [slugErr, setSlugErr]               = useState('');

  const photoInputRef = useRef(null);
  const canInstall = !['installed', 'desktop'].includes(detectPlatform());

  // Vérification disponibilité slug (debounce 600ms).
  // slug_available() exclut déjà le slug que l'utilisateur possède lui-même.
  useEffect(() => {
    if (sheetOpen !== 'slug') return;
    if (!slugValue || slugValue.length < 3) { setIsSlugAvail(null); setSlugErr(''); return; }
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const { ok, error } = await checkSlug(slugValue);
      setIsSlugAvail(ok);
      setSlugErr(error || '');
      setSlugChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [slugValue, sheetOpen]);

  const slug        = profile?.public_slug;
  const lienBoutique = boutiqueUrl(slug);
  const initials    = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();
  const photoUrl    = profile?.photo_url || null;

  // Même règle de lecture du plan que PaliersScreen, pour ne pas afficher
  // « Gratuit » à quelqu'un qui paie sous un ancien code de plan.
  const isGratuit = !(
    (profile?.plan_tier && profile.plan_tier !== 'gratuit') ||
    ['bras_droit','growth','growth_eu','team','manager','personnalise','pro'].includes(profile?.plan_code)
  );
  const planLabel = isGratuit ? 'Gratuit' : 'Bras Droit';

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

  // Note : il n'y a plus de « régénération » sans anamnèse. Régénérer l'assistant
  // sans lui redonner d'informations le reconstruisait à partir du seul prénom +
  // activité, c'est-à-dire vide. On repasse par les 7 questions (sheet `anamnese`).

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
        {lienBoutique ? (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
            <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Ma boutique</div>
                <div className="text-[12px] font-mono text-orange mt-0.5 break-all">{lienBoutique.replace('https://', '')}</div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-vert/10 flex items-center justify-center">
                <Icon name="check" size={14} className="text-vert" />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-3.5 pt-2.5">
              <button
                onClick={() => { navigator.clipboard.writeText(lienBoutique); notify('Lien copié !'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <Icon name="copy" size={13} /> Copier
              </button>
              <button
                onClick={() => {
                  const text = encodeURIComponent(`Commande directement sur ma boutique : ${lienBoutique}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WA
              </button>
              <button
                onClick={() => setSheetOpen('anamnese')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-orange/25 text-[12.5px] font-bold text-orange bg-orange/5 active:bg-orange/10 transition"
              >
                <Icon name="spark" size={13} />
                Réapprendre
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

        {/* Domaine professionnel */}
        {slug && (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
            <div className="px-4 pt-3.5 pb-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-g400 uppercase tracking-[.1em] mb-0.5">Domaine professionnel</div>
                <p className="text-[12.5px] text-charbon leading-snug">
                  Passe de <span className="font-mono text-g500 text-[11px]">{BOUTIQUE_BASE.replace('https://', '')}</span> à ton propre nom de domaine.
                  <span className="text-g400"> 10 000 F/an.</span>
                </p>
              </div>
              <a
                href={`https://wa.me/${WA_AGENCE}?text=${encodeURIComponent(`Bonjour ! Je veux un nom de domaine professionnel pour ma boutique Assists. Mon lien actuel : ${lienBoutique}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-charbon text-white text-[12.5px] font-bold active:opacity-80 transition whitespace-nowrap"
              >
                <Icon name="bolt" size={13} />
                Obtenir
              </a>
            </div>
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
            sub={slug ? `${BOUTIQUE_BASE.replace('https://', '')}/${slug}` : 'Créer un identifiant'}
            right="Modifier"
            onClick={() => { setSlugValue(profile?.public_slug || ''); setIsSlugAvail(null); setSheetOpen('slug'); }}
          />
        </div>

        {/* Mon offre — seule porte d'entrée vers les formules et Fidelys.
            Avant, l'écran des formules n'était atteignable qu'après 16 commandes
            dans le mois, et Fidelys que si un client dormait depuis 14 jours. */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Mon offre</span>
          </div>
          <Row
            label="Ma formule"
            sub={planLabel}
            right={isGratuit ? 'Découvrir' : 'Voir'}
            onClick={() => go('paliers')}
          />
          <Divider />
          <Row
            label="Fidelys"
            sub="Faire revenir mes clients"
            onClick={() => go('fidelys')}
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
          <Row label="Ce que je fais pour toi" sub="Les 3 choses, en 30 secondes" onClick={() => setSheetOpen('pitch')} />
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

        <a
          href="https://agenceattractor.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-[12px] text-g400 hover:text-orange transition-colors pb-2"
        >
          <Icon name="back" size={12} /> agenceattractor.com
        </a>
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
                {BOUTIQUE_BASE.replace('https://', '')}/<span className="text-orange font-bold">{slugValue || '...'}</span>
              </p>
            </div>

            {/* Input */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={slugValue}
                  onChange={e => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+/, '').slice(0, 20);
                    setSlugValue(val);
                    setIsSlugAvail(null);
                    setSlugErr('');
                  }}
                  placeholder="ex: macarthur"
                  className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[16px] font-mono text-charbon outline-none focus:border-orange pr-10"
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
              {isSlugAvail === false && slugErr && (
                <p className="text-[12px] text-red-500 mt-1.5">
                  {slugErr}{' '}
                  {slugValue.length >= 3 && (
                    <>Essaie <button className="font-bold underline" onClick={() => setSlugValue(slugValue + '2')}>{slugValue}2</button>.</>
                  )}
                </p>
              )}
              <p className="text-[11px] text-g400 mt-2">Minuscules, chiffres et tirets. 3 à 20 caractères.</p>
              {slug && slugValue !== slug && (
                <p className="text-[11px] text-amber-600 mt-2 leading-snug">
                  Attention : si tu changes, l'ancien lien ne marchera plus. Les clients qui l'ont gardé ne trouveront plus ta boutique.
                </p>
              )}
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

      {/* Liste explicite : la condition était « tout sauf feedback et slug », donc
          la feuille d'édition s'empilait par-dessus l'anamnèse et proposait
          d'enregistrer un champ `anamnese` qui n'existe pas en base. */}
      {['prenom', 'activite', 'nom_assistant'].includes(sheetOpen) && (
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
              className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[16px] text-charbon outline-none focus:border-orange"
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
              className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[16px] text-charbon outline-none focus:border-orange resize-none"
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

      {sheetOpen === 'pitch' && <PitchModal onClose={() => setSheetOpen(null)} />}

      {/* Réapprendre : les 7 questions, puis régénération de l'assistant */}
      {sheetOpen === 'anamnese' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div>
              <div className="font-display font-bold text-[17px] text-charbon">Réapprends-lui ton métier</div>
              <p className="text-[12.5px] text-g400 mt-0.5">Tes réponses remplacent les précédentes et ton assistant est reconstruit.</p>
            </div>
            <Anamnese
              profile={profile}
              onClose={() => setSheetOpen(null)}
              onGenerated={() => {
                setSheetOpen(null);
                notify('Ton assistant a été mis à jour');
                if (reloadProfile) reloadProfile();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
