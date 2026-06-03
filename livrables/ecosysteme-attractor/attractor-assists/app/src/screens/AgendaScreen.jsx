import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Btn, Spinner } from '../components/ui';

const PRIORITE_STYLE = {
  urgente: { dot: 'bg-[#E53935]', label: 'Urgente', text: 'text-[#E53935]', hex: '#E53935' },
  normale: { dot: 'bg-orange',    label: 'Normale',  text: 'text-orange',    hex: '#F25C05' },
  basse:   { dot: 'bg-g400',      label: 'Basse',    text: 'text-g400',      hex: '#9A938B' },
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_LONG = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

// ─── TodoItem (inchangé) ──────────────────────────────────────────────────────

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

// ─── Formulaire ajout tâche ───────────────────────────────────────────────────

function AddForm({ defaultDate, onAdd, onClose }) {
  const [titre,    setTitre]    = useState('');
  const [priorite, setPriorite] = useState('normale');
  const [date,     setDate]     = useState(defaultDate || '');
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

        <input type="text" placeholder="Ce qu'il faut faire..." value={titre}
          onChange={e => setTitre(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[15px] font-medium text-charbon outline-none focus:border-orange transition mb-3" />

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

        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-3" />

        <textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="w-full border-2 border-g200 rounded-[14px] px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition mb-4 resize-none" />

        <Btn onClick={submit} className={`w-full ${(!titre.trim() || saving) ? 'opacity-40 pointer-events-none' : ''}`} iconRight="arrow">
          {saving ? 'Ajout en cours…' : 'Ajouter'}
        </Btn>
      </div>
    </div>
  );
}

// ─── Grille Calendrier ────────────────────────────────────────────────────────

function CalendarGrid({ year, month, todos, selectedDay, onSelectDay }) {
  const today = new Date().toISOString().slice(0, 10);

  // Construire la grille : lundi en premier
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    // Décalage : lundi=0, mardi=1... (JS: 0=dim, 1=lun...)
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const grid = [];
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, 1 - (startOffset - i));
      grid.push({ date: d.toISOString().slice(0, 10), inMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d).toISOString().slice(0, 10);
      grid.push({ date, inMonth: true });
    }
    // Compléter jusqu'à 42 cellules
    while (grid.length < 42) {
      const last = new Date(grid[grid.length - 1].date);
      last.setDate(last.getDate() + 1);
      grid.push({ date: last.toISOString().slice(0, 10), inMonth: false });
    }
    return grid;
  }, [year, month]);

  // Index des tâches par date
  const todosByDate = useMemo(() => {
    const idx = {};
    todos.forEach(t => {
      if (t.date_echeance && t.statut !== 'done') {
        if (!idx[t.date_echeance]) idx[t.date_echeance] = [];
        idx[t.date_echeance].push(t);
      }
    });
    return idx;
  }, [todos]);

  return (
    <div className="bg-white rounded-[20px] border border-g200 overflow-hidden shadow-soft">
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-g200">
        {JOURS.map(j => (
          <div key={j} className="py-2 text-center text-[11px] font-extrabold text-g400 uppercase tracking-wide">
            {j}
          </div>
        ))}
      </div>

      {/* Cellules */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const dayTodos = todosByDate[cell.date] || [];
          const isToday    = cell.date === today;
          const isSelected = cell.date === selectedDay;
          const hasDot     = dayTodos.length > 0;

          // Points : max 3, par priorité
          const dots = [];
          const priorities = ['urgente', 'normale', 'basse'];
          priorities.forEach(p => {
            if (dots.length < 3 && dayTodos.some(t => t.priorite === p)) {
              dots.push(PRIORITE_STYLE[p].hex);
            }
          });

          return (
            <button
              key={i}
              onClick={() => cell.inMonth && onSelectDay(cell.date)}
              className={`relative flex flex-col items-center py-2 min-h-[46px] transition-all active:scale-95 ${
                !cell.inMonth ? 'opacity-30 pointer-events-none' : ''
              } ${isSelected ? 'bg-orange/10' : isToday ? 'bg-orange/5' : ''}`}
            >
              <span className={`text-[13px] font-bold leading-tight rounded-full w-7 h-7 flex items-center justify-center ${
                isSelected
                  ? 'bg-orange text-white'
                  : isToday
                    ? 'text-orange font-extrabold'
                    : 'text-charbon'
              }`}>
                {new Date(cell.date + 'T00:00:00').getDate()}
              </span>
              {hasDot && (
                <div className="flex gap-[3px] mt-0.5">
                  {dots.map((color, di) => (
                    <span key={di} className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sheet tâches du jour ─────────────────────────────────────────────────────

function DaySheet({ date, todos, onToggle, onDelete, onAdd, onClose }) {
  const [addingHere, setAddingHere] = useState(false);
  const dayTodos = todos.filter(t => t.date_echeance === date);
  const d = new Date(date + 'T00:00:00');
  const label = `${JOURS_LONG[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${MOIS_FR[d.getMonth()]}`;

  return (
    <div className="fixed inset-0 bg-charbon/40 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-[28px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-g200 rounded-full mx-auto mt-4 mb-1 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-g200 flex-shrink-0">
          <div>
            <p className="font-display font-extrabold text-[17px] text-charbon">{label}</p>
            <p className="text-[12px] text-g400">{dayTodos.length} tâche{dayTodos.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setAddingHere(true)}
            className="w-9 h-9 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_4px_12px_-3px_rgba(242,92,5,.5)] active:scale-95 transition"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-2">
          {dayTodos.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="font-display font-bold text-[15px] text-charbon">Rien de prévu.</p>
              <p className="text-[13px] text-g400 mt-1">Profites-en, ou ajoute quelque chose.</p>
            </div>
          ) : (
            dayTodos.map(t => <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />)
          )}
        </div>
      </div>
      {addingHere && (
        <AddForm defaultDate={date} onAdd={onAdd} onClose={() => setAddingHere(false)} />
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function AgendaScreen({ go, profile }) {
  const now    = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [filter,  setFilter]  = useState('todo');
  const [selectedDay, setSelectedDay] = useState(null);

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('todos')
        .select('*').eq('user_id', user.id)
        .order('date_echeance', { ascending: true, nullsFirst: false });
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

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const today    = new Date().toISOString().slice(0, 10);
  const visible  = todos.filter(t => filter === 'done' ? t.statut === 'done' : t.statut !== 'done');
  const urgentes = visible.filter(t => t.priorite === 'urgente');
  const today_   = visible.filter(t => t.priorite !== 'urgente' && t.date_echeance === today);
  const reste    = visible.filter(t => t.priorite !== 'urgente' && t.date_echeance !== today);
  const doneCount = todos.filter(t => t.statut === 'done').length;

  return (
    <div className="min-h-screen bg-sable pb-24">
      {/* Header */}
      <div className="bg-white border-b border-g200 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => go('dashboard')} className="w-9 h-9 rounded-full hover:bg-sable flex items-center justify-center">
            <Icon name="back" size={20} className="text-charbon" />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-extrabold text-[20px] text-charbon leading-tight">Agenda</h1>
            <p className="text-[12px] text-g400 font-medium">
              {todos.filter(t => t.statut !== 'done').length} tâche{todos.filter(t=>t.statut!=='done').length!==1?'s':''} en cours
            </p>
          </div>
          <button onClick={() => setAdding(true)}
            className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(242,92,5,.5)] active:scale-95 transition">
            <Icon name="plus" size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* Navigation mois */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-white border border-g200 shadow-soft flex items-center justify-center active:scale-95 transition">
            <Icon name="chevron" size={16} className="text-charbon rotate-180" />
          </button>
          <p className="font-display font-extrabold text-[16px] text-charbon">
            {MOIS_FR[month]} {year}
          </p>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-white border border-g200 shadow-soft flex items-center justify-center active:scale-95 transition">
            <Icon name="chevron" size={16} className="text-charbon" />
          </button>
        </div>

        {/* Grille calendrier */}
        {loading ? (
          <div className="flex justify-center py-8"><Spinner className="w-8 h-8" /></div>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            todos={todos}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        )}

        {/* Légende points */}
        <div className="flex items-center gap-4 px-1">
          {Object.values(PRIORITE_STYLE).map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${p.dot}`} />
              <span className="text-[11px] text-g400 font-medium">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Filtre liste */}
        <div className="flex gap-2">
          {[['todo','En cours'],['done','Terminées']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition ${
                filter === val ? 'bg-charbon text-white' : 'bg-white border border-g200 text-g700'
              }`}>
              {label} {val === 'done' && doneCount > 0 ? `(${doneCount})` : ''}
            </button>
          ))}
        </div>

        {/* Liste groupée */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mb-4">
              <Icon name="check" size={28} className="text-orange" />
            </div>
            <p className="font-display font-bold text-[16px] text-charbon">
              {filter === 'done' ? "Rien de terminé pour l'instant" : 'Tout est clair'}
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

      {selectedDay && (
        <DaySheet
          date={selectedDay}
          todos={todos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
