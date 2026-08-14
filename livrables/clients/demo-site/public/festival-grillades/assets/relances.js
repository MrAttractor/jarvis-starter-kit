/* =====================================================================
   Festival des Grillades de Paris 2026
   Carnet de contacts et relances, partagé par la boussole et le board.

   Ce module n'envoie rien tout seul. Il rédige, puis ouvre WhatsApp ou
   la boîte de messagerie de la personne qui relance, avec son identité.
   Une relance qui part d'un automate se repère et se range ; une relance
   qui part du téléphone d'Arnaud se lit.
   ===================================================================== */
(function(global){
"use strict";

var CFG=null, CARNET={contacts:[],relances:[]}, CTX=null, CANAL="whatsapp";

var esc=function(s){return (s==null?"":String(s)).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
var $=function(s){return document.querySelector(s);};

/* ---------- STYLE ---------- */
var CSS=''
+'.rl-voile{position:fixed;inset:0;background:rgba(26,26,24,.55);display:flex;'
+'align-items:flex-end;justify-content:center;z-index:200}'
+'@media(min-width:640px){.rl-voile{align-items:center;padding:20px}}'
+'.rl-p{background:#fff;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;'
+'border-radius:14px 14px 0 0;padding:20px}'
+'@media(min-width:640px){.rl-p{border-radius:14px}}'
+'.rl-p h3{font-size:17px;font-weight:700;margin-bottom:4px}'
+'.rl-p .rl-sous{font-size:13.5px;color:#4A4A46;margin-bottom:16px;line-height:1.5}'
+'.rl-l{display:block;font-size:12px;font-weight:600;color:#4A4A46;margin:0 0 5px}'
+'.rl-p select,.rl-p input,.rl-p textarea{width:100%;border:1px solid #D2CFC8;border-radius:8px;'
+'background:#fff;font:inherit;margin-bottom:12px;padding:10px 12px;min-height:44px}'
+'.rl-p textarea{min-height:190px;line-height:1.55;resize:vertical}'
+'.rl-can{display:flex;gap:8px;margin-bottom:12px}'
+'.rl-can button{flex:1;min-height:44px;border:1px solid #D2CFC8;background:#fff;border-radius:8px;'
+'font-weight:600;font-size:14px;cursor:pointer;color:#3D3D39}'
+'.rl-can button.on{background:#2F4858;border-color:#2F4858;color:#fff}'
+'.rl-can button:disabled{opacity:.4;cursor:not-allowed}'
+'.rl-act{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}'
+'.rl-b{flex:1 1 100%;min-height:48px;border:0;border-radius:8px;background:#2F4858;color:#fff;'
+'font-weight:600;font-size:15px;cursor:pointer}'
+'.rl-b.sec{background:#fff;color:#2F4858;border:1px solid #D2CFC8;flex:1 1 auto}'
+'.rl-b:disabled{opacity:.5;cursor:not-allowed}'
+'.rl-note{font-size:12.5px;color:#84837C;margin-top:12px;line-height:1.5}'
+'.rl-c{border:1px solid #E5E3DE;border-radius:10px;overflow:hidden;margin-bottom:14px}'
+'.rl-c-t{background:#EAF0F3;color:#2F4858;font-weight:700;font-size:12px;letter-spacing:.08em;'
+'text-transform:uppercase;padding:9px 13px}'
+'.rl-c-l{padding:11px 13px;border-top:1px solid #E5E3DE}'
+'.rl-c-l:first-of-type{border-top:0}'
+'.rl-c-n{font-size:14.5px;font-weight:600}'
+'.rl-c-f{font-size:12.5px;color:#84837C}'
+'.rl-c-co{font-size:12.5px;color:#3D3D39;margin-top:3px;word-break:break-word}'
+'.rl-c-m{font-size:12.5px;color:#8A6D2F;margin-top:3px}'
+'.rl-c-a{display:flex;gap:8px;margin-top:8px}'
+'.rl-c-a button{min-height:38px;padding:0 12px;border:1px solid #D2CFC8;background:#fff;'
+'border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;color:#2F4858}'
+'.rl-x{position:sticky;top:0;background:#fff;padding-bottom:10px;display:flex;'
+'justify-content:space-between;align-items:center;gap:12px}'
+'.rl-x button{border:0;background:none;font-size:26px;line-height:1;color:#84837C;'
+'cursor:pointer;min-width:44px;min-height:44px}'
+'@media print{.rl-voile{display:none!important}}';

function style(){
  if(document.getElementById("rl-css"))return;
  var s=document.createElement("style"); s.id="rl-css"; s.textContent=CSS;
  document.head.appendChild(s);
}

/* ---------- OUTILS ---------- */
function prenom(nom){ return (nom||"").trim().split(/\s+/)[0]||""; }
function jours(){
  var e=new Date("2026-10-11T12:00:00"), d=Math.ceil((e-new Date())/86400000);
  return d>0?d:0;
}
function dateFR(d){
  if(!d)return""; var x=new Date(d+"T12:00:00"); if(isNaN(x))return"";
  return x.toLocaleDateString("fr-FR",{day:"numeric",month:"long"});
}
function appel(fn,args){
  args=args||{}; args.p_jeton=CFG.jeton;
  return CFG.sb.rpc(fn,args).then(function(r){
    if(r.error)throw r.error;
    CARNET=r.data; return r.data;
  });
}

/* ---------- MODÈLES ----------
   Écrits pour être lus par une personne pressée : ce qui est demandé en
   premier, la raison ensuite, et jamais de reproche. Aucun emoji, aucune
   mise en forme : ce sont des messages, pas des documents. */
function modele(ctx,contact,canal){
  var p=prenom(contact&&contact.nom)||"", j=jours();
  var moi=CFG.moi()||{}, sign=moi.nom||"";
  var court=(canal==="whatsapp");
  var t=[];

  if(p)t.push("Bonjour "+p+",");
  else t.push("Bonjour,");
  t.push("");

  if(ctx.type==="info"){
    t.push("Il nous manque encore une information pour le Festival des Grillades de Paris : "
           +ctx.libelle.charAt(0).toLowerCase()+ctx.libelle.slice(1)+".");
    if(!court&&ctx.detail)t.push("");
    if(!court&&ctx.detail)t.push(ctx.detail);
    t.push("");
    t.push("Peux-tu me dire quand tu peux nous l'envoyer ? C'est ce qui nous bloque pour avancer.");
  }else if(ctx.type==="tache"){
    t.push(ctx.libelle+" : où en est-on ?");
    if(ctx.echeance)t.push("C'était prévu pour le "+dateFR(ctx.echeance)+".");
    if(!court&&ctx.detail){ t.push(""); t.push(ctx.detail); }
    t.push("");
    t.push("Si quelque chose bloque, dis-le moi, on ajuste ensemble.");
  }else if(ctx.type==="jalon"){
    t.push("Point sur une échéance du Festival : "+ctx.libelle+".");
    if(ctx.echeance)t.push("Date visée : le "+dateFR(ctx.echeance)+".");
    t.push("");
    t.push("Peux-tu me confirmer où on en est ?");
  }else{
    t.push("Point sur le Festival des Grillades de Paris.");
    t.push("");
  }

  t.push("");
  t.push("Il reste "+j+" jours avant l'événement du 11 octobre.");
  if(sign){ t.push(""); t.push(sign); }
  return t.join("\n");
}

function sujet(ctx){
  if(ctx.type==="info") return "Festival des Grillades Paris : "+ctx.libelle;
  if(ctx.type==="tache")return "Festival des Grillades Paris : "+ctx.libelle;
  if(ctx.type==="jalon")return "Festival des Grillades Paris : "+ctx.libelle;
  return "Festival des Grillades de Paris";
}

/* ---------- PANNEAU DE RELANCE ---------- */
function fermer(){ var v=$("#rl-voile"); if(v)v.remove(); }

function ouvrir(ctx){
  style(); CTX=ctx||{type:"libre",libelle:""};
  charger().then(function(){ dessiner(); });
}

function charger(){
  return CARNET.contacts.length?Promise.resolve(CARNET)
    :appel("fgp_carnet").catch(function(e){
       alert("Carnet indisponible : "+(e.message||e)); return CARNET; });
}

function candidats(){
  var c=CARNET.contacts.slice();
  if(CTX&&CTX.porteur){
    var p=CTX.porteur;
    c.sort(function(a,b){
      var A=(a.structure===p)?0:1, B=(b.structure===p)?0:1;
      return A-B || a.nom.localeCompare(b.nom);
    });
  }
  return c;
}

function dessiner(){
  fermer();
  var liste=candidats();
  var opts=liste.map(function(c){
    var d=[]; if(c.whatsapp)d.push("WhatsApp"); if(c.email)d.push("email");
    return '<option value="'+c.id+'">'+esc(c.nom)+" · "+esc(c.structure)
      +(d.length?" ("+d.join(", ")+")":" (aucune coordonnée)")+"</option>";
  }).join("");

  var v=document.createElement("div");
  v.className="rl-voile"; v.id="rl-voile";
  v.innerHTML='<div class="rl-p" role="dialog" aria-label="Relancer">'
   +'<div class="rl-x"><h3>Relancer</h3><button id="rl-f" aria-label="Fermer">&times;</button></div>'
   +'<div class="rl-sous">'+esc(CTX.libelle||"Message libre")
   +(CTX.porteur?" · "+esc(CTX.porteur):"")+'</div>'
   +'<label class="rl-l" for="rl-dest">Destinataire</label>'
   +'<select id="rl-dest">'+opts+'</select>'
   +'<label class="rl-l">Canal</label>'
   +'<div class="rl-can"><button data-c="whatsapp" id="rl-wa">WhatsApp</button>'
   +'<button data-c="email" id="rl-em">Courrier électronique</button></div>'
   +'<label class="rl-l" for="rl-txt">Message, modifiable</label>'
   +'<textarea id="rl-txt"></textarea>'
   +'<div class="rl-act"><button class="rl-b" id="rl-go">Ouvrir</button>'
   +'<button class="rl-b sec" id="rl-cp">Copier le texte</button>'
   +'<button class="rl-b sec" id="rl-ca">Carnet de contacts</button></div>'
   +'<div class="rl-note" id="rl-note"></div></div>';
  document.body.appendChild(v);

  v.addEventListener("click",function(e){ if(e.target===v)fermer(); });
  $("#rl-f").onclick=fermer;
  $("#rl-dest").onchange=majCanal;
  $("#rl-wa").onclick=function(){ CANAL="whatsapp"; majCanal(); };
  $("#rl-em").onclick=function(){ CANAL="email"; majCanal(); };
  $("#rl-cp").onclick=copier;
  $("#rl-ca").onclick=function(){ carnet(); };
  $("#rl-go").onclick=envoyer;
  majCanal();
}

function contactChoisi(){
  var id=$("#rl-dest")?$("#rl-dest").value:null;
  return CARNET.contacts.filter(function(c){return c.id===id;})[0]||null;
}

function majCanal(){
  var c=contactChoisi(), wa=$("#rl-wa"), em=$("#rl-em");
  wa.disabled=!(c&&c.whatsapp); em.disabled=!(c&&c.email);
  if(CANAL==="whatsapp"&&wa.disabled&&!em.disabled)CANAL="email";
  if(CANAL==="email"&&em.disabled&&!wa.disabled)CANAL="whatsapp";
  wa.classList.toggle("on",CANAL==="whatsapp"&&!wa.disabled);
  em.classList.toggle("on",CANAL==="email"&&!em.disabled);
  $("#rl-txt").value=modele(CTX,c,CANAL);
  var manque=!c||(!c.whatsapp&&!c.email);
  $("#rl-go").disabled=manque;
  $("#rl-note").textContent=manque
    ? "Ce contact n'a ni numéro ni adresse. Ajoutez-les depuis le carnet."
    : "Le message s'ouvre dans votre application, vous l'envoyez vous-même. Rien ne part sans vous.";
}

function copier(){
  var t=$("#rl-txt").value;
  var fin=function(){ var b=$("#rl-cp"); b.textContent="Copié"; setTimeout(function(){b.textContent="Copier le texte";},1800); };
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(t).then(fin,fin);
  else { $("#rl-txt").select(); try{document.execCommand("copy");}catch(e){} fin(); }
}

function envoyer(){
  var c=contactChoisi(); if(!c)return;
  var moi=CFG.moi();
  if(!moi){ CFG.demanderMoi(function(){ envoyer(); }); return; }
  var txt=$("#rl-txt").value, url;

  if(CANAL==="whatsapp"){
    url="https://wa.me/"+c.whatsapp+"?text="+encodeURIComponent(txt);
  }else{
    url="mailto:"+encodeURIComponent(c.email)
       +"?subject="+encodeURIComponent(sujet(CTX))
       +"&body="+encodeURIComponent(txt);
  }
  /* Ouvert avant l'appel réseau : un navigateur mobile bloque une fenêtre
     ouverte après une promesse, elle ne serait plus liée au clic. */
  var w=window.open(url,"_blank");
  if(!w)location.href=url;

  appel("fgp_relance_tracer",{
    p_contact:c.id, p_destinataire:c.nom, p_canal:CANAL,
    p_sujet:CTX.libelle||sujet(CTX),
    p_objet_type:CTX.type||"libre", p_objet_ref:CTX.ref||null,
    p_auteur:moi.nom
  }).catch(function(){ /* la trace n'est pas plus importante que le message */ });

  fermer();
}

/* ---------- CARNET ---------- */
function carnet(){
  style();
  charger().then(function(){ dessinerCarnet(); });
}

function dessinerCarnet(){
  fermer();
  var parStruct={};
  CARNET.contacts.forEach(function(c){
    (parStruct[c.structure]=parStruct[c.structure]||[]).push(c); });

  var corps=Object.keys(parStruct).sort().map(function(s){
    return '<div class="rl-c"><div class="rl-c-t">'+esc(s)+'</div>'
      +parStruct[s].map(function(c){
        var co=[];
        if(c.whatsapp)co.push("WhatsApp +"+esc(c.whatsapp));
        if(c.email)co.push(esc(c.email));
        return '<div class="rl-c-l"><div class="rl-c-n">'+esc(c.nom)+'</div>'
          +(c.fonction?'<div class="rl-c-f">'+esc(c.fonction)+'</div>':'')
          +(co.length?'<div class="rl-c-co">'+co.join(" · ")+'</div>'
                     :'<div class="rl-c-m">Ni numéro ni adresse</div>')
          +'<div class="rl-c-a"><button data-mod="'+c.id+'">Modifier</button>'
          +'<button data-sup="'+c.id+'">Retirer</button></div></div>';
      }).join("")+'</div>';
  }).join("");

  var v=document.createElement("div");
  v.className="rl-voile"; v.id="rl-voile";
  v.innerHTML='<div class="rl-p" role="dialog" aria-label="Carnet de contacts">'
   +'<div class="rl-x"><h3>Carnet de contacts</h3><button id="rl-f" aria-label="Fermer">&times;</button></div>'
   +'<div class="rl-sous">Les numéros s\'écrivent avec l\'indicatif du pays et sans le signe plus. '
   +'Exemple pour la Côte d\'Ivoire : 2250700000000.</div>'
   +corps
   +'<div class="rl-act"><button class="rl-b" id="rl-add">Ajouter un contact</button></div></div>';
  document.body.appendChild(v);

  v.addEventListener("click",function(e){ if(e.target===v)fermer(); });
  $("#rl-f").onclick=fermer;
  $("#rl-add").onclick=function(){ fiche(null); };
  v.querySelectorAll("[data-mod]").forEach(function(b){
    b.onclick=function(){ fiche(b.getAttribute("data-mod")); }; });
  v.querySelectorAll("[data-sup]").forEach(function(b){
    b.onclick=function(){ retirer(b.getAttribute("data-sup")); }; });
}

function fiche(id){
  var c=id?CARNET.contacts.filter(function(x){return x.id===id;})[0]:null;
  fermer();
  var v=document.createElement("div");
  v.className="rl-voile"; v.id="rl-voile";
  v.innerHTML='<div class="rl-p" role="dialog">'
   +'<div class="rl-x"><h3>'+(c?"Modifier":"Nouveau contact")+'</h3>'
   +'<button id="rl-f" aria-label="Fermer">&times;</button></div>'
   +'<label class="rl-l" for="f-nom">Nom</label>'
   +'<input id="f-nom" value="'+esc(c?c.nom:"")+'" />'
   +'<label class="rl-l" for="f-str">Structure</label>'
   +'<select id="f-str">'
   +["Advantage Conseils","Thim Production","Mr Attractor","Prestataire","Autre"].map(function(s){
       return '<option'+((c&&c.structure===s)?" selected":"")+'>'+s+'</option>';}).join("")
   +'</select>'
   +'<label class="rl-l" for="f-fon">Fonction</label>'
   +'<input id="f-fon" value="'+esc(c?c.fonction:"")+'" />'
   +'<label class="rl-l" for="f-wa">Numéro WhatsApp, indicatif compris, sans le signe plus</label>'
   +'<input id="f-wa" inputmode="numeric" placeholder="2250700000000" value="'+esc(c?c.whatsapp:"")+'" />'
   +'<label class="rl-l" for="f-em">Adresse électronique</label>'
   +'<input id="f-em" type="email" inputmode="email" value="'+esc(c?c.email:"")+'" />'
   +'<label class="rl-l" for="f-note">Note</label>'
   +'<input id="f-note" value="'+esc(c?c.note:"")+'" />'
   +'<div class="rl-act"><button class="rl-b" id="f-ok">Enregistrer</button>'
   +'<button class="rl-b sec" id="f-non">Annuler</button></div>'
   +'<div class="rl-note" id="f-err"></div></div>';
  document.body.appendChild(v);

  $("#rl-f").onclick=function(){ carnet(); };
  $("#f-non").onclick=function(){ carnet(); };
  $("#f-ok").onclick=function(){
    var moi=CFG.moi();
    if(!moi){ CFG.demanderMoi(function(){ $("#f-ok").click(); }); return; }
    $("#f-ok").disabled=true;
    appel("fgp_contact_maj",{
      p_id:id, p_nom:$("#f-nom").value, p_structure:$("#f-str").value,
      p_fonction:$("#f-fon").value, p_email:$("#f-em").value,
      p_whatsapp:$("#f-wa").value, p_note:$("#f-note").value, p_auteur:moi.nom
    }).then(function(){ carnet(); })
      .catch(function(e){
        $("#f-err").textContent=(e.message||"Enregistrement impossible.");
        $("#f-ok").disabled=false; });
  };
}

function retirer(id){
  var c=CARNET.contacts.filter(function(x){return x.id===id;})[0];
  if(!c)return;
  if(!confirm("Retirer "+c.nom+" du carnet ?"))return;
  var moi=CFG.moi();
  if(!moi){ CFG.demanderMoi(function(){ retirer(id); }); return; }
  appel("fgp_contact_retirer",{p_id:id,p_auteur:moi.nom})
    .then(function(){ carnet(); })
    .catch(function(e){ alert(e.message||"Suppression impossible."); });
}

/* ---------- API ---------- */
global.Relances={
  init:function(cfg){ CFG=cfg; style(); },
  ouvrir:ouvrir,
  carnet:carnet,
  rafraichir:function(){ return appel("fgp_carnet"); }
};

})(window);
