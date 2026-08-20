const state = { site: null, data: null };
const $ = id => document.getElementById(id);

/* =========================================================
   ASSETS
   Corrige automaticamente /uploads/... em GitHub Pages de projeto.
   ========================================================= */
function assetUrl(value) {
  if (!value) return "";
  value = String(value).trim();
  if (/^(https?:|data:|blob:|#)/i.test(value)) return value;

  const clean = value.replace(/^\.\//, "");

  if (clean.startsWith("/")) {
    const parts = location.pathname.split("/").filter(Boolean);
    const repo = location.hostname.endsWith("github.io") && parts.length ? parts[0] : "";
    return repo ? `/${repo}${clean}` : clean;
  }

  return clean;
}

function cssUrl(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(value){ return escapeHtml(value); }

async function load() {
  const [s, r] = await Promise.all([
    fetch("content/site.json?v=" + Date.now(), { cache: "no-store" }).then(x => {
      if (!x.ok) throw new Error("site.json não encontrado");
      return x.json();
    }),
    fetch("content/rules.json?v=" + Date.now(), { cache: "no-store" }).then(x => {
      if (!x.ok) throw new Error("rules.json não encontrado");
      return x.json();
    })
  ]);

  state.site = s || {};
  state.data = r || { categories: [], updates: [] };

  applySite();
  renderNav();
  renderHome();
  setupCursor(state.site);
  route(location.hash.replace(/^#/, "") || "inicio");
}

/* =========================================================
   SITE
   A imagem enviada no Admin é usada como FUNDO inteiro do hero.
   ========================================================= */
function applySite() {
  const s = state.site || {};
  const t = s.theme || {};

  for (const [k, v] of Object.entries(t)) {
    const cssName = k === "accent_light" ? "accent2" : k;
    document.documentElement.style.setProperty("--" + cssName, v);
  }

  $("headerLogo").src = assetUrl(s.logo || "logo-viena.png");
  $("headerLogo").alt = s.site_name || "Viena Roleplay";
  $("favicon").href = assetUrl(s.favicon || s.logo || "logo-viena.png");

  $("brandTitle").textContent = s.site_title || "CÓDIGO DA RUA";
  $("brandSite").textContent = (s.site_name || "VIENA ROLEPLAY").toUpperCase();

  $("heroEyebrow").textContent = s.hero_eyebrow || "";
  $("heroTitle").textContent = s.hero_title || "";
  $("heroText").textContent = s.hero_text || "";
  $("noticeTitle").textContent = s.notice_title || "";
  $("noticeText").textContent = s.notice_text || "";
  $("footerText").textContent = s.footer_text || "";

  $("discordBtn").href = s.discord_url || "#";
  $("discordBtn").target = "_blank";
  $("discordBtn").rel = "noopener noreferrer";

  $("notice").style.display = s.layout?.show_notice === false ? "none" : "flex";
  $("updatesWrap").style.display = s.layout?.show_updates === false ? "none" : "block";
  $("searchOpen").style.display = s.layout?.show_search === false ? "none" : "block";

  /* Aceita o formato atual hero_image e também nomes equivalentes. */
  const heroImage = s.hero_image || s.cover_image || s.cover?.image || s.background_image || "";
  const showHero = s.layout?.show_hero_image !== false && heroImage;
  const hero = document.querySelector(".hero");

  if (showHero) {
    const url = assetUrl(heroImage);
    hero.style.setProperty("--hero-image", `url("${cssUrl(url)}")`);
    hero.classList.add("has-image");

    /* Mantém o elemento antigo sem ocupar espaço e testa carregamento. */
    $("heroImage").src = url;
    $("heroImage").onerror = () => {
      console.warn("Imagem do hero não carregou:", url);
    };
  } else {
    hero.style.removeProperty("--hero-image");
    hero.classList.remove("has-image");
    $("heroImage").removeAttribute("src");
  }
}

function renderNav() {
  $("nav").innerHTML = (state.data.categories || [])
    .map(c => `
      <button data-route="${escapeAttr(c.id)}" type="button">
        <span>${escapeHtml(c.code)}</span>${escapeHtml(c.short)}
      </button>
    `)
    .join("");
}

function renderHome() {
  $("homeCategories").innerHTML = (state.data.categories || [])
    .map(c => `
      <article class="cat-card" data-route="${escapeAttr(c.id)}">
        <div class="num">${escapeHtml(c.code)} / VIENA</div>
        ${c.image ? `<div class="card-image-wrap"><img class="card-image" src="${escapeAttr(assetUrl(c.image))}" alt=""></div>` : ""}
        <h3>${escapeHtml(c.short)}</h3>
        <p>${escapeHtml(c.desc)}</p>
      </article>
    `)
    .join("");

  $("updatesList").innerHTML = (state.data.updates || [])
    .map(x => `
      <div class="update">
        <time>${escapeHtml(x.date)}</time>
        <strong>${escapeHtml(x.title)} — ${escapeHtml(x.text)}</strong>
        <span>${escapeHtml(x.tag)}</span>
      </div>
    `)
    .join("");
}

function allRules() {
  return (state.data.categories || []).flatMap(c =>
    (c.rules || []).map(r => ({ cat: c, ...r }))
  );
}

function renderCategory(id) {
  const c = state.data.categories.find(x => x.id === id);
  if (!c) return;

  $("catCode").textContent = `CÓDIGO ${c.code}`;
  $("catTitle").textContent = c.name || "";
  $("catDesc").textContent = c.desc || "";

  const hero = $("categoryHero");
  if (c.image) {
    hero.style.setProperty("--category-image", `url("${cssUrl(assetUrl(c.image))}")`);
    hero.classList.add("has-image");
  } else {
    hero.style.removeProperty("--category-image");
    hero.classList.remove("has-image");
  }

  $("ruleList").innerHTML = (c.rules || [])
    .map((r, i) => `
      <article class="rule" id="rule-${i}">
        <div class="rule-top">
          <div class="rule-num">${escapeHtml(r.code)}</div>
          <div>
            <h3>${escapeHtml(r.title)}</h3>
            <p>${escapeHtml(r.text)}</p>
            <span class="tag">${escapeHtml(r.tag || "REGRA")}</span>
            ${r.image ? `<br><img class="rule-image" src="${escapeAttr(assetUrl(r.image))}" alt="">` : ""}
          </div>
        </div>
      </article>
    `)
    .join("");

  $("ruleToc").innerHTML =
    `<strong>NESTA CATEGORIA</strong>` +
    (c.rules || [])
      .map((r, i) => `
        <button data-scroll-rule="rule-${i}" type="button">
          ${escapeHtml(r.code)} — ${escapeHtml(r.title)}
        </button>
      `)
      .join("");
}

function search(q, target) {
  q = q.trim().toLowerCase();
  if (!q) { target.innerHTML = ""; return; }

  const res = allRules()
    .filter(r => `${r.cat.short} ${r.cat.name} ${r.code} ${r.title} ${r.text} ${r.tag}`.toLowerCase().includes(q))
    .slice(0, 30);

  target.innerHTML = res.length
    ? res.map(r => `
      <div class="result" data-route="${escapeAttr(r.cat.id)}">
        <small>${escapeHtml(r.cat.short)} · ${escapeHtml(r.code)}</small>
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.text)}</p>
      </div>
    `).join("")
    : `<div class="result"><h3>Nenhuma regra encontrada.</h3><p>Tente outra palavra.</p></div>`;
}

function route(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  if (id === "inicio") {
    $("inicio").classList.add("active");
  } else if (id === "pesquisa") {
    $("searchPage").classList.add("active");
    setTimeout(() => $("searchInput")?.focus(), 0);
  } else if ((state.data.categories || []).some(c => c.id === id)) {
    $("categoryPage").classList.add("active");
    renderCategory(id);
  } else {
    id = "inicio";
    $("inicio").classList.add("active");
  }

  document.querySelectorAll(".sidebar nav button").forEach(b =>
    b.classList.toggle("active", b.dataset.route === id)
  );

  $("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

/* Navegação em TODAS as abas/cards/resultados. */
document.addEventListener("click", e => {
  const scrollTarget = e.target.closest("[data-scroll-rule]");
  if (scrollTarget) {
    const el = document.getElementById(scrollTarget.dataset.scrollRule);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const target = e.target.closest("[data-route]");
  if (!target) return;

  e.preventDefault();
  const id = target.dataset.route;
  route(id);
  history.replaceState(null, "", "#" + id);
});

$("searchOpen").onclick = () => {
  $("searchOverlay").classList.add("open");
  $("overlaySearch").focus();
};
$("searchClose").onclick = () => $("searchOverlay").classList.remove("open");
$("searchOverlay").addEventListener("click", e => {
  if (e.target === $("searchOverlay")) $("searchOverlay").classList.remove("open");
});
$("overlaySearch").oninput = e => search(e.target.value, $("overlayResults"));
$("searchInput").oninput = e => search(e.target.value, $("searchResults"));
$("mobileMenu").onclick = () => $("sidebar").classList.toggle("open");
window.addEventListener("hashchange", () => route(location.hash.replace(/^#/, "") || "inicio"));

/* =========================================================
   CURSOR DO ADMIN — LOGO/SPRAY + RASTRO
   Usa site.cursor exatamente como o painel atual grava.
   ========================================================= */
function setupCursor(site) {
  document.getElementById("vienaGlobalCursor")?.remove();
  document.querySelectorAll(".viena-global-trail").forEach(x => x.remove());
  document.getElementById("vienaGlobalCursorStyle")?.remove();
  document.documentElement.classList.remove("viena-cursor-active");

  if (window.matchMedia("(pointer: coarse)").matches) return;

  const config = site?.cursor || {};
  if (config.enabled === false) return;

  const image = assetUrl(
    config.image || config.icon || config.cursor_image || "uploads/SPRAY PNG.png"
  );

  const size = Math.max(12, Math.min(96, Number(config.size || config.icon_size) || 34));
  const trailEnabled = config.trail_enabled !== false && config.trail !== false;
  const trailCount = Math.max(2, Math.min(30, Number(config.trail_count) || 10));
  const trailColor = config.trail_color || "#e50914";

  const style = document.createElement("style");
  style.id = "vienaGlobalCursorStyle";
  style.textContent = `
    html.viena-cursor-active,html.viena-cursor-active *,html.viena-cursor-active a,
    html.viena-cursor-active button,html.viena-cursor-active input,
    html.viena-cursor-active textarea,html.viena-cursor-active select,
    html.viena-cursor-active [role="button"]{cursor:none!important}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add("viena-cursor-active");

  const cursor = document.createElement("div");
  cursor.id = "vienaGlobalCursor";
  cursor.className = "viena-global-cursor";
  cursor.style.cssText = `
    position:fixed;left:0;top:0;width:${size}px;height:${size}px;
    z-index:2147483647;display:none;pointer-events:none;user-select:none;
    transform:translate(-50%,-50%);background-image:url("${cssUrl(image)}");
    background-size:contain;background-repeat:no-repeat;background-position:center;
  `;
  document.body.appendChild(cursor);

  const trail = [];
  if (trailEnabled) {
    for (let i=0;i<trailCount;i++) {
      const dot = document.createElement("span");
      dot.className = "viena-global-trail";
      const dotSize = Math.max(3, 9 - i * .5);
      const opacity = Math.max(.05, .8 - i * .07);
      dot.style.cssText = `
        position:fixed;left:0;top:0;width:${dotSize}px;height:${dotSize}px;
        border-radius:50%;z-index:2147483646;display:none;pointer-events:none;
        background:${trailColor};opacity:${opacity};transform:translate(-50%,-50%);
      `;
      document.body.appendChild(dot);
      trail.push({el:dot,x:-100,y:-100});
    }
  }

  let mouseX=-100,mouseY=-100,currentX=-100,currentY=-100;
  let active=false;

  const move = event => {
    mouseX=event.clientX; mouseY=event.clientY;
    active=true;
    cursor.style.display="block";
    trail.forEach(x=>x.el.style.display="block");
  };
  window.addEventListener("mousemove", move, {passive:true});
  window.addEventListener("mouseleave", () => {
    active=false; cursor.style.display="none"; trail.forEach(x=>x.el.style.display="none");
  });

  function animate(){
    currentX += (mouseX-currentX)*.38;
    currentY += (mouseY-currentY)*.38;
    if(active){cursor.style.left=currentX+"px";cursor.style.top=currentY+"px";}

    let px=currentX,py=currentY;
    trail.forEach(item=>{
      item.x += (px-item.x)*.25;
      item.y += (py-item.y)*.25;
      item.el.style.left=item.x+"px";
      item.el.style.top=item.y+"px";
      px=item.x;py=item.y;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

load().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="load-error">
      Não foi possível carregar o conteúdo.<br>
      Verifique se <strong>content/site.json</strong> e <strong>content/rules.json</strong> foram enviados.
    </div>
  `);
  /* Mesmo que o JSON falhe, não deixa o cursor quebrado. */
  setupCursor({cursor:{enabled:true,image:"uploads/SPRAY PNG.png",size:34,trail_enabled:true,trail_count:10,trail_color:"#e50914"}});
});
