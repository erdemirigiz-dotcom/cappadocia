/* ═══════════════════════════════════════════════
   AURELIA — language detection, i18n, GSAP motion
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── 1. Language: auto-detect from browser, manual override ── */
  const SUPPORTED = Object.keys(LANGS);

  /* localStorage: Safari private mode'da erişim patlayabilir — sessizce vazgeç */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* yoksay */ } },
  };

  function detectLang() {
    const param = new URLSearchParams(location.search).get("lang"); // hreflang URL'leri
    if (param && SUPPORTED.includes(param)) return param;
    const saved = store.get("aurelia-lang");
    if (saved && SUPPORTED.includes(saved)) return saved;
    const prefs = navigator.languages || [navigator.language || "en"];
    for (const tag of prefs) {
      const base = String(tag).toLowerCase().split("-")[0];
      if (SUPPORTED.includes(base)) return base;
    }
    return "en"; // countries outside our list → English
  }

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang; // içerik pt-BR
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = dict[key] ?? I18N.en[key];
      if (val != null) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-content]").forEach((el) => {
      const key = el.getAttribute("data-i18n-content");
      const val = dict[key] ?? I18N.en[key];
      if (val != null) el.setAttribute("content", val);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      const val = dict[key] ?? I18N.en[key];
      if (val != null) el.setAttribute("placeholder", val);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const val = dict[key] ?? I18N.en[key];
      if (val != null) el.setAttribute("aria-label", val);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const val = dict[key] ?? I18N.en[key];
      if (val != null) el.setAttribute("title", val);
    });
    document.getElementById("langCurrent").textContent = lang.toUpperCase();
    document.querySelectorAll("#langMenu button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    store.set("aurelia-lang", lang);
    rebuildHeroTitle(); // re-split words after text swap
  }

  /* language menu */
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  SUPPORTED.forEach((code) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.dataset.lang = code;
    btn.setAttribute("role", "menuitem");
    btn.innerHTML = `<span>${LANGS[code]}</span><span>${code.toUpperCase()}</span>`;
    btn.addEventListener("click", () => {
      applyLang(code);
      // ?lang= parametresi kayıtlı tercihi ezmesin: URL'de varsa yeni seçime güncelle
      if (new URLSearchParams(location.search).has("lang")) {
        const u = new URL(location.href);
        u.searchParams.set("lang", code);
        history.replaceState(null, "", u);
      }
      langMenu.classList.remove("open");
      langBtn.setAttribute("aria-expanded", "false");
    });
    li.appendChild(btn);
    langMenu.appendChild(li);
  });
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = langMenu.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", () => {
    langMenu.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && langMenu.classList.contains("open")) {
      langMenu.classList.remove("open");
      langBtn.setAttribute("aria-expanded", "false");
      langBtn.focus();
    }
  });

  /* ── 2. Hero title word-by-word reveal ── */
  const heroTitle = document.getElementById("heroTitle");

  function rebuildHeroTitle() {
    const raw = heroTitle.textContent.trim();
    // CJK titles have no spaces — animate as one piece
    const parts = raw.includes(" ") ? raw.split(/\s+/) : [raw];
    heroTitle.innerHTML = parts
      .map((w) => `<span class="w"><span>${w}</span></span>`)
      .join(" ");
    const noMotion =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      location.search.includes("noanim");
    if (window.gsap && !noMotion) {
      gsap.fromTo(
        heroTitle.querySelectorAll(".w > span"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.09, delay: 0.15 }
      );
    }
  }

  /* ── 3. Apply detected language ── */
  applyLang(detectLang());

  /* ── 4. Header state + mobile nav ── */
  const header = document.getElementById("siteHeader");
  addEventListener("scroll", () => {
    header.classList.toggle("scrolled", scrollY > 40);
  }, { passive: true });

  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const setNav = (open) => {
    navToggle.classList.toggle("open", open);
    mainNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : ""; // menü açıkken arka plan kaymasın
    document.body.classList.toggle("nav-open", open);    // yapışkan bar menünün üstüne binmesin
  };
  navToggle.addEventListener("click", () => setNav(!mainNav.classList.contains("open")));
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setNav(false))
  );

  /* ── 4b. Ekran-dışı videolar: görünürken yükle/oynat, çıkınca durdur ── */
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lazyVids = document.querySelectorAll("video.lazy-vid");
  if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; v.preload = "metadata"; }
          if (!reducedMotion) v.play().catch(() => {});
        } else if (v.src) {
          v.pause();
        }
      });
    }, { rootMargin: "200px" });
    lazyVids.forEach((v) => vio.observe(v));
  } else {
    lazyVids.forEach((v) => { v.src = v.dataset.src; v.autoplay = !reducedMotion; });
  }

  /* ── 4c. Mobil yapışkan rezervasyon çubuğu: hero'dan sonra göster, form görünürken gizle ── */
  const mobileBar = document.getElementById("mobileBar");
  let bookVisible = false;
  const updateBar = () => {
    if (mobileBar) mobileBar.hidden = !(scrollY > innerHeight * 0.7) || bookVisible;
  };
  if ("IntersectionObserver" in window && mobileBar) {
    new IntersectionObserver((entries) => {
      bookVisible = entries.some((en) => en.isIntersecting);
      updateBar();
    }).observe(document.getElementById("book"));
  }
  addEventListener("scroll", updateBar, { passive: true });

  /* ── 5. Booking form (demo) ── */
  const bookDate = document.getElementById("bookDate");
  if (bookDate) bookDate.min = new Date().toISOString().slice(0, 10); // düne rezervasyon olmaz
  document.getElementById("bookForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById("bookSubmit");
    const labelEl = btn.querySelector(".btn-label");
    const sendingEl = btn.querySelector(".btn-sending");
    const bookDone = document.getElementById("bookDone");
    const bookError = document.getElementById("bookError");
    bookDone.hidden = true;
    bookError.hidden = true;
    btn.disabled = true;
    labelEl.hidden = true;
    sendingEl.hidden = false;

    // Form backend: a Cloudflare Worker endpoint (Telegram relay + honeypot + rate limit).
    // Replace with your own endpoint, or override at runtime via window.FORM_ENDPOINT.
    const endpoint = window.FORM_ENDPOINT || "https://vitrin-form.example.workers.dev/";
    let ok = false;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ site: "AURELIA Cappadocia (cappadocia-demo)", ...data }),
      });
      let payload = null;
      try { payload = await res.json(); } catch { /* boş/JSON olmayan yanıt */ }
      ok = res.ok && !!payload && payload.ok === true;
    } catch {
      ok = false; // ağ hatası — kullanıcıya "başarılı" DENMEZ
    }

    btn.disabled = false;
    labelEl.hidden = false;
    sendingEl.hidden = true;
    if (ok) {
      bookDone.hidden = false;
    } else {
      bookError.hidden = false;
    }
  });
  /* package cards preselect the booking dropdown */
  document.querySelectorAll("[data-pack]").forEach((a) =>
    a.addEventListener("click", () => {
      document.getElementById("bookPackage").value = a.dataset.pack;
    })
  );

  /* ── 6. GSAP scroll motion ── */
  const noAnim = location.search.includes("noanim");
  if (!window.gsap || !window.ScrollTrigger || noAnim) {
    document.body.classList.add("no-gsap");
    document.documentElement.style.scrollBehavior = "auto";
    if (location.hash) {
      const jump = () => document.querySelector(location.hash)?.scrollIntoView();
      addEventListener("load", () => requestAnimationFrame(jump));
      requestAnimationFrame(jump);
    }
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    const hv = document.getElementById("heroVideo");
    if (hv) hv.pause(); // hareket azaltan kullanıcıya döngü video oynatma; poster kalır
    return;
  }

  /* hero: slow zoom + darkening as you scroll away */
  gsap.to("#heroVideo", {
    scale: 1.14,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-content", {
    yPercent: -18,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "72% top", scrub: true },
  });

  /* hero intro lines */
  gsap.fromTo(
    ".reveal-line",
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.05, ease: "power3.out", stagger: 0.14, delay: 0.55 }
  );

  /* generic section reveals */
  const revealUp = (targets, trigger, stagger = 0.1) => {
    gsap.fromTo(
      targets,
      { y: 44, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.05, ease: "power3.out", stagger,
        scrollTrigger: { trigger, start: "top 78%" },
      }
    );
  };
  document.querySelectorAll(".section-head").forEach((h) => revealUp(h.children, h, 0.12));
  revealUp(".route-card", ".route-grid", 0.1);
  revealUp(".pack-card", ".pack-grid", 0.12);
  revealUp(".rev-card", ".rev-grid", 0.14);
  revealUp(".faq-item", ".faq-list", 0.08);
  revealUp(".book-form", ".book-form", 0);

  /* experience media: gentle parallax drift */
  gsap.fromTo(
    ".exp-media video",
    { yPercent: -7, scale: 1.12 },
    {
      yPercent: 7, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: ".exp-media", start: "top bottom", end: "bottom top", scrub: true },
    }
  );

  /* ── 7. İmza anları (scroll'a bağlı anlatım) ── */
  document.body.classList.add("gsap-on"); // başlangıç durumları bu sınıfla gelir; no-gsap'ta her şey açık

  /* 7a. Timeline: altın iplik scroll'la dolar, saatler sırayla uyanır (04:30 → 07:00) */
  gsap.fromTo("#tlLineFill", { scaleY: 0 }, {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 62%", end: "bottom 62%", scrub: true },
  });
  document.querySelectorAll(".tl-item").forEach((item) => {
    ScrollTrigger.create({
      trigger: item, start: "top 62%",
      toggleClass: { targets: item, className: "tl-active" },
    });
  });

  /* 7b. Route: sabah rüzgârı rotayı çizer; çizgi biterken balon-nokta parlar */
  const windPath = document.getElementById("windPath");
  if (windPath) {
    const len = windPath.getTotalLength();
    gsap.set(windPath, { strokeDasharray: len, strokeDashoffset: len });
    const windScrub = { trigger: ".route", start: "top 55%", end: "bottom 80%", scrub: true };
    gsap.to(windPath, { strokeDashoffset: 0, ease: "none", scrollTrigger: windScrub });
    gsap.to("#windDot", {
      opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".route", start: "72% 80%", end: "bottom 80%", scrub: true },
    });
  }
})();
