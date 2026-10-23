(() => {
  // Free key from https://web3forms.com (sent to hello@webzuno.com). Empty = fall back to the visitor's mail app.
  const WEB3FORMS_KEY = "";
  const CONTACT_EMAIL = "hello@webzuno.com";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const mobile = () => window.innerWidth < 769;

  const loader = document.getElementById("loader");
  const fill = document.querySelector(".loader-bar-fill");
  const pct = document.querySelector(".loader-pct");
  const bar = document.querySelector(".loader-bar");
  const nav = document.getElementById("nav");
  const menu = document.getElementById("mobile-menu");
  const toggle = document.querySelector(".nav-toggle");
  const glow = document.querySelector(".page-glow");
  const progress = document.querySelector(".scroll-progress span");
  const contactOverlay = document.getElementById("contact-overlay");
  const legalOverlay = document.getElementById("legal-overlay");
  const planSelect = document.getElementById("contact-plan");
  const form = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const themeBtn = document.getElementById("theme-toggle");
  const waFloat = document.querySelector(".wa-float");

  let lenis;

  function lock(on) {
    document.body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  }

  function initTheme() {
    const root = document.documentElement;
    const apply = (mode) => {
      root.dataset.theme = mode;
      localStorage.setItem("webzuno-theme", mode);
      themeBtn?.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
    };
    apply(root.dataset.theme || "dark");
    themeBtn?.addEventListener("click", () => {
      apply(root.dataset.theme === "dark" ? "light" : "dark");
      window.dispatchEvent(new CustomEvent("webzuno-theme", { detail: root.dataset.theme }));
    });
    window.addEventListener("storage", (e) => {
      if (e.key !== "webzuno-theme" || !e.newValue || e.newValue === root.dataset.theme) return;
      apply(e.newValue);
      window.dispatchEvent(new CustomEvent("webzuno-theme", { detail: root.dataset.theme }));
    });
  }

  function runLoader() {
    if (!loader) return Promise.resolve();
    const seen = sessionStorage.getItem("webzuno-seen");
    const duration = seen || reduce ? 360 : 1100;
    const start = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const value = Math.round(t * 100);
        if (fill) fill.style.width = `${value}%`;
        if (pct) pct.textContent = `${value}%`;
        if (bar) bar.setAttribute("aria-valuenow", String(value));
        if (t < 1) requestAnimationFrame(tick);
        else {
          loader.classList.add("is-done");
          sessionStorage.setItem("webzuno-seen", "1");
          setTimeout(resolve, reduce ? 0 : 180);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  function initSmooth() {
    if (reduce || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollTo(target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -12 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function bindAnchors() {
    document.querySelectorAll("[data-scroll]").forEach((node) => {
      node.addEventListener("click", (e) => {
        const href = node.getAttribute("data-scroll") || node.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        e.preventDefault();
        closeMenu();
        scrollTo(href);
      });
    });
  }

  function initNav() {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
      waFloat?.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.5);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (progress) progress.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = ["#home", "#services", "#work", "#process", "#pricing", "#about"];
    if (!reduce && window.ScrollTrigger) {
      sections.forEach((id) => {
        const el = document.querySelector(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            document.querySelectorAll(".nav-links a").forEach((a) => {
              a.classList.toggle("is-active", a.getAttribute("href") === id && self.isActive);
            });
          }
        });
      });
    }

    toggle?.addEventListener("click", () => {
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });
  }

  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("is-open"));
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    lock(true);
    if (!reduce && typeof gsap !== "undefined") {
      gsap.fromTo(".mobile-menu-links a", { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: "power3.out" });
    }
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    lock(false);
    setTimeout(() => {
      if (!menu.classList.contains("is-open")) menu.hidden = true;
    }, 400);
  }

  function initMagnetic() {
    if (touch || reduce || typeof gsap === "undefined") return;
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.22,
          y: (e.clientY - (r.top + r.height / 2)) * 0.22,
          duration: 0.35,
          ease: "power3.out"
        });
      });
      btn.addEventListener("pointerleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "expo.out" });
      });
    });
  }

  function heroIntro() {
    if (typeof gsap === "undefined" || reduce) return;
    gsap.from(".hero-copy > *", { y: 22, opacity: 0, stagger: 0.08, duration: 0.75, ease: "power3.out" });
    gsap.from(".hero-stage", { opacity: 0, scale: 0.96, duration: 1, delay: 0.1, ease: "expo.out" });
  }

  function initOrb() {
    const canvas = document.getElementById("orb");
    const kicker = document.getElementById("orb-kicker");
    const caption = document.getElementById("orb-caption");
    if (!canvas) return;

    const slides = [
      { id: "cube", kicker: "Modular", caption: "Websites built from solid blocks" },
      { id: "wave", kicker: "Flow", caption: "Smooth on every screen" },
      { id: "sphere", kicker: "Global", caption: "Take your business worldwide" },
      { id: "helix", kicker: "Connected", caption: "Every part of your business, linked" },
      { id: "infinity", kicker: "Infinite", caption: "Endless possibilities online" },
      { id: "ripple", kicker: "Impact", caption: "Every visit makes a ripple" },
      { id: "galaxy", kicker: "Stand out", caption: "Shine in a crowded market" }
    ];

    const setCopy = (i) => {
      if (kicker) kicker.textContent = slides[i].kicker;
      if (caption) caption.textContent = slides[i].caption;
    };
    setCopy(0);

    if (reduce) {
      let i = 0;
      setInterval(() => {
        i = (i + 1) % slides.length;
        setCopy(i);
      }, 5000);
      return;
    }

    const ctx = canvas.getContext("2d");
    const n = mobile() ? 1331 : 2744;
    const G = Math.round(Math.cbrt(n));
    const TAU = Math.PI * 2;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const hash = (seed) => Float32Array.from({ length: n }, (_, i) => {
      const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      return s - Math.floor(s);
    });
    const H1 = hash(1);
    const H2 = hash(2);
    const H3 = hash(3);
    const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); const y = p[1] * c - p[2] * s; p[2] = p[1] * s + p[2] * c; p[1] = y; };
    const rotY = (p, a) => { const c = Math.cos(a), s = Math.sin(a); const x = p[0] * c + p[2] * s; p[2] = -p[0] * s + p[2] * c; p[0] = x; };
    const rotZ = (p, a) => { const c = Math.cos(a), s = Math.sin(a); const x = p[0] * c - p[1] * s; p[1] = p[0] * s + p[1] * c; p[0] = x; };
    const set = (p, x, y, z) => { p[0] = x; p[1] = y; p[2] = z; };
    const wCols = Math.ceil(Math.sqrt(n * 1.5));
    const wRows = Math.ceil(n / wCols);
    const iRows = 18;
    const iCols = Math.ceil(n / iRows);
    const lemniscate = (q) => {
      const d = 1 + Math.sin(q) * Math.sin(q);
      return [(1.2 * Math.cos(q)) / d, (1.2 * Math.sin(q) * Math.cos(q)) / d];
    };

    const effects = {
      cube: (i, t, p) => {
        const a = i % G, b = Math.floor(i / G) % G, c = Math.floor(i / (G * G)) % G;
        const s = 1.35 / (G - 1);
        set(p, (a - (G - 1) / 2) * s, (b - (G - 1) / 2) * s, (c - (G - 1) / 2) * s);
        rotY(p, t * 0.28 + 0.6);
        rotX(p, 0.42 + Math.sin(t * 0.3) * 0.12);
      },
      wave: (i, t, p) => {
        const a = i % wCols, b = Math.floor(i / wCols);
        const x = (a / (wCols - 1) - 0.5) * 3.4;
        const z = (b / (wRows - 1) - 0.5) * 2.2;
        const y = 0.24 * Math.sin(x * 1.7 + t) + 0.16 * Math.sin(z * 2.4 + t * 0.75 + x * 0.6) + 0.07 * Math.sin((x - z) * 3.4 - t * 1.5);
        set(p, x, -y, z);
        rotY(p, Math.sin(t * 0.12) * 0.25 - 0.18);
        rotX(p, 0.52);
      },
      sphere: (i, t, p) => {
        const yy = 1 - (2 * (i + 0.5)) / n;
        const r = Math.sqrt(1 - yy * yy);
        const th = golden * i;
        const bump = (1 + 0.045 * Math.sin(yy * 9 + t * 2.2)) * 1.05;
        set(p, Math.cos(th) * r * bump, yy * bump, Math.sin(th) * r * bump);
        rotY(p, t * 0.22);
        rotX(p, 0.28);
      },
      helix: (i, t, p) => {
        const turns = 3;
        if (H1[i] < 0.7) {
          const u = H2[i];
          const ang = u * TAU * turns + (i % 2) * Math.PI + t * 0.8;
          const rad = 0.42 + (H3[i] - 0.5) * 0.07;
          set(p, Math.cos(ang) * rad, (u - 0.5) * 2.2 + (H3[i] - 0.5) * 0.04, Math.sin(ang) * rad);
        } else {
          const rungs = 30;
          const u = (Math.floor(H2[i] * rungs) + 0.5) / rungs;
          const ang = u * TAU * turns + t * 0.8;
          const f = H3[i] * 2 - 1;
          set(p, Math.cos(ang) * 0.42 * f, (u - 0.5) * 2.2, Math.sin(ang) * 0.42 * f);
        }
        rotZ(p, 0.55);
        rotX(p, 0.25);
      },
      infinity: (i, t, p) => {
        const a = i % iCols, b = Math.floor(i / iCols);
        const u = (a / iCols) * TAU + t * 0.35;
        const v = (b / iRows) * TAU;
        const [x, y] = lemniscate(u);
        const [x2, y2] = lemniscate(u + 0.002);
        const l = Math.hypot(x2 - x, y2 - y) || 1;
        const nx = -(y2 - y) / l;
        const ny = (x2 - x) / l;
        const r = 0.16;
        set(p, x + nx * r * Math.cos(v), y + ny * r * Math.cos(v), r * Math.sin(v) + 0.2 * Math.sin(u));
        rotX(p, 0.45 + Math.sin(t * 0.25) * 0.15);
        rotY(p, Math.sin(t * 0.2) * 0.45);
      },
      ripple: (i, t, p) => {
        const a = i % wCols, b = Math.floor(i / wCols);
        const x = (a / (wCols - 1) - 0.5) * 3.0;
        const z = (b / (wRows - 1) - 0.5) * 2.2;
        const d = Math.hypot(x, z);
        set(p, x, -0.26 * Math.sin(d * 6 - t * 2.6) * Math.exp(-d * 0.85), z);
        rotY(p, t * 0.08);
        rotX(p, 0.6);
      },
      galaxy: (i, t, p) => {
        const arms = 4;
        const r = 0.08 + Math.pow(H1[i], 0.75) * 1.2;
        const ang = (i % arms) * (TAU / arms) + r * 2.8 + (H2[i] - 0.5) * 0.45 * (1.4 - r) - t * 0.18;
        const rr = r + (H3[i] - 0.5) * 0.08;
        set(p, Math.cos(ang) * rr, (H3[i] - 0.5) * 0.12 * (1.4 - r), Math.sin(ang) * rr);
        rotX(p, 0.95);
        rotZ(p, 0.22);
      }
    };
    const fns = slides.map((s) => effects[s.id]);

    const palettes = {
      dark: { rgb: [196, 222, 255], core: "255,255,255", blend: "lighter" },
      light: { rgb: [21, 88, 224], core: "21,88,224", blend: "source-over" }
    };
    const themeKey = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
    let palette = palettes[themeKey()];
    const sprite = document.createElement("canvas");
    const makeSprite = () => {
      const [r, g, b] = palette.rgb;
      sprite.width = sprite.height = 64;
      const s = sprite.getContext("2d");
      const grd = s.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, `rgba(${palette.core},1)`);
      grd.addColorStop(0.16, `rgba(${r},${g},${b},1)`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},0.22)`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      s.clearRect(0, 0, 64, 64);
      s.fillStyle = grd;
      s.fillRect(0, 0, 64, 64);
    };
    makeSprite();
    window.addEventListener("webzuno-theme", (e) => {
      palette = palettes[e.detail === "light" ? "light" : "dark"];
      makeSprite();
    });

    const stage = canvas.parentElement;
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width - 0.5;
      tmy = (e.clientY - r.top) / r.height - 0.5;
    });
    stage.addEventListener("pointerleave", () => { tmx = 0; tmy = 0; });

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth;
      h = stage.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stage);
    }

    const A = [0, 0, 0];
    const B = [0, 0, 0];
    const D = 3.6;
    const HOLD = 6;
    const MORPH = 2.2;
    let from = 0;
    let to = 0;
    let morph = 1;
    let hold = 0;
    let t = 0;
    let last = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      t += dt;
      if (morph < 1) {
        morph = Math.min(1, morph + dt / MORPH);
        if (morph >= 0.5) setCopy(to);
        if (morph >= 1) from = to;
      } else {
        hold += dt;
        if (hold >= HOLD) {
          hold = 0;
          morph = 0;
          to = (from + 1) % slides.length;
        }
      }
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = palette.blend;
      const f = Math.min(w * 0.78, h * 0.95);
      const cx = w * 0.5;
      const cy = h * 0.45;
      const fa = fns[from];
      const fb = fns[to];
      const morphing = morph < 1;
      for (let i = 0; i < n; i += 1) {
        fa(i, t, A);
        if (morphing) {
          fb(i, t, B);
          let k = Math.min(1, Math.max(0, morph * 1.45 - H1[i] * 0.45));
          k = k * k * (3 - 2 * k);
          A[0] += (B[0] - A[0]) * k;
          A[1] += (B[1] - A[1]) * k;
          A[2] += (B[2] - A[2]) * k;
        }
        rotY(A, mx * 0.5);
        rotX(A, my * 0.3);
        const zz = A[2] + D;
        if (zz < 0.3) continue;
        const s = f / zz;
        const depth = Math.min(1, Math.max(0, (D + 1.3 - zz) / 2.6));
        const size = (1.1 + depth * 2.8) * 2.3;
        ctx.globalAlpha = 0.12 + depth * 0.78;
        ctx.drawImage(sprite, cx + A[0] * s - size / 2, cy + A[1] * s - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    requestAnimationFrame(draw);
  }

  function revealLines() {
    if (reduce || typeof gsap === "undefined") return;
    document.querySelectorAll(".problem .line > span").forEach((span) => {
      gsap.fromTo(span, { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.05,
        ease: "power4.out",
        scrollTrigger: { trigger: span.closest(".line"), start: "top 86%" }
      });
    });
    const typed = document.getElementById("pb-typed");
    if (typed) {
      const query = typed.textContent;
      const state = { n: 0 };
      typed.textContent = "";
      gsap.timeline({ scrollTrigger: { trigger: ".problem-art", start: "top 80%", once: true } })
        .from(".pb-phone, .pb-notch, .pb-search", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" })
        .to(state, {
          n: query.length,
          duration: query.length * 0.07,
          ease: "none",
          onUpdate: () => { typed.textContent = query.slice(0, Math.round(state.n)); }
        })
        .from(".pb-result", { opacity: 0, x: 24, duration: 0.5, stagger: 0.18, ease: "power3.out" }, "+=0.15")
        .from(".pb-missing > *", { opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, "+=0.1");
    }
    gsap.to(".drift-left", {
      xPercent: 6,
      ease: "none",
      scrollTrigger: { trigger: ".problem", start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.to(".drift-right", {
      xPercent: -6,
      ease: "none",
      scrollTrigger: { trigger: ".problem", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  function initWordBunches() {
    const bunches = gsap.utils.toArray(".do-words .bunch");
    const icons = gsap.utils.toArray(".do-icons li");
    if (!bunches.length) return;
    if (reduce) {
      bunches.forEach((b) => b.classList.add("is-on"));
      icons.forEach((icon) => icon.classList.add("is-on"));
      return;
    }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      ScrollTrigger.create({
        trigger: ".do-pin",
        start: "top 18%",
        end: "+=90%",
        pin: true,
        scrub: 0.55,
        onUpdate: (self) => {
          bunches.forEach((bunch, i) => {
            if (i === 0) {
              bunch.classList.add("is-on");
              return;
            }
            bunch.classList.toggle("is-on", self.progress > (i - 1) / (bunches.length - 1) + 0.06);
          });
          icons.forEach((icon, i) => {
            icon.classList.toggle("is-on", self.progress > 0.04 + (i / icons.length) * 0.9);
          });
        }
      });
    });
    mm.add("(max-width: 768px)", () => {
      bunches[0]?.classList.add("is-on");
      icons.forEach((icon) => icon.classList.add("is-on"));
      bunches.slice(1).forEach((bunch) => {
        ScrollTrigger.create({
          trigger: bunch,
          start: "top 82%",
          onEnter: () => bunch.classList.add("is-on")
        });
      });
    });
  }

  function initTransform() {
    if (typeof gsap === "undefined") return;
    if (reduce) {
      gsap.set(".browser", { scale: 1 });
      gsap.set(".screen-b, .tablet, .phone", { opacity: 1, y: 0 });
      return;
    }
    gsap.set(".browser", { scale: 1 });
    gsap.set(".screen-a", { opacity: 1, filter: "blur(0px)" });
    gsap.set(".screen-b", { opacity: 0 });
    gsap.set(".tablet, .phone", { opacity: 0, y: 40 });
    const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power2.inOut" } });
    tl.to({}, { duration: 1.8 })
      .to(".screen-a", { opacity: 0, filter: "blur(8px)", duration: 0.8 })
      .to(".screen-b", { opacity: 1, duration: 0.8 }, "<0.15")
      .fromTo(".screen-b .mx", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" }, "<0.1")
      .to(".tablet", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
      .to(".phone", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.45")
      .to({}, { duration: 3 })
      .to(".tablet, .phone", { opacity: 0, y: 40, duration: 0.6 })
      .to(".screen-b", { opacity: 0, duration: 0.7 }, "<0.2")
      .to(".screen-a", { opacity: 1, filter: "blur(0px)", duration: 0.7 }, "<0.15");
    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: ".transform",
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause())
      });
    } else {
      tl.play();
    }
  }

  function initSpiral() {
    const cards = gsap.utils.toArray(".sample");
    const stage = document.querySelector(".sample-pin");
    if (!cards.length || !stage) return;
    if (reduce || mobile()) return;
    const cols = window.innerWidth <= 1024 ? 2 : 3;
    gsap.from(cards, {
      x: (i) => [-120, 0, 120][cols === 3 ? i % 3 : (i % 2) * 2],
      y: (i) => (Math.floor(i / cols) === 0 ? -60 : 60),
      scale: 0.82,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.09,
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: stage, start: "top 78%", once: true }
    });
  }

  function initProcess() {
    if (reduce) {
      document.querySelectorAll(".process-steps li").forEach((li) => li.classList.add("is-in"));
      gsap.set(".process-line span", { scaleX: 1 });
      return;
    }
    gsap.to(".process-line span", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".process-rail", start: "top 75%", end: "bottom 40%", scrub: true }
    });
    const artPath = document.querySelector(".pa-path");
    if (artPath) {
      const len = artPath.getTotalLength();
      gsap.set(artPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.timeline({ scrollTrigger: { trigger: ".process-art", start: "top 80%", once: true } })
        .from(".pa-start", { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" })
        .to(artPath, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "-=0.2")
        .from(".pa-node", { scale: 0, opacity: 0, duration: 0.45, stagger: 0.24, ease: "back.out(2.4)" }, "<0.15")
        .from(".pa-end", { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" }, "-=0.35")
        .from(".pa-bars", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.4");
    }
    document.querySelectorAll(".process-steps li").forEach((li) => {
      ScrollTrigger.create({
        trigger: li,
        start: "top 85%",
        onEnter: () => li.classList.add("is-in")
      });
    });
  }

  function initBenefits() {
    const words = document.querySelectorAll(".benefit-words li");
    if (reduce) {
      words.forEach((w) => w.classList.add("is-on"));
      return;
    }
    words.forEach((word, i) => {
      ScrollTrigger.create({
        trigger: word,
        start: "top 88%",
        onEnter: () => gsap.delayedCall(i * 0.06, () => word.classList.add("is-on"))
      });
    });
  }

  function initCounters() {
    if (reduce || typeof gsap === "undefined" || !window.ScrollTrigger) return;
    document.querySelectorAll(".count").forEach((node) => {
      const end = Number(node.dataset.count || 0);
      const obj = { n: 0 };
      ScrollTrigger.create({
        trigger: node,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            n: end,
            duration: 1.4,
            ease: "power3.out",
            onUpdate: () => { node.textContent = String(Math.round(obj.n)); }
          });
        }
      });
    });
  }

  function initFinale() {
    if (reduce) return;
    gsap.fromTo(".finale-w", { scale: 0.72, opacity: 0.02 }, {
      scale: 1,
      opacity: 0.1,
      ease: "none",
      scrollTrigger: { trigger: ".finale", start: "top 80%", end: "center center", scrub: true }
    });
    gsap.fromTo(".finale-light", { xPercent: -40 }, {
      xPercent: 40,
      ease: "none",
      scrollTrigger: { trigger: ".finale", start: "top 70%", end: "bottom 40%", scrub: true }
    });
    gsap.from(".finale h2, .finale-sub, .finale-actions, .finale-card", {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".finale h2", start: "top 80%" }
    });
  }

  function initTrust() {
    const section = document.querySelector(".trust");
    if (!section || reduce) return;
    const counts = section.querySelectorAll(".trust-count");
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 75%", once: true } });
    tl.from(".trust-card", { y: 34, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" })
      .from(".tg-arc", { strokeDasharray: "0 100", duration: 1.4, ease: "power2.out" }, 0.2)
      .from(".trust-checks li", { x: -14, opacity: 0, duration: 0.4, stagger: 0.14, ease: "power2.out" }, 0.4)
      .from(".trust-bars i", { scaleY: 0, duration: 0.5, stagger: 0.025, ease: "power2.out" }, 0.4);
    counts.forEach((el) => {
      const to = Number(el.dataset.to);
      const decimals = Number(el.dataset.decimals || 0);
      const state = { v: 0 };
      el.textContent = (0).toFixed(decimals);
      tl.to(state, {
        v: to,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => { el.textContent = state.v.toFixed(decimals); }
      }, 0.2);
    });
  }

  function openContact(plan) {
    closeMenu();
    contactOverlay.hidden = false;
    if (plan && planSelect) planSelect.value = plan;
    lock(true);
    contactOverlay.querySelector("input")?.focus();
  }

  function closeOverlays() {
    contactOverlay.hidden = true;
    if (legalOverlay) legalOverlay.hidden = true;
    lock(false);
  }

  function initOverlays() {
    document.querySelectorAll("[data-open-contact]").forEach((btn) => {
      btn.addEventListener("click", () => openContact(btn.dataset.plan || ""));
    });
    document.querySelectorAll("[data-open-legal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const which = btn.dataset.openLegal;
        document.getElementById("legal-privacy").hidden = which !== "privacy";
        document.getElementById("legal-terms").hidden = which !== "terms";
        legalOverlay.querySelector('[role="dialog"]').setAttribute("aria-labelledby", which === "terms" ? "legal-terms-title" : "legal-title");
        const scroller = legalOverlay.querySelector(".legal-scroll");
        if (scroller) scroller.scrollTop = 0;
        legalOverlay.hidden = false;
        lock(true);
      });
    });
    if (location.hash === "#privacy" || location.hash === "#terms") {
      document.querySelector(`.footer-legal [data-open-legal="${location.hash.slice(1)}"]`)?.click();
    }
    document.querySelectorAll("[data-close-overlay]").forEach((btn) => {
      btn.addEventListener("click", closeOverlays);
    });
    contactOverlay.addEventListener("click", (e) => {
      if (e.target === contactOverlay) closeOverlays();
    });
    legalOverlay?.addEventListener("click", (e) => {
      if (e.target === legalOverlay) closeOverlays();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlays();
    });
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("toggle", () => window.ScrollTrigger?.refresh());
    });
    bindEnquiryForm(form, formSuccess, "New Webzuno project");
    bindEnquiryForm(document.getElementById("quick-form"), document.getElementById("quick-success"), "New Webzuno enquiry");
  }

  function bindEnquiryForm(el, success, subjectPrefix) {
    if (!el || !success) return;
    const button = el.querySelector('button[type="submit"]');
    const status = el.querySelector(".form-status");
    el.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(el);
      if (data.get("botcheck")) return;
      const subject = `${subjectPrefix} — ${data.get("business")}`;
      const done = (sent) => {
        if (sent) success.textContent = "Thanks — your enquiry is in. We’ll reply within one working day.";
        el.hidden = true;
        success.hidden = false;
      };

      if (!WEB3FORMS_KEY) {
        const body = encodeURIComponent(
          `Name: ${data.get("name")}\nBusiness: ${data.get("business")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nPlan: ${data.get("plan")}\n\n${data.get("message") || ""}`
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
        done();
        return;
      }

      data.append("access_key", WEB3FORMS_KEY);
      data.append("subject", subject);
      data.append("from_name", "Webzuno website");
      const label = button ? button.innerHTML : "";
      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }
      if (status) status.textContent = "";
      try {
        const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data, headers: { Accept: "application/json" } });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Send failed");
        done(true);
      } catch {
        if (status) status.innerHTML = `Couldn’t send just now. Please try again or email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = label;
        }
      }
    });
  }

  async function start() {
    initTheme();
    const hasGsap = typeof gsap !== "undefined";
    if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    await runLoader();
    bindAnchors();
    initNav();
    initOverlays();
    initOrb();
    if (!hasGsap) return;
    initSmooth();
    initMagnetic();
    heroIntro();
    revealLines();
    initWordBunches();
    initTransform();
    initSpiral();
    initProcess();
    initBenefits();
    initCounters();
    initFinale();
    initTrust();
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      window.addEventListener("resize", () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
