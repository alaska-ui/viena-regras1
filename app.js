const state = {
  site: null,
  data: null
};

/* =========================================================
   UTILIDADES
========================================================= */

const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function assetUrl(path) {
  if (!path) return "";

  path = String(path);

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return path.replace(/^\/+/, "./");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function categoryId(category, index) {
  return String(
    category?.id ||
    slugify(category?.name || category?.short) ||
    `categoria-${index + 1}`
  );
}

function categoryIndexById(id) {
  return state.data.categories.findIndex(
    (category, index) => categoryId(category, index) === id
  );
}

/* =========================================================
   MARKDOWN SIMPLES E SEGURO
   Permite:
   **negrito**
   *itálico*
   # títulos
   - listas
   > caixas
========================================================= */

function inlineMarkdown(value) {
  let text = escapeHtml(value);

  text = text.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
    '<img src="$2" alt="$1" class="md-inline-image">'
  );

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  text = text.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  );

  text = text.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );

  text = text.replace(
    /__([^_]+)__/g,
    "<strong>$1</strong>"
  );

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

function renderMarkdown(markdown) {
  if (!markdown) return "";

  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const output = [];

  let inList = false;
  let listType = null;
  let inQuote = false;
  let quoteLines = [];

  function closeList() {
    if (!inList) return;
    output.push(listType === "ol" ? "</ol>" : "</ul>");
    inList = false;
    listType = null;
  }

  function closeQuote() {
    if (!inQuote) return;

    const raw = quoteLines.join("\n").trim();

    let type = "info";
    let icon = "ℹ️";
    let title = "OBSERVAÇÃO";

    if (/^(⚠️|⚠|ATENÇÃO|ATENCAO)/i.test(raw)) {
      type = "warning";
      icon = "⚠️";
      title = "ATENÇÃO";
    } else if (/^(❌|⛔|PROIBIDO|ERRO)/i.test(raw)) {
      type = "danger";
      icon = "❌";
      title = "PROIBIDO";
    } else if (/^(✅|PERMITIDO|OK)/i.test(raw)) {
      type = "success";
      icon = "✓";
      title = "PERMITIDO";
    }

    let content = raw
      .replace(/^(⚠️|⚠|ℹ️|❌|⛔|✅)\s*/u, "")
      .replace(/^(ATENÇÃO|ATENCAO|OBSERVAÇÃO|OBSERVACAO|PROIBIDO|PERMITIDO|ERRO|OK)\s*:?\s*/i, "")
      .trim();

    const firstLine = content.split("\n")[0] || "";
    const titleMatch = firstLine.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);

    if (titleMatch) {
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
          ${
            content
              ? `<div>${renderMarkdown(content)}</div>`
              : ""
          }
        </div>
      </div>
    `);

    inQuote = false;
    quoteLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith(">")) {
      closeList();

      if (!inQuote) {
        inQuote = true;
        quoteLines = [];
      }

      quoteLines.push(
        trimmed.replace(/^>\s?/, "")
      );

      continue;
    }

    if (inQuote) closeQuote();

    if (!trimmed) {
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      closeList();

      const level = heading[1].length;
      output.push(
        `<h${level + 2} class="md-heading">${inlineMarkdown(heading[2])}</h${level + 2}>`
      );
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);

    if (unordered) {
      if (!inList || listType !== "ul") {
        closeList();
        output.push("<ul>");
        inList = true;
        listType = "ul";
      }

      output.push(`<li>${inlineMarkdown(unordered[1])}</li>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (ordered) {
      if (!inList || listType !== "ol") {
        closeList();
        output.push("<ol>");
        inList = true;
        listType = "ol";
      }

      output.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    closeList();

    output.push(
      `<p>${inlineMarkdown(line)}</p>`
    );
  }

  if (inQuote) closeQuote();
  closeList();

  return output.join("");
}

/* =========================================================
   CARREGAMENTO
========================================================= */

async function load() {
  const [siteResponse, rulesResponse] = await Promise.all([
    fetch("./content/site.json").then(response => response.json()),
    fetch("./content/rules.json").then(response => response.json())
  ]);

  state.site = siteResponse || {};

  state.data = rulesResponse || {
    categories: [],
    updates: []
  };

  if (!Array.isArray(state.data.categories)) {
    state.data.categories = [];
  }

  if (!Array.isArray(state.data.updates)) {
    state.data.updates = [];
  }

  applySite();
  renderNav();
  renderHome();
  setupCursor();
  setupFallingLetters();

  route(
    location.hash.replace("#", "") || "inicio"
  );
}

/* =========================================================
   SITE / CONFIGURAÇÕES
========================================================= */

function applySite() {
  const s = state.site || {};
  const t = s.theme || {};

  for (const [key, value] of Object.entries(t)) {
    if (!value) continue;

    document.documentElement.style.setProperty(
      "--" + (key === "accent_light" ? "accent2" : key),
      value
    );
  }

  const logo =
    assetUrl(s.logo) ||
    "./logo-viena.png";

  if ($("headerLogo")) {
    $("headerLogo").src = logo;
    $("headerLogo").alt =
      s.site_name || "Viena Roleplay";
  }

  if ($("favicon")) {
    $("favicon").href =
      assetUrl(s.favicon) || logo;
  }

  if ($("brandTitle")) {
    $("brandTitle").textContent =
      s.site_title || "CÓDIGO DA RUA";
  }

  if ($("brandSite")) {
    $("brandSite").textContent =
      (s.site_name || "VIENA ROLEPLAY").toUpperCase();
  }

  if ($("heroEyebrow")) {
    $("heroEyebrow").textContent =
      s.hero_eyebrow || "";
  }

  if ($("heroTitle")) {
    $("heroTitle").textContent =
      s.hero_title || "";
  }

  if ($("heroText")) {
    $("heroText").textContent =
      s.hero_text || "";
  }

  if ($("noticeTitle")) {
    $("noticeTitle").textContent =
      s.notice_title || "";
  }

  if ($("noticeText")) {
    $("noticeText").textContent =
      s.notice_text || "";
  }

  if ($("footerText")) {
    $("footerText").textContent =
      s.footer_text || "";
  }

  if ($("discordBtn")) {
    $("discordBtn").href =
      s.discord_url || "#";
  }

  const layout = s.layout || {};

  if ($("notice")) {
    $("notice").style.display =
      layout.show_notice === false ? "none" : "flex";
  }

  if ($("updatesWrap")) {
    $("updatesWrap").style.display =
      layout.show_updates === false ? "none" : "block";
  }

  if ($("searchOpen")) {
    $("searchOpen").style.display =
      layout.show_search === false ? "none" : "block";
  }

  /* IMAGEM DA CAPA COMO FUNDO */
  const hero = document.querySelector(".hero");
  const heroImage = assetUrl(s.hero_image);

  if (hero) {
    if (
      heroImage &&
      layout.show_hero_image !== false
    ) {
      hero.style.setProperty(
        "--hero-image",
        `url("${heroImage}")`
      );

      hero.classList.add("has-image");
    } else {
      hero.style.setProperty(
        "--hero-image",
        "none"
      );

      hero.classList.remove("has-image");
    }
  }

  if ($("heroArt")) {
    $("heroArt").style.display = "none";
  }

  if ($("heroImage") && heroImage) {
    $("heroImage").src = heroImage;
  }
}

/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav() {
  const nav = $("nav");
  if (!nav) return;

  nav.innerHTML = state.data.categories
    .map((category, index) => {
      const id = categoryId(category, index);
      const code = category.code || String(index + 1).padStart(2, "0");
      const short =
        category.short ||
        category.name ||
        `Categoria ${index + 1}`;

      return `
        <button
          data-route="${escapeAttr(id)}"
          type="button"
        >
          <span>${escapeHtml(code)}</span>
          ${escapeHtml(short)}
        </button>
      `;
    })
    .join("");
}

/* =========================================================
   MAPA DA RUA
   IMPORTANTE:
   A imagem da categoria NÃO aparece aqui.
========================================================= */

function renderHome() {
  const home = $("homeCategories");

  if (home) {
    home.innerHTML = state.data.categories
      .map((category, index) => {
        const id = categoryId(category, index);
        const code =
          category.code ||
          String(index + 1).padStart(2, "0");

        const title =
          category.short ||
          category.name ||
          `Categoria ${index + 1}`;

        const description =
          category.desc || "";

        return `
          <article
            class="cat-card"
            data-route="${escapeAttr(id)}"
            tabindex="0"
          >
            <div class="num">
              ${escapeHtml(code)} / VIENA
            </div>

            <h3>
              ${escapeHtml(title)}
            </h3>

            ${
              description
                ? `<p>${escapeHtml(description)}</p>`
                : ""
            }
          </article>
        `;
      })
      .join("");

    home.querySelectorAll("[data-route]").forEach(card => {
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
    });
  }

  const updatesList = $("updatesList");
  if (!updatesList) return;

  updatesList.innerHTML =
    (state.data.updates || [])
      .map(item => {
        const date = item.date || "";
        const title = item.title || "";
        const text = item.text || "";
        const tag = item.tag || "";

        return `
          <div class="update">
            ${date ? `<time>${escapeHtml(date)}</time>` : "<time></time>"}

            ${
              title || text
                ? `
                  <strong>
                    ${escapeHtml(title)}
                    ${title && text ? " — " : ""}
                    ${escapeHtml(text)}
                  </strong>
                `
                : "<strong></strong>"
            }

            ${
              tag
                ? `<span>${escapeHtml(tag)}</span>`
                : "<span></span>"
            }
          </div>
        `;
      })
      .join("");
}

/* =========================================================
   TODAS AS REGRAS
========================================================= */

function allRules() {
  return state.data.categories.flatMap(
    (category, categoryIndex) => {
      const rules =
        Array.isArray(category.rules)
          ? category.rules
          : [];

      return rules.map((rule, ruleIndex) => ({
        cat: category,
        catIndex: categoryIndex,
        ruleIndex,
        ...rule
      }));
    }
  );
}

/* =========================================================
   PÁGINA DA CATEGORIA
========================================================= */

function renderCategory(id) {
  const categoryIndex = categoryIndexById(id);

  if (categoryIndex < 0) return;

  const category =
    state.data.categories[categoryIndex];

  if ($("catCode")) {
    $("catCode").textContent =
      category.code
        ? `CÓDIGO ${category.code}`
        : "";
  }

  if ($("catTitle")) {
    $("catTitle").textContent =
      category.name ||
      category.short ||
      `Categoria ${categoryIndex + 1}`;
  }

  if ($("catDesc")) {
    $("catDesc").textContent =
      category.desc || "";
  }

  const categoryImage =
    assetUrl(category.image);

  const categoryHero =
    $("categoryHero");

  if (categoryHero) {
    if (categoryImage) {
      categoryHero.style.setProperty(
        "--category-image",
        `url("${categoryImage}")`
      );

      categoryHero.classList.add("has-image");
    } else {
      categoryHero.style.setProperty(
        "--category-image",
        "none"
      );

      categoryHero.classList.remove("has-image");
    }
  }

  const rules =
    Array.isArray(category.rules)
      ? category.rules
      : [];

  const ruleList = $("ruleList");

  if (ruleList) {
    if (!rules.length) {
      ruleList.innerHTML = `
        <div class="empty-rules">
          <strong>NENHUMA REGRA CADASTRADA</strong>
          <p>Esta categoria ainda não possui regras publicadas.</p>
        </div>
      `;
    } else {
      ruleList.innerHTML =
        rules.map((rule, index) => {
          const code = rule.code || "";
          const title = rule.title || "";
          const text = rule.text || "";
          const tag = rule.tag || "";
          const image = assetUrl(rule.image);

          return `
            <article
              class="rule"
              id="rule-${index}"
            >
              <div class="rule-top">
                ${
                  code
                    ? `<div class="rule-num">${escapeHtml(code)}</div>`
                    : `<div class="rule-num"></div>`
                }

                <div class="rule-content">
                  ${
                    title
                      ? `<h3>${escapeHtml(title)}</h3>`
                      : ""
                  }

                  ${
                    text
                      ? `<div class="rule-markdown">${renderMarkdown(text)}</div>`
                      : ""
                  }

                  ${
                    tag
                      ? `<span class="tag">${escapeHtml(tag)}</span>`
                      : ""
                  }

                  ${
                    image
                      ? `
                        <img
                          class="rule-image"
                          src="${escapeAttr(image)}"
                          alt=""
                          loading="lazy"
                        >
                      `
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

  if (ruleToc) {
    if (!rules.length) {
      ruleToc.innerHTML = "";
    } else {
      ruleToc.innerHTML =
        `
          <strong>NESTA CATEGORIA</strong>
        ` +
        rules
          .map((rule, index) => {
            const code = rule.code || "";
            const title = rule.title || "Regra";

            return `
              <button
                type="button"
                data-scroll-rule="${index}"
              >
                ${escapeHtml(code)}
                ${
                  code && title
                    ? " — "
                    : ""
                }
                ${escapeHtml(title)}
              </button>
            `;
          })
          .join("");

      ruleToc
        .querySelectorAll("[data-scroll-rule]")
        .forEach(button => {
          button.addEventListener("click", () => {
            const index =
              button.dataset.scrollRule;

            const element =
              document.getElementById(
                `rule-${index}`
              );

            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center"
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

function renderCategoryNavigation(currentIndex) {
  const navigation =
    $("categoryNavigation");

  if (!navigation) return;

  const total =
    state.data.categories.length;

  const previousIndex =
    currentIndex > 0
      ? currentIndex - 1
      : null;

  const nextIndex =
    currentIndex < total - 1
      ? currentIndex + 1
      : null;

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
              data-route="${escapeAttr(categoryId(previousCategory, previousIndex))}"
            >
              <span>← ANTERIOR</span>
              <strong>
                ${escapeHtml(
                  previousCategory.short ||
                  previousCategory.name ||
                  "Categoria anterior"
                )}
              </strong>
            </button>
          `
          : `
            <div></div>
          `
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
              data-route="${escapeAttr(categoryId(nextCategory, nextIndex))}"
            >
              <span>PRÓXIMA →</span>
              <strong>
                ${escapeHtml(
                  nextCategory.short ||
                  nextCategory.name ||
                  "Próxima categoria"
                )}
              </strong>
            </button>
          `
          : `
            <div></div>
          `
      }
    </div>
  `;
}

/* =========================================================
   PESQUISA
========================================================= */

function search(query, target) {
  if (!target) return;

  const q =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) {
    target.innerHTML = "";
    return;
  }

  const results =
    allRules()
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
      .slice(0, 30);

  target.innerHTML =
    results.length
      ? results
          .map(rule => {
            const categoryRoute =
              categoryId(
                rule.cat,
                rule.catIndex
              );

            return `
              <div
                class="result"
                data-route="${escapeAttr(categoryRoute)}"
              >
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

                <h3>
                  ${escapeHtml(rule.title || "")}
                </h3>

                <p>
                  ${escapeHtml(
                    String(rule.text || "")
                      .replace(/[#>*_`]/g, "")
                      .slice(0, 240)
                  )}
                </p>
              </div>
            `;
          })
          .join("")
      : `
          <div class="result">
            <h3>Nenhuma regra encontrada.</h3>
            <p>Tente outra palavra.</p>
          </div>
        `;

  target
    .querySelectorAll("[data-route]")
    .forEach(result => {
      result.addEventListener("click", () => {
        const routeId =
          result.dataset.route;

        route(routeId);

        history.replaceState(
          null,
          "",
          "#" + routeId
        );
      });
    });
}

/* =========================================================
   ROTAS
========================================================= */

function route(id) {
  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  if (id === "inicio") {
    $("inicio")?.classList.add("active");

  } else if (id === "pesquisa") {
    $("searchPage")?.classList.add("active");

    setTimeout(() => {
      $("searchInput")?.focus();
    }, 50);

  } else {
    const exists =
      categoryIndexById(id) >= 0;

    if (!exists) {
      $("inicio")?.classList.add("active");
      id = "inicio";
    } else {
      $("categoryPage")?.classList.add("active");
      renderCategory(id);
    }
  }

  document
    .querySelectorAll(".sidebar nav button")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.route === id
      );
    });

  $("sidebar")?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   CLIQUES DE NAVEGAÇÃO
========================================================= */

document.addEventListener("click", event => {
  const target =
    event.target.closest("[data-route]");

  if (!target) return;

  if (
    target.tagName === "A" &&
    target.getAttribute("target") === "_blank"
  ) {
    return;
  }

  event.preventDefault();

  const routeId =
    target.dataset.route;

  if (!routeId) return;

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

$("searchOpen")?.addEventListener("click", () => {
  $("searchOverlay")?.classList.add("open");
  $("overlaySearch")?.focus();
});

$("searchClose")?.addEventListener("click", () => {
  $("searchOverlay")?.classList.remove("open");
});

$("searchOverlay")?.addEventListener("click", event => {
  if (event.target === $("searchOverlay")) {
    $("searchOverlay")?.classList.remove("open");
  }
});

$("overlaySearch")?.addEventListener("input", event => {
  search(
    event.target.value,
    $("overlayResults")
  );
});

$("searchInput")?.addEventListener("input", event => {
  search(
    event.target.value,
    $("searchResults")
  );
});

/* ESC fecha pesquisa */
document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    $("searchOverlay")?.classList.contains("open")
  ) {
    $("searchOverlay").classList.remove("open");
  }
});

/* =========================================================
   MENU MOBILE
========================================================= */

$("mobileMenu")?.addEventListener("click", () => {
  $("sidebar")?.classList.toggle("open");
});

/* =========================================================
   HASH
========================================================= */

window.addEventListener("hashchange", () => {
  route(
    location.hash.replace("#", "") ||
    "inicio"
  );
});

/* =========================================================
   CURSOR PERSONALIZADO
   Mantém a LOGO no cursor + rastro.
========================================================= */

function setupCursor() {
  const config =
    state.site?.cursor || {};

  const cursor =
    $("customCursor");

  const dot =
    $("cursorDot");

  if (!cursor) return;

  if (config.enabled === false) {
    document.documentElement.classList.remove(
      "viena-cursor-active"
    );

    cursor.style.display = "none";

    if (dot) {
      dot.style.display = "none";
    }

    return;
  }

  document.documentElement.classList.add(
    "viena-cursor-active"
  );

  cursor.style.display = "block";

  const cursorImage =
    assetUrl(config.image) ||
    assetUrl(state.site?.logo) ||
    "./logo-viena.png";

  const size =
    Math.max(
      12,
      Math.min(
        96,
        Number(config.size) || 34
      )
    );

  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  cursor.style.backgroundImage =
    `url("${cursorImage}")`;

  const trailEnabled =
    config.trail_enabled !== false;

  const trailColor =
    config.trail_color ||
    "#e50914";

  const trailCount =
    Math.max(
      2,
      Math.min(
        30,
        Number(config.trail_count) || 10
      )
    );

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let lastTrail = 0;

  document.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (dot) {
      dot.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }

    createTrail(
      mouseX,
      mouseY
    );
  });

  function animateCursor() {
    cursorX +=
      (mouseX - cursorX) * 0.20;

    cursorY +=
      (mouseY - cursorY) * 0.20;

    cursor.style.transform =
      `translate3d(
        ${cursorX - size / 2}px,
        ${cursorY - size / 2}px,
        0
      )`;

    requestAnimationFrame(
      animateCursor
    );
  }

  animateCursor();

  function createTrail(x, y) {
    if (!trailEnabled) return;

    const now = Date.now();

    if (
      now - lastTrail <
      Math.max(
        18,
        80 - trailCount * 2
      )
    ) {
      return;
    }

    lastTrail = now;

    const particle =
      document.createElement("span");

    particle.className =
      "cursor-trail";

    particle.style.left =
      `${x}px`;

    particle.style.top =
      `${y}px`;

    particle.style.background =
      trailColor;

    particle.style.setProperty(
      "--trail-size",
      `${3 + Math.random() * 4}px`
    );

    document.body.appendChild(
      particle
    );

    requestAnimationFrame(() => {
      particle.classList.add("fade");
    });

    setTimeout(() => {
      particle.remove();
    }, 650);
  }
}

/* =========================================================
   LETRINHAS CAINDO
========================================================= */

function setupFallingLetters() {
  const container =
    $("fallingLetters");

  if (!container) return;

  const letters =
    "VIENA • CÓDIGO DA RUA • RP • 01 • 02 • 03 • ";

  const amount =
    window.innerWidth < 700
      ? 18
      : 34;

  container.innerHTML = "";

  for (let i = 0; i < amount; i++) {
    const span =
      document.createElement("span");

    span.className =
      "falling-letter";

    span.textContent =
      letters[
        Math.floor(
          Math.random() * letters.length
        )
      ];

    span.style.left =
      `${Math.random() * 100}%`;

    span.style.animationDuration =
      `${8 + Math.random() * 15}s`;

    span.style.animationDelay =
      `${-Math.random() * 18}s`;

    span.style.fontSize =
      `${9 + Math.random() * 13}px`;

    span.style.opacity =
      `${0.04 + Math.random() * 0.09}`;

    container.appendChild(
      span
    );
  }
}

/* =========================================================
   ERRO DE CARREGAMENTO
========================================================= */

load().catch(error => {
  console.error(
    "Erro ao carregar o site:",
    error
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="load-error">
        Não foi possível carregar o conteúdo.
        Verifique se
        content/site.json e
        content/rules.json
        foram enviados corretamente.
      </div>
    `
  );
});
