const state = {
  site: null,
  data: null
};

const $ = id => document.getElementById(id);


/* =========================================================
   CAMINHOS DE IMAGENS
========================================================= */

function asset(path) {
  if (!path) return "";

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  const base = new URL(".", document.baseURI).href;

  return base + path.replace(/^\/+/, "");
}


/* =========================================================
   CARREGAR CONTEÚDO
========================================================= */

async function load() {

  const [s, r] = await Promise.all([

    fetch("content/site.json")
      .then(x => x.json()),

    fetch("content/rules.json")
      .then(x => x.json())

  ]);

  /*
    Compatibilidade caso o JSON antigo esteja
    dentro de {"content":"..."}
  */

  state.site =
    s.content && typeof s.content === "string"
      ? JSON.parse(s.content)
      : s;

  state.data =
    r.content && typeof r.content === "string"
      ? JSON.parse(r.content)
      : r;


  applySite();

  initCursor();

  renderNav();

  renderHome();

  route(
    location.hash.replace("#", "") || "inicio"
  );
}


/* =========================================================
   CONFIGURAÇÕES DO SITE
========================================================= */

function applySite() {

  const s = state.site;

  const t = s.theme || {};


  /* CORES */

  for (const [k, v] of Object.entries(t)) {

    document.documentElement.style.setProperty(
      "--" +
      (k === "accent_light"
        ? "accent2"
        : k),

      v
    );

  }


  /* LOGO */

  $("headerLogo").src =
    asset(
      s.logo ||
      "logo-viena.png"
    );

  $("headerLogo").alt =
    s.site_name ||
    "Viena Roleplay";


  /* FAVICON */

  $("favicon").href =
    asset(
      s.favicon ||
      s.logo ||
      "logo-viena.png"
    );


  /* TEXTOS */

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


  /* DISCORD */

  $("discordBtn").href =
    s.discord_url ||
    "#";

  $("discordBtn").target =
    "_blank";

  $("discordBtn").rel =
    "noopener noreferrer";


  /* ELEMENTOS */

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


  /* IMAGEM DA CAPA */

  if (
    s.hero_image &&
    s.layout?.show_hero_image !== false
  ) {

    $("heroImage").src =
      asset(s.hero_image);

    $("heroArt").style.display =
      "flex";

  } else {

    $("heroArt").style.display =
      "none";

  }

}


/* =========================================================
   CURSOR PERSONALIZADO
========================================================= */

function initCursor() {

  const c =
    state.site?.cursor || {};


  /* Se estiver desligado */

  if (c.enabled === false) {

    return;

  }


  /* Evita criar duas vezes */

  if (
    document.getElementById(
      "vienaCursor"
    )
  ) {

    return;

  }


  /* CURSOR */

  const cursor =
    document.createElement(
      "div"
    );

  cursor.id =
    "vienaCursor";


  const size =
    Number(c.size) || 34;


  cursor.style.cssText = `

    position: fixed;

    left: 0;
    top: 0;

    width: ${size}px;
    height: ${size}px;

    pointer-events: none;

    z-index: 99999;

    transform:
      translate(-50%, -50%);

    display: none;

    background-image:
      url("${asset(
        c.image ||
        "logo-viena.png"
      )}");

    background-size:
      contain;

    background-repeat:
      no-repeat;

    background-position:
      center;

  `;


  document.body.appendChild(
    cursor
  );


  /* ESCONDE O CURSOR NORMAL */

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "vienaCursorStyle";


  style.textContent = `

    body.viena-custom-cursor,
    body.viena-custom-cursor * {
      cursor: none !important;
    }

  `;


  document.head.appendChild(
    style
  );


  document.body.classList.add(
    "viena-custom-cursor"
  );


  /* =====================================================
     RASTRO
  ===================================================== */

  const trail = [];


  if (
    c.trail_enabled !== false
  ) {

    const count =
      Number(c.trail_count) || 10;


    const trailColor =
      c.trail_color ||
      "#e50914";


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const dot =
        document.createElement(
          "span"
        );


      const dotSize =
        Math.max(
          3,
          9 - i * 0.5
        );


      const opacity =
        Math.max(
          0.05,
          0.8 - i * 0.07
        );


      dot.style.cssText = `

        position: fixed;

        left: 0;
        top: 0;

        width: ${dotSize}px;
        height: ${dotSize}px;

        border-radius: 50%;

        pointer-events: none;

        z-index: 99998;

        background:
          ${trailColor};

        opacity:
          ${opacity};

        transform:
          translate(-50%, -50%);

        display: none;

      `;


      document.body.appendChild(
        dot
      );


      trail.push({

        el: dot,

        x: 0,

        y: 0

      });

    }

  }


  /* =====================================================
     MOVIMENTO
  ===================================================== */

  let mouseX = 0;

  let mouseY = 0;


  let currentX = 0;

  let currentY = 0;


  document.addEventListener(
    "mousemove",
    e => {

      mouseX =
        e.clientX;

      mouseY =
        e.clientY;


      cursor.style.display =
        "block";


      trail.forEach(
        item => {

          item.el.style.display =
            "block";

        }
      );

    }
  );


  /* ANIMAÇÃO */

  function animateCursor() {

    currentX +=
      (
        mouseX -
        currentX
      ) * 0.35;


    currentY +=
      (
        mouseY -
        currentY
      ) * 0.35;


    cursor.style.left =
      currentX + "px";


    cursor.style.top =
      currentY + "px";


    /*
      O primeiro ponto acompanha
      o mouse e os seguintes seguem
      o anterior.
    */

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
          ) * 0.25;


        item.y +=
          (
            previousY -
            item.y
          ) * 0.25;


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
      animateCursor
    );

  }


  animateCursor();

}


/* =========================================================
   MENU LATERAL
========================================================= */

function renderNav() {

  $("nav").innerHTML =
    state.data.categories

      .map(
        c => `

          <button
            data-route="${c.id}"
          >

            <span>
              ${c.code}
            </span>

            ${c.short}

          </button>

        `
      )

      .join("");

}


/* =========================================================
   PÁGINA INICIAL
========================================================= */

function renderHome() {

  $("homeCategories").innerHTML =
    state.data.categories

      .map(
        c => `

          <article
            class="cat-card"
            data-route="${c.id}"
          >

            <div class="num">

              ${c.code}
              / VIENA

            </div>


            ${
              c.image

                ? `

                  <img
                    class="card-image"
                    src="${asset(c.image)}"
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

        `
      )

      .join("");


  /* ATUALIZAÇÕES */

  $("updatesList").innerHTML =
    (
      state.data.updates ||
      []
    )

      .map(
        x => `

          <div
            class="update"
          >

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

        `
      )

      .join("");

}


/* =========================================================
   TODAS AS REGRAS
========================================================= */

function allRules() {

  return state.data.categories

    .flatMap(
      c =>
        c.rules.map(
          r => ({
            cat: c,
            ...r
          })
        )
    );

}


/* =========================================================
   CATEGORIA
========================================================= */

function renderCategory(id) {

  const c =
    state.data.categories
      .find(
        x => x.id === id
      );


  if (!c) {

    return;

  }


  $("catCode").textContent =
    `CÓDIGO ${c.code}`;


  $("catTitle").textContent =
    c.name;


  $("catDesc").textContent =
    c.desc;


  $("catImage").hidden =
    !c.image;


  if (c.image) {

    $("catImage").src =
      asset(c.image);

  }


  /* REGRAS */

  $("ruleList").innerHTML =
    c.rules

      .map(
        (r, i) => `

          <article
            class="rule"
            id="rule-${i}"
          >

            <div
              class="rule-top"
            >

              <div
                class="rule-num"
              >

                ${r.code}

              </div>


              <div>

                <h3>
                  ${r.title}
                </h3>


                <p>
                  ${r.text}
                </p>


                <span
                  class="tag"
                >

                  ${r.tag}

                </span>


                ${
                  r.image

                    ? `

                      <br>

                      <img
                        class="rule-image"
                        src="${asset(r.image)}"
                        alt=""
                      >

                    `

                    : ""
                }


              </div>

            </div>

          </article>

        `
      )

      .join("");


  /* ÍNDICE */

  $("ruleToc").innerHTML =
    `<strong>
      NESTA CATEGORIA
    </strong>` +

    c.rules

      .map(
        (r, i) => `

          <button
            onclick="
              document
                .getElementById(
                  'rule-${i}'
                )
                .scrollIntoView({
                  behavior:'smooth',
                  block:'center'
                })
            "
          >

            ${r.code}
            —
            ${r.title}

          </button>

        `
      )

      .join("");

}


/* =========================================================
   PESQUISA
========================================================= */

function search(
  q,
  target
) {

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

      .filter(
        r => `

          ${r.cat.short}

          ${r.cat.name}

          ${r.code}

          ${r.title}

          ${r.text}

          ${r.tag}

        `

          .toLowerCase()

          .includes(q)

      )

      .slice(
        0,
        30
      );


  target.innerHTML =
    res.length

      ? res

          .map(
            r => `

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

            `
          )

          .join("")


      : `

          <div
            class="result"
          >

            <h3>

              Nenhuma regra
              encontrada.

            </h3>


            <p>

              Tente outra
              palavra.

            </p>

          </div>

        `;

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function route(id) {

  document
    .querySelectorAll(
      ".page"
    )

    .forEach(
      p =>
        p.classList.remove(
          "active"
        )
    );


  if (
    id === "inicio"
  ) {

    $("inicio")
      .classList.add(
        "active"
      );

  }


  else if (
    id === "pesquisa"
  ) {

    $("searchPage")
      .classList.add(
        "active"
      );


    $("searchInput")
      .focus();

  }


  else {

    $("categoryPage")
      .classList.add(
        "active"
      );


    renderCategory(
      id
    );

  }


  document
    .querySelectorAll(
      ".sidebar nav button"
    )

    .forEach(
      b =>
        b.classList.toggle(
          "active",
          b.dataset.route === id
        )
    );


  $("sidebar")
    .classList.remove(
      "open"
    );


  window.scrollTo(
    0,
    0
  );

}


/* =========================================================
   CLIQUES
========================================================= */

document.addEventListener(
  "click",
  e => {

    const t =
      e.target.closest(
        "[data-route]"
      );


    if (!t) {

      return;

    }


    e.preventDefault();


    route(
      t.dataset.route
    );


    history.replaceState(
      null,
      "",
      "#" +
      t.dataset.route
    );

  }
);


/* =========================================================
   PESQUISA
========================================================= */

$("searchOpen").onclick =
  () => {

    $("searchOverlay")
      .classList.add(
        "open"
      );


    $("overlaySearch")
      .focus();

  };


$("searchClose").onclick =
  () => {

    $("searchOverlay")
      .classList.remove(
        "open"
      );

  };


$("overlaySearch").oninput =
  e => {

    search(
      e.target.value,
      $("overlayResults")
    );

  };


$("searchInput").oninput =
  e => {

    search(
      e.target.value,
      $("searchResults")
    );

  };


/* =========================================================
   MENU MOBILE
========================================================= */

$("mobileMenu").onclick =
  () => {

    $("sidebar")
      .classList.toggle(
        "open"
      );

  };


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
   ERROS
========================================================= */

load().catch(
  err => {

    console.error(
      err
    );


    document.body
      .insertAdjacentHTML(
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
              z-index:9999;
            "
          >

            Não foi possível
            carregar o conteúdo.

            Verifique se
            content/site.json
            e
            content/rules.json
            foram enviados.

          </div>

        `

      );

  }
);
