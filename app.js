const state = {
  site: null,
  data: null
};

const $ = id => document.getElementById(id);


/* =========================================================
   CARREGAMENTO
   ========================================================= */

async function load() {

  try {

    const [siteResponse, rulesResponse] =
      await Promise.all([
        fetch("content/site.json"),
        fetch("content/rules.json")
      ]);

    if (!siteResponse.ok) {
      throw new Error("Não foi possível carregar site.json");
    }

    if (!rulesResponse.ok) {
      throw new Error("Não foi possível carregar rules.json");
    }

    state.site = await siteResponse.json();
    state.data = await rulesResponse.json();

    applySite();
    renderNav();
    renderHome();

    route(
      location.hash.replace("#", "") || "inicio"
    );

  } catch (err) {

    console.error(err);

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
            padding:14px;
            text-align:center;
            z-index:99999;
            font-family:Arial,sans-serif;
          "
        >
          Não foi possível carregar o conteúdo.
          Verifique se content/site.json e
          content/rules.json existem.
        </div>
      `
    );
  }
}


/* =========================================================
   CONFIGURAÇÕES DO SITE
   ========================================================= */

function applySite() {

  const s = state.site;
  const t = s.theme || {};


  /* -------------------------------------------------------
     CORES
     ------------------------------------------------------- */

  for (const [key, value] of Object.entries(t)) {

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


  /* -------------------------------------------------------
     LOGO
     ------------------------------------------------------- */

  if ($("headerLogo")) {

    $("headerLogo").src =
      s.logo || "logo-viena.png";

    $("headerLogo").alt =
      s.site_name || "Viena Roleplay";
  }


  /* -------------------------------------------------------
     FAVICON
     ------------------------------------------------------- */

  if ($("favicon")) {

    $("favicon").href =
      s.favicon ||
      s.logo ||
      "logo-viena.png";
  }


  /* -------------------------------------------------------
     MARCA
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     HERO
     ------------------------------------------------------- */

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


  /*
   * IMAGEM DO HERO
   *
   * A imagem cadastrada no ADMIN agora vira
   * o FUNDO INTEIRO do Hero.
   */

  const hero =
    document.querySelector(".hero");


  if (hero) {

    if (
      s.hero_image &&
      s.layout?.show_hero_image !== false
    ) {

      hero.style.backgroundImage =
        `url("${s.hero_image}")`;

      hero.classList.add(
        "has-hero-background"
      );

    } else {

      hero.style.backgroundImage =
        "none";

      hero.classList.remove(
        "has-hero-background"
      );
    }
  }


  /*
   * Remove a imagem lateral antiga.
   */

  if ($("heroArt")) {

    $("heroArt").style.display =
      "none";
  }


  if ($("heroImage")) {

    $("heroImage").style.display =
      "none";
  }


  /* -------------------------------------------------------
     AVISO
     ------------------------------------------------------- */

  if ($("noticeTitle")) {

    $("noticeTitle").textContent =
      s.notice_title || "";
  }


  if ($("noticeText")) {

    $("noticeText").textContent =
      s.notice_text || "";
  }


  if ($("notice")) {

    $("notice").style.display =
      s.layout?.show_notice === false
        ? "none"
        : "flex";
  }


  /* -------------------------------------------------------
     ATUALIZAÇÕES
     ------------------------------------------------------- */

  if ($("updatesWrap")) {

    $("updatesWrap").style.display =
      s.layout?.show_updates === false
        ? "none"
        : "block";
  }


  /* -------------------------------------------------------
     PESQUISA
     ------------------------------------------------------- */

  if ($("searchOpen")) {

    $("searchOpen").style.display =
      s.layout?.show_search === false
        ? "none"
        : "block";
  }


  /* -------------------------------------------------------
     DISCORD
     ------------------------------------------------------- */

  if ($("discordBtn")) {

    $("discordBtn").href =
      s.discord_url || "#";

    $("discordBtn").target =
      "_blank";

    $("discordBtn").rel =
      "noopener noreferrer";
  }


  /* -------------------------------------------------------
     RODAPÉ
     ------------------------------------------------------- */

  if ($("footerText")) {

    $("footerText").textContent =
      s.footer_text || "";
  }


  /* -------------------------------------------------------
     REMOVE MENU MOBILE ANTIGO
     ------------------------------------------------------- */

  if ($("mobileMenu")) {

    $("mobileMenu").style.display =
      "none";
  }
}


/* =========================================================
   MENU / NAVEGAÇÃO
   ========================================================= */

function renderNav() {

  if (!$("nav")) return;

  $("nav").innerHTML =
    state.data.categories
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

  if ($("homeCategories")) {

    $("homeCategories").innerHTML =
      state.data.categories
        .map(category => `

          <article
            class="cat-card"
            data-route="${category.id}"
          >

            <div class="num">
              ${category.code} / VIENA
            </div>

            ${
              category.image
                ? `
                  <img
                    class="card-image"
                    src="${category.image}"
                    alt=""
                  >
                `
                : ""
            }

            <h3>
              ${category.short}
            </h3>

            <p>
              ${category.desc}
            </p>

          </article>

        `)
        .join("");
  }


  /* -------------------------------------------------------
     ATUALIZAÇÕES
     ------------------------------------------------------- */

  if ($("updatesList")) {

    $("updatesList").innerHTML =
      (state.data.updates || [])
        .map(update => `

          <div class="update">

            <time>
              ${update.date}
            </time>

            <strong>
              ${update.title}
              — ${update.text}
            </strong>

            <span>
              ${update.tag}
            </span>

          </div>

        `)
        .join("");
  }
}


/* =========================================================
   TODAS AS REGRAS
   ========================================================= */

function allRules() {

  return state.data.categories.flatMap(
    category =>
      category.rules.map(rule => ({
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
      x => x.id === id
    );


  if (!category) return;


  /* -------------------------------------------------------
     CABEÇALHO
     ------------------------------------------------------- */

  if ($("catCode")) {

    $("catCode").textContent =
      `CÓDIGO ${category.code}`;
  }


  if ($("catTitle")) {

    $("catTitle").textContent =
      category.name;
  }


  if ($("catDesc")) {

    $("catDesc").textContent =
      category.desc;
  }


  /* -------------------------------------------------------
     IMAGEM DA CATEGORIA
     ------------------------------------------------------- */

  if ($("catImage")) {

    $("catImage").hidden =
      !category.image;

    if (category.image) {

      $("catImage").src =
        category.image;
    }
  }


  /* -------------------------------------------------------
     REGRAS
     ------------------------------------------------------- */

  if ($("ruleList")) {

    $("ruleList").innerHTML =
      category.rules
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
                  ${rule.text}
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
                      <br>

                      <img
                        class="rule-image"
                        src="${rule.image}"
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
  }


  /* -------------------------------------------------------
     TOC
     ------------------------------------------------------- */

  if ($("ruleToc")) {

    $("ruleToc").innerHTML =

      `<strong>NESTA CATEGORIA</strong>` +

      category.rules
        .map((rule, index) => `

          <button
            type="button"
            data-rule-target="${index}"
          >
            ${rule.code}
            —
            ${rule.title}
          </button>

        `)
        .join("");
  }
}


/* =========================================================
   PESQUISA
   ========================================================= */

function search(query, target) {

  if (!target) return;

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
          ${rule.tag || ""}
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
              data-route="${rule.cat.id}"
            >

              <small>
                ${rule.cat.short}
                ·
                ${rule.code}
              </small>

              <h3>
                ${rule.title}
              </h3>

              <p>
                ${rule.text}
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


  /* -------------------------------------------------------
     MENU ATIVO
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     FECHA SIDEBAR
     ------------------------------------------------------- */

  if ($("sidebar")) {

    $("sidebar")
      .classList.remove("open");
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   CLIQUES DE NAVEGAÇÃO
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    /* ---------------------------------------------
       BOTÕES DE ROTA
       --------------------------------------------- */

    const routeElement =
      event.target.closest(
        "[data-route]"
      );


    if (routeElement) {

      event.preventDefault();

      const routeId =
        routeElement.dataset.route;

      route(routeId);

      history.replaceState(
        null,
        "",
        "#" + routeId
      );

      return;
    }


    /* ---------------------------------------------
       TOC DAS REGRAS
       --------------------------------------------- */

    const ruleButton =
      event.target.closest(
        "[data-rule-target]"
      );


    if (ruleButton) {

      const index =
        ruleButton.dataset.ruleTarget;

      const rule =
        document.getElementById(
          `rule-${index}`
        );


      if (rule) {

        rule.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

      return;
    }

  }
);


/* =========================================================
   PESQUISA
   ========================================================= */

if ($("searchOpen")) {

  $("searchOpen").onclick = () => {

    if ($("searchOverlay")) {

      $("searchOverlay")
        .classList.add("open");
    }

    if ($("overlaySearch")) {

      $("overlaySearch").focus();
    }
  };
}


if ($("searchClose")) {

  $("searchClose").onclick = () => {

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
   HASH / NAVEGAÇÃO
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

  /*
   * Se o cursor personalizado estiver configurado
   * no site.json, usamos ele.
   */

  const cursorImage =
    state.site?.cursor_icon;


  /*
   * Cria o cursor apenas uma vez.
   */

  let cursor =
    document.getElementById(
      "customCursor"
    );


  if (!cursor) {

    cursor =
      document.createElement("div");

    cursor.id =
      "customCursor";

    document.body.appendChild(
      cursor
    );
  }


  /*
   * Sem imagem configurada:
   * usa o cursor normal.
   */

  if (!cursorImage) {

    cursor.style.display =
      "none";

    document.body.classList.remove(
      "custom-cursor-enabled"
    );

    return;
  }


  /*
   * Ativa cursor.
   */

  document.body.classList.add(
    "custom-cursor-enabled"
  );


  cursor.style.backgroundImage =
    `url("${cursorImage}")`;

  cursor.style.display =
    "block";


  /*
   * Movimento.
   *
   * Usamos fixed + transform para
   * funcionar em todas as páginas.
   */

  document.addEventListener(
    "mousemove",
    event => {

      cursor.style.left =
        `${event.clientX}px`;

      cursor.style.top =
        `${event.clientY}px`;

    },
    {
      passive: true
    }
  );


  /*
   * Efeito ao clicar.
   */

  document.addEventListener(
    "mousedown",
    () => {

      cursor.classList.add(
        "click"
      );

    }
  );


  document.addEventListener(
    "mouseup",
    () => {

      cursor.classList.remove(
        "click"
      );

    }
  );


  /*
   * Quando passar em botão/link.
   */

  document.addEventListener(
    "mouseover",
    event => {

      const interactive =
        event.target.closest(
          "a, button, [data-route], .cat-card, .result, input, textarea, select"
        );


      cursor.classList.toggle(
        "hover",
        !!interactive
      );

    }
  );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

load().then(() => {

  setupCursor();

});
