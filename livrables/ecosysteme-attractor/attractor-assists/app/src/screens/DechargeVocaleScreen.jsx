import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Btn, Spinner } from '../components/ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Carte d'entité confirmable ───────────────────────────────────────────────

function EntityCard({ icon, label, color, items, selected, onToggle }) {
  if (!items.length) return null;
  return (
    <div className="bg-white rounded-[18px] border border-g200 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 border-b border-g200 ${color}`}>
        <Icon name={icon} size={16} />
        <span className="font-display font-bold text-[13px]">{label}</span>
        <span className="ml-auto text-[11px] font-bold opacity-60">{items.length}</span>
      </div>
      <div className="divide-y divide-g100">
        {items.map((item, i) => {
          const isSelected = selected.has(i);
          return (
            <button key={i} onClick={() => onToggle(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isSelected ? 'bg-orange/5' : 'hover:bg-g50'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                isSelected ? 'bg-orange border-orange' : 'border-g300'
              }`}>
                {isSelected && <Icon name="check" size={11} stroke={2.8} className="text-white" />}
              </div>
              <span className="text-[14px] text-charbon leading-snug flex-1">{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function DechargeVocaleScreen({ go, profile }) {
  const [phase, setPhase]           = useState('idle'); // idle | recording | processing | confirm | done
  const [transcript, setTranscript] = useState('');
  const [entities, setEntities]     = useState({ taches: [], clients: [], rappels: [], idees: [] });
  const [selTaches, setSelTaches]   = useState(new Set());
  const [selClients, setSelClients] = useState(new Set());
  const [selRappels, setSelRappels] = useState(new Set());
  const [saving, setSaving]         = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [errMsg, setErrMsg]         = useState('');
  const [duration, setDuration]     = useState(0);

  const recorderRef  = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const durationRef  = useRef(0);

  // Nettoyage au démontage
  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  // ── Enregistrement ───────────────────────────────────────────────────────────

  const startRecording = async () => {
    setErrMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); processAudio(recorder.mimeType); };
      recorderRef.current = recorder;
      recorder.start(250);
      setPhase('recording');
      durationRef.current = 0;
      setDuration(0);
      timerRef.current = setInterval(() => { durationRef.current++; setDuration(durationRef.current); }, 1000);
    } catch {
      setErrMsg("Accès au microphone refusé. Autorise le microphone dans les paramètres de ton navigateur.");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setPhase('processing');
    }
  };

  // ── Traitement audio ─────────────────────────────────────────────────────────

  const processAudio = async (mimeType) => {
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size < 1000) { setPhase('idle'); setErrMsg("Enregistrement trop court. Maintiens le bouton et parle."); return; }

      const audio_b64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke('process-dump', {
        body: { audio_b64, audio_type: mimeType },
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      setTranscript(data.transcript || '');
      const ents = data.entities || { taches: [], clients: [], rappels: [], idees: [] };
      setEntities(ents);

      // Tout sélectionné par défaut
      setSelTaches(new Set(ents.taches.map((_, i) => i)));
      setSelClients(new Set(ents.clients.map((_, i) => i)));
      setSelRappels(new Set(ents.rappels.map((_, i) => i)));

      const total = ents.taches.length + ents.clients.length + ents.rappels.length + ents.idees.length;
      if (total === 0 && !data.transcript) {
        setErrMsg("Rien entendu. Réessaie en parlant plus fort.");
        setPhase('idle');
      } else {
        setPhase('confirm');
      }
    } catch (e) {
      setErrMsg(e.message || "Une erreur est survenue. Réessaie.");
      setPhase('idle');
    }
  };

  // ── Sauvegarde ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    let count = 0;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("session perdue");

      const ops = [];

      // Tâches → agenda
      const tachesSelected = [...selTaches].map(i => entities.taches[i]).filter(Boolean);
      if (tachesSelected.length) {
        ops.push(supabase.from('todos').insert(
          tachesSelected.map(t => ({ user_id: user.id, titre: t, priorite: 'normale', statut: 'todo' }))
        ));
        count += tachesSelected.length;
      }

      // Rappels → agenda (avec note horodatage)
      const rappelsSelected = [...selRappels].map(i => entities.rappels[i]).filter(Boolean);
      if (rappelsSelected.length) {
        ops.push(supabase.from('todos').insert(
          rappelsSelected.map(r => ({ user_id: user.id, titre: r, priorite: 'urgente', statut: 'todo', notes: 'Rappel depuis décharge vocale' }))
        ));
        count += rappelsSelected.length;
      }

      // Clients → carnet_affaires
      const clientsSelected = [...selClients].map(i => entities.clients[i]).filter(Boolean);
      if (clientsSelected.length) {
        ops.push(supabase.from('carnet_affaires').insert(
          clientsSelected.map(c => ({ user_id: user.id, type: 'client', nom: c, statut: 'actif', derniere_interaction: new Date().toISOString() }))
        ));
        count += clientsSelected.length;
      }

      await Promise.all(ops);
      setSavedCount(count);
      setPhase('done');
    } catch (e) {
      setErrMsg(e.message || "Erreur lors de la sauvegarde.");
    }
    setSaving(false);
  };

  const reset = () => {
    setPhase('idle');
    setTranscript('');
    setEntities({ taches: [], clients: [], rappels: [], idees: [] });
    setSelTaches(new Set());
    setSelClients(new Set());
    setSelRappels(new Set());
    setErrMsg('');
    setSavedCount(0);
  };

  const toggleItem = (setter, i) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const totalSelected = selTaches.size + selClients.size + selRappels.size;
  const hasEntities = entities.taches.length + entities.clients.length + entities.rappels.length + entities.idees.length > 0;

  // ── RENDU ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sable flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden text-white rounded-b-[26px] px-5 pt-7 pb-6"
        style={{ background: "linear-gradient(150deg,#FF7A2E 0%,#F25C05 52%,#D94703 100%)" }}>
        <div className="absolute -right-16 -top-12 w-52 h-52 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => go('dashboard')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon name="back" size={18} className="text-white" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-[20px] leading-tight">Décharge vocale</h1>
            <p className="text-[12px] text-white/80">Parlez, Mr Attractor organise</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 flex flex-col gap-5">

        {/* ── Phase IDLE : bouton microphone ── */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-[fadeUp_.4s_ease]">
            <div className="text-center max-w-[280px]">
              <p className="font-display font-extrabold text-[20px] text-charbon leading-snug">
                Videz votre tête.
              </p>
              <p className="text-[14px] text-g500 mt-2 leading-relaxed">
                Parlez librement — clients, tâches, rappels, idées. Mr Attractor structure tout automatiquement.
              </p>
            </div>

            <button
              onPointerDown={startRecording}
              className="w-28 h-28 rounded-full bg-orange shadow-[0_16px_40px_-10px_rgba(242,92,5,.6)] flex items-center justify-center active:scale-95 transition-all duration-150"
            >
              <Icon name="mic" size={40} className="text-white" />
            </button>

            <p className="text-[12.5px] text-g400 font-medium">Appuie pour commencer</p>

            {errMsg && (
              <div className="w-full p-3.5 bg-red-50 border border-red-100 rounded-[14px] flex items-start gap-2.5">
                <Icon name="warn" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 leading-snug">{errMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Phase RECORDING : animation ── */}
        {phase === 'recording' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-[fadeUp_.3s_ease]">
            <div className="text-center">
              <p className="font-display font-extrabold text-[20px] text-charbon">En écoute…</p>
              <p className="text-[14px] text-g400 mt-2">Parlez normalement. Relâchez quand vous avez terminé.</p>
            </div>

            <div className="relative">
              {/* Anneaux pulsés */}
              <div className="absolute inset-0 rounded-full bg-orange/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-[-12px] rounded-full bg-orange/10 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
              <button
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                className="relative w-28 h-28 rounded-full bg-orange shadow-[0_16px_40px_-10px_rgba(242,92,5,.7)] flex items-center justify-center active:scale-95 transition"
              >
                <Icon name="mic" size={40} className="text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-orange/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              <span className="font-display font-bold text-[14px] text-orange">
                {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <p className="text-[13px] text-g400">Relâchez le bouton pour terminer</p>
          </div>
        )}

        {/* ── Phase PROCESSING : spinner ── */}
        {phase === 'processing' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 animate-[fadeUp_.3s_ease]">
            <Spinner className="w-12 h-12" />
            <div className="text-center">
              <p className="font-display font-bold text-[17px] text-charbon">Mr Attractor analyse…</p>
              <p className="text-[13px] text-g400 mt-2">Transcription + extraction en cours</p>
            </div>
          </div>
        )}

        {/* ── Phase CONFIRM : résultats ── */}
        {phase === 'confirm' && (
          <div className="flex flex-col gap-4 animate-[fadeUp_.4s_ease]">
            {/* Transcript */}
            {transcript && (
              <div className="p-4 bg-white rounded-[16px] border border-g200">
                <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Vous avez dit</p>
                <p className="text-[13.5px] text-g600 leading-relaxed italic">"{transcript}"</p>
              </div>
            )}

            {hasEntities ? (
              <>
                <p className="text-[13px] text-g500 font-medium">Cochez ce que vous voulez enregistrer :</p>

                <EntityCard icon="check" label="Tâches" color="bg-blue-50 text-blue-700"
                  items={entities.taches} selected={selTaches}
                  onToggle={i => toggleItem(setSelTaches, i)} />

                <EntityCard icon="users" label="Clients" color="bg-orange/10 text-orange"
                  items={entities.clients} selected={selClients}
                  onToggle={i => toggleItem(setSelClients, i)} />

                <EntityCard icon="clock" label="Rappels" color="bg-amber-50 text-amber-700"
                  items={entities.rappels} selected={selRappels}
                  onToggle={i => toggleItem(setSelRappels, i)} />

                {entities.idees.length > 0 && (
                  <div className="bg-white rounded-[18px] border border-g200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-g200 bg-growth/10 text-growth">
                      <Icon name="spark" size={16} />
                      <span className="font-display font-bold text-[13px]">Idées notées</span>
                      <span className="ml-auto text-[11px] font-bold opacity-60">{entities.idees.length}</span>
                    </div>
                    <div className="divide-y divide-g100">
                      {entities.idees.map((idee, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-growth mt-2 flex-shrink-0" />
                          <p className="text-[13.5px] text-g600 leading-snug">{idee}</p>
                        </div>
                      ))}
                    </div>
                    <p className="px-4 py-2.5 text-[11.5px] text-g400 bg-g50">
                      Les idées sont affichées seulement — parlez-en à votre CoS pour les développer.
                    </p>
                  </div>
                )}

                {errMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-[14px]">
                    <p className="text-[13px] text-red-600">{errMsg}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 pb-6">
                  <Btn onClick={handleSave} className="w-full" iconRight="check"
                    disabled={saving || totalSelected === 0}>
                    {saving ? 'Enregistrement...' : `Enregistrer (${totalSelected} élément${totalSelected > 1 ? 's' : ''})`}
                  </Btn>
                  <button onClick={reset}
                    className="text-center text-[13px] text-g400 font-semibold py-2">
                    Recommencer
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <p className="font-display font-bold text-[16px] text-charbon">Aucune entité détectée</p>
                <p className="text-[13.5px] text-g400 max-w-[260px] leading-relaxed">
                  {transcript
                    ? "Mr Attractor n'a pas identifié de tâches, clients ou rappels dans votre message."
                    : "Rien entendu. Assurez-vous de parler clairement."}
                </p>
                <Btn onClick={reset} variant="ghost">Réessayer</Btn>
              </div>
            )}
          </div>
        )}

        {/* ── Phase DONE : confirmation ── */}
        {phase === 'done' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-[fadeUp_.4s_ease] text-center">
            <div className="w-20 h-20 rounded-full bg-orange/12 flex items-center justify-center">
              <Icon name="check" size={32} className="text-orange" stroke={2.5} />
            </div>
            <div>
              <p className="font-display font-extrabold text-[22px] text-charbon">
                {savedCount} élément{savedCount > 1 ? 's' : ''} enregistré{savedCount > 1 ? 's' : ''}
              </p>
              <p className="text-[14px] text-g500 mt-2 leading-relaxed max-w-[260px] mx-auto">
                Vos tâches et clients sont dans votre agenda et votre carnet.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              <Btn onClick={() => go('agenda')} iconRight="arrow" className="w-full">
                Voir l'agenda
              </Btn>
              <button onClick={() => go('carnet')}
                className="flex items-center justify-center gap-2 py-3 text-[14px] font-bold text-orange">
                <Icon name="users" size={16} /> Voir le carnet
              </button>
              <button onClick={reset}
                className="text-center text-[13px] text-g400 font-semibold py-1">
                Nouvelle décharge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
