/* =========================================================
   VIENA RP — APP.JS
========================================================= */

const state = {
  site: null,
  data: null
};

const $ = id => document.getElementById(id);


/* =========================================================
   CONVERTER CAMINHOS DO ADMIN PARA GITHUB PAGES
========================================================= */

function assetUrl(value) {

  if (!value) return "";

  value = String(value).trim();

  if (!value) return "";

  /*
    Se o Admin salvou:

    /uploads/imagem.png

    o GitHub Pages precisa procurar:

    ./uploads/imagem.png

    dentro do repositório.
  */

  if (value.startsWith("/uploads/")) {
    return "./uploads/" + value.substring(9);
  }

  /*
    Caso o Admin tenha salvo /logo-viena.png
  */

  if (
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return "." + value;
  }

  return value;
}


/* =========================================================
   CARREGAR JSON
========================================================= */

async function load() {

  try {

    const [siteResponse, rulesResponse] =
      await Promise.all([

        fetch("./content/site.json", {
          cache: "no-store"
        }),

        fetch("./content/rules.json", {
          cache: "no-store"
        })

      ]);


    if (!siteResponse.ok) {
      throw new Error(
        "content/site.json não encontrado."
      );
    }

    if (!rulesResponse.ok) {
      throw new Error(
        "content/rules.json não encontrado."
      );
    }


    state.site =
      await siteResponse.json();

    state.data =
      await rulesResponse.json();


    applySite();

    renderNav();

    renderHome();

    setupCursor();

    setupEvents();


    route(
      location.hash.replace("#", "")
      || "inicio"
    );

  }

  catch (error) {

    console.error(error);

    showError(error.message);

  }

}


/* =========================================================
   CONFIGURAÇÕES DO SITE
========================================================= */

function applySite() {

  const s = state.site || {};

  const theme =
    s.theme || {};


  /* CORES */

  for (
    const [key, value]
    of Object.entries(theme)
  ) {

    document.documentElement
      .style
      .setProperty(
        "--" +
        (
          key === "accent_light"
            ? "accent2"
            : key
        ),
        value
      );

  }


  /* LOGO */

  const logo =
    assetUrl(
      s.logo ||
      s.logo_url ||
      "logo-viena.png"
    );


  if ($("headerLogo")) {

    $("headerLogo").src = logo;

    $("headerLogo").alt =
      s.site_name ||
      "Viena Roleplay";

  }


  /* FAVICON */

  if ($("favicon")) {

    $("favicon").href =
      logo;

  }


  /* TÍTULOS */

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
    "CENTRAL OFICIAL DE REGRAS";


  $("heroTitle").textContent =
    s.hero_title ||
    "O CÓDIGO DA RUA.";


  $("heroText").textContent =
    s.hero_text ||
    "As regras que mantêm Viena viva. Leia, entenda e faça parte da história.";


  $("noticeTitle").textContent =
    s.notice_title ||
    "LEIA ANTES DE JOGAR";


  $("noticeText").textContent =
    s.notice_text ||
    "Desconhecer uma regra não isenta o jogador de sua responsabilidade.";


  $("footerText").textContent =
    s.footer_text ||
    "© 2026 Viena Roleplay · Todos os direitos reservados.";


  /* DISCORD */

  const discord =
    s.discord_url ||
    s.discord ||
    "#";


  $("discordBtn").href =
    discord;


  $("discordBtn").target =
    "_blank";


  $("discordBtn").rel =
    "noopener noreferrer";


  /*
    IMPORTANTE:

    Não deixar o Discord ser capturado
    pelo sistema data-route.
  */

  $("discordBtn")
    .removeAttribute("data-route");


  /* AVISO */

  $("notice").style.display =
    s.layout?.show_notice === false
      ? "none"
      : "flex";


  /* ATUALIZAÇÕES */

  $("updatesWrap").style.display =
    s.layout?.show_updates === false
      ? "none"
      : "block";


  /* PESQUISA */

  $("searchOpen").style.display =
    s.layout?.show_search === false
      ? "none"
      : "block";


  /* =======================================================
     IMAGEM DA CAPA
  ======================================================= */

  const heroImage =
    assetUrl(
      s.hero_image ||
      s.heroImage ||
      s.cover_image ||
      s.cover ||
      ""
    );


  const heroBackground =
    $("heroBackground");


  if (
    heroImage &&
    s.layout?.show_hero_image !== false
  ) {

    heroBackground.style.backgroundImage =
      `url("${heroImage}")`;

    heroBackground.style.display =
      "block";

  }

  else {

    heroBackground.style.backgroundImage =
      "none";

    heroBackground.style.display =
      "none";

  }


  /* =======================================================
     CURSOR
  ======================================================= */

  setupCursorConfig(s);

}


/* =========================================================
   CONFIGURAR CURSOR
========================================================= */

function setupCursorConfig(s) {

  const cursor =
    $("customCursor");

  if (!cursor) return;


  const cursorConfig =
    s.cursor ||
    s.cursor_settings ||
    {};


  /*
    Aceita vários nomes para funcionar
    com diferentes versões do Admin.
  */

  const enabled =
    cursorConfig.enabled !== false &&
    s.cursor_enabled !== false;


  const icon =
    cursorConfig.icon ||
    cursorConfig.image ||
    s.cursor_icon ||
    s.cursor_image ||
    s.cursor ||
    "";


  const size =
    Number(
      cursorConfig.size ||
      s.cursor_size ||
      34
    );


  document.documentElement
    .style
    .setProperty(
      "--cursor-size",
      Math.max(12, Math.min(size, 100))
      + "px"
    );


  if (!enabled) {

    cursor.style.display =
      "none";

    document.body.style.cursor =
      "auto";

    return;
  }


  cursor.style.display =
    "block";


  cursor.classList.remove(
    "fallback"
  );


  if (icon) {

    const url =
      assetUrl(icon);


    cursor.style.backgroundImage =
      `url("${url}")`;

  }

  else {

    cursor.classList.add(
      "fallback"
    );

  }


  /*
    TRAÇO
  */

  const trailEnabled =
    cursorConfig.trail === true ||
    s.cursor_trail === true;


  window.__cursorTrailEnabled =
    trailEnabled;

}


/* =========================================================
   CURSOR
========================================================= */

function setupCursor() {

  const cursor =
    $("customCursor");

  if (!cursor) return;


  let mouseX = -100;
  let mouseY = -100;

  let currentX = -100;
  let currentY = -100;


  document.addEventListener(
    "mousemove",
    event => {

      mouseX =
        event.clientX;

      mouseY =
        event.clientY;

      /*
        O cursor funciona no SITE INTEIRO.

        Não está preso à Home.
      */

      cursor.style.left =
        mouseX + "px";

      cursor.style.top =
        mouseY + "px";

    },
    {
      passive: true
    }
  );


  /*
    Hover global

    Funciona:
    Home
    Categorias
    Pesquisa
    Menu
    Botões
    Links
    etc.
  */

  document.addEventListener(
    "mouseover",
    event => {

      const target =
        event.target.closest(
          "a, button, input, .cat-card, .result"
        );


      if (target) {

        cursor.classList.add(
          "hover"
        );

      }

    }
  );


  document.addEventListener(
    "mouseout",
    event => {

      const target =
        event.target.closest(
          "a, button, input, .cat-card, .result"
        );


      if (target) {

        cursor.classList.remove(
          "hover"
        );

      }

    }
  );


  /*
    ESCONDER QUANDO SAI DA JANELA
  */

  document.addEventListener(
    "mouseleave",
    () => {

      cursor.style.opacity =
        "0";

    }
  );


  document.addEventListener(
    "mouseenter",
    () => {

      cursor.style.opacity =
        "1";

    }
  );


  /*
    TRAÇO
  */

  document.addEventListener(
    "mousemove",
    event => {

      if (
        !window.__cursorTrailEnabled
      ) return;


      createTrailDot(
        event.clientX,
        event.clientY
      );

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   TRAÇO
========================================================= */

function createTrailDot(x, y) {

  const dot =
    document.createElement("div");

  dot.className =
    "cursor-trail-dot";


  dot.style.left =
    x + "px";


  dot.style.top =
    y + "px";


  document.body.appendChild(dot);


  setTimeout(() => {

    dot.style.opacity =
      "0";

    dot.style.transform =
      "translate(-50%, -50%) scale(.3)";

  }, 20);


  setTimeout(() => {

    dot.remove();

  }, 500);

}


/* =========================================================
   MENU
========================================================= */

function setupEvents() {

  /*
    BOTÕES DATA-ROUTE
  */

  document.addEventListener(
    "click",
    event => {

      const target =
        event.target.closest(
          "[data-route]"
        );


      if (!target) return;


      event.preventDefault();


      const routeId =
        target.dataset.route;


      route(routeId);


      history.replaceState(
        null,
        "",
        "#" + routeId
      );

    }
  );


  /*
    PESQUISA
  */

  $("searchOpen").onclick =
    () => {

      $("searchOverlay")
        .classList.add("open");

      setTimeout(() => {

        $("overlaySearch")
          .focus();

      }, 50);

    };


  $("searchClose").onclick =
    () => {

      $("searchOverlay")
        .classList.remove("open");

    };


  $("overlaySearch").oninput =
    event => {

      search(
        event.target.value,
        $("overlayResults")
      );

    };


  $("searchInput").oninput =
    event => {

      search(
        event.target.value,
        $("searchResults")
      );

    };


  /*
    ESC
  */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        $("searchOverlay")
          .classList.remove("open");

      }

    }
  );


  /*
    FECHAR OVERLAY CLICANDO FORA
  */

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


  /*
    HASH
  */

  window.addEventListener(
    "hashchange",
    () => {

      route(
        location.hash.replace("#", "")
        || "inicio"
      );

    }
  );

}


/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav() {

  const categories =
    state.data?.categories || [];


  $("nav").innerHTML =
    categories
      .map(category => `

        <button
          type="button"
          data-route="${category.id}"
        >

          <span>
            ${category.code}
          </span>

          ${category.short}

        </button>

      `)
      .join("");

}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

  const categories =
    state.data?.categories || [];


  $("homeCategories").innerHTML =
    categories
      .map(category => `

        <article
          class="cat-card"
          data-route="${category.id}"
        >

          <div class="num">

            ${category.code}
            / VIENA

          </div>


          ${
            category.image

              ? `

                <img
                  class="card-image"
                  src="${assetUrl(category.image)}"
                  alt=""
                >

              `

              : ""
          }


          <h3>
            ${category.short}
          </h3>


          <p>
            ${category.desc || ""}
          </p>

        </article>

      `)
      .join("");


  const updates =
    state.data?.updates || [];


  $("updatesList").innerHTML =
    updates
      .map(item => `

        <div class="update">

          <time>
            ${item.date || ""}
          </time>

          <strong>
            ${item.title || ""}
            ${
              item.text
                ? " — " + item.text
                : ""
            }
          </strong>

          <span>
            ${item.tag || ""}
          </span>

        </div>

      `)
      .join("");

}


/* =========================================================
   TODAS AS REGRAS
========================================================= */

function allRules() {

  return (
    state.data?.categories || []
  ).flatMap(category =>

    (category.rules || [])
      .map(rule => ({

        cat: category,

        ...rule

      }))

  );

}


/* =========================================================
   CATEGORIA
========================================================= */

function renderCategory(id) {

  const category =
    state.data.categories.find(
      item => item.id === id
    );


  if (!category) {

    route("inicio");

    return;

  }


  $("catCode").textContent =
    `CÓDIGO ${category.code}`;


  $("catTitle").textContent =
    category.name;


  $("catDesc").textContent =
    category.desc || "";


  /*
    IMAGEM DA CATEGORIA

    Se existir, usamos como fundo.
  */

  const categoryHero =
    $("categoryHero");


  if (category.image) {

    categoryHero.style.backgroundImage = `
      linear-gradient(
        90deg,
        rgba(5,5,5,.98),
        rgba(5,5,5,.70),
        rgba(5,5,5,.35)
      ),
      url("${assetUrl(category.image)}")
    `;

    categoryHero.style.backgroundSize =
      "cover";

    categoryHero.style.backgroundPosition =
      "center";

    categoryHero.style.padding =
      "70px 0";

  }

  else {

    categoryHero.style.backgroundImage =
      "none";

  }


  /*
    REGRAS
  */

  $("ruleList").innerHTML =
    (category.rules || [])
      .map((rule, index) => `

        <article
          class="rule"
          id="rule-${index}"
        >

          <div class="rule-top">

            <div class="rule-num">
              ${rule.code}
            </div>

            <div>

              <h3>
                ${rule.title}
              </h3>

              <p>
                ${rule.text || ""}
              </p>


              ${
                rule.tag

                  ? `

                    <span class="tag">
                      ${rule.tag}
                    </span>

                  `

                  : ""
              }


              ${
                rule.image

                  ? `

                    <img
                      class="rule-image"
                      src="${assetUrl(rule.image)}"
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


  /*
    TOC
  */

  $("ruleToc").innerHTML = `

    <strong>
      NESTA CATEGORIA
    </strong>

    ${
      (category.rules || [])
        .map(
          (rule, index) => `

            <button
              type="button"
              data-rule-index="${index}"
            >

              ${rule.code}
              —
              ${rule.title}

            </button>

          `
        )
        .join("")
    }

  `;


  /*
    TOC FUNCIONAL
  */

  $("ruleToc")
    .querySelectorAll(
      "[data-rule-index]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            button.dataset.ruleIndex;


          const element =
            document.getElementById(
              "rule-" + index
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


/* =========================================================
   PESQUISA
========================================================= */

function search(query, target) {

  query =
    query
      .trim()
      .toLowerCase();


  if (!query) {

    target.innerHTML =
      "";

    return;

  }


  const results =
    allRules()
      .filter(rule => `

        ${rule.cat.short}

        ${rule.cat.name}

        ${rule.cat.code}

        ${rule.title}

        ${rule.text}

        ${rule.tag}

      `
        .toLowerCase()
        .includes(query)
      )
      .slice(0, 30);


  if (!results.length) {

    target.innerHTML = `

      <div class="result">

        <h3>
          Nenhuma regra encontrada.
        </h3>

        <p>
          Tente outra palavra.
        </p>

      </div>

    `;

    return;

  }


  target.innerHTML =
    results
      .map(rule => `

        <div
          class="result"
          data-route="${rule.cat.id}"
        >

          <small>

            ${rule.cat.short}
            ·
            ${rule.cat.code}

          </small>


          <h3>
            ${rule.title}
          </h3>


          <p>
            ${rule.text || ""}
          </p>

        </div>

      `)
      .join("");

}


/* =========================================================
   ROTAS
========================================================= */

function route(id) {

  const pages =
    document.querySelectorAll(
      ".page"
    );


  pages.forEach(page => {

    page.classList.remove(
      "active"
    );

  });


  if (id === "inicio") {

    $("inicio")
      .classList.add("active");

  }

  else if (id === "pesquisa") {

    $("searchPage")
      .classList.add("active");

  }

  else {

    const exists =
      state.data?.categories?.some(
        category =>
          category.id === id
      );


    if (!exists) {

      $("inicio")
        .classList.add("active");

      id = "inicio";

    }

    else {

      $("categoryPage")
        .classList.add("active");

      renderCategory(id);

    }

  }


  /*
    ATUALIZAR MENU
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


  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


/* =========================================================
   ERRO
========================================================= */

function showError(message) {

  document.body.insertAdjacentHTML(
    "beforeend",

    `

      <div
        style="
          position:fixed;
          left:20px;
          right:20px;
          bottom:20px;
          z-index:999999;
          padding:20px;
          background:#120000;
          color:#fff;
          border:1px solid #ff1018;
          font-family:Arial,sans-serif;
        "
      >

        <strong>
          ERRO AO CARREGAR O SITE
        </strong>

        <br><br>

        ${message}

        <br><br>

        Verifique se
        <b>content/site.json</b>
        e
        <b>content/rules.json</b>
        existem.

      </div>

    `
  );

}


/* =========================================================
   INICIAR
========================================================= */

load();
