import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Btn, Spinner } from '../components/ui';

const PRIORITE_STYLE = {
  urgente: { dot: 'bg-[#E53935]', label: 'Urgente', text: 'text-[#E53935]' },
  normale: { dot: 'bg-orange',    label: 'Normale',  text: 'text-orange'    },
  basse:   { dot: 'bg-g400',      label: 'Basse',    text: 'text-g400'      },
};

function TodoItem({ todo, onToggle, onDelete }) {
  const done = todo.statut === 'done';
  const p    = PRIORITE_STYLE[todo.priorite] || PRIORITE_STYLE.normale;

  return (
    <div className={`flex items-start gap-3 p-4 bg-white rounded-[16px] border border-g200 shadow-soft transition-all ${done ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onToggle(todo)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all active:scale-90 ${
          done ? 'bg-growth border-growth' : 'border-g300 hover:border-orange'
        }`}
      >
        {done && <Icon name="check" size={12} stroke={2.8} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[14.5px] font-semibold leading-snug ${done ? 'line-through text-g400' : 'text-charbon'}`}>
          {todo.titre}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`flex items-center gap-1 text-[11.5px] font-bold ${p.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{p.label}
          </span>
          {todo.date_echeance && (
            <span className="text-[11.5px] text-g400 font-medium">
              · {new Date(todo.date_echeance + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        {todo.notes && (
          <p className="text-[12.5px] text-g400 mt-1 leading-snug">{todo.notes}</p>
        )}
      </div>
      <button onClick={() => onDelete(todo.id)} className="text-g300 hover:text-[#E53935] transition p-1 mt-0.5">
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}

function AddForm({ onAdd, onClose }) {
  const [titre,    setTitre]    = useState('');
  const [priorite, setPriorite] = useState('normale');
  const [date,     setDate]     = useState('');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const submit = async () => {
    if (!titre.trim()) return;
    setSaving(true);
    await onAdd({ titre: titre.trim(), priorite, date_echeance: date || null, notes: notes.trim() || null });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charbon/40 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-[24px] p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-g200 rounded-full mx-auto mb-5" />
        <h3 className="font-display font-extrabold text-[18px] text-charbon mb-4">Nouvelle tâche</h3>

        <input
          type="text"
          placeholder="Ce qu'il faut faire..."
          value={titre}
          onChange={e => setTitre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[15px] font-medium text-charbon outline-none focus:border-orange transition mb-3"
        />

        <div className="flex gap-2 mb-3">
          {['urgente','normale','basse'].map(p => (
            <button key={p} onClick={() => setPriorite(p)}
              className={`flex-1 py-2.5 rounded-[12px] text-[12.5px] font-bold capitalize border-2 transition ${
                priorite === p ? 'border-orange bg-orange/8 text-orange' : 'border-g200 text-g400'
              }`}>
              {PRIORITE_STYLE[p].label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-3"
        />

        <textarea
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-4 resize-none"
        />

        <Btn onClick={submit} className={`w-full ${(!titre.trim() || saving) ? 'opacity-40 pointer-events-none' : ''}`} iconRight="arrow">
          {saving ? 'Ajout en cours…' : 'Ajouter'}
        </Btn>
      </div>
    </div>
  );
}

export function AgendaScreen({ go, profile }) {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [filter,  setFilter]  = useState('todo'); // todo | done

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTodos(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async ({ titre, priorite, date_echeance, notes }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('todos').insert({
      user_id: user.id, titre, priorite, date_echeance, notes, statut: 'todo',
    }).select().single();
    if (data) setTodos(t => [data, ...t]);
  };

  const handleToggle = async (todo) => {
    const next = todo.statut === 'done' ? 'todo' : 'done';
    await supabase.from('todos').update({ statut: next }).eq('id', todo.id);
    setTodos(t => t.map(x => x.id === todo.id ? { ...x, statut: next } : x));
  };

  const handleDelete = async (id) => {
    await supabase.from('todos').delete().eq('id', id);
    setTodos(t => t.filter(x => x.id !== id));
  };

  const today    = new Date().toISOString().slice(0, 10);
  const visible  = todos.filter(t => filter === 'done' ? t.statut === 'done' : t.statut !== 'done');
  const urgentes = visible.filter(t => t.priorite === 'urgente');
  const today_   = visible.filter(t => t.priorite !== 'urgente' && t.date_echeance === today);
  const reste    = visible.filter(t => t.priorite !== 'urgente' && t.date_echeance !== today);
  const doneCount = todos.filter(t => t.statut === 'done').length;

  return (
    <div className="min-h-full bg-sable pb-24">
      {/* Header */}
      <div className="bg-white border-b border-g200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => go('dashboard')} className="w-9 h-9 rounded-full hover:bg-sable flex items-center justify-center">
            <Icon name="back" size={20} className="text-charbon" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-extrabold text-[20px] text-charbon leading-tight">Mon agenda</h1>
            <p className="text-[12px] text-g400 font-medium">
              {todos.filter(t => t.statut !== 'done').length} tâche{todos.filter(t=>t.statut!=='done').length!==1?'s':''} en cours
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(242,92,5,.5)] active:scale-95 transition"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>

        {/* Filtre */}
        <div className="flex gap-2">
          {[['todo','En cours'],['done','Terminées']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition ${
                filter === val ? 'bg-charbon text-white' : 'bg-sable text-g700'
              }`}>
              {label} {val === 'done' && doneCount > 0 ? `(${doneCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">
        {loading && (
          <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mb-4">
              <Icon name="check" size={28} className="text-orange" />
            </div>
            <p className="font-display font-bold text-[16px] text-charbon">
              {filter === 'done' ? 'Rien de terminé pour l\'instant' : 'Tout est clair'}
            </p>
            <p className="text-[13px] text-g400 mt-2">
              {filter === 'done' ? 'Les tâches cochées apparaîtront ici' : 'Ajoute ta première tâche avec le + en haut'}
            </p>
          </div>
        )}

        {urgentes.length > 0 && (
          <div>
            <p className="text-[11.5px] font-extrabold text-[#E53935] uppercase tracking-widest mb-2">Urgentes</p>
            <div className="flex flex-col gap-2">
              {urgentes.map(t => <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          </div>
        )}

        {today_.length > 0 && (
          <div>
            <p className="text-[11.5px] font-extrabold text-charbon uppercase tracking-widest mb-2">Aujourd'hui</p>
            <div className="flex flex-col gap-2">
              {today_.map(t => <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          </div>
        )}

        {reste.length > 0 && (
          <div>
            <p className="text-[11.5px] font-extrabold text-g400 uppercase tracking-widest mb-2">
              {filter === 'done' ? 'Terminées' : 'À venir'}
            </p>
            <div className="flex flex-col gap-2">
              {reste.map(t => <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          </div>
        )}
      </div>

      {adding && <AddForm onAdd={handleAdd} onClose={() => setAdding(false)} />}
    </div>
  );
}
