/* Réalisations du studio — source partagée (accueil + page réalisations).
   featured:true = mis en vedette sur la page d'accueil. */
const WORKS = [
  {type:'video', title:"KFC · Avatar IA", file:'assets/video/portfolio/kfc.mp4', poster:'assets/video/portfolio/kfc.jpg', featured:true},
  {type:'video', title:"NASCO · World Cup", file:'assets/video/portfolio/nasco.mp4', poster:'assets/video/portfolio/nasco.jpg', featured:true},
  {type:'video', title:"Oraimo · Spot IA", file:'assets/video/portfolio/oraimo.mp4', poster:'assets/video/portfolio/oraimo.jpg', featured:true},
  {type:'video', title:"Youki Moka · Café", file:'assets/video/portfolio/youki.mp4', poster:'assets/video/portfolio/youki.jpg', featured:true},
  {type:'video', title:"FIFA · World Cup", file:'assets/video/portfolio/fifa.mp4', poster:'assets/video/portfolio/fifa.jpg'},
  {type:'video', title:"SNA · Campagne", file:'assets/video/portfolio/sna.mp4', poster:'assets/video/portfolio/sna.jpg'},
  {type:'video', title:"Réflexe · Spot IA", file:'assets/video/portfolio/reflexe.mp4', poster:'assets/video/portfolio/reflexe.jpg'},
  {type:'video', title:"Didier · Film IA", file:'assets/video/portfolio/didier.mp4', poster:'assets/video/portfolio/didier.jpg'},
  {type:'image', title:"Portrait ultra-réaliste", file:'assets/img/portfolio/p01.jpg', featured:true},
  {type:'image', title:"Beauté IA", file:'assets/img/portfolio/p08.jpg', featured:true},
  {type:'image', title:"Direction artistique", file:'assets/img/portfolio/p02.jpg'},
  {type:'image', title:"Personnalité", file:'assets/img/portfolio/p03.jpg'},
  {type:'image', title:"Portrait éditorial", file:'assets/img/portfolio/p04.jpg'},
  {type:'image', title:"Studio portrait", file:'assets/img/portfolio/p05.jpg'},
  {type:'image', title:"Campagne de marque", file:'assets/img/portfolio/p06.jpg'},
  {type:'image', title:"Portrait iconique", file:'assets/img/portfolio/p07.jpg'},
  {type:'image', title:"Lumière & matière", file:'assets/img/portfolio/p09.jpg'},
  {type:'image', title:"Scène cinématique", file:'assets/img/portfolio/p10.jpg'}
];

/* ---------------------------------------------------------------------------
   Source vivante : le portfolio est piloté par Emmanuel depuis /admin.
   On lit la table publique aic_works via l'API REST de Supabase.
   Si la base ne répond pas (ou est vide), on retombe sur WORKS ci-dessus :
   le site public n'est jamais cassé.
--------------------------------------------------------------------------- */
const WORKS_SUPA_URL  = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const WORKS_SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk';

async function loadWorks(){
  try{
    const url = WORKS_SUPA_URL + '/rest/v1/aic_works?active=eq.true'
      + '&order=featured.desc,sort.asc,created_at.desc'
      + '&select=type,title,media_url,poster_url,featured';
    const r = await fetch(url, { headers:{ apikey: WORKS_SUPA_ANON, Authorization: 'Bearer ' + WORKS_SUPA_ANON } });
    if(!r.ok) throw 0;
    const rows = await r.json();
    if(!Array.isArray(rows) || !rows.length) throw 0;
    return rows.map(w => ({ type:w.type, title:w.title, file:w.media_url, poster:w.poster_url, featured:!!w.featured }));
  }catch(_){ return WORKS; }
}

/* Aides de rendu partagées (accueil + réalisations) --------------------- */
function worksEsc(s){ const p=document.createElement('div'); p.textContent = s==null?'':String(s); return p.innerHTML; }
function worksIsFileVideo(u){ return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(u||''); }
function worksYtId(u){ const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m?m[1]:null; }
function worksVimeoId(u){ const m=String(u||'').match(/vimeo\.com\/(?:video\/)?(\d+)/); return m?m[1]:null; }
function worksPoster(w){
  if(w.poster) return w.poster;
  const y = worksYtId(w.file); if(y) return 'https://img.youtube.com/vi/'+y+'/hqdefault.jpg';
  return w.file;
}
/* true si la vignette est une balise <video> qu'on peut lire au survol */
function worksGridIsPlayable(w){ return w.type==='video' && worksIsFileVideo(w.file); }
function worksGridMedia(w){
  const t = worksEsc(w.title);
  if(worksGridIsPlayable(w))
    return '<video src="'+worksEsc(w.file)+'" poster="'+worksEsc(w.poster||'')+'" muted loop playsinline preload="none"></video>';
  if(w.type==='video')
    return '<img src="'+worksEsc(worksPoster(w))+'" alt="'+t+'" loading="lazy" />';
  return '<img src="'+worksEsc(w.file)+'" alt="'+t+'" loading="lazy" />';
}
function worksLightboxMedia(w){
  const cap = '<div class="lightbox-cap">'+worksEsc(w.title)+'</div>';
  const frame = 'style="width:min(90vw,960px);aspect-ratio:16/9;border:0;border-radius:12px"';
  if(worksGridIsPlayable(w))
    return '<video src="'+worksEsc(w.file)+'" poster="'+worksEsc(w.poster||'')+'" controls autoplay loop playsinline></video>'+cap;
  if(w.type==='video'){
    const y = worksYtId(w.file), vm = worksVimeoId(w.file);
    if(y)  return '<iframe '+frame+' src="https://www.youtube.com/embed/'+y+'?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>'+cap;
    if(vm) return '<iframe '+frame+' src="https://player.vimeo.com/video/'+vm+'?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>'+cap;
    return '<video src="'+worksEsc(w.file)+'" controls autoplay loop playsinline></video>'+cap;
  }
  return '<img src="'+worksEsc(w.file)+'" alt="'+worksEsc(w.title)+'" />'+cap;
}
