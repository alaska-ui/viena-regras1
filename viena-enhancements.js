/* VIENA RP — correções globais */
(() => {
  const BASE = new URL(".", document.baseURI).href;

  function asset(value) {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return BASE + value.replace(/^\/+/, "");
  }

  function parse(value) {
    if (value && typeof value.content === "string") {
      try { return JSON.parse(value.content); } catch (_) {}
    }
    return value;
  }

  async function json(path) {
    const response = await fetch(path + "?v=" + Date.now(), { cache: "no-store" });
    return parse(await response.json());
  }

  /*
   * Imagem que você já enviou pelo Admin.
   * Ela fica como fallback somente enquanto a categoria
   * ainda estiver sem imagem no rules.json.
   */
  const FALLBACK_IMAGES = {
    corridas: "uploads/ChatGPT Image 19 de ago. de 2026, 12_54_58.png"
  };

  function removeOldCursor() {
    document.getElementById("vienaCursor")?.remove();
    document.getElementById("vienaCursorStyle")?.remove();
  }

  function setupCursor(site) {
    removeOldCursor();

    const config = site?.cursor || {};
    if (config.enabled === false) return;

    const image = asset(
      config.image || "uploads/SPRAY PNG.png"
    );

    const size = Math.max(
      12,
      Math.min(96, Number(config.size) || 34)
    );

    const old = document.getElementById("vienaGlobalCursor");
    if (old) old.remove();

    const cursor = document.createElement("div");
    cursor.id = "vienaGlobalCursor";

    const css = document.createElement("style");
    css.id = "vienaGlobalCursorStyle";

    css.textContent = `
      html.viena-cursor-active,
      html.viena-cursor-active *,
      html.viena-cursor-active a,
      html.viena-cursor-active button,
      html.viena-cursor-active input,
      html.viena-cursor-active textarea,
      html.viena-cursor-active select,
      html.viena-cursor-active [role="button"] {
        cursor: none !important;
      }

      #vienaGlobalCursor,
      .viena-global-trail {
        pointer-events: none !important;
        user-select: none !important;
      }
    `;

    document.head.appendChild(css);
    document.documentElement.classList.add("viena-cursor-active");

    cursor.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      user-select: none;
      z-index: 2147483647;
      display: none;
      transform: translate(-50%, -50%);
      background-image: url("${image.replace(/"/g, "%22")}");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    `;

    document.documentElement.appendChild(cursor);

    document
      .querySelectorAll(".viena-global-trail")
      .forEach(x => x.remove());

    const trail = [];

    if (config.trail_enabled !== false) {
      const count = Math.max(
        2,
        Math.min(30, Number(config.trail_count) || 10)
      );

      const color = config.trail_color || "#e50914";

      for (let i = 0; i < count; i++) {
        const dot = document.createElement("span");
        dot.className = "viena-global-trail";

        const dotSize = Math.max(3, 9 - i * 0.5);
        const opacity = Math.max(0.05, 0.8 - i * 0.07);

        dot.style.cssText = `
          position: fixed;
          left: 0;
          top: 0;
          width: ${dotSize}px;
          height: ${dotSize}px;
          border-radius: 50%;
          pointer-events: none;
          user-select: none;
          z-index: 2147483646;
          background: ${color};
          opacity: ${opacity};
          transform: translate(-50%, -50%);
          display: none;
        `;

        document.documentElement.appendChild(dot);

        trail.push({
          el: dot,
          x: -100,
          y: -100
        });
      }
    }

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    window.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursor.style.display = "block";

      trail.forEach(item => {
        item.el.style.display = "block";
      });
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      cursor.style.display = "none";

      trail.forEach(item => {
        item.el.style.display = "none";
      });
    });

    function animate() {
      currentX += (mouseX - currentX) * 0.38;
      currentY += (mouseY - currentY) * 0.38;

      cursor.style.left = currentX + "px";
      cursor.style.top = currentY + "px";

      let previousX = currentX;
      let previousY = currentY;

      trail.forEach(item => {
        item.x += (previousX - item.x) * 0.25;
        item.y += (previousY - item.y) * 0.25;

        item.el.style.left = item.x + "px";
        item.el.style.top = item.y + "px";

        previousX = item.x;
        previousY = item.y;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  function applyCategoryImages(data) {
    const categories = data?.categories || [];

    categories.forEach(category => {
      const image = category.image || FALLBACK_IMAGES[category.id];

      if (!image) return;

      const safeId = CSS.escape(category.id);

      document
        .querySelectorAll(`[data-route="${safeId}"] .card-image`)
        .forEach(img => {
          img.src = asset(image);
        });

      const currentId = location.hash.replace(/^#/, "");

      if (currentId === category.id) {
        const catImage = document.getElementById("catImage");

        if (catImage) {
          catImage.src = asset(image);
          catImage.hidden = false;
        }
      }
    });
  }

  async function start() {
    try {
      const site = await json("content/site.json");
      setupCursor(site);

      const rules = await json("content/rules.json");
      applyCategoryImages(rules);

      const observer = new MutationObserver(() => {
        applyCategoryImages(rules);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      window.addEventListener("hashchange", () => {
        setTimeout(() => applyCategoryImages(rules), 80);
      });
    } catch (error) {
      console.error("Viena RP:", error);

      setupCursor({
        cursor: {
          enabled: true,
          image: "uploads/SPRAY PNG.png",
          size: 34,
          trail_enabled: true,
          trail_count: 10,
          trail_color: "#e50914"
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
