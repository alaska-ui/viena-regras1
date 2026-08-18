const state={site:null,data:null};
const $=id=>document.getElementById(id);
async function load(){
  const [s,r]=await Promise.all([fetch("content/site.json").then(x=>x.json()),fetch("content/rules.json").then(x=>x.json())]);
  state.site=s; state.data=r; applySite(); renderNav(); renderHome(); route(location.hash.replace("#","")||"inicio");
}
function applySite(){
  const s=state.site, t=s.theme||{};
  for(const [k,v] of Object.entries(t)) document.documentElement.style.setProperty("--"+(k==="accent_light"?"accent2":k),v);
  $(\"headerLogo\").src=s.logo||\"logo-viena.png\"; $("headerLogo").alt=s.site_name;
  $(\"favicon\").href=s.favicon||s.logo||\"logo-viena.png\";
  $("brandTitle").textContent=s.site_title||"CÓDIGO DA RUA"; $("brandSite").textContent=(s.site_name||"VIENA ROLEPLAY").toUpperCase();
  $("heroEyebrow").textContent=s.hero_eyebrow||""; $("heroTitle").textContent=s.hero_title||"";
  $("heroText").textContent=s.hero_text||""; $("noticeTitle").textContent=s.notice_title||""; $("noticeText").textContent=s.notice_text||"";
  $("footerText").textContent=s.footer_text||"";
  $(\"discordBtn\").href=s.discord_url||\"#\";
$(\"discordBtn\").target=\"_blank\";
$(\"discordBtn\").rel=\"noopener noreferrer\";
  $("notice").style.display=s.layout?.show_notice===false?"none":"flex";
  $("updatesWrap").style.display=s.layout?.show_updates===false?"none":"block";
  $("searchOpen").style.display=s.layout?.show_search===false?"none":"block";
  if(s.hero_image && s.layout?.show_hero_image!==false){$("heroImage").src=s.hero_image;$("heroArt").style.display="flex"}else $("heroArt").style.display="none";
}
function renderNav(){
  $("nav").innerHTML=state.data.categories.map(c=>`<button data-route="${c.id}"><span>${c.code}</span>${c.short}</button>`).join("");
}
function renderHome(){
  $("homeCategories").innerHTML=state.data.categories.map(c=>`<article class="cat-card" data-route="${c.id}"><div class="num">${c.code} / VIENA</div>${c.image?`<img class="card-image" src="${c.image}" alt="">`:``}<h3>${c.short}</h3><p>${c.desc}</p></article>`).join("");
  $("updatesList").innerHTML=(state.data.updates||[]).map(x=>`<div class="update"><time>${x.date}</time><strong>${x.title} — ${x.text}</strong><span>${x.tag}</span></div>`).join("");
}
function allRules(){return state.data.categories.flatMap(c=>c.rules.map(r=>({cat:c,...r})))}
function renderCategory(id){
  const c=state.data.categories.find(x=>x.id===id); if(!c)return;
  $("catCode").textContent=`CÓDIGO ${c.code}`; $("catTitle").textContent=c.name; $("catDesc").textContent=c.desc;
  $("catImage").hidden=!c.image; if(c.image)$("catImage").src=c.image;
  $("ruleList").innerHTML=c.rules.map((r,i)=>`<article class="rule" id="rule-${i}"><div class="rule-top"><div class="rule-num">${r.code}</div><div><h3>${r.title}</h3><p>${r.text}</p><span class="tag">${r.tag}</span>${r.image?`<br><img class="rule-image" src="${r.image}" alt="">`:``}</div></div></article>`).join("");
  $("ruleToc").innerHTML=`<strong>NESTA CATEGORIA</strong>`+c.rules.map((r,i)=>`<button onclick="document.getElementById('rule-${i}').scrollIntoView({behavior:'smooth',block:'center'})">${r.code} — ${r.title}</button>`).join("");
}
function search(q,target){
  q=q.trim().toLowerCase(); if(!q){target.innerHTML="";return}
  const res=allRules().filter(r=>`${r.cat.short} ${r.cat.name} ${r.code} ${r.title} ${r.text} ${r.tag}`.toLowerCase().includes(q)).slice(0,30);
  target.innerHTML=res.length?res.map(r=>`<div class="result" data-route="${r.cat.id}"><small>${r.cat.short} · ${r.code}</small><h3>${r.title}</h3><p>${r.text}</p></div>`).join(""):`<div class="result"><h3>Nenhuma regra encontrada.</h3><p>Tente outra palavra.</p></div>`;
}
function route(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  if(id==="inicio")$("inicio").classList.add("active");
  else if(id==="pesquisa"){$("searchPage").classList.add("active");$("searchInput").focus()}
  else{$("categoryPage").classList.add("active");renderCategory(id)}
  document.querySelectorAll(".sidebar nav button").forEach(b=>b.classList.toggle("active",b.dataset.route===id));
  $("sidebar").classList.remove("open"); window.scrollTo(0,0);
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-route]");if(t){e.preventDefault();route(t.dataset.route);history.replaceState(null,"","#"+t.dataset.route)}});
$("searchOpen").onclick=()=>{$("searchOverlay").classList.add("open");$("overlaySearch").focus()};
$("searchClose").onclick=()=>$("searchOverlay").classList.remove("open");
$("overlaySearch").oninput=e=>search(e.target.value,$("overlayResults"));
$("searchInput").oninput=e=>search(e.target.value,$("searchResults"));
$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");
window.addEventListener("hashchange",()=>route(location.hash.replace("#","")||"inicio"));
load().catch(err=>{console.error(err);document.body.insertAdjacentHTML("beforeend","<div style='position:fixed;bottom:0;left:0;right:0;background:#e50914;color:#fff;padding:12px;text-align:center'>Não foi possível carregar o conteúdo. Verifique se content/site.json e content/rules.json foram enviados.</div>")});
