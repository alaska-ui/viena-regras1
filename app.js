const state = {
  site: null,
  data: null
};

/* =========================================================
   UTILIDADES
========================================================= */

const $ = id => document.getElementById(id);

function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function escapeAttr(value){
  return escapeHtml(value).replace(/`/g,"&#096;");
}

function assetUrl(path){
  if(!path) return "";
  const value = String(path).trim();

  if(
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ){
    return value;
  }

  /* Sveltia salva /uploads/arquivo.png.
     No GitHub Pages usamos ./uploads/arquivo.png */
  return value.replace(/^\/+/,"./");
}

function slugify(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80);
}

/* Nunca dependa de id preenchido no Admin.
   Se estiver vazio, cria automaticamente. */
function categoryId(category,index){
  return String(
    category?.id ||
    slugify(category?.name || category?.short) ||
    `categoria-${index+1}`
  );
}

function categoryIndexById(id){
  return (state.data?.categories || []).findIndex(
    (category,index) => categoryId(category,index) === String(id)
  );
}

/* =========================================================
   MARKDOWN SIMPLES
   Suporta:
   **negrito**
   *itálico*
   # títulos
   - listas
   1. listas numeradas
   > caixas
========================================================= */

function inlineMarkdown(value){
  let text = escapeHtml(value);

  text = text.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
    '<img src="$2" alt="$1" class="md-inline-image">'
  );

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  text = text.replace(/`([^`]+)`/g,"<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g,"<strong>$1</strong>");
  text = text.replace(
    /(^|[^\*])\*([^*]+)\*(?!\*)/g,
    "$1<em>$2</em>"
  );
  text = text.replace(
    /(^|[^_])_([^_]+)_(?!_)/g,
    "$1<em>$2</em>"
  );

  return text;
}

function renderMarkdown(markdown){
  if(!markdown) return "";

  const lines = String(markdown)
    .replace(/\r\n/g,"\n")
    .split("\n");

  const output = [];
  let inList = false;
  let listType = null;
  let inQuote = false;
  let quoteLines = [];

  function closeList(){
    if(!inList) return;
    output.push(listType === "ol" ? "</ol>" : "</ul>");
    inList = false;
    listType = null;
  }

  function closeQuote(){
    if(!inQuote) return;

    const raw = quoteLines.join("\n").trim();

    let type = "info";
    let icon = "ℹ";
    let title = "OBSERVAÇÃO";

    if(/^(⚠️|⚠|ATENÇÃO|ATENCAO)/i.test(raw)){
      type = "warning";
      icon = "⚠";
      title = "ATENÇÃO";
    }else if(/^(❌|⛔|PROIBIDO|ERRO)/i.test(raw)){
      type = "danger";
      icon = "!";
      title = "PROIBIDO";
    }else if(/^(✅|PERMITIDO|OK)/i.test(raw)){
      type = "success";
      icon = "✓";
      title = "PERMITIDO";
    }

    let content = raw
      .replace(/^(⚠️|⚠|ℹ️|❌|⛔|✅)\s*/u,"")
      .replace(
        /^(ATENÇÃO|ATENCAO|OBSERVAÇÃO|OBSERVACAO|PROIBIDO|PERMITIDO|ERRO|OK)\s*:?\s*/i,
        ""
      )
      .trim();

    const firstLine = content.split("\n")[0] || "";
    const titleMatch = firstLine.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);

    if(titleMatch){
      title = titleMatch[1];
      content = [
        titleMatch[2],
        ...content.split("\n").slice(1)
      ].filter(Boolean).join("\n");
    }

    output.push(`
      <div class="rule-callout ${type}">
        <div class="callout-icon">${icon}</div>
        <div class="callout-content">
          <strong>${escapeHtml(title)}</strong>
          ${content ? `<div>${renderMarkdown(content)}</div>` : ""}
        </div>
      </div>
    `);

    inQuote = false;
    quoteLines = [];
  }

  for(const line of lines){
    const trimmed = line.trim();

    if(trimmed.startsWith(">")){
      closeList();

      if(!inQuote){
        inQuote = true;
        quoteLines = [];
      }

      quoteLines.push(trimmed.replace(/^>\s?/,""));
      continue;
    }

    if(inQuote) closeQuote();

    if(!trimmed){
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);

    if(heading){
      closeList();
      const level = heading[1].length;
      output.push(
        `<h${level+2} class="md-heading">${inlineMarkdown(heading[2])}</h${level+2}>`
      );
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);

    if(unordered){
      if(!inList || listType !== "ul"){
        closeList();
        output.push("<ul>");
        inList = true;
        listType = "ul";
      }

      output.push(`<li>${inlineMarkdown(unordered[1])}</li>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if(ordered){
      if(!inList || listType !== "ol"){
        closeList();
        output.push("<ol>");
        inList = true;
        listType = "ol";
      }

      output.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    closeList();
    output.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if(inQuote) closeQuote();
  closeList();

  return output.join("");
}

/* =========================================================
   CARREGAMENTO
========================================================= */

async function load(){
  const [siteResponse,rulesResponse] = await Promise.all([
    fetch("./content/site.json").then(r => {
      if(!r.ok) throw new Error("content/site.json não encontrado");
      return r.json();
    }),
    fetch("./content/rules.json").then(r => {
      if(!r.ok) throw new Error("content/rules.json não encontrado");
      return r.json();
    })
  ]);

  state.site = siteResponse || {};
  state.data = rulesResponse || {
    categories:[],
    updates:[]
  };

  if(!Array.isArray(state.data.categories)){
    state.data.categories = [];
  }

  if(!Array.isArray(state.data.updates)){
    state.data.updates = [];
  }

  applySite();
  renderNav();
  renderHome();
  setupCursor();
  setupFallingLetters();

  route(location.hash.replace("#","") || "inicio");
}

/* =========================================================
   CONFIGURAÇÕES DO SITE
========================================================= */

function applySite(){
  const s = state.site || {};
  const t = s.theme || {};

  for(const [key,value] of Object.entries(t)){
    if(!value) continue;

    document.documentElement.style.setProperty(
      "--" + (key === "accent_light" ? "accent2" : key),
      value
    );
  }

  const logo = assetUrl(s.logo) || "./logo-viena.png";

  if($("headerLogo")){
    $("headerLogo").src = logo;
    $("headerLogo").alt = s.site_name || "Viena Roleplay";
  }

  if($("favicon")){
    $("favicon").href = assetUrl(s.favicon) || logo;
  }

  if($("brandTitle")){
    $("brandTitle").textContent = s.site_title || "CÓDIGO DA RUA";
  }

  if($("brandSite")){
    $("brandSite").textContent =
      (s.site_name || "VIENA ROLEPLAY").toUpperCase();
  }

  if($("heroEyebrow")){
    $("heroEyebrow").textContent = s.hero_eyebrow || "";
  }

  if($("heroTitle")){
    $("heroTitle").textContent = s.hero_title || "";
  }

  if($("heroText")){
    $("heroText").textContent = s.hero_text || "";
  }

  if($("noticeTitle")){
    $("noticeTitle").textContent = s.notice_title || "";
  }

  if($("noticeText")){
    $("noticeText").textContent = s.notice_text || "";
  }

  if($("footerText")){
    $("footerText").textContent = s.footer_text || "";
  }

  if($("discordBtn")){
    $("discordBtn").href = s.discord_url || "#";
  }

  const layout = s.layout || {};

  if($("notice")){
    $("notice").style.display =
      layout.show_notice === false ? "none" : "flex";
  }

  if($("updatesWrap")){
    $("updatesWrap").style.display =
      layout.show_updates === false ? "none" : "block";
  }

  if($("searchOpen")){
    $("searchOpen").style.display =
      layout.show_search === false ? "none" : "block";
  }

  /* HERO: imagem fica no fundo, nunca em card separado */
  const hero = $("hero");
  const heroImage = assetUrl(s.hero_image);

  if(hero){
    if(heroImage && layout.show_hero_image !== false){
      hero.style.setProperty("--hero-image",`url("${heroImage}")`);
      hero.classList.add("has-image");
    }else{
      hero.style.setProperty("--hero-image","none");
      hero.classList.remove("has-image");
    }
  }
}

/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav(){
  const nav = $("nav");
  if(!nav) return;

  nav.innerHTML = state.data.categories.map((category,index) => {
    const id = categoryId(category,index);
    const code = category.code || String(index+1).padStart(2,"0");
    const short =
      category.short ||
      category.name ||
      `Categoria ${index+1}`;

    return `
      <button
        data-route="${escapeAttr(id)}"
        type="button"
      >
        <span>${escapeHtml(code)}</span>
        ${escapeHtml(short)}
      </button>
    `;
  }).join("");
}

/* =========================================================
   MAPA DA RUA
   A IMAGEM DA CATEGORIA NÃO APARECE AQUI.
========================================================= */

function renderHome(){
  const home = $("homeCategories");

  if(home){
    home.innerHTML = state.data.categories.map((category,index) => {
      const id = categoryId(category,index);
      const code =
        category.code ||
        String(index+1).padStart(2,"0");

      const title =
        category.short ||
        category.name ||
        `Categoria ${index+1}`;

      const description = category.desc || "";

      return `
        <article
          class="cat-card"
          data-route="${escapeAttr(id)}"
          tabindex="0"
          role="button"
        >
          <div class="num">${escapeHtml(code)} / VIENA</div>
          <h3>${escapeHtml(title)}</h3>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        </article>
      `;
    }).join("");

    home.querySelectorAll(".cat-card").forEach(card => {
      card.addEventListener("keydown",event => {
        if(event.key === "Enter" || event.key === " "){
          event.preventDefault();
          card.click();
        }
      });
    });
  }

  const updatesList = $("updatesList");
  if(!updatesList) return;

  updatesList.innerHTML = (state.data.updates || []).map(item => {
    const date = item.date || "";
    const title = item.title || "";
    const text = item.text || "";
    const tag = item.tag || "";

    return `
      <div class="update">
        ${date ? `<time>${escapeHtml(date)}</time>` : "<time></time>"}
        ${
          title || text
            ? `<strong>${escapeHtml(title)}${title && text ? " — " : ""}${escapeHtml(text)}</strong>`
            : "<strong></strong>"
        }
        ${tag ? `<span>${escapeHtml(tag)}</span>` : "<span></span>"}
      </div>
    `;
  }).join("");
}

/* =========================================================
   TODAS AS REGRAS
========================================================= */

function allRules(){
  return state.data.categories.flatMap((category,categoryIndex) => {
    const rules = Array.isArray(category.rules)
      ? category.rules
      : [];

    return rules.map((rule,ruleIndex) => ({
      cat:category,
      catIndex:categoryIndex,
      ruleIndex,
      ...rule
    }));
  });
}

/* =========================================================
   PÁGINA DA CATEGORIA
========================================================= */

function renderCategory(id){
  const categoryIndex = categoryIndexById(id);

  if(categoryIndex < 0) return;

  const category = state.data.categories[categoryIndex];

  if($("catCode")){
    $("catCode").textContent =
      category.code ? `CÓDIGO ${category.code}` : "";
  }

  if($("catTitle")){
    $("catTitle").textContent =
      category.name ||
      category.short ||
      `Categoria ${categoryIndex+1}`;
  }

  if($("catDesc")){
    $("catDesc").textContent = category.desc || "";
  }

  /* Imagem da categoria:
     NÃO vai para o mapa.
     Aqui ela fica como fundo da capa da categoria. */
  const categoryImage = assetUrl(category.image);
  const categoryHero = $("categoryHero");

  if(categoryHero){
    if(categoryImage){
      categoryHero.style.setProperty(
        "--category-image",
        `url("${categoryImage}")`
      );
      categoryHero.classList.add("has-image");
    }else{
      categoryHero.style.setProperty("--category-image","none");
      categoryHero.classList.remove("has-image");
    }
  }

  const rules = Array.isArray(category.rules)
    ? category.rules
    : [];

  const ruleList = $("ruleList");

  if(ruleList){
    if(!rules.length){
      ruleList.innerHTML = `
        <div class="empty-rules">
          <strong>NENHUMA REGRA CADASTRADA</strong>
          <p>Esta categoria ainda não possui regras publicadas.</p>
        </div>
      `;
    }else{
      ruleList.innerHTML = rules.map((rule,index) => {
        const code = rule.code || "";
        const title = rule.title || "";
        const text = rule.text || "";
        const tag = rule.tag || "";
        const image = assetUrl(rule.image);

        return `
          <article class="rule" id="rule-${index}">
            <div class="rule-top">
              <div class="rule-num">${escapeHtml(code)}</div>

              <div class="rule-content">
                ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
                ${text ? `<div class="rule-markdown">${renderMarkdown(text)}</div>` : ""}
                ${tag ? `<span class="tag">${escapeHtml(tag)}</span>` : ""}
                ${
                  image
                    ? `<img class="rule-image"
                              src="${escapeAttr(image)}"
                              alt=""
                              loading="lazy"
                              onerror="this.style.display='none'">`
                    : ""
                }
              </div>
            </div>
          </article>
        `;
      }).join("");
    }
  }

  /* ÍNDICE */
  const ruleToc = $("ruleToc");

  if(ruleToc){
    if(!rules.length){
      ruleToc.innerHTML = "";
    }else{
      ruleToc.innerHTML =
        `<strong>NESTA CATEGORIA</strong>` +
        rules.map((rule,index) => {
          const code = rule.code || "";
          const title = rule.title || "Regra";

          return `
            <button type="button" data-scroll-rule="${index}">
              ${escapeHtml(code)}
              ${code && title ? " — " : ""}
              ${escapeHtml(title)}
            </button>
          `;
        }).join("");

      ruleToc.querySelectorAll("[data-scroll-rule]").forEach(button => {
        button.addEventListener("click",() => {
          const element = document.getElementById(
            `rule-${button.dataset.scrollRule}`
          );

          if(element){
            element.scrollIntoView({
              behavior:"smooth",
              block:"center"
            });
          }
        });
      });
    }
  }

  renderCategoryNavigation(categoryIndex);
}

/* =========================================================
   PRÓXIMA / ANTERIOR
========================================================= */

function renderCategoryNavigation(currentIndex){
  const navigation = $("categoryNavigation");
  if(!navigation) return;

  const total = state.data.categories.length;

  const previousIndex =
    currentIndex > 0 ? currentIndex-1 : null;

  const nextIndex =
    currentIndex < total-1 ? currentIndex+1 : null;

  const previousCategory =
    previousIndex !== null
      ? state.data.categories[previousIndex]
      : null;

  const nextCategory =
    nextIndex !== null
      ? state.data.categories[nextIndex]
      : null;

  navigation.innerHTML = `
    <div class="category-nav-side">
      ${
        previousCategory
          ? `
            <button
              type="button"
              class="category-nav-button previous"
              data-route="${escapeAttr(categoryId(previousCategory,previousIndex))}"
            >
              <span>← ANTERIOR</span>
              <strong>${escapeHtml(
                previousCategory.short ||
                previousCategory.name ||
                "Categoria anterior"
              )}</strong>
            </button>
          `
          : ""
      }
    </div>

    <button
      type="button"
      class="category-nav-map"
      data-route="inicio"
    >
      VOLTAR AO MAPA
    </button>

    <div class="category-nav-side next-side">
      ${
        nextCategory
          ? `
            <button
              type="button"
              class="category-nav-button next"
              data-route="${escapeAttr(categoryId(nextCategory,nextIndex))}"
            >
              <span>PRÓXIMA →</span>
              <strong>${escapeHtml(
                nextCategory.short ||
                nextCategory.name ||
                "Próxima categoria"
              )}</strong>
            </button>
          `
          : ""
      }
    </div>
  `;
}

/* =========================================================
   PESQUISA
========================================================= */

function search(query,target){
  if(!target) return;

  const q = String(query || "").trim().toLowerCase();

  if(!q){
    target.innerHTML = "";
    return;
  }

  const results = allRules()
    .filter(rule => {
      const searchable = `
        ${rule.cat?.short || ""}
        ${rule.cat?.name || ""}
        ${rule.cat?.code || ""}
        ${rule.code || ""}
        ${rule.title || ""}
        ${rule.text || ""}
        ${rule.tag || ""}
      `.toLowerCase();

      return searchable.includes(q);
    })
    .slice(0,30);

  target.innerHTML = results.length
    ? results.map(rule => {
        const routeId = categoryId(rule.cat,rule.catIndex);

        return `
          <div class="result" data-route="${escapeAttr(routeId)}">
            <small>
              ${escapeHtml(
                rule.cat.short ||
                rule.cat.name ||
                ""
              )}
              ·
              ${escapeHtml(
                rule.code ||
                rule.cat.code ||
                ""
              )}
            </small>

            <h3>${escapeHtml(rule.title || "")}</h3>

            <p>${escapeHtml(
              String(rule.text || "")
                .replace(/[#>*_`]/g,"")
                .slice(0,240)
            )}</p>
          </div>
        `;
      }).join("")
    : `
      <div class="result">
        <h3>Nenhuma regra encontrada.</h3>
        <p>Tente outra palavra.</p>
      </div>
    `;

  target.querySelectorAll("[data-route]").forEach(result => {
    result.addEventListener("click",() => {
      const routeId = result.dataset.route;
      route(routeId);
      history.replaceState(null,"","#" + routeId);
    });
  });
}

/* =========================================================
   ROTAS
========================================================= */

function route(id){
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  if(id === "inicio"){
    $("inicio")?.classList.add("active");
  }else if(id === "pesquisa"){
    $("searchPage")?.classList.add("active");

    setTimeout(() => {
      $("searchInput")?.focus();
    },50);
  }else{
    const exists = categoryIndexById(id) >= 0;

    if(!exists){
      $("inicio")?.classList.add("active");
      id = "inicio";
    }else{
      $("categoryPage")?.classList.add("active");
      renderCategory(id);
    }
  }

  document.querySelectorAll(".sidebar nav button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.route === id
    );
  });

  $("sidebar")?.classList.remove("open");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

/* =========================================================
   CLIQUES DE NAVEGAÇÃO
========================================================= */

document.addEventListener("click",event => {
  const target = event.target.closest("[data-route]");
  if(!target) return;

  if(
    target.tagName === "A" &&
    target.getAttribute("target") === "_blank"
  ){
    return;
  }

  event.preventDefault();

  const routeId = target.dataset.route;
  if(!routeId) return;

  route(routeId);

  history.replaceState(
    null,
    "",
    "#" + routeId
  );
});

/* =========================================================
   PESQUISA
========================================================= */

$("searchOpen")?.addEventListener("click",() => {
  $("searchOverlay")?.classList.add("open");
  $("overlaySearch")?.focus();
});

$("searchClose")?.addEventListener("click",() => {
  $("searchOverlay")?.classList.remove("open");
});

$("searchOverlay")?.addEventListener("click",event => {
  if(event.target === $("searchOverlay")){
    $("searchOverlay")?.classList.remove("open");
  }
});

$("overlaySearch")?.addEventListener("input",event => {
  search(event.target.value,$("overlayResults"));
});

$("searchInput")?.addEventListener("input",event => {
  search(event.target.value,$("searchResults"));
});

document.addEventListener("keydown",event => {
  if(
    event.key === "Escape" &&
    $("searchOverlay")?.classList.contains("open")
  ){
    $("searchOverlay").classList.remove("open");
  }
});

/* =========================================================
   MENU MOBILE
========================================================= */

$("mobileMenu")?.addEventListener("click",() => {
  $("sidebar")?.classList.toggle("open");
});

/* =========================================================
   HASH
========================================================= */

window.addEventListener("hashchange",() => {
  route(
    location.hash.replace("#","") || "inicio"
  );
});

/* =========================================================
   CURSOR PERSONALIZADO
   - sem bolinha
   - usa a imagem do Admin
   - rastro de tinta aparece SEM clicar
========================================================= */

function setupCursor(){
  const config = state.site?.cursor || {};
  const cursor = $("customCursor");
  if(!cursor) return;

  if(window.__vienaCursorCleanup){
    window.__vienaCursorCleanup();
  }

  if(config.enabled === false){
    document.documentElement.classList.remove("viena-cursor-active");
    cursor.style.display = "none";
    return;
  }

  document.documentElement.classList.add("viena-cursor-active");
  cursor.style.display = "block";

  const cursorImage =
    assetUrl(config.image) ||
    assetUrl(state.site?.logo) ||
    "./logo-viena.png";

  const size = Math.max(12,Math.min(96,Number(config.size) || 34));
  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  cursor.style.backgroundImage = `url("${cursorImage}")`;

  const trailEnabled = config.trail_enabled !== false;
  const trailType = config.trail_type || "paint";
  const trailColor = config.trail_color || "#e50914";
  const trailCount = Math.max(2,Math.min(30,Number(config.trail_count) || 10));

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let lastTrail = 0;

  const moveHandler = event => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if(!trailEnabled || trailType === "none") return;

    const now = performance.now();
    const interval = Math.max(10,48 - trailCount * 1.25);
    if(now - lastTrail < interval) return;
    lastTrail = now;

    const previousX = window.__vienaLastX ?? mouseX;
    const previousY = window.__vienaLastY ?? mouseY;
    const dx = mouseX - previousX;
    const dy = mouseY - previousY;
    const distance = Math.max(1,Math.hypot(dx,dy));
    const angle = Math.atan2(dy,dx) * 180 / Math.PI;

    window.__vienaLastX = mouseX;
    window.__vienaLastY = mouseY;

    const paint = document.createElement("span");
    paint.className = `cursor-paint cursor-paint-${trailType}`;
    paint.style.left = `${mouseX}px`;
    paint.style.top = `${mouseY}px`;
    paint.style.background = trailColor;
    paint.style.setProperty("--angle",`${angle}deg`);

    const width = 10 + Math.min(22,distance * .45) + Math.random() * 9;
    const height = 4 + Math.random() * 5;
    paint.style.width = `${width}px`;
    paint.style.height = `${height}px`;
    paint.style.marginLeft = `${-width/2}px`;
    paint.style.marginTop = `${-height/2}px`;
    paint.style.opacity = `${Math.min(.85,.38 + trailCount/35)}`;
    paint.style.transform = `rotate(${angle + (Math.random()*24-12)}deg)`;

    document.body.appendChild(paint);

    const maxPaint = trailCount * 2 + 8;
    const paints = document.querySelectorAll(".cursor-paint");
    if(paints.length > maxPaint){
      for(let i=0;i<paints.length-maxPaint;i++) paints[i].remove();
    }

    setTimeout(() => paint.remove(),760);
  };

  document.addEventListener("mousemove",moveHandler,{passive:true});

  function animateCursor(){
    cursorX += (mouseX - cursorX) * .28;
    cursorY += (mouseY - cursorY) * .28;
    cursor.style.transform = `translate3d(${cursorX - size/2}px,${cursorY - size/2}px,0)`;
    window.__vienaCursorFrame = requestAnimationFrame(animateCursor);
  }

  animateCursor();

  window.__vienaCursorCleanup = () => {
    document.removeEventListener("mousemove",moveHandler);
    cancelAnimationFrame(window.__vienaCursorFrame);
    document.querySelectorAll(".cursor-paint").forEach(el => el.remove());
    window.__vienaLastX = null;
    window.__vienaLastY = null;
  };
}

/* =========================================================
   LETRINHAS CAINDO
========================================================= */

function setupFallingLetters(){
  const container = $("fallingLetters");
  if(!container) return;

  const config = state.site?.cursor?.falling_particles || {};
  const enabled = config.enabled !== false;

  container.innerHTML = "";
  if(!enabled) return;

  const type = config.type || "letters";
  const amount = Math.max(5,Math.min(80,Number(config.count) || (window.innerWidth < 700 ? 18 : 34)));
  const size = Math.max(6,Math.min(40,Number(config.size) || 14));
  const color = config.color || "#e50914";
  const image = assetUrl(config.image) || assetUrl(state.site?.logo) || "./logo-viena.png";
  const letters = "VIENA • CÓDIGO DA RUA • RP • 01 • 02 • 03 •";

  for(let i=0;i<amount;i++){
    const span = document.createElement("span");
    span.className = "falling-particle";

    let particleType = type;
    if(type === "mixed"){
      particleType = Math.random() < .5 ? "letters" : "logo";
    }

    if(particleType === "logo"){
      const img = document.createElement("img");
      img.src = image;
      img.alt = "";
      img.draggable = false;
      img.style.width = `${size + Math.random()*size}px`;
      img.style.height = "auto";
      span.classList.add("falling-logo");
      span.appendChild(img);
    }else if(particleType === "spark"){
      span.classList.add("falling-spark");
      span.textContent = Math.random() < .5 ? "✦" : "•";
      span.style.fontSize = `${size + Math.random()*size/2}px`;
    }else{
      span.classList.add("falling-letter");
      span.textContent = letters[Math.floor(Math.random()*letters.length)];
      span.style.fontSize = `${size + Math.random()*size/2}px`;
    }

    span.style.left = `${Math.random()*100}%`;
    span.style.animationDuration = `${8 + Math.random()*15}s`;
    span.style.animationDelay = `${-Math.random()*18}s`;
    span.style.setProperty("--particle-color",color);
    span.style.opacity = `${.04 + Math.random()*.10}`;
    container.appendChild(span);
  }
}

window.addEventListener("resize",() => {
  clearTimeout(window.__vienaResizeTimer);
  window.__vienaResizeTimer = setTimeout(
    setupFallingLetters,
    200
  );
});

/* =========================================================
   ERRO
========================================================= */

load().catch(error => {
  console.error("Erro ao carregar o site:",error);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="load-error">
        Não foi possível carregar o conteúdo.
        Verifique se <strong>content/site.json</strong> e
        <strong>content/rules.json</strong> existem no projeto.
      </div>
    `
  );
});

/* =========================================================
   EDITOR VISUAL — PRÉVIA AO VIVO
   Permite ao editor enviar dados não salvos para esta mesma página.
========================================================= */
window.addEventListener("message", event => {
  const payload = event.data;
  if (!payload || payload.type !== "viena-preview") return;
  if (!payload.site || !payload.data) return;

  state.site = payload.site;
  state.data = payload.data;

  try {
    applySite();
    renderNav();
    renderHome();
    setupCursor();
    setupFallingLetters();

    const current = location.hash.replace("#", "") || "inicio";
    if (current !== "inicio" && current !== "pesquisa") {
      renderCategory(current);
    }
  } catch (error) {
    console.error("Erro ao atualizar prévia:", error);
  }
});
