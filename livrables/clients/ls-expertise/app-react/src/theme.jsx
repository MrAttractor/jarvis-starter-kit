// ─── PALETTE ──────────────────────────────────────────────────────────────────
export const C = {
  navy:    "#0E1650",
  blue:    "#1E2FA8",
  gold:    "#F5C518",
  gold2:   "#E6B800",
  dark:    "#080D30",
  card:    "#131C5C",
  card2:   "#1A2275",
  white:   "#FFFFFF",
  off:     "#F4F6FF",
  muted:   "#8892C0",
  light:   "#C0CAFF",
  success: "#22C55E",
  warn:    "#F59E0B",
  danger:  "#EF4444",
  tiktok:  "#FF0050",
  fb:      "#1877F2",
  purple:  "#8B5CF6",
};

// ─── ICÔNES (SVG line-art maison, jamais d'emojis) ────────────────────────────
export const Ic = ({ name, size = 18, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":      return <svg {...p}><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>;
    case "chart":     return <svg {...p}><rect x="4" y="12" width="3.4" height="8" rx="1"/><rect x="10.3" y="7" width="3.4" height="13" rx="1"/><rect x="16.6" y="3" width="3.4" height="17" rx="1"/></svg>;
    case "video":     return <svg {...p}><path d="M3 9l1.5-4h14L20 9"/><rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M7 9l1-3M12 9l1-3M17 9l1-3"/></svg>;
    case "trend":     return <svg {...p}><path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/></svg>;
    case "people":    return <svg {...p}><circle cx="9" cy="8.2" r="3.2"/><path d="M3 20a6 6 0 0112 0"/><circle cx="17.3" cy="9" r="2.4"/><path d="M15.5 13.2a5 5 0 015.5 5"/></svg>;
    case "person":    return <svg {...p}><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/></svg>;
    case "bell":      return <svg {...p}><path d="M12 3a5 5 0 00-5 5v3.5L5 15h14l-2-3.5V8a5 5 0 00-5-5z"/><path d="M9.5 18a2.5 2.5 0 005 0"/></svg>;
    case "clock":     return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>;
    case "clipboard": return <svg {...p}><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/><path d="M9 10h6M9 14h6M9 18h3"/></svg>;
    case "check":     return <svg {...p}><path d="M4 12.5l5.5 5.5L20 6"/></svg>;
    case "x":         return <svg {...p}><path d="M5 5l14 14M19 5L5 19"/></svg>;
    case "warning":   return <svg {...p}><path d="M12 3.5L2.5 20h19z"/><path d="M12 9.5v5"/><circle cx="12" cy="17" r="0.6" fill={color} stroke="none"/></svg>;
    case "flame":     return <svg {...p}><path d="M12 3c3 3 5 6 5 9.5a5 5 0 01-10 0C7 9 9 6 12 3z"/><path d="M12 9c1 1.2 1.6 2.3 1.6 3.5a1.6 1.6 0 01-3.2 0C10.4 11.3 11 10.2 12 9z"/></svg>;
    case "phone":     return <svg {...p}><path d="M6 3h3l1.5 4.5L8 9.5a12 12 0 006.5 6.5l2-2.5L21 15v3a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/></svg>;
    case "pin":       return <svg {...p}><path d="M12 21s-7-6.5-7-11.5a7 7 0 0114 0C19 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>;
    case "doc":       return <svg {...p}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2"/></svg>;
    case "camera":    return <svg {...p}><rect x="3" y="7" width="14" height="11" rx="2"/><path d="M8 7l1.5-2.5h3L14 7"/><circle cx="10" cy="12.5" r="3"/><path d="M17.5 10l3.5-2v9l-3.5-2z"/></svg>;
    case "tie":       return <svg {...p}><circle cx="12" cy="7" r="3.2"/><path d="M6 20a6 6 0 0112 0"/><path d="M12 10.5l-1.3 2 1.3 6 1.3-6z"/></svg>;
    default:          return null;
  }
};
