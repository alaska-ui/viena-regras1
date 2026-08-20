const state = {
  site: null,
  data: null
};

const $ = id => document.getElementById(id);

/*
=========================================================
DADOS
=========================================================

O painel salva os arquivos em content/.

O site tenta primeiro o GitHub RAW. Isso evita que uma alteração
feita pelo Admin fique presa no cache do GitHub Pages.

Depois existe fallback para o caminho local.
*/

const RAW_BASE =
  "https://raw.githubusercontent.com/alaska-ui/viena-regras1/main/content/";

function assetUrl(value) {
  if (!value) return "";

  value = String(value).trim();

  if (/^(https?:|data:|blob:|#)/i.test(value)) {
    return value;
  }

  const clean = value.replace(/^\.\/+/, "");

  if (clean.startsWith("/")) {
    const parts = location.pathname.split("/").filter(Boolean);

    const repo =
      location.hostname.endsWith("github.io") && parts.length
        ? parts[0]
        : "";

    return repo
      ? `/${repo}${clean}`
      : clean;
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

function escapeAttr(value) {
  return escapeHtml(value);
}

async function getJson(filename) {
  const stamp = Date.now();

  /*
    RAW é a fonte principal.
    O parâmetro ?v= impede respostas antigas em cache.
  */
  const rawUrl =
    `${RAW_BASE}${filename}?v=${stamp}`;

  try {
    const response = await fetch(
      rawUrl,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `${filename}: HTTP ${response.status}`
      );
    }

    return await response.json();

  } catch (rawError) {
    console.warn(
      "GitHub RAW falhou. Tentando caminho local:",
      rawError
    );

    const localUrl =
      `content/${filename}?v=${stamp}`;

    const response = await fetch(
      localUrl,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `${filename}: não encontrado`
      );
    }

    return await response.json();
  }
}

async function load() {
  const [site, rules] = await Promise.all([
    getJson("site.json"),
    getJson("rules.json")
  ]);

  state.site = site || {};
  state.data = rules || {
    categories: [],
    updates: []
  };

  /*
    Normalização para evitar erro caso alguma categoria/regra
    esteja sem algum campo.
  */
  state.data.categories =
    Array.isArray(state.data.categories)
      ? state.data.categories
      : [];

  state.data.categories.forEach(category => {
    category.rules =
      Array.isArray(category.rules)
        ? category.rules
        : [];
  });

  state.data.updates =
    Array.isArray(state.data.updates)
      ? state.data.updates
      : [];

  applySite();
  renderNav();
  renderHome();
  setupCursor(state.site);

  route(
    location.hash.replace(/^#/, "") ||
    "inicio"
  );
}

/*
=========================================================
SITE
=========================================================
*/

function applySite() {
  const s = state.site || {};
  const theme = s.theme || {};

  for (const [key, value] of Object.entries(theme)) {
    const cssName =
      key === "accent_light"
        ? "accent2"
        : key;

    document.documentElement.style.setProperty(
      `--${cssName}`,
      value
    );
  }

  $("headerLogo").src =
    assetUrl(
      s.logo ||
      "logo-viena.png"
    );

  $("headerLogo").alt =
    s.site_name ||
    "Viena Roleplay";

  $("favicon").href =
    assetUrl(
      s.favicon ||
      s.logo ||
      "logo-viena.png"
    );

  $("brandTitle").textContent =
    s.site_title ||
    "CÓDIGO DA RUA";

  $("brandSite").textContent =
    (
      s.site_name ||
      "VIENA ROLEPLAY"
    ).toUpperCase();

  $("heroEyebrow").textContent =
    s.hero_eyebrow ||
    "";

  $("heroTitle").textContent =
    s.hero_title ||
    "";

  $("heroText").textContent =
    s.hero_text ||
    "";

  $("noticeTitle").textContent =
    s.notice_title ||
    "";

  $("noticeText").textContent =
    s.notice_text ||
    "";

  $("footerText").textContent =
    s.footer_text ||
    "";

  $("discordBtn").href =
    s.discord_url ||
    "#";

  $("discordBtn").target =
    "_blank";

  $("discordBtn").rel =
    "noopener noreferrer";

  $("notice").style.display =
    s.layout?.show_notice === false
      ? "none"
      : "flex";

  $("updatesWrap").style.display =
    s.layout?.show_updates === false
      ? "none"
      : "block";

  $("searchOpen").style.display =
    s.layout?.show_search === false
      ? "none"
      : "block";

  /*
    IMPORTANTE:
    hero_image é a imagem enviada pelo Admin.

    Ela NÃO é colocada dentro do quadrado lateral.
    Ela vira o fundo inteiro da capa.
  */

  const heroImage =
    s.hero_image ||
    s.cover_image ||
    s.cover?.image ||
    s.background_image ||
    "";

  const hero =
    document.querySelector(".hero");

  if (
    heroImage &&
    s.layout?.show_hero_image !== false
  ) {
    const url =
      assetUrl(heroImage);

    hero.style.setProperty(
      "--hero-image",
      `url("${cssUrl(url)}")`
    );

    hero.classList.add(
      "has-image"
    );

    /*
      Mantemos o elemento para compatibilidade,
      mas a imagem visual é o background.
    */
    $("heroImage").src = url;

  } else {
    hero.style.removeProperty(
      "--hero-image"
    );

    hero.classList.remove(
      "has-image"
    );

    $("heroImage")
      .removeAttribute("src");
  }
}

/*
=========================================================
MENU
=========================================================
*/

function renderNav() {
  $("nav").innerHTML =
    state.data.categories
      .map(category => `
        <button
          data-route="${escapeAttr(category.id)}"
          type="button"
        >
          <span>
            ${escapeHtml(category.code)}
          </span>
          ${escapeHtml(category.short)}
        </button>
      `)
      .join("");
}

/*
=========================================================
HOME
=========================================================
*/

function renderHome() {
  $("homeCategories").innerHTML =
    state.data.categories
      .map(category => `
        <article
          class="cat-card"
          data-route="${escapeAttr(category.id)}"
        >

          <div class="num">
            ${escapeHtml(category.code)}
            / VIENA
          </div>

          ${
            category.image
              ? `
                <div class="card-image-wrap">
                  <img
                    class="card-image"
                    src="${escapeAttr(
                      assetUrl(category.image)
                    )}"
                    alt=""
                  >
                </div>
              `
              : ""
          }

          <h3>
            ${escapeHtml(
              category.short ||
              category.name
            )}
          </h3>

          <p>
            ${escapeHtml(
              category.desc
            )}
          </p>

        </article>
      `)
      .join("");

  $("updatesList").innerHTML =
    state.data.updates
      .map(update => `
        <div class="update">

          <time>
            ${escapeHtml(update.date)}
          </time>

          <strong>
            ${escapeHtml(update.title)}
            —
            ${escapeHtml(update.text)}
          </strong>

          <span>
            ${escapeHtml(update.tag)}
          </span>

        </div>
      `)
      .join("");
}

/*
=========================================================
TODAS AS REGRAS
=========================================================
*/

function allRules() {
  return state.data.categories.flatMap(
    category =>
      category.rules.map(rule => ({
        cat: category,
        ...rule
      }))
  );
}

/*
=========================================================
CATEGORIA
=========================================================
*/

function renderCategory(id) {
  const category =
    state.data.categories.find(
      item => item.id === id
    );

  if (!category) {
    return;
  }

  $("catCode").textContent =
    `CÓDIGO ${category.code}`;

  $("catTitle").textContent =
    category.name ||
    "";

  $("catDesc").textContent =
    category.desc ||
    "";

  const categoryHero =
    $("categoryHero");

  if (category.image) {
    categoryHero.style.setProperty(
      "--category-image",
      `url("${cssUrl(
        assetUrl(category.image)
      )}")`
    );

    categoryHero.classList.add(
      "has-image"
    );

  } else {
    categoryHero.style.removeProperty(
      "--category-image"
    );

    categoryHero.classList.remove(
      "has-image"
    );
  }

  $("ruleList").innerHTML =
    category.rules
      .map((rule, index) => `
        <article
          class="rule"
          id="rule-${index}"
        >

          <div class="rule-top">

            <div class="rule-num">
              ${escapeHtml(
                rule.code
              )}
            </div>

            <div>

              <h3>
                ${escapeHtml(
                  rule.title
                )}
              </h3>

              <p>
                ${escapeHtml(
                  rule.text
                )}
              </p>

              <span class="tag">
                ${escapeHtml(
                  rule.tag ||
                  "REGRA"
                )}
              </span>

              ${
                rule.image
                  ? `
                    <br>

                    <img
                      class="rule-image"
                      src="${escapeAttr(
                        assetUrl(
                          rule.image
                        )
                      )}"
                      alt=""
                    >
                  `
                  : ""
              }

            </div>

          </div>

        </article>
      `)
      .join("");

  $("ruleToc").innerHTML =
    `
      <strong>
        NESTA CATEGORIA
      </strong>
    ` +

    category.rules
      .map((rule, index) => `
        <button
          data-scroll-rule="rule-${index}"
          type="button"
        >
          ${escapeHtml(
            rule.code
          )}
          —
          ${escapeHtml(
            rule.title
          )}
        </button>
      `)
      .join("");
}

/*
=========================================================
PESQUISA
=========================================================
*/

function search(query, target) {
  query =
    query
      .trim()
      .toLowerCase();

  if (!query) {
    target.innerHTML = "";
    return;
  }

  const results =
    allRules()
      .filter(rule => {

        const content = `
          ${rule.cat.short}
          ${rule.cat.name}
          ${rule.cat.code}
          ${rule.code}
          ${rule.title}
          ${rule.text}
          ${rule.tag}
        `;

        return content
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 30);

  target.innerHTML =
    results.length

      ? results
          .map(rule => `
            <div
              class="result"
              data-route="${escapeAttr(
                rule.cat.id
              )}"
            >

              <small>
                ${escapeHtml(
                  rule.cat.short
                )}
                ·
                ${escapeHtml(
                  rule.code
                )}
              </small>

              <h3>
                ${escapeHtml(
                  rule.title
                )}
              </h3>

              <p>
                ${escapeHtml(
                  rule.text
                )}
              </p>

            </div>
          `)
          .join("")

      : `
          <div class="result">

            <h3>
              Nenhuma regra encontrada.
            </h3>

            <p>
              Tente outra palavra.
            </p>

          </div>
        `;
}

/*
=========================================================
ROTAS
=========================================================
*/

function route(id) {
  document
    .querySelectorAll(".page")
    .forEach(page =>
      page.classList.remove(
        "active"
      )
    );

  if (id === "inicio") {

    $("inicio")
      .classList.add("active");

  } else if (id === "pesquisa") {

    $("searchPage")
      .classList.add("active");

    setTimeout(
      () =>
        $("searchInput")?.focus(),
      0
    );

  } else if (
    state.data.categories.some(
      category =>
        category.id === id
    )
  ) {

    $("categoryPage")
      .classList.add("active");

    renderCategory(id);

  } else {

    id = "inicio";

    $("inicio")
      .classList.add("active");
  }

  document
    .querySelectorAll(
      ".sidebar nav button"
    )
    .forEach(button =>
      button.classList.toggle(
        "active",
        button.dataset.route === id
      )
    );

  $("sidebar")
    .classList.remove("open");

  window.scrollTo(
    0,
    0
  );
}

/*
=========================================================
CLIQUES / NAVEGAÇÃO
=========================================================
*/

document.addEventListener(
  "click",
  event => {

    const scrollTarget =
      event.target.closest(
        "[data-scroll-rule]"
      );

    if (scrollTarget) {

      const element =
        document.getElementById(
          scrollTarget.dataset.scrollRule
        );

      if (element) {
        element.scrollIntoView({
          behavior:"smooth",
          block:"center"
        });
      }

      return;
    }

    const target =
      event.target.closest(
        "[data-route]"
      );

    if (!target) {
      return;
    }

    event.preventDefault();

    const id =
      target.dataset.route;

    route(id);

    history.replaceState(
      null,
      "",
      "#" + id
    );
  }
);

/*
=========================================================
PESQUISA
=========================================================
*/

$("searchOpen").onclick = () => {
  $("searchOverlay")
    .classList.add("open");

  $("overlaySearch")
    .focus();
};

$("searchClose").onclick = () => {
  $("searchOverlay")
    .classList.remove("open");
};

$("searchOverlay").addEventListener(
  "click",
  event => {

    if (
      event.target ===
      $("searchOverlay")
    ) {
      $("searchOverlay")
        .classList.remove("open");
    }
  }
);

$("overlaySearch").oninput =
  event =>
    search(
      event.target.value,
      $("overlayResults")
    );

$("searchInput").oninput =
  event =>
    search(
      event.target.value,
      $("searchResults")
    );

$("mobileMenu").onclick = () =>
  $("sidebar")
    .classList.toggle("open");

window.addEventListener(
  "hashchange",
  () =>
    route(
      location.hash.replace(
        /^#/,
        ""
      ) || "inicio"
    )
);

/*
=========================================================
CURSOR DO ADMIN
=========================================================

O cursor usa exatamente o arquivo escolhido no painel:

site.cursor.image

e mantém o rastro.

Também funciona em:
- menu lateral
- botões
- cards
- regras
- pesquisa
- links
- mobile (no mobile volta ao cursor normal)
*/

function setupCursor(site) {
  document
    .getElementById(
      "vienaGlobalCursor"
    )
    ?.remove();

  document
    .querySelectorAll(
      ".viena-global-trail"
    )
    .forEach(
      element =>
        element.remove()
    );

  document
    .getElementById(
      "vienaGlobalCursorStyle"
    )
    ?.remove();

  document.documentElement
    .classList.remove(
      "viena-cursor-active"
    );

  if (
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {
    return;
  }

  const config =
    site?.cursor || {};

  if (
    config.enabled === false
  ) {
    return;
  }

  const image =
    assetUrl(
      config.image ||
      config.icon ||
      config.cursor_image ||
      "uploads/SPRAY PNG.png"
    );

  const size =
    Math.max(
      12,
      Math.min(
        96,
        Number(
          config.size ||
          config.icon_size
        ) || 34
      )
    );

  const trailEnabled =
    config.trail_enabled !== false &&
    config.trail !== false;

  const trailCount =
    Math.max(
      2,
      Math.min(
        30,
        Number(
          config.trail_count
        ) || 10
      )
    );

  const trailColor =
    config.trail_color ||
    "#e50914";

  /*
    Remove o cursor padrão em TODA a página.
  */
  const style =
    document.createElement(
      "style"
    );

  style.id =
    "vienaGlobalCursorStyle";

  style.textContent = `
    html.viena-cursor-active,
    html.viena-cursor-active *,
    html.viena-cursor-active a,
    html.viena-cursor-active button,
    html.viena-cursor-active input,
    html.viena-cursor-active textarea,
    html.viena-cursor-active select,
    html.viena-cursor-active [role="button"]{
      cursor:none!important;
    }
  `;

  document.head.appendChild(
    style
  );

  document.documentElement
    .classList.add(
      "viena-cursor-active"
    );

  /*
    CURSOR PRINCIPAL
  */
  const cursor =
    document.createElement(
      "div"
    );

  cursor.id =
    "vienaGlobalCursor";

  cursor.className =
    "viena-global-cursor";

  cursor.style.cssText = `
    position:fixed;
    left:0;
    top:0;
    width:${size}px;
    height:${size}px;
    z-index:2147483647;
    display:none;
    pointer-events:none;
    user-select:none;
    transform:translate(-50%,-50%);
    background-image:url("${cssUrl(image)}");
    background-size:contain;
    background-repeat:no-repeat;
    background-position:center;
  `;

  document.body.appendChild(
    cursor
  );

  /*
    RASTRO
  */
  const trail = [];

  if (trailEnabled) {

    for (
      let index = 0;
      index < trailCount;
      index++
    ) {

      const dot =
        document.createElement(
          "span"
        );

      dot.className =
        "viena-global-trail";

      const dotSize =
        Math.max(
          3,
          9 - index * .5
        );

      const opacity =
        Math.max(
          .05,
          .8 - index * .07
        );

      dot.style.cssText = `
        position:fixed;
        left:0;
        top:0;
        width:${dotSize}px;
        height:${dotSize}px;
        border-radius:50%;
        z-index:2147483646;
        display:none;
        pointer-events:none;
        background:${trailColor};
        opacity:${opacity};
        transform:translate(-50%,-50%);
      `;

      document.body.appendChild(
        dot
      );

      trail.push({
        el:dot,
        x:-100,
        y:-100
      });
    }
  }

  let mouseX = -100;
  let mouseY = -100;

  let currentX = -100;
  let currentY = -100;

  let active = false;

  const move =
    event => {

      mouseX =
        event.clientX;

      mouseY =
        event.clientY;

      active = true;

      cursor.style.display =
        "block";

      trail.forEach(
        item =>
          item.el.style.display =
            "block"
      );
    };

  window.addEventListener(
    "mousemove",
    move,
    { passive:true }
  );

  window.addEventListener(
    "mouseleave",
    () => {

      active = false;

      cursor.style.display =
        "none";

      trail.forEach(
        item =>
          item.el.style.display =
            "none"
      );
    }
  );

  function animate() {

    currentX +=
      (
        mouseX -
        currentX
      ) * .38;

    currentY +=
      (
        mouseY -
        currentY
      ) * .38;

    if (active) {

      cursor.style.left =
        currentX + "px";

      cursor.style.top =
        currentY + "px";
    }

    let previousX =
      currentX;

    let previousY =
      currentY;

    trail.forEach(
      item => {

        item.x +=
          (
            previousX -
            item.x
          ) * .25;

        item.y +=
          (
            previousY -
            item.y
          ) * .25;

        item.el.style.left =
          item.x + "px";

        item.el.style.top =
          item.y + "px";

        previousX =
          item.x;

        previousY =
          item.y;
      }
    );

    requestAnimationFrame(
      animate
    );
  }

  animate();
}

/*
=========================================================
ERRO
=========================================================
*/

load().catch(error => {

  console.error(error);

  document
    .querySelector(
      ".load-error"
    )
    ?.remove();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="load-error">
        Não foi possível carregar o conteúdo.
        Verifique content/site.json e
        content/rules.json.
        <br>
        <small>
          ${escapeHtml(
            error.message
          )}
        </small>
      </div>
    `
  );
});
