const state = { site: null, data: null };
const $ = id => document.getElementById(id);

function assetUrl(value) {
  if (!value) return "";
  if (/^(https?:|data:|blob:|#)/i.test(value)) return value;

  // Corrige caminhos /uploads, /logo-viena.png etc. quando o site está
  // hospedado em um GitHub Pages de projeto, por exemplo /viena-regras1/.
  if (value.startsWith("/")) {
    const base = location.pathname.split("/").filter(Boolean)[0];
    if (base && location.hostname.endsWith("github.io")) {
      return `/${base}${value}`;
    }
    return value;
  }

  return value;
}

async function load() {
  const [s, r] = await Promise.all([
    fetch("content/site.json", { cache: "no-store" }).then(x => x.json()),
    fetch("content/rules.json", { cache: "no-store" }).then(x => x.json())
  ]);

  state.site = s;
  state.data = r;

  applySite();
  renderNav();
  renderHome();
  route(location.hash.replace("#", "") || "inicio");
}

function applySite() {
  const s = state.site;
  const t = s.theme || {};

  for (const [k, v] of Object.entries(t)) {
    document.documentElement.style.setProperty(
      "--" + (k === "accent_light" ? "accent2" : k),
      v
    );
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

  if (s.hero_image && s.layout?.show_hero_image !== false) {
    $("heroImage").src = assetUrl(s.hero_image);
    $("heroArt").style.display = "flex";
  } else {
    $("heroArt").style.display = "none";
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
  $("catTitle").textContent = c.name;
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

  if (!q) {
    target.innerHTML = "";
    return;
  }

  const res = allRules()
    .filter(r => `
      ${r.cat.short} ${r.cat.name} ${r.code}
      ${r.title} ${r.text} ${r.tag}
    `.toLowerCase().includes(q))
    .slice(0, 30);

  target.innerHTML = res.length
    ? res.map(r => `
      <div class="result" data-route="${escapeAttr(r.cat.id)}">
        <small>${escapeHtml(r.cat.short)} · ${escapeHtml(r.code)}</small>
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.text)}</p>
      </div>
    `).join("")
    : `
      <div class="result">
        <h3>Nenhuma regra encontrada.</h3>
        <p>Tente outra palavra.</p>
      </div>
    `;
}

function route(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  if (id === "inicio") {
    $("inicio").classList.add("active");
  } else if (id === "pesquisa") {
    $("searchPage").classList.add("active");
    setTimeout(() => $("searchInput").focus(), 0);
  } else if (state.data.categories.some(c => c.id === id)) {
    $("categoryPage").classList.add("active");
    renderCategory(id);
  } else {
    $("inicio").classList.add("active");
    id = "inicio";
  }

  document.querySelectorAll(".sidebar nav button").forEach(b =>
    b.classList.toggle("active", b.dataset.route === id)
  );

  $("sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "instant" });
}

// Navegação: funciona em todas as abas, cards, resultados e botões.
document.addEventListener("click", e => {
  const scrollTarget = e.target.closest("[data-scroll-rule]");
  if (scrollTarget) {
    const el = document.getElementById(scrollTarget.dataset.scrollRule);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const t = e.target.closest("[data-route]");
  if (!t) return;

  e.preventDefault();
  const id = t.dataset.route;
  route(id);
  history.replaceState(null, "", "#" + id);
});

$("searchOpen").onclick = () => {
  $("searchOverlay").classList.add("open");
  $("overlaySearch").focus();
};

$("searchClose").onclick = () => {
  $("searchOverlay").classList.remove("open");
};

$("searchOverlay").addEventListener("click", e => {
  if (e.target === $("searchOverlay")) $("searchOverlay").classList.remove("open");
});

$("overlaySearch").oninput = e => search(e.target.value, $("overlayResults"));
$("searchInput").oninput = e => search(e.target.value, $("searchResults"));

$("mobileMenu").onclick = () => $("sidebar").classList.toggle("open");

window.addEventListener("hashchange", () =>
  route(location.hash.replace("#", "") || "inicio")
);

// Cursor personalizado em todas as áreas da central.
function setupCursor() {
  const cursor = $("customCursor");
  const dot = $("cursorDot");
  if (!cursor || !dot) return;

  if (window.matchMedia("(pointer: coarse)").matches) {
    cursor.remove();
    dot.remove();
    document.documentElement.classList.add("touch-device");
    return;
  }

  let x = -100, y = -100;
  let tx = x, ty = y;

  window.addEventListener("pointermove", e => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  }, { passive: true });

  function animate() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener("pointerover", e => {
    const interactive = e.target.closest("a, button, input, textarea, [data-route], [data-scroll-rule], .cat-card, .result");
    cursor.classList.toggle("hover", !!interactive);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function cssUrl(value) {
  return String(value).replaceAll('\\', "\\\\").replaceAll('"', '\\"').replaceAll("\n", "");
}

setupCursor();

load().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="load-error">
      Não foi possível carregar o conteúdo.<br>
      Verifique se <strong>content/site.json</strong> e <strong>content/rules.json</strong> foram enviados.
    </div>
  `);
});
