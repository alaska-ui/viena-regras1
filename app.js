const state = {
  site: null,
  data: null
};


/* =========================================================
   UTILIDADES
========================================================= */

const $ = id => document.getElementById(id);


/*
  Corrige caminhos de imagens vindos do Admin.

  O Sveltia salva normalmente:
  /uploads/imagem.png

  No GitHub Pages precisamos:
  ./uploads/imagem.png
*/
function assetUrl(path) {

  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return path.replace(/^\/+/, "./");
}


/* =========================================================
   CARREGAMENTO
========================================================= */

async function load() {

  const [siteResponse, rulesResponse] =
    await Promise.all([
      fetch("./content/site.json").then(r => r.json()),
      fetch("./content/rules.json").then(r => r.json())
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

  /*
    CORES
  */

  for (const [key, value] of Object.entries(t)) {

    if (!value) continue;

    document.documentElement.style.setProperty(
      "--" +
      (
        key === "accent_light"
          ? "accent2"
          : key
      ),
      value
    );
  }


  /*
    LOGO
  */

  const logo =
    assetUrl(s.logo) ||
    "./logo-viena.png";

  if ($("headerLogo")) {

    $("headerLogo").src = logo;

    $("headerLogo").alt =
      s.site_name ||
      "Viena Roleplay";
  }


  /*
    FAVICON
  */

  if ($("favicon")) {

    $("favicon").href =
      assetUrl(s.favicon) ||
      logo;
  }


  /*
    TÍTULOS
  */

  if ($("brandTitle")) {

    $("brandTitle").textContent =
      s.site_title ||
      "CÓDIGO DA RUA";
  }

  if ($("brandSite")) {

    $("brandSite").textContent =
      (
        s.site_name ||
        "VIENA ROLEPLAY"
      ).toUpperCase();
  }


  /*
    HERO
  */

  if ($("heroEyebrow")) {

    $("heroEyebrow").textContent =
      s.hero_eyebrow ||
      "";
  }

  if ($("heroTitle")) {

    $("heroTitle").textContent =
      s.hero_title ||
      "";
  }

  if ($("heroText")) {

    $("heroText").textContent =
      s.hero_text ||
      "";
  }


  /*
    AVISO
  */

  if ($("noticeTitle")) {

    $("noticeTitle").textContent =
      s.notice_title ||
      "";
  }

  if ($("noticeText")) {

    $("noticeText").textContent =
      s.notice_text ||
      "";
  }


  /*
    RODAPÉ
  */

  if ($("footerText")) {

    $("footerText").textContent =
      s.footer_text ||
      "";
  }


  /*
    DISCORD
  */

  if ($("discordBtn")) {

    $("discordBtn").href =
      s.discord_url ||
      "#";

    $("discordBtn").target =
      "_blank";

    $("discordBtn").rel =
      "noopener noreferrer";
  }


  /*
    ELEMENTOS VISÍVEIS
  */

  const layout =
    s.layout || {};


  if ($("notice")) {

    $("notice").style.display =
      layout.show_notice === false
        ? "none"
        : "flex";
  }


  if ($("updatesWrap")) {

    $("updatesWrap").style.display =
      layout.show_updates === false
        ? "none"
        : "block";
  }


  if ($("searchOpen")) {

    $("searchOpen").style.display =
      layout.show_search === false
        ? "none"
        : "block";
  }


  /*
    IMAGEM DA CAPA
  */

  const heroImage =
    assetUrl(s.hero_image);


  /*
    Mantém a imagem como fundo da área HERO.
    Isso evita transformar a imagem em um card
    separado.
  */

  const hero =
    document.querySelector(".hero");


  if (
    hero &&
    heroImage &&
    layout.show_hero_image !== false
  ) {

    hero.style.backgroundImage =
      `url("${heroImage}")`;

    hero.classList.add(
      "has-hero-background"
    );
  }


  /*
    Mantém o elemento antigo escondido.
    A imagem agora fica no fundo.
  */

  if ($("heroArt")) {

    $("heroArt").style.display =
      "none";
  }


  /*
    Caso exista heroImage no HTML,
    também atualiza para manter compatibilidade.
  */

  if ($("heroImage") && heroImage) {

    $("heroImage").src =
      heroImage;
  }
}


/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav() {

  const nav =
    $("nav");

  if (!nav) return;

  nav.innerHTML =
    state.data.categories
      .map(c => {

        const id =
          c.id || "";

        const code =
          c.code || "";

        const short =
          c.short ||
          c.name ||
          "";

        return `
          <button
            data-route="${id}"
            type="button"
          >
            <span>${code}</span>
            ${short}
          </button>
        `;
      })
      .join("");
}


/* =========================================================
   MAPA DA RUA
========================================================= */

function renderHome() {

  /*
    IMPORTANTE:

    AQUI NÃO EXISTE MAIS <img>.

    A imagem cadastrada na categoria NÃO aparece
    no mapa.

    O mapa mostra somente:
    - código
    - nome
    - descrição
  */

  const home =
    $("homeCategories");

  if (home) {

    home.innerHTML =
      state.data.categories
        .map(c => {

          const id =
            c.id || "";

          const code =
            c.code || "";

          const title =
            c.short ||
            c.name ||
            "";

          const description =
            c.desc ||
            "";

          return `
            <article
              class="cat-card"
              data-route="${id}"
            >

              <div class="num">
                ${code} / VIENA
              </div>

              <h3>
                ${title}
              </h3>

              ${
                description
                  ? `
                    <p>
                      ${description}
                    </p>
                  `
                  : ""
              }

            </article>
          `;
        })
        .join("");
  }


  /*
    ÚLTIMAS ALTERAÇÕES
  */

  const updatesList =
    $("updatesList");

  if (!updatesList) return;

  updatesList.innerHTML =
    (state.data.updates || [])
      .map(item => {

        const date =
          item.date || "";

        const title =
          item.title || "";

        const text =
          item.text || "";

        const tag =
          item.tag || "";

        return `
          <div class="update">

            ${
              date
                ? `
                  <time>
                    ${date}
                  </time>
                `
                : ""
            }

            ${
              title || text
                ? `
                  <strong>
                    ${title}
                    ${
                      title && text
                        ? " — "
                        : ""
                    }
                    ${text}
                  </strong>
                `
                : ""
            }

            ${
              tag
                ? `
                  <span>
                    ${tag}
                  </span>
                `
                : ""
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

  return state.data.categories
    .flatMap(category => {

      const rules =
        Array.isArray(category.rules)
          ? category.rules
          : [];

      return rules.map(rule => ({
        cat: category,
        ...rule
      }));
    });
}


/* =========================================================
   PÁGINA DA CATEGORIA
========================================================= */

function renderCategory(id) {

  const category =
    state.data.categories.find(
      item => item.id === id
    );


  if (!category) return;


  /*
    TÍTULO
  */

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
      "";
  }


  if ($("catDesc")) {

    $("catDesc").textContent =
      category.desc ||
      "";
  }


  /*
    IMAGEM DA CATEGORIA

    IMPORTANTE:

    A imagem NÃO aparece no mapa.

    Ela continua disponível SOMENTE
    dentro da página da categoria.
  */

  const categoryImage =
    assetUrl(category.image);


  if ($("catImage")) {

    if (categoryImage) {

      $("catImage").src =
        categoryImage;

      $("catImage").hidden =
        false;

    } else {

      $("catImage").hidden =
        true;

      $("catImage").removeAttribute(
        "src"
      );
    }
  }


  /*
    FUNDO DA CATEGORIA

    Caso seu HTML/CSS use #categoryHero,
    a imagem também pode funcionar como
    fundo da página da categoria.
  */

  const categoryHero =
    $("categoryHero");


  if (categoryHero) {

    if (categoryImage) {

      categoryHero.style.backgroundImage =
        `url("${categoryImage}")`;

      categoryHero.classList.add(
        "has-category-background"
      );

    } else {

      categoryHero.style.backgroundImage =
        "";

      categoryHero.classList.remove(
        "has-category-background"
      );
    }
  }


  /*
    REGRAS
  */

  const rules =
    Array.isArray(category.rules)
      ? category.rules
      : [];


  const ruleList =
    $("ruleList");


  if (ruleList) {

    ruleList.innerHTML =
      rules
        .map((rule, index) => {

          const code =
            rule.code || "";

          const title =
            rule.title || "";

          const text =
            rule.text || "";

          const tag =
            rule.tag || "";

          const image =
            assetUrl(rule.image);


          return `
            <article
              class="rule"
              id="rule-${index}"
            >

              <div class="rule-top">

                <div class="rule-num">
                  ${code}
                </div>

                <div>

                  ${
                    title
                      ? `
                        <h3>
                          ${title}
                        </h3>
                      `
                      : ""
                  }

                  ${
                    text
                      ? `
                        <p>
                          ${text}
                        </p>
                      `
                      : ""
                  }

                  ${
                    tag
                      ? `
                        <span class="tag">
                          ${tag}
                        </span>
                      `
                      : ""
                  }

                  ${
                    image
                      ? `
                        <br>

                        <img
                          class="rule-image"
                          src="${image}"
                          alt=""
                        >
                      `
                      : ""
                  }

                </div>

              </div>

            </article>
          `;
        })
        .join("");
  }


  /*
    ÍNDICE DA CATEGORIA
  */

  const ruleToc =
    $("ruleToc");


  if (ruleToc) {

    ruleToc.innerHTML =
      `
        <strong>
          NESTA CATEGORIA
        </strong>
      ` +
      rules
        .map((rule, index) => {

          const code =
            rule.code || "";

          const title =
            rule.title ||
            "Regra";

          return `
            <button
              type="button"
              data-scroll-rule="${index}"
            >
              ${code}
              ${
                code && title
                  ? " — "
                  : ""
              }
              ${title}
            </button>
          `;
        })
        .join("");


    /*
      Clique no índice
    */

    ruleToc
      .querySelectorAll(
        "[data-scroll-rule]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

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
          }
        );
      });
  }
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

    target.innerHTML =
      "";

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
        `
          .toLowerCase();

        return searchable.includes(q);
      })
      .slice(0, 30);


  target.innerHTML =
    results.length

      ? results
          .map(rule => {

            return `
              <div
                class="result"
                data-route="${rule.cat.id}"
              >

                <small>
                  ${
                    rule.cat.short ||
                    rule.cat.name ||
                    ""
                  }

                  ·

                  ${
                    rule.code ||
                    rule.cat.code ||
                    ""
                  }
                </small>

                <h3>
                  ${rule.title || ""}
                </h3>

                <p>
                  ${rule.text || ""}
                </p>

              </div>
            `;
          })
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


/* =========================================================
   ROTAS
========================================================= */

function route(id) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active"
      );
    });


  if (id === "inicio") {

    if ($("inicio")) {

      $("inicio")
        .classList.add("active");
    }


  } else if (id === "pesquisa") {

    if ($("searchPage")) {

      $("searchPage")
        .classList.add("active");
    }


    setTimeout(() => {

      if ($("searchInput")) {

        $("searchInput").focus();
      }

    }, 50);


  } else {

    if ($("categoryPage")) {

      $("categoryPage")
        .classList.add("active");
    }

    renderCategory(id);
  }


  /*
    MENU ATIVO
  */

  document
    .querySelectorAll(
      ".sidebar nav button"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.route === id
      );
    });


  /*
    FECHA MENU MOBILE
  */

  if ($("sidebar")) {

    $("sidebar")
      .classList.remove("open");
  }


  window.scrollTo(
    0,
    0
  );
}


/* =========================================================
   CLIQUES DE NAVEGAÇÃO
========================================================= */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-route]"
      );


    if (!target) return;


    /*
      Não interfere em links externos
      nem em elementos que não sejam
      botões de navegação.
    */

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
  }
);


/* =========================================================
   PESQUISA
========================================================= */

if ($("searchOpen")) {

  $("searchOpen").onclick =
    () => {

      if ($("searchOverlay")) {

        $("searchOverlay")
          .classList.add("open");
      }


      if ($("overlaySearch")) {

        $("overlaySearch")
          .focus();
      }
    };
}


if ($("searchClose")) {

  $("searchClose").onclick =
    () => {

      if ($("searchOverlay")) {

        $("searchOverlay")
          .classList.remove("open");
      }
    };
}


if ($("overlaySearch")) {

  $("overlaySearch").oninput =
    event => {

      search(
        event.target.value,
        $("overlayResults")
      );
    };
}


if ($("searchInput")) {

  $("searchInput").oninput =
    event => {

      search(
        event.target.value,
        $("searchResults")
      );
    };
}


/* =========================================================
   MENU MOBILE
========================================================= */

if ($("mobileMenu")) {

  $("mobileMenu").onclick =
    () => {

      if ($("sidebar")) {

        $("sidebar")
          .classList.toggle("open");
      }
    };
}


/* =========================================================
   HASH
========================================================= */

window.addEventListener(
  "hashchange",
  () => {

    route(
      location.hash.replace("#", "") ||
      "inicio"
    );
  }
);


/* =========================================================
   CURSOR PERSONALIZADO
========================================================= */

function setupCursor() {

  const config =
    state.site?.cursor || {};


  const cursor =
    $("customCursor");

  const dot =
    $("cursorDot");


  /*
    Se o cursor estiver desativado,
    remove os elementos visuais.
  */

  if (
    config.enabled === false
  ) {

    if (cursor) {

      cursor.style.display =
        "none";
    }

    if (dot) {

      dot.style.display =
        "none";
    }

    return;
  }


  if (!cursor) return;


  /*
    IMAGEM DO CURSOR

    Prioridade:
    1. imagem configurada no Admin
    2. logo da cidade
    3. logo padrão
  */

  const cursorImage =
    assetUrl(config.image) ||
    assetUrl(state.site?.logo) ||
    "./logo-viena.png";


  cursor.style.backgroundImage =
    `url("${cursorImage}")`;


  /*
    TAMANHO
  */

  const size =
    Number(config.size) || 34;


  cursor.style.width =
    `${size}px`;

  cursor.style.height =
    `${size}px`;


  cursor.style.backgroundSize =
    "contain";

  cursor.style.backgroundPosition =
    "center";

  cursor.style.backgroundRepeat =
    "no-repeat";


  /*
    NÃO DEIXA O CURSOR NATIVO
    INTERFERIR
  */

  cursor.style.pointerEvents =
    "none";


  if (dot) {

    dot.style.pointerEvents =
      "none";
  }


  /*
    POSIÇÃO
  */

  let mouseX = -100;
  let mouseY = -100;

  let cursorX = -100;
  let cursorY = -100;


  document.addEventListener(
    "mousemove",
    event => {

      mouseX =
        event.clientX;

      mouseY =
        event.clientY;


      if (dot) {

        dot.style.transform =
          `translate3d(
            ${mouseX}px,
            ${mouseY}px,
            0
          )`;
      }


      createTrail(
        mouseX,
        mouseY
      );
    }
  );


  /*
    MOVIMENTO SUAVE
  */

  function animateCursor() {

    cursorX +=
      (mouseX - cursorX) *
      0.18;

    cursorY +=
      (mouseY - cursorY) *
      0.18;


    cursor.style.transform =
      `
        translate3d(
          ${cursorX - size / 2}px,
          ${cursorY - size / 2}px,
          0
        )
      `;


    requestAnimationFrame(
      animateCursor
    );
  }


  animateCursor();


  /*
    RASTRO
  */

  const trailEnabled =
    config.trail_enabled !== false;


  const trailColor =
    config.trail_color ||
    "#e50914";


  const trailCount =
    Number(config.trail_count) ||
    10;


  let lastTrail =
    0;


  function createTrail(x, y) {

    if (!trailEnabled) return;


    const now =
      Date.now();


    /*
      Evita criar partículas demais.
    */

    if (
      now - lastTrail <
      35
    ) {
      return;
    }


    lastTrail =
      now;


    const particle =
      document.createElement(
        "span"
      );


    particle.className =
      "cursor-trail";


    particle.style.position =
      "fixed";

    particle.style.left =
      `${x}px`;

    particle.style.top =
      `${y}px`;

    particle.style.width =
      "5px";

    particle.style.height =
      "5px";

    particle.style.borderRadius =
      "50%";

    particle.style.background =
      trailColor;

    particle.style.pointerEvents =
      "none";

    particle.style.zIndex =
      "99998";

    particle.style.transform =
      "translate(-50%, -50%)";

    particle.style.opacity =
      "0.9";

    particle.style.transition =
      "opacity .5s ease, transform .5s ease";


    document.body.appendChild(
      particle
    );


    requestAnimationFrame(
      () => {

        particle.style.opacity =
          "0";

        particle.style.transform =
          "translate(-50%, -50%) scale(.2)";
      }
    );


    setTimeout(
      () => {

        particle.remove();

      },
      550
    );
  }
}


/* =========================================================
   ERRO DE CARREGAMENTO
========================================================= */

load().catch(
  error => {

    console.error(
      "Erro ao carregar o site:",
      error
    );


    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div
          style="
            position:fixed;
            bottom:0;
            left:0;
            right:0;
            background:#e50914;
            color:#fff;
            padding:12px;
            text-align:center;
            z-index:999999;
            font-family:Arial,sans-serif;
          "
        >
          Não foi possível carregar o conteúdo.
          Verifique se
          content/site.json e
          content/rules.json
          foram enviados corretamente.
        </div>
      `
    );
  }
);
