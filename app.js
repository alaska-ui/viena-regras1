/* =========================================================
   VIENA ROLEPLAY — APP.JS
   Cursor + rastro spray/pichação
   ========================================================= */

let siteData = {};
let rulesData = {};

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let lastX = mouseX;
let lastY = mouseY;

let cursorElement = null;
let paintCanvas = null;
let paintCtx = null;

let cursorImage = null;
let cursorSize = 34;
let trailEnabled = true;
let trailColor = "#e50914";

let particles = [];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  await loadData();

  initSite();

  initNavigation();

  initSearch();

  initMobileMenu();

  initCursor();

  initPaintTrail();

});


/* =========================================================
   CARREGAR JSON
   ========================================================= */

async function loadData() {

  try {

    const siteResponse = await fetch("content/site.json");

    if (siteResponse.ok) {
      siteData = await siteResponse.json();
    }

  } catch (error) {

    console.error("Erro carregando site.json:", error);

  }


  try {

    const rulesResponse = await fetch("content/rules.json");

    if (rulesResponse.ok) {
      rulesData = await rulesResponse.json();
    }

  } catch (error) {

    console.error("Erro carregando rules.json:", error);

  }

}


/* =========================================================
   INICIALIZAR SITE
   ========================================================= */

function initSite() {

  const get = (id) => document.getElementById(id);


  /* -----------------------------------------
     IDENTIDADE
     ----------------------------------------- */

  if (get("brandTitle")) {

    get("brandTitle").textContent =
      siteData.site_title || "CÓDIGO DA RUA";

  }

  if (get("brandSite")) {

    get("brandSite").textContent =
      siteData.site_name || "VIENA ROLEPLAY";

  }


  /* -----------------------------------------
     LOGO
     ----------------------------------------- */

  if (siteData.logo && get("headerLogo")) {

    get("headerLogo").src = siteData.logo;

  }


  /* -----------------------------------------
     FAVICON
     ----------------------------------------- */

  if (siteData.favicon) {

    const favicon =
      document.getElementById("favicon");

    if (favicon) {

      favicon.href = siteData.favicon;

    }

  }


  /* -----------------------------------------
     DISCORD
     ----------------------------------------- */

  if (
    siteData.discord_url &&
    get("discordBtn")
  ) {

    get("discordBtn").href =
      siteData.discord_url;

  }


  /* -----------------------------------------
     HERO
     ----------------------------------------- */

  if (get("heroEyebrow")) {

    get("heroEyebrow").textContent =
      siteData.hero_eyebrow || "";

  }

  if (get("heroTitle")) {

    get("heroTitle").textContent =
      siteData.hero_title || "";

  }

  if (get("heroText")) {

    get("heroText").textContent =
      siteData.hero_text || "";

  }


  /* -----------------------------------------
     IMAGEM HERO
     ----------------------------------------- */

  const heroImage =
    get("heroImage");

  const heroArt =
    get("heroArt");

  if (
    heroImage &&
    siteData.hero_image &&
    siteData.layout?.show_hero_image !== false
  ) {

    heroImage.src =
      siteData.hero_image;

    heroImage.style.display =
      "block";

  } else if (heroArt) {

    heroArt.style.display =
      "none";

  }


  /* -----------------------------------------
     AVISO
     ----------------------------------------- */

  if (
    siteData.layout?.show_notice !== false
  ) {

    if (get("noticeTitle")) {

      get("noticeTitle").textContent =
        siteData.notice_title ||
        "LEIA ANTES DE JOGAR";

    }

    if (get("noticeText")) {

      get("noticeText").textContent =
        siteData.notice_text ||
        "Desconhecer uma regra não isenta o jogador de sua responsabilidade.";

    }

  } else {

    if (get("notice")) {

      get("notice").style.display =
        "none";

    }

  }


  /* -----------------------------------------
     FOOTER
     ----------------------------------------- */

  if (get("footerText")) {

    get("footerText").textContent =
      siteData.footer_text ||
      "© 2026 Viena Roleplay | Todos os direitos reservados.";

  }


  /* -----------------------------------------
     CURSOR
     ----------------------------------------- */

  if (siteData.cursor) {

    cursorImage =
      siteData.cursor.image || null;

    cursorSize =
      Number(siteData.cursor.size) || 34;

    trailEnabled =
      siteData.cursor.trail_enabled !== false;

    trailColor =
      siteData.cursor.trail_color ||
      "#e50914";

  }


  /* -----------------------------------------
     CATEGORIAS
     ----------------------------------------- */

  renderNavigation();

  renderHomeCategories();

  renderUpdates();

}


/* =========================================================
   NAVEGAÇÃO LATERAL
   ========================================================= */

function renderNavigation() {

  const nav =
    document.getElementById("nav");

  if (!nav) return;

  nav.innerHTML = "";

  const categories =
    rulesData.categories || [];

  categories.forEach((category, index) => {

    const link =
      document.createElement("a");

    link.href =
      "#categoria-" + category.id;

    link.dataset.route =
      category.id;

    link.innerHTML = `
      <span>
        ${String(index + 1).padStart(2, "0")}
      </span>
      ${escapeHTML(category.short || category.name || "")}
    `;

    nav.appendChild(link);

  });

}


/* =========================================================
   MAPA DA RUA
   IMPORTANTE:
   AQUI NÃO MOSTRAMOS A IMAGEM DA CATEGORIA.
   ========================================================= */

function renderHomeCategories() {

  const container =
    document.getElementById("homeCategories");

  if (!container) return;

  container.innerHTML = "";

  const categories =
    rulesData.categories || [];

  categories.forEach((category, index) => {

    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "category-card";

    card.dataset.route =
      category.id;

    /*
      SOMENTE:
      - código
      - título
      - descrição

      A imagem da categoria NÃO entra aqui.
    */

    card.innerHTML = `
      <div class="category-code">
        ${escapeHTML(category.code || String(index + 1).padStart(2, "0"))}
        / VIENA
      </div>

      <h3>
        ${escapeHTML(category.short || category.name || "")}
      </h3>

      <p>
        ${escapeHTML(category.desc || "")}
      </p>
    `;

    container.appendChild(card);

  });

}


/* =========================================================
   ÚLTIMAS ALTERAÇÕES
   ========================================================= */

function renderUpdates() {

  const container =
    document.getElementById("updatesList");

  if (!container) return;

  const updates =
    rulesData.updates || [];

  container.innerHTML = "";

  if (!updates.length) {

    const wrap =
      document.getElementById("updatesWrap");

    if (wrap) {

      wrap.style.display = "none";

    }

    return;

  }

  updates.forEach(update => {

    const item =
      document.createElement("div");

    item.className =
      "update-item";

    item.innerHTML = `
      <strong>
        ${escapeHTML(update.title || "")}
      </strong>

      <p>
        ${escapeHTML(update.text || "")}
      </p>
    `;

    container.appendChild(item);

  });

}


/* =========================================================
   ROTAS
   ========================================================= */

function initNavigation() {

  document.addEventListener("click", event => {

    const routeElement =
      event.target.closest("[data-route]");

    if (!routeElement) return;

    event.preventDefault();

    const route =
      routeElement.dataset.route;

    if (route === "inicio") {

      showHome();

      return;

    }

    if (route === "gerais") {

      const category =
        findCategory("gerais");

      if (category) {

        showCategory(category);

      } else {

        const first =
          rulesData.categories?.[0];

        if (first) {

          showCategory(first);

        }

      }

      return;

    }

    if (route === "corridas") {

      const category =
        findCategory("corridas");

      if (category) {

        showCategory(category);

      }

      return;

    }

    const category =
      findCategory(route);

    if (category) {

      showCategory(category);

    }

  });

}


/* =========================================================
   MOSTRAR HOME
   ========================================================= */

function showHome() {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });

  const home =
    document.getElementById("inicio");

  if (home) {

    home.classList.add("active");

  }

  updateActiveNav("");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   MOSTRAR CATEGORIA
   ========================================================= */

function showCategory(category) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });

  const page =
    document.getElementById("categoryPage");

  if (!page) return;

  page.classList.add("active");


  const code =
    document.getElementById("catCode");

  const title =
    document.getElementById("catTitle");

  const desc =
    document.getElementById("catDesc");


  if (code) {

    code.textContent =
      category.code || "";

  }

  if (title) {

    title.textContent =
      category.name ||
      category.short ||
      "";

  }

  if (desc) {

    desc.textContent =
      category.desc || "";

  }


  renderRules(category);

  updateActiveNav(category.id);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   RENDERIZAR REGRAS
   ========================================================= */

function renderRules(category) {

  const list =
    document.getElementById("ruleList");

  const toc =
    document.getElementById("ruleToc");

  if (!list) return;

  list.innerHTML = "";

  if (toc) {

    toc.innerHTML = "";

  }

  const rules =
    category.rules || [];


  rules.forEach((rule, index) => {

    const id =
      "regra-" +
      category.id +
      "-" +
      index;


    const card =
      document.createElement("article");

    card.className =
      "rule-card";

    card.id = id;


    /*
      TEXTO DA REGRA

      Permite que o texto venha do Admin
      com quebras de linha.
    */

    let content =
      escapeHTML(rule.text || "");


    /*
      Suporte simples para:
      **negrito**
    */

    content =
      content.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );


    card.innerHTML = `

      <div class="rule-code">
        ${escapeHTML(rule.code || "")}
      </div>

      <h2>
        ${escapeHTML(rule.title || "")}
      </h2>

      <p>
        ${content}
      </p>

      ${
        rule.tag
          ? `
            <span class="rule-tag">
              ${escapeHTML(rule.tag)}
            </span>
          `
          : ""
      }

      ${
        rule.image
          ? `
            <img
              class="rule-image"
              src="${escapeAttribute(rule.image)}"
              alt=""
            >
          `
          : ""
      }

    `;

    list.appendChild(card);


    if (toc) {

      const tocLink =
        document.createElement("a");

      tocLink.href =
        "#" + id;

      tocLink.textContent =
        rule.title || "";

      toc.appendChild(tocLink);

    }

  });

}


/* =========================================================
   ENCONTRAR CATEGORIA
   ========================================================= */

function findCategory(id) {

  const categories =
    rulesData.categories || [];

  return categories.find(category =>
    String(category.id) === String(id) ||
    String(category.code) === String(id) ||
    String(category.short || "")
      .toLowerCase()
      .includes(String(id).toLowerCase())
  );

}


/* =========================================================
   NAV ATIVA
   ========================================================= */

function updateActiveNav(id) {

  document
    .querySelectorAll("#nav a")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.route === id
      );

    });

}


/* =========================================================
   PESQUISA
   ========================================================= */

function initSearch() {

  const open =
    document.getElementById("searchOpen");

  const overlay =
    document.getElementById("searchOverlay");

  const close =
    document.getElementById("searchClose");

  const input =
    document.getElementById("overlaySearch");


  if (open && overlay) {

    open.addEventListener("click", () => {

      overlay.classList.add("open");

      setTimeout(() => {

        input?.focus();

      }, 100);

    });

  }


  if (close && overlay) {

    close.addEventListener("click", () => {

      overlay.classList.remove("open");

    });

  }


  if (overlay) {

    overlay.addEventListener("click", event => {

      if (event.target === overlay) {

        overlay.classList.remove("open");

      }

    });

  }


  if (input) {

    input.addEventListener(
      "input",
      () => {

        performSearch(
          input.value,
          "overlayResults"
        );

      }
    );

  }


  const pageInput =
    document.getElementById("searchInput");

  if (pageInput) {

    pageInput.addEventListener(
      "input",
      () => {

        performSearch(
          pageInput.value,
          "searchResults"
        );

      }
    );

  }

}


/* =========================================================
   PESQUISA
   ========================================================= */

function performSearch(query, containerId) {

  const container =
    document.getElementById(containerId);

  if (!container) return;

  const term =
    String(query || "")
      .trim()
      .toLowerCase();


  if (!term) {

    container.innerHTML = "";

    return;

  }


  const results = [];


  (rulesData.categories || [])
    .forEach(category => {

      (category.rules || [])
        .forEach(rule => {

          const searchable = [

            rule.code,
            rule.title,
            rule.text,
            rule.tag

          ]
            .join(" ")
            .toLowerCase();


          if (searchable.includes(term)) {

            results.push({
              category,
              rule
            });

          }

        });

    });


  if (!results.length) {

    container.innerHTML = `
      <div class="update-item">
        Nenhuma regra encontrada.
      </div>
    `;

    return;

  }


  container.innerHTML =
    results.map(result => `

      <div
        class="update-item"
        data-search-category="${escapeAttribute(
          result.category.id
        )}"
      >

        <strong>
          ${escapeHTML(
            result.rule.code || ""
          )}
          —
          ${escapeHTML(
            result.rule.title || ""
          )}
        </strong>

        <p>
          ${escapeHTML(
            result.rule.text || ""
          )}
        </p>

      </div>

    `).join("");

}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function initMobileMenu() {

  const button =
    document.getElementById("mobileMenu");

  const sidebar =
    document.getElementById("sidebar");

  if (!button || !sidebar) return;

  button.addEventListener("click", () => {

    sidebar.classList.toggle("open");

  });

}


/* =========================================================
   CURSOR PERSONALIZADO
   ========================================================= */

function initCursor() {

  /*
     Cria o elemento caso ainda não exista.
  */

  cursorElement =
    document.getElementById(
      "customCursor"
    );


  if (!cursorElement) {

    cursorElement =
      document.createElement("div");

    cursorElement.id =
      "customCursor";

    cursorElement.className =
      "custom-cursor";

    document.body.appendChild(
      cursorElement
    );

  }


  /*
     IMPORTANTE:

     Não existe bolinha.
     Não existe cursor-dot.
  */

  const oldDot =
    document.getElementById("cursorDot");

  if (oldDot) {

    oldDot.style.display =
      "none";

  }


  /*
     Verifica se o cursor está ativado.
  */

  if (
    siteData.cursor &&
    siteData.cursor.enabled === false
  ) {

    cursorElement.style.display =
      "none";

    document.body.style.cursor =
      "auto";

    return;

  }


  /*
     Se o Admin colocou uma imagem,
     ela será usada.
  */

  if (cursorImage) {

    cursorElement.style.backgroundImage =
      `url("${cursorImage}")`;

    cursorElement.style.width =
      `${cursorSize}px`;

    cursorElement.style.height =
      `${cursorSize}px`;

    cursorElement.classList.add(
      "active"
    );

  }


  /*
     Movimento do cursor
  */

  document.addEventListener(
    "mousemove",
    event => {

      mouseX =
        event.clientX;

      mouseY =
        event.clientY;


      if (cursorElement) {

        cursorElement.style.transform =
          `translate3d(
            ${mouseX}px,
            ${mouseY}px,
            0
          ) translate(-50%, -50%)`;

      }


      /*
         Cria spray somente quando
         o mouse realmente está andando.
      */

      if (trailEnabled) {

        const dx =
          mouseX - lastX;

        const dy =
          mouseY - lastY;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        if (distance > 2) {

          createPaintSpray(
            mouseX,
            mouseY,
            dx,
            dy
          );

        }

      }


      lastX =
        mouseX;

      lastY =
        mouseY;

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   CANVAS DO SPRAY
   ========================================================= */

function initPaintTrail() {

  /*
     Evita criar no celular.
  */

  if (
    window.innerWidth <= 600
  ) {

    return;

  }


  paintCanvas =
    document.createElement("canvas");

  paintCanvas.id =
    "paintTrailCanvas";

  document.body.appendChild(
    paintCanvas
  );


  paintCtx =
    paintCanvas.getContext(
      "2d"
    );


  resizePaintCanvas();


  window.addEventListener(
    "resize",
    resizePaintCanvas
  );


  animatePaintTrail();

}


/* =========================================================
   TAMANHO DO CANVAS
   ========================================================= */

function resizePaintCanvas() {

  if (!paintCanvas) return;

  const ratio =
    window.devicePixelRatio || 1;


  paintCanvas.width =
    window.innerWidth * ratio;

  paintCanvas.height =
    window.innerHeight * ratio;


  paintCanvas.style.width =
    window.innerWidth + "px";

  paintCanvas.style.height =
    window.innerHeight + "px";


  if (paintCtx) {

    paintCtx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

  }

}


/* =========================================================
   CRIAR SPRAY
   ========================================================= */

function createPaintSpray(
  x,
  y,
  dx,
  dy
) {

  if (!paintCtx) return;


  /*
     Velocidade do mouse.
  */

  const speed =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  /*
     Quantidade de spray.

     Quanto mais rápido o mouse,
     mais tinta sai.
  */

  const amount =
    Math.min(
      14,
      Math.max(
        3,
        Math.floor(speed / 2)
      )
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    /*
       Spray espalhado para trás
       como tinta de spray.
    */

    const angle =
      Math.random() *
      Math.PI *
      2;


    const distance =
      Math.random() *
      22;


    const px =
      x +
      Math.cos(angle) *
      distance;


    const py =
      y +
      Math.sin(angle) *
      distance;


    const radius =
      Math.random() *
      2.8 +
      0.5;


    particles.push({

      x: px,

      y: py,

      radius: radius,

      alpha:
        Math.random() *
          0.7 +
        0.25,

      life:
        Math.random() *
          45 +
        25,

      maxLife:
        70,

      vx:
        (Math.random() - 0.5) *
        0.5,

      vy:
        (Math.random() - 0.5) *
        0.5

    });

  }


  /*
     Pequenos respingos maiores.
  */

  if (
    Math.random() < 0.35
  ) {

    particles.push({

      x:
        x +
        (Math.random() - 0.5) *
        25,

      y:
        y +
        (Math.random() - 0.5) *
        25,

      radius:
        Math.random() * 5 +
        2,

      alpha:
        0.25,

      life:
        80,

      maxLife:
        80,

      vx:
        (Math.random() - 0.5),

      vy:
        (Math.random() - 0.5)

    });

  }


  /*
     Limite de partículas
     para não pesar a página.
  */

  if (
    particles.length > 1200
  ) {

    particles.splice(
      0,
      particles.length - 1200
    );

  }

}


/* =========================================================
   ANIMAÇÃO DO SPRAY
   ========================================================= */

function animatePaintTrail() {

  requestAnimationFrame(
    animatePaintTrail
  );


  if (
    !paintCtx ||
    !paintCanvas
  ) {

    return;

  }


  /*
     Limpa o canvas inteiro.

     Assim o spray desaparece
     naturalmente.
  */

  paintCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  for (
    let i = particles.length - 1;
    i >= 0;
    i--
  ) {

    const particle =
      particles[i];


    particle.life -= 1;


    particle.x +=
      particle.vx;

    particle.y +=
      particle.vy;


    if (
      particle.life <= 0
    ) {

      particles.splice(
        i,
        1
      );

      continue;

    }


    const opacity =
      Math.max(
        0,
        particle.alpha *
        (
          particle.life /
          particle.maxLife
        )
      );


    /*
       Cor configurada no Admin.
    */

    paintCtx.fillStyle =
      hexToRGBA(
        trailColor,
        opacity
      );


    paintCtx.beginPath();

    paintCtx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );

    paintCtx.fill();

  }

}


/* =========================================================
   HEX → RGBA
   ========================================================= */

function hexToRGBA(
  hex,
  alpha
) {

  let value =
    String(hex || "#e50914")
      .replace("#", "");


  if (
    value.length === 3
  ) {

    value =
      value
        .split("")
        .map(char => char + char)
        .join("");

  }


  const number =
    parseInt(
      value,
      16
    );


  const r =
    (number >> 16) & 255;

  const g =
    (number >> 8) & 255;

  const b =
    number & 255;


  return `
    rgba(
      ${r},
      ${g},
      ${b},
      ${alpha}
    )
  `;

}


/* =========================================================
   SEGURANÇA — TEXTO
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(value) {

  return String(value ?? "")
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    );

}
