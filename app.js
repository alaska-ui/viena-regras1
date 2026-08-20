const state = {
  site: null,
  data: null
};

const $ = id => document.getElementById(id);


/* =========================================================
   CURSOR PERSONALIZADO
========================================================= */

const customCursor = document.getElementById("customCursor");
const cursorDot = document.getElementById("cursorDot");

let mouseX = 0;
let mouseY = 0;

let cursorX = 0;
let cursorY = 0;

let dotX = 0;
let dotY = 0;


/* Movimento do mouse */

document.addEventListener("mousemove", e => {

  mouseX = e.clientX;
  mouseY = e.clientY;

  if (customCursor) {
    customCursor.style.left = mouseX + "px";
    customCursor.style.top = mouseY + "px";
  }

});


/* Animação do cursor */

function animateCursor() {

  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;

  dotX += (mouseX - dotX) * 0.35;
  dotY += (mouseY - dotY) * 0.35;


  if (cursorDot) {

    cursorDot.style.left =
      dotX + "px";

    cursorDot.style.top =
      dotY + "px";

  }


  requestAnimationFrame(animateCursor);

}

animateCursor();


/* =========================================================
   RASTRO DO CURSOR
========================================================= */

let lastTrailX = 0;
let lastTrailY = 0;

document.addEventListener("mousemove", e => {

  const distance = Math.hypot(
    e.clientX - lastTrailX,
    e.clientY - lastTrailY
  );


  /* Evita criar partículas demais */

  if (distance < 8) {
    return;
  }


  lastTrailX = e.clientX;
  lastTrailY = e.clientY;


  const trail =
    document.createElement("span");


  trail.className =
    "cursor-trail";


  trail.style.left =
    e.clientX + "px";

  trail.style.top =
    e.clientY + "px";


  document.body.appendChild(trail);


  setTimeout(() => {

    trail.remove();

  }, 600);

});


/* =========================================================
   EFEITO DO CURSOR SOBRE ELEMENTOS CLICÁVEIS
========================================================= */

document.addEventListener("mouseover", e => {

  const clickable =
    e.target.closest(
      "a, button, input, textarea, select, [data-route]"
    );


  if (!customCursor) {
    return;
  }


  if (clickable) {

    customCursor.classList.add(
      "cursor-hover"
    );

  }

});


document.addEventListener("mouseout", e => {

  const clickable =
    e.target.closest(
      "a, button, input, textarea, select, [data-route]"
    );


  if (!customCursor) {
    return;
  }


  if (clickable) {

    customCursor.classList.remove(
      "cursor-hover"
    );

  }

});


/* =========================================================
   CARREGAR CONTEÚDO
========================================================= */

async function load() {

  try {

    const [s, r] = await Promise.all([

      fetch("content/site.json")
        .then(x => {

          if (!x.ok) {
            throw new Error(
              "Não foi possível carregar site.json"
            );
          }

          return x.json();

        }),


      fetch("content/rules.json")
        .then(x => {

          if (!x.ok) {
            throw new Error(
              "Não foi possível carregar rules.json"
            );
          }

          return x.json();

        })

    ]);


    state.site = s;
    state.data = r;


    applySite();

    renderNav();

    renderHome();


    route(
      location.hash.replace("#", "") ||
      "inicio"
    );

  }

  catch (err) {

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

            font-family:Arial,sans-serif;

            z-index:999999;
          "
        >
          Não foi possível carregar o conteúdo.
          Verifique se <strong>content/site.json</strong>
          e <strong>content/rules.json</strong>
          foram enviados corretamente.
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

  const t =
    s.theme || {};


  /* Tema */

  for (
    const [k, v]
    of Object.entries(t)
  ) {

    document.documentElement.style.setProperty(

      "--" +
      (
        k === "accent_light"
          ? "accent2"
          : k
      ),

      v

    );

  }


  /* =====================================================
     LOGO
  ===================================================== */

  if ($("headerLogo")) {

    $("headerLogo").src =
      s.logo ||
      "logo-viena.png";


    $("headerLogo").alt =
      s.site_name ||
      "Viena Roleplay";

  }


  /* =====================================================
     FAVICON
  ===================================================== */

  if ($("favicon")) {

    $("favicon").href =
      s.favicon ||
      s.logo ||
      "logo-viena.png";

  }


  /* =====================================================
     TÍTULO
  ===================================================== */

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


  /* =====================================================
     HERO
  ===================================================== */

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


  /* =====================================================
     AVISO
  ===================================================== */

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


  /* =====================================================
     RODAPÉ
  ===================================================== */

  if ($("footerText")) {

    $("footerText").textContent =
      s.footer_text ||
      "";

  }


  /* =====================================================
     DISCORD
  ===================================================== */

  if ($("discordBtn")) {

    $("discordBtn").href =
      s.discord_url ||
      "#";


    $("discordBtn").target =
      "_blank";


    $("discordBtn").rel =
      "noopener noreferrer";

  }


  /* =====================================================
     ELEMENTOS OPCIONAIS
  ===================================================== */

  if ($("notice")) {

    $("notice").style.display =

      s.layout?.show_notice === false
        ? "none"
        : "flex";

  }


  if ($("updatesWrap")) {

    $("updatesWrap").style.display =

      s.layout?.show_updates === false
        ? "none"
        : "block";

  }


  if ($("searchOpen")) {

    $("searchOpen").style.display =

      s.layout?.show_search === false
        ? "none"
        : "block";

  }


  /* =====================================================
     IMAGEM DA CAPA / HERO
  ===================================================== */

  if (
    s.hero_image &&
    s.layout?.show_hero_image !== false
  ) {

    if ($("heroImage")) {

      $("heroImage").src =
        s.hero_image;

    }


    if ($("heroArt")) {

      $("heroArt").style.display =
        "flex";

    }

  }

  else {

    if ($("heroArt")) {

      $("heroArt").style.display =
        "none";

    }

  }

}


/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav() {

  if (!$("nav")) {
    return;
  }


  $("nav").innerHTML =

    (
      state.data.categories ||
      []
    )

    .map(c => `

      <button
        data-route="${c.id}"
        type="button"
      >

        <span>
          ${c.code}
        </span>

        ${c.short}

      </button>

    `)

    .join("");

}


/* =========================================================
   PÁGINA INICIAL
========================================================= */

function renderHome() {

  if (!$("homeCategories")) {
    return;
  }


  $("homeCategories").innerHTML =

    (
      state.data.categories ||
      []
    )

    .map(c => `

      <article
        class="cat-card"
        data-route="${c.id}"
      >

        <div class="num">

          ${c.code} / VIENA

        </div>


        ${
          c.image

            ? `

              <img
                class="card-image"
                src="${c.image}"
                alt=""
              >

            `

            : ""
        }


        <h3>
          ${c.short}
        </h3>


        <p>
          ${c.desc}
        </p>


      </article>

    `)

    .join("");


  /* =====================================================
     ATUALIZAÇÕES
  ===================================================== */

  if (!$("updatesList")) {
    return;
  }


  $("updatesList").innerHTML =

    (
      state.data.updates ||
      []
    )

    .map(x => `

      <div class="update">

        <time>
          ${x.date}
        </time>


        <strong>

          ${x.title}
          —
          ${x.text}

        </strong>


        <span>
          ${x.tag}
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

    state.data.categories || []

  ).flatMap(c =>

    (c.rules || []).map(r => ({

      cat: c,

      ...r

    }))

  );

}


/* =========================================================
   RENDERIZAR CATEGORIA
========================================================= */

function renderCategory(id) {

  const c =

    state.data.categories.find(
      x => x.id === id
    );


  if (!c) {
    return;
  }


  /* =====================================================
     TÍTULO
  ===================================================== */

  if ($("catCode")) {

    $("catCode").textContent =
      `CÓDIGO ${c.code}`;

  }


  if ($("catTitle")) {

    $("catTitle").textContent =
      c.name;

  }


  if ($("catDesc")) {

    $("catDesc").textContent =
      c.desc;

  }


  /* =====================================================
     IMAGEM DA CATEGORIA
  ===================================================== */

  if ($("catImage")) {

    $("catImage").hidden =
      !c.image;


    if (c.image) {

      $("catImage").src =
        c.image;

    }

  }


  /* =====================================================
     REGRAS
  ===================================================== */

  if ($("ruleList")) {

    $("ruleList").innerHTML =

      (c.rules || [])

      .map((r, i) => `

        <article
          class="rule"
          id="rule-${i}"
        >

          <div class="rule-top">


            <div class="rule-num">

              ${r.code}

            </div>


            <div>


              <h3>
                ${r.title}
              </h3>


              <p>
                ${r.text}
              </p>


              <span class="tag">

                ${r.tag}

              </span>


              ${
                r.image

                  ? `

                    <br>

                    <img
                      class="rule-image"
                      src="${r.image}"
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


  /* =====================================================
     ÍNDICE DA CATEGORIA
  ===================================================== */

  if ($("ruleToc")) {

    $("ruleToc").innerHTML =

      `<strong>NESTA CATEGORIA</strong>` +

      (c.rules || [])

      .map((r, i) => `

        <button
          type="button"
          data-rule-target="rule-${i}"
        >

          ${r.code}
          —
          ${r.title}

        </button>

      `)

      .join("");

  }

}


/* =========================================================
   CLIQUE NO ÍNDICE DAS REGRAS
========================================================= */

document.addEventListener(
  "click",
  e => {

    const button =
      e.target.closest(
        "[data-rule-target]"
      );


    if (!button) {
      return;
    }


    const target =
      document.getElementById(
        button.dataset.ruleTarget
      );


    if (!target) {
      return;
    }


    e.preventDefault();


    target.scrollIntoView({

      behavior: "smooth",

      block: "center"

    });

  }
);


/* =========================================================
   PESQUISA
========================================================= */

function search(q, target) {

  if (!target) {
    return;
  }


  q =
    q
      .trim()
      .toLowerCase();


  if (!q) {

    target.innerHTML =
      "";

    return;

  }


  const res =

    allRules()

      .filter(r => `

        ${r.cat.short}

        ${r.cat.name}

        ${r.code}

        ${r.title}

        ${r.text}

        ${r.tag}

      `

      .toLowerCase()

      .includes(q))

      .slice(0, 30);


  target.innerHTML =

    res.length

      ? res

        .map(r => `

          <div
            class="result"
            data-route="${r.cat.id}"
          >

            <small>

              ${r.cat.short}
              ·
              ${r.code}

            </small>


            <h3>

              ${r.title}

            </h3>


            <p>

              ${r.text}

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
   ROTAS / ABAS
========================================================= */

function route(id) {

  document

    .querySelectorAll(".page")

    .forEach(p =>

      p.classList.remove(
        "active"
      )

    );


  /* =====================================================
     INÍCIO
  ===================================================== */

  if (id === "inicio") {

    if ($("inicio")) {

      $("inicio")
        .classList.add("active");

    }

  }


  /* =====================================================
     PESQUISA
  ===================================================== */

  else if (id === "pesquisa") {

    if ($("searchPage")) {

      $("searchPage")
        .classList.add("active");

    }


    if ($("searchInput")) {

      setTimeout(() => {

        $("searchInput").focus();

      }, 50);

    }

  }


  /* =====================================================
     CATEGORIA
  ===================================================== */

  else {

    if ($("categoryPage")) {

      $("categoryPage")
        .classList.add("active");

    }


    renderCategory(id);

  }


  /* =====================================================
     MENU ATIVO
  ===================================================== */

  document

    .querySelectorAll(
      ".sidebar nav button"
    )

    .forEach(b =>

      b.classList.toggle(

        "active",

        b.dataset.route === id

      )

    );


  /* =====================================================
     FECHAR MENU MOBILE
  ===================================================== */

  if ($("sidebar")) {

    $("sidebar")
      .classList.remove("open");

  }


  /* =====================================================
     VOLTAR AO TOPO
  ===================================================== */

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


/* =========================================================
   NAVEGAÇÃO DO SITE
========================================================= */

document.addEventListener(
  "click",
  e => {

    const target =
      e.target.closest(
        "[data-route]"
      );


    if (!target) {
      return;
    }


    e.preventDefault();


    const routeId =
      target.dataset.route;


    if (!routeId) {
      return;
    }


    route(routeId);


    history.replaceState(

      null,

      "",

      "#" + routeId

    );

  }
);


/* =========================================================
   BOTÃO DE PESQUISA
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


/* =========================================================
   FECHAR PESQUISA
========================================================= */

if ($("searchClose")) {

  $("searchClose").onclick = () => {

    if ($("searchOverlay")) {

      $("searchOverlay")
        .classList.remove("open");

    }

  };

}


/* =========================================================
   PESQUISA OVERLAY
========================================================= */

if ($("overlaySearch")) {

  $("overlaySearch").oninput = e => {

    search(

      e.target.value,

      $("overlayResults")

    );

  };

}


/* =========================================================
   PESQUISA NORMAL
========================================================= */

if ($("searchInput")) {

  $("searchInput").oninput = e => {

    search(

      e.target.value,

      $("searchResults")

    );

  };

}


/* =========================================================
   MENU MOBILE
========================================================= */

if ($("mobileMenu")) {

  $("mobileMenu").onclick = () => {

    if ($("sidebar")) {

      $("sidebar")
        .classList.toggle("open");

    }

  };

}


/* =========================================================
   HASH / ABAS
========================================================= */

window.addEventListener(
  "hashchange",
  () => {

    route(

      location.hash.replace(
        "#",
        ""
      ) || "inicio"

    );

  }
);


/* =========================================================
   FECHAR PESQUISA CLICANDO FORA
========================================================= */

if ($("searchOverlay")) {

  $("searchOverlay").addEventListener(
    "click",
    e => {

      if (
        e.target ===
        $("searchOverlay")
      ) {

        $("searchOverlay")
          .classList.remove("open");

      }

    }
  );

}


/* =========================================================
   INICIAR SITE
========================================================= */

load();
