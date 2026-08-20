const state = {
  site: {},
  data: {
    categories: [],
    updates: []
  }
};

const $ = id => document.getElementById(id);


/* =========================
   CURSOR
========================= */

const customCursor = $("customCursor");
const cursorDot = $("cursorDot");

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", e => {

  mouseX = e.clientX;
  mouseY = e.clientY;

  if (customCursor) {
    customCursor.style.left = mouseX + "px";
    customCursor.style.top = mouseY + "px";
  }

  if (cursorDot) {
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  }

});


document.addEventListener(
  "mouseover",
  e => {

    const target =
      e.target.closest(
        "a, button, input, textarea, select, [data-route], .cat-card, .result"
      );

    if (
      target &&
      customCursor
    ) {
      customCursor.classList.add(
        "cursor-hover"
      );
    }

  }
);


document.addEventListener(
  "mouseout",
  e => {

    const target =
      e.target.closest(
        "a, button, input, textarea, select, [data-route], .cat-card, .result"
      );

    if (
      target &&
      customCursor
    ) {
      customCursor.classList.remove(
        "cursor-hover"
      );
    }

  }
);


/* =========================
   CARREGAMENTO
========================= */

async function load() {

  try {

    const siteResponse =
      await fetch(
        "content/site.json",
        {
          cache: "no-store"
        }
      );

    const rulesResponse =
      await fetch(
        "content/rules.json",
        {
          cache: "no-store"
        }
      );


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


    if (
      !Array.isArray(
        state.data.categories
      )
    ) {
      state.data.categories = [];
    }


    if (
      !Array.isArray(
        state.data.updates
      )
    ) {
      state.data.updates = [];
    }


    applySite();

    renderNav();

    renderHome();


    const current =
      location.hash
        .replace("#", "")
        .trim() || "inicio";

    route(current);

  }

  catch (error) {

    console.error(
      "ERRO AO CARREGAR:",
      error
    );

    showError(error);

  }

}


/* =========================
   CONFIGURAÇÕES DO SITE
========================= */

function applySite() {

  const s =
    state.site || {};

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
        "--" + (
          key === "accent_light"
            ? "accent2"
            : key
        ),
        value
      );

  }


  /* LOGO */

  const logo =
    s.logo ||
    "logo-viena.png";


  if ($("headerLogo")) {

    $("headerLogo").src = logo;

    $("headerLogo").alt =
      s.site_name ||
      "Viena Roleplay";

  }


  /* FAVICON */

  if ($("favicon")) {

    $("favicon").href =
      s.favicon ||
      logo;

  }


  /* NOME */

  $("brandTitle").textContent =
    s.site_title ||
    "CÓDIGO DA RUA";


  $("brandSite").textContent =
    (
      s.site_name ||
      "VIENA ROLEPLAY"
    ).toUpperCase();


  /* HERO */

  $("heroEyebrow").textContent =
    s.hero_eyebrow ||
    "CENTRAL OFICIAL DE REGRAS";


  $("heroTitle").textContent =
    s.hero_title ||
    "O CÓDIGO DA RUA.";


  $("heroText").textContent =
    s.hero_text ||
    "As regras que mantêm Viena viva. Leia, entenda e faça parte da história.";


  /* IMAGEM DO HERO */

  if (
    s.hero_image &&
    s.hero_image.trim() !== ""
  ) {

    document.documentElement
      .style
      .setProperty(
        "--hero-image",
        `url("${s.hero_image}")`
      );

  } else {

    document.documentElement
      .style
      .setProperty(
        "--hero-image",
        "none"
      );

  }


  /* AVISO */

  $("noticeTitle").textContent =
    s.notice_title ||
    "LEIA ANTES DE JOGAR";


  $("noticeText").textContent =
    s.notice_text ||
    "Desconhecer uma regra não isenta o jogador de sua responsabilidade.";


  /* RODAPÉ */

  $("footerText").textContent =
    s.footer_text ||
    "© 2026 Viena Roleplay · Todos os direitos reservados.";


  /* DISCORD */

  const discord =
    s.discord_url ||
    "#";


  $("discordBtn").href =
    discord;


  $("discordBtn").target =
    "_blank";


  $("discordBtn").rel =
    "noopener noreferrer";


  /* ELEMENTOS OPCIONAIS */

  if (
    s.layout &&
    s.layout.show_notice === false
  ) {

    $("notice").style.display =
      "none";

  }


  if (
    s.layout &&
    s.layout.show_updates === false
  ) {

    $("updatesWrap").style.display =
      "none";

  }


}


/* =========================
   MENU
========================= */

function renderNav() {

  const nav =
    $("nav");

  if (!nav) return;


  nav.innerHTML =
    state.data.categories
      .map(category => {

        return `
          <button
            type="button"
            data-route="${escapeHtml(category.id)}"
          >
            <span>
              ${escapeHtml(category.code || "")}
            </span>

            ${escapeHtml(
              category.short ||
              category.name ||
              ""
            )}
          </button>
        `;

      })
      .join("");

}


/* =========================
   HOME
========================= */

function renderHome() {

  const container =
    $("homeCategories");


  if (!container) return;


  container.innerHTML =
    state.data.categories
      .map(category => {

        const image =
          category.image ||
          "";


        return `
          <article
            class="cat-card"
            data-route="${escapeHtml(category.id)}"
          >

            ${
              image
                ? `
                  <img
                    class="card-image"
                    src="${escapeHtml(image)}"
                    alt=""
                    loading="lazy"
                  >
                `
                : ""
            }


            <div class="num">
              ${escapeHtml(
                category.code || ""
              )}
              / VIENA
            </div>


            <h3>
              ${escapeHtml(
                category.short ||
                category.name ||
                ""
              )}
            </h3>


            <p>
              ${escapeHtml(
                category.desc ||
                ""
              )}
            </p>

          </article>
        `;

      })
      .join("");


  const updates =
    $("updatesList");


  if (!updates) return;


  updates.innerHTML =
    state.data.updates
      .map(update => {

        return `
          <div class="update">

            <time>
              ${escapeHtml(
                update.date || ""
              )}
            </time>

            <strong>
              ${escapeHtml(
                update.title || ""
              )}
              ${
                update.text
                  ? " — " +
                    escapeHtml(
                      update.text
                    )
                  : ""
              }
            </strong>

            <span>
              ${escapeHtml(
                update.tag || ""
              )}
            </span>

          </div>
        `;

      })
      .join("");

}


/* =========================
   TODAS AS REGRAS
========================= */

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


/* =========================
   CATEGORIA
========================= */

function renderCategory(id) {

  const category =
    state.data.categories.find(
      item =>
        String(item.id) === String(id)
    );


  if (!category) {

    route("inicio");

    return;

  }


  $("catCode").textContent =
    "CÓDIGO " +
    (category.code || "");


  $("catTitle").textContent =
    category.name ||
    category.short ||
    "";


  $("catDesc").textContent =
    category.desc ||
    "";


  /* IMAGEM DA CATEGORIA */

  const categoryHero =
    $("categoryHero");


  if (
    category.image &&
    category.image.trim() !== ""
  ) {

    categoryHero.style
      .setProperty(
        "--category-image",
        `url("${category.image}")`
      );

  } else {

    categoryHero.style
      .setProperty(
        "--category-image",
        "none"
      );

  }


  const rules =
    Array.isArray(category.rules)
      ? category.rules
      : [];


  $("ruleList").innerHTML =
    rules
      .map((rule, index) => {

        return `
          <article
            class="rule"
            id="rule-${index}"
          >

            <div class="rule-top">

              <div class="rule-num">
                ${escapeHtml(
                  rule.code ||
                  `${category.code}.${index + 1}`
                )}
              </div>

              <div>

                <h3>
                  ${escapeHtml(
                    rule.title ||
                    ""
                  )}
                </h3>

                <p>
                  ${escapeHtml(
                    rule.text ||
                    ""
                  )}
                </p>


                ${
                  rule.tag
                    ? `
                      <span class="tag">
                        ${escapeHtml(
                          rule.tag
                        )}
                      </span>
                    `
                    : ""
                }


                ${
                  rule.image
                    ? `
                      <img
                        class="rule-image"
                        src="${escapeHtml(
                          rule.image
                        )}"
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

      })
      .join("");


  $("ruleToc").innerHTML =
    `
      <strong>
        NESTA CATEGORIA
      </strong>
    ` +

    rules
      .map((rule, index) => {

        return `
          <button
            type="button"
            data-scroll-rule="${index}"
          >
            ${escapeHtml(
              rule.code ||
              ""
            )}
            —
            ${escapeHtml(
              rule.title ||
              ""
            )}
          </button>
        `;

      })
      .join("");


  document
    .querySelectorAll(
      "[data-scroll-rule]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            button.dataset.scrollRule;

          const target =
            document.getElementById(
              "rule-" + index
            );

          if (target) {

            target.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

          }

        }
      );

    });

}


/* =========================
   PESQUISA
========================= */

function search(query, target) {

  query =
    String(query || "")
      .trim()
      .toLowerCase();


  if (!target) return;


  if (!query) {

    target.innerHTML =
      "";

    return;

  }


  const results =
    allRules()
      .filter(rule => {

        const text = `

          ${rule.cat.short || ""}

          ${rule.cat.name || ""}

          ${rule.cat.code || ""}

          ${rule.title || ""}

          ${rule.text || ""}

          ${rule.tag || ""}

        `.toLowerCase();


        return text.includes(query);

      })
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
      .map(rule => {

        return `
          <div
            class="result"
            data-route="${escapeHtml(
              rule.cat.id
            )}"
          >

            <small>
              ${escapeHtml(
                rule.cat.short || ""
              )}
              ·
              ${escapeHtml(
                rule.code || ""
              )}
            </small>

            <h3>
              ${escapeHtml(
                rule.title || ""
              )}
            </h3>

            <p>
              ${escapeHtml(
                rule.text || ""
              )}
            </p>

          </div>
        `;

      })
      .join("");

}


/* =========================
   ROTAS
========================= */

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
      .classList
      .add("active");

  }

  else if (id === "pesquisa") {

    $("searchPage")
      .classList
      .add("active");

    setTimeout(() => {

      $("searchInput")?.focus();

    }, 100);

  }

  else {

    $("categoryPage")
      .classList
      .add("active");

    renderCategory(id);

  }


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


/* =========================
   CLIQUES
========================= */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-route]"
      );


    if (!target) return;


    const id =
      target.dataset.route;


    if (!id) return;


    event.preventDefault();


    route(id);


    history.replaceState(
      null,
      "",
      "#" + id
    );

  }
);


/* =========================
   PESQUISA
========================= */

$("searchOpen")
  ?.addEventListener(
    "click",
    () => {

      $("searchOverlay")
        .classList
        .add("open");

      setTimeout(() => {

        $("overlaySearch")
          ?.focus();

      }, 100);

    }
  );


$("searchClose")
  ?.addEventListener(
    "click",
    () => {

      $("searchOverlay")
        .classList
        .remove("open");

    }
  );


$("overlaySearch")
  ?.addEventListener(
    "input",
    event => {

      search(
        event.target.value,
        $("overlayResults")
      );

    }
  );


$("searchInput")
  ?.addEventListener(
    "input",
    event => {

      search(
        event.target.value,
        $("searchResults")
      );

    }
  );


/* ESC FECHA PESQUISA */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      $("searchOverlay")
        ?.classList
        .remove("open");

    }

  }
);


/* =========================
   HASH
========================= */

window.addEventListener(
  "hashchange",
  () => {

    const id =
      location.hash
        .replace("#", "")
        .trim() || "inicio";

    route(id);

  }
);


/* =========================
   ERRO
========================= */

function showError(error) {

  const box =
    document.createElement(
      "div"
    );


  box.style.position =
    "fixed";

  box.style.left =
    "20px";

  box.style.right =
    "20px";

  box.style.bottom =
    "20px";

  box.style.zIndex =
    "9999999";

  box.style.padding =
    "20px";

  box.style.background =
    "#120000";

  box.style.border =
    "1px solid #ff1018";

  box.style.color =
    "white";

  box.innerHTML = `

    <strong>
      ERRO AO CARREGAR O SITE
    </strong>

    <br><br>

    ${escapeHtml(
      error.message ||
      String(error)
    )}

    <br><br>

    Verifique se existem:

    <br>

    <b>
      content/site.json
    </b>

    <br>

    <b>
      content/rules.json
    </b>

  `;


  document.body.appendChild(
    box
  );

}


/* =========================
   SEGURANÇA
========================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================
   MENU MOBILE
========================= */

/*
   Não existe mais aquele botão
   de 3 riscos no desktop.

   O menu lateral permanece normal.
*/

load();
