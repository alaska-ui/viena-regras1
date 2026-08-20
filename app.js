/* =========================================================
   VIENA ROLEPLAY
   APP.JS COMPLETO
   ========================================================= */


const state = {

  site: null,

  data: null

};


/* =========================================================
   ATALHO
   ========================================================= */

const $ = id =>
  document.getElementById(id);


/* =========================================================
   CARREGAR SITE
   ========================================================= */

async function load() {

  try {

    const [siteResponse, rulesResponse] =
      await Promise.all([

        fetch("content/site.json")
          .then(response => {

            if (!response.ok) {
              throw new Error(
                "Não foi possível carregar site.json"
              );
            }

            return response.json();

          }),

        fetch("content/rules.json")
          .then(response => {

            if (!response.ok) {
              throw new Error(
                "Não foi possível carregar rules.json"
              );
            }

            return response.json();

          })

      ]);


    state.site =
      siteResponse;

    state.data =
      rulesResponse;


    applySite();

    renderNav();

    renderHome();


    route(
      location.hash.replace("#", "") ||
      "inicio"
    );


  } catch (error) {

    console.error(error);

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
          z-index:999999;
          font-family:Arial;
        "
      >

        Não foi possível carregar o conteúdo.

        <br>

        Verifique:

        <strong>
          content/site.json
        </strong>

        e

        <strong>
          content/rules.json
        </strong>

      </div>

      `

    );

  }

}


/* =========================================================
   CONFIGURAÇÕES DO SITE
   ========================================================= */

function applySite() {

  const s =
    state.site || {};

  const theme =
    s.theme || {};


  /*
     TEMA
  */

  for (
    const [key, value]
    of Object.entries(theme)
  ) {

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
    s.logo ||
    "logo-viena.png";


  if ($("headerLogo")) {

    $("headerLogo").src =
      logo;

    $("headerLogo").alt =
      s.site_name ||
      "Viena Roleplay";

  }


  /*
     FAVICON
  */

  if ($("favicon")) {

    $("favicon").href =
      s.favicon ||
      logo ||
      "logo-viena.png";

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
     FOOTER
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
     LAYOUT
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
        : "flex";

  }


  /*
     ========================================================
     IMAGEM DO HERO
     ========================================================

     ESTA É A IMAGEM QUE VOCÊ ENVIA PELO ADMIN.

     Ela NÃO usa a logo.

  */

  const heroImage =
    s.hero_image ||
    "";


  if (
    heroImage &&
    layout.show_hero_image !== false
  ) {

    $("heroImage").src =
      heroImage;

    $("heroImage").style.display =
      "block";

    $("heroArt").style.display =
      "flex";

  } else {

    $("heroImage").removeAttribute(
      "src"
    );

    $("heroArt").style.display =
      "none";

  }


  /*
     ========================================================
     CURSOR DO ADMIN
     ========================================================

     O Admin deve salvar:

     cursor: {
       image: "uploads/spray.png"
     }

  */

  const cursor =
    s.cursor || {};


  if (
    cursor.enabled !== false &&
    cursor.image
  ) {

    document.documentElement.style.setProperty(

      "--cursor-image",

      `url("${cursor.image}")`

    );

  } else {

    document.documentElement.style.setProperty(

      "--cursor-image",

      `url("logo-viena.png")`

    );

  }

}


/* =========================================================
   MENU
   ========================================================= */

function renderNav() {

  if (
    !state.data ||
    !Array.isArray(
      state.data.categories
    )
  ) {

    return;

  }


  $("nav").innerHTML =

    state.data.categories

      .map(category => `

        <button
          data-route="${category.id}"
          type="button"
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

  if (
    !state.data ||
    !Array.isArray(
      state.data.categories
    )
  ) {

    return;

  }


  $("homeCategories").innerHTML =

    state.data.categories

      .map(category => `

        <article
          class="cat-card"
          data-route="${category.id}"
        >

          <div class="num">

            ${category.code}
            /
            VIENA

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


  /*
     ATUALIZAÇÕES
  */

  $("updatesList").innerHTML =

    (
      state.data.updates ||
      []
    )

      .map(update => `

        <div class="update">

          <time>
            ${update.date}
          </time>

          <strong>
            ${update.title}
            —
            ${update.text}
          </strong>

          <span>
            ${update.tag}
          </span>

        </div>

      `)

      .join("");

}


/* =========================================================
   TODAS AS REGRAS
   ========================================================= */

function allRules() {

  return state.data.categories

    .flatMap(category =>

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
    category.desc;


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
                ${rule.text}
              </p>


              <span class="tag">

                ${rule.tag || ""}

              </span>


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


  /*
     ÍNDICE DAS REGRAS
  */

  $("ruleToc").innerHTML =

    `<strong>NESTA CATEGORIA</strong>` +

    (category.rules || [])

      .map((rule, index) => `

        <button
          type="button"
          data-scroll-rule="${index}"
        >

          ${rule.code}
          —
          ${rule.title}

        </button>

      `)

      .join("");

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

      .filter(rule =>

        `

        ${rule.cat.short}

        ${rule.cat.name}

        ${rule.code}

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

      .join("");

}


/* =========================================================
   ROTA
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

    $("inicio")
      .classList
      .add("active");

  }


  else if (id === "pesquisa") {

    $("searchPage")
      .classList
      .add("active");

  }


  else {

    $("categoryPage")
      .classList
      .add("active");

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

  $("sidebar")
    .classList
    .remove("open");


  /*
     TOPO
  */

  window.scrollTo(
    0,
    0
  );

}


/* =========================================================
   CLIQUES DE ROTA
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    /*
       ÍNDICE DE REGRA
    */

    const scrollButton =
      event.target.closest(
        "[data-scroll-rule]"
      );


    if (scrollButton) {

      const index =
        scrollButton.dataset.scrollRule;


      const rule =
        document.getElementById(
          `rule-${index}`
        );


      if (rule) {

        rule.scrollIntoView({

          behavior:
            "smooth",

          block:
            "center"

        });

      }

      return;

    }


    /*
       ROTA NORMAL
    */

    const target =
      event.target.closest(
        "[data-route]"
      );


    if (!target) {

      return;

    }


    /*
       Não impedir links externos
    */

    if (
      target.tagName === "A" &&
      target.target === "_blank"
    ) {

      return;

    }


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


/* =========================================================
   PESQUISA DO TOPO
   ========================================================= */

if ($("searchOpen")) {

  $("searchOpen").onclick = () => {

    $("searchOverlay")
      .classList
      .add("open");


    setTimeout(() => {

      $("overlaySearch").focus();

    }, 50);

  };

}


/* =========================================================
   FECHAR PESQUISA
   ========================================================= */

if ($("searchClose")) {

  $("searchClose").onclick = () => {

    $("searchOverlay")
      .classList
      .remove("open");

  };

}


/* =========================================================
   PESQUISA OVERLAY
   ========================================================= */

if ($("overlaySearch")) {

  $("overlaySearch").oninput =
    event => {

      search(

        event.target.value,

        $("overlayResults")

      );

    };

}


/* =========================================================
   PESQUISA PÁGINA
   ========================================================= */

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

  $("mobileMenu").onclick = () => {

    $("sidebar")
      .classList
      .toggle("open");

  };

}


/* =========================================================
   HASH
   ========================================================= */

window.addEventListener(
  "hashchange",
  () => {

    route(

      location.hash.replace(
        "#",
        ""
      ) ||
      "inicio"

    );

  }
);


/* =========================================================
   ESC FECHA PESQUISA
   ========================================================= */

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


/* =========================================================
   CURSOR PERSONALIZADO
   ========================================================= */

let mouseX = 0;
let mouseY = 0;

let lastTrail = 0;


/*
   Movimento do mouse
*/

document.addEventListener(
  "mousemove",
  event => {

    mouseX =
      event.clientX;

    mouseY =
      event.clientY;


    const cursor =
      $("customCursor");


    if (cursor) {

      cursor.style.left =
        mouseX + "px";

      cursor.style.top =
        mouseY + "px";

    }


    createTrail(
      mouseX,
      mouseY
    );

  }
);


/*
   Criar rastro
*/

function createTrail(
  x,
  y
) {

  const now =
    Date.now();


  /*
     Limita quantidade
  */

  if (
    now - lastTrail <
    35
  ) {

    return;

  }


  lastTrail =
    now;


  const trail =
    document.createElement(
      "div"
    );


  trail.className =
    "cursor-trail";


  trail.style.left =
    x + "px";


  trail.style.top =
    y + "px";


  document.body.appendChild(
    trail
  );


  setTimeout(
    () => {

      trail.remove();

    },

    600

  );

}


/* =========================================================
   INICIAR
   ========================================================= */

load();
