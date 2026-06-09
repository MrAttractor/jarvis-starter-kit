import { useState } from 'react';

export function Icon({ name, className = "", size = 22, stroke = 1.9 }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    bot:  <><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="4" r="1.3"/><path d="M9 13h.01M15 13h.01"/></>,
    user: <><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></>,
    users:<><circle cx="9" cy="7" r="3.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="18" cy="8" r="2.5"/><path d="M22 20c0-2.4-1.8-4-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    flame:<><path d="M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-1-2.5C16 11 17 13 17 15a5 5 0 0 1-10 0c0-4 4-5 5-12Z"/></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    check:<><path d="M5 12.5 10 17l9-10"/></>,
    arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
    chevron:  <><path d="m9 6 6 6-6 6"/></>,
    chevdown: <><path d="m6 9 6 6 6-6"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></>,
    send: <><path d="M4 12 20 4l-6 16-3.5-6.5L4 12Z"/></>,
    mega: <><path d="M4 10v4a1 1 0 0 0 1 1h2l8 5V4L7 9H5a1 1 0 0 0-1 1Z"/><path d="M18 8a4 4 0 0 1 0 8"/></>,
    spark:<><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></>,
    target:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.5"/></>,
    edit: <><path d="M5 19h14"/><path d="M14 5.5 18.5 10 9 19.5 4.5 20l.5-4.5L14 5.5Z"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></>,
    compass:<><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
    trend:<><path d="M4 17l5-5 3 3 7-7"/><path d="M15 8h5v5"/></>,
    chat: <><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1Z"/></>,
    flag: <><path d="M6 21V4M6 4l11 2-2 4 2 4-11 1"/></>,
    coins:<><ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7"/><path d="M10 14.5c.6 1.2 2.6 2 5 2 2.8 0 5-1.1 5-2.5v-5"/></>,
    sun:  <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>,
    moon: <><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/></>,
    back: <><path d="M19 12H5M11 6l-6 6 6 6"/></>,
    close:<><path d="M6 6l12 12M18 6 6 18"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bolt: <><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></>,
    sheet:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/></>,
    heart:<><path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11Z"/></>,
    medal:<><circle cx="12" cy="14" r="5"/><path d="M9 9 7 3h10l-2 6"/><path d="M12 12.5v3M10.6 13.5l1.4-1 1.4 1"/></>,
    refresh:<><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16M4 20v-4h4"/></>,
    warn: <><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></>,
    play:   <><path d="M7 4v16l13-8L7 4Z"/></>,
    mic:    <><path d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 19v3M9 22h6"/></>,
    micoff: <><path d="M2 2l20 20M12 2a4 4 0 0 1 4 4v2M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 7.7 1.6"/><path d="M19 10a7 7 0 0 1-1.2 3.9M12 19v3M9 22h6M5 10a7 7 0 0 0 .5 2.6"/></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></>,
    image:  <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>,
    star:   <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  }[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className}>{paths}</svg>
  );
}

export function Logo({ light = false, size = "md" }) {
  const s = { sm: "text-[17px]", md: "text-[21px]", lg: "text-[26px]" }[size];
  return (
    <div className={`font-display font-extrabold tracking-tight leading-none flex items-center gap-2 ${light ? "text-white" : "text-charbon"} ${s}`}>
      <span className="inline-flex items-center justify-center rounded-[10px] bg-orange text-white"
        style={{ width: "1.55em", height: "1.55em" }}>
        <span className="font-display font-extrabold" style={{ fontSize: "0.9em" }}>A</span>
      </span>
      <span>Attractor<span className="text-orange">.</span></span>
    </div>
  );
}

export function Btn({ variant = "primary", className = "", children, icon, iconRight, ...rest }) {
  const base = "font-display font-bold rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[.98] select-none cursor-pointer";
  const v = {
    primary:   "bg-orange text-white hover:bg-orange-light shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] px-5 py-3.5 text-[15px]",
    secondary: "bg-transparent text-charbon border-[1.5px] border-charbon/85 hover:bg-charbon hover:text-white px-5 py-3.5 text-[15px]",
    tertiary:  "bg-transparent text-orange hover:bg-orange/8 px-3 py-2 text-[14px]",
    ghost:     "bg-white text-charbon border border-g200 hover:border-g400 px-5 py-3.5 text-[15px] shadow-soft",
    dark:      "bg-charbon text-white hover:bg-charbon/90 px-5 py-3.5 text-[15px]",
  }[variant];
  return (
    <button className={`${base} ${v} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}

export function Card({ className = "", children, ...rest }) {
  return <div className={`bg-white rounded-[20px] border border-g200 shadow-soft ${className}`} {...rest}>{children}</div>;
}

export function Pill({ tone = "neutral", className = "", children, icon }) {
  const t = {
    neutral: "bg-charbon/6 text-g700",
    orange:  "bg-orange/12 text-orange",
    growth:  "bg-growth/12 text-growth",
    amber:   "bg-amber/18 text-[#9a6a00]",
    info:    "bg-[#2B6CB0]/12 text-[#2B6CB0]",
    white:   "bg-white/18 text-white border border-white/25",
  }[tone] || "bg-charbon/6 text-g700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${t} ${className}`}>
      {icon && <Icon name={icon} size={13} stroke={2.2} />}{children}
    </span>
  );
}

export function SectionLabel({ children, className = "", action }) {
  return (
    <div className={`flex items-center justify-between px-0.5 ${className}`}>
      <span className="font-display font-bold text-[12px] tracking-[.12em] uppercase text-g400">{children}</span>
      {action}
    </div>
  );
}

export function Progress({ value, tone = "growth", className = "" }) {
  const bg = tone === "growth" ? "linear-gradient(90deg,#2E7D32,#1E5631)" : "linear-gradient(90deg,#FF7A2E,#F25C05)";
  return (
    <div className={`h-2.5 rounded-full bg-g100 overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: bg }} />
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="block font-semibold text-[13.5px] text-charbon mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block text-[12px] text-g400 mt-1.5">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  const { className = "", ...rest } = props;
  return <input {...rest}
    className={`w-full bg-white border-[1.5px] border-g200 rounded-xl px-4 py-3.5 text-[15px] text-charbon placeholder:text-g400 outline-none focus:border-orange focus:ring-4 focus:ring-orange/12 transition ${className}`} />;
}

export function Textarea(props) {
  const { className = "", ...rest } = props;
  return <textarea {...rest}
    className={`w-full bg-white border-[1.5px] border-g200 rounded-xl px-4 py-3.5 text-[15px] text-charbon placeholder:text-g400 outline-none focus:border-orange focus:ring-4 focus:ring-orange/12 transition resize-none ${className}`} />;
}

export function Spinner({ className = "" }) {
  return <div className={`inline-block rounded-full border-[3px] border-orange/25 border-t-orange animate-spin ${className}`} />;
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-g400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export function AssistGlyph({ accent = "orange", icon = "compass", size = 44, locked = false }) {
  const tones = {
    orange:  ["rgba(242,92,5,.13)", "#F25C05"],
    info:    ["rgba(43,108,176,.13)", "#2B6CB0"],
    amber:   ["rgba(255,179,0,.18)", "#9a6a00"],
    growth:  ["rgba(30,86,49,.13)", "#1E5631"],
    charbon: ["rgba(26,23,20,.10)", "#1A1714"],
  }[accent] || ["rgba(242,92,5,.13)", "#F25C05"];
  return (
    <div className="rounded-[13px] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: locked ? "rgba(154,147,139,.14)" : tones[0], color: locked ? "#9A938B" : tones[1] }}>
      <Icon name={icon} size={size * 0.5} />
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState(null);
  const show = (m) => {
    setMsg(m);
    clearTimeout(window.__toast_t);
    window.__toast_t = setTimeout(() => setMsg(null), 2200);
  };
  const node = msg ? (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-28 lg:bottom-10 z-[80] bg-charbon text-white px-4 py-2.5 rounded-xl text-[13.5px] font-semibold shadow-lg flex items-center gap-2 animate-[fadeUp_.2s_ease]">
      <Icon name="check" size={16} stroke={2.4} className="text-[#7ee0a0]" />{msg}
    </div>
  ) : null;
  return [node, show];
}

export function Sheet({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-charbon/50 backdrop-blur-[2px] animate-[fade_.2s_ease]" />
      <div onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-white rounded-t-[26px] lg:rounded-[26px] p-5 pb-7 shadow-2xl animate-[slideUp_.28s_cubic-bezier(.2,.9,.3,1)] max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-[19px]">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-sable flex items-center justify-center text-g700">
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AppHeader({ title, sub, right, onBack }) {
  return (
    <div className="px-[18px] pt-7 pb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-g200 flex items-center justify-center text-charbon shadow-soft -ml-1">
            <Icon name="back" size={20} />
          </button>
        )}
        <div>
          <h1 className="font-display font-extrabold text-[26px] leading-tight tracking-tight text-charbon">{title}</h1>
          {sub && <p className="text-[13.5px] text-g400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
