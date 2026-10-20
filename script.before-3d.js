(() => {
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
      { id: "globe", kicker: "WWW / Internet", caption: "Take your business worldwide" },
      { id: "puzzle", kicker: "Building", caption: "We build your website" },
      { id: "blocks", kicker: "Development", caption: "Building digital experiences" },
      { id: "house", kicker: "Business / home", caption: "Your business’s digital home" },
      { id: "building", kicker: "Company", caption: "Bring your company online" },
      { id: "shop", kicker: "Local business", caption: "Websites for local shops" },
      { id: "cart", kicker: "E-commerce", caption: "Sell online" },
      { id: "chain", kicker: "Hyperlink", caption: "Connect your customers" },
      { id: "web", kicker: "World Wide Web", caption: "World Wide Webzuno" },
      { id: "bolt", kicker: "Speed", caption: "Fast websites" }
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
    const n = mobile() ? 520 : 1100;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const fit = (pts) => {
      const out = new Array(n);
      const len = pts.length || 1;
      for (let i = 0; i < n; i += 1) {
        const t = (i / n) * len;
        const a = Math.floor(t) % len;
        const b = (a + 1) % len;
        const f = t - Math.floor(t);
        const pa = pts[a];
        const pb = pts[b];
        out[i] = {
          x: pa.x + (pb.x - pa.x) * f,
          y: pa.y + (pb.y - pa.y) * f,
          z: pa.z + (pb.z - pa.z) * f
        };
      }
      return out;
    };
    const walk = (path, closed = false) => {
      const segs = [];
      for (let i = 0; i < path.length - 1; i += 1) segs.push([path[i], path[i + 1]]);
      if (closed && path.length > 2) segs.push([path[path.length - 1], path[0]]);
      const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], (b[2] || 0) - (a[2] || 0)));
      return { segs, lens, total: lens.reduce((s, v) => s + v, 0) || 1 };
    };
    const at = (path, closed, d) => {
      const { segs, lens } = walk(path, closed);
      let rest = d;
      for (let s = 0; s < segs.length; s += 1) {
        if (rest <= lens[s] || s === segs.length - 1) {
          const [a, b] = segs[s];
          const t = lens[s] ? rest / lens[s] : 0;
          return {
            x: a[0] + (b[0] - a[0]) * t,
            y: a[1] + (b[1] - a[1]) * t,
            z: (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * t
          };
        }
        rest -= lens[s];
      }
      const last = path[path.length - 1];
      return { x: last[0], y: last[1], z: last[2] || 0 };
    };
    const line = (pts, path, count, closed = false) => {
      const { total } = walk(path, closed);
      for (let i = 0; i < count; i += 1) {
        pts.push(at(path, closed, ((i + 0.5) / count) * total));
      }
    };
    const ribbon = (pts, path, count, closed = false, layers = [-0.05, 0, 0.05]) => {
      const each = Math.floor(count / layers.length);
      layers.forEach((z) => {
        const shifted = path.map((p) => [p[0], p[1], (p[2] || 0) + z]);
        line(pts, shifted, each, closed);
      });
    };
    const oval = (pts, cx, cy, rx, ry, count, z = 0) => {
      const path = [];
      for (let i = 0; i <= 48; i += 1) {
        const a = (i / 48) * Math.PI * 2;
        path.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z]);
      }
      line(pts, path, count, true);
    };
    const rect = (pts, x, y, w, h, count, z = 0) => {
      ribbon(pts, [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], count, true);
    };
    const fill = (pts, poly, rows, perRow, z = 0) => {
      let minY = Infinity;
      let maxY = -Infinity;
      poly.forEach((p) => {
        minY = Math.min(minY, p[1]);
        maxY = Math.max(maxY, p[1]);
      });
      for (let r = 0; r < rows; r += 1) {
        const y = minY + ((r + 0.5) / rows) * (maxY - minY);
        const xs = [];
        for (let i = 0; i < poly.length; i += 1) {
          const a = poly[i];
          const b = poly[(i + 1) % poly.length];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
            const t = (y - a[1]) / ((b[1] - a[1]) || 1e-6);
            xs.push(a[0] + (b[0] - a[0]) * t);
          }
        }
        xs.sort((u, v) => u - v);
        for (let k = 0; k < xs.length - 1; k += 2) {
          for (let p = 0; p < perRow; p += 1) {
            pts.push({
              x: xs[k] + (xs[k + 1] - xs[k]) * ((p + 0.5) / perRow),
              y,
              z
            });
          }
        }
      }
    };
    const cube = (pts, cx, cy, s) => {
      const top = [[cx, cy - s * 0.58, 0], [cx + s, cy - s * 0.28, 0.12], [cx, cy + 0.02, 0.22], [cx - s, cy - s * 0.28, 0.12]];
      const left = [[cx - s, cy - s * 0.28, 0.12], [cx, cy + 0.02, 0.22], [cx, cy + s * 0.72, 0.22], [cx - s, cy + s * 0.42, 0.12]];
      const right = [[cx + s, cy - s * 0.28, 0.12], [cx, cy + 0.02, 0.22], [cx, cy + s * 0.72, 0.22], [cx + s, cy + s * 0.42, 0.12]];
      ribbon(pts, top, 70, true);
      ribbon(pts, left, 70, true);
      ribbon(pts, right, 70, true);
    };

    const makers = {
      globe: () => {
        const pts = [];
        const count = Math.floor(n * 0.58);
        for (let i = 0; i < count; i += 1) {
          const y = 1 - (i / Math.max(1, count - 1)) * 2;
          const rad = Math.sqrt(Math.max(0, 1 - y * y));
          const th = golden * i;
          pts.push({ x: Math.cos(th) * rad, y: y * 0.98, z: Math.sin(th) * rad });
        }
        [-0.66, -0.33, 0, 0.33, 0.66].forEach((lat) => {
          const r = Math.sqrt(Math.max(0.06, 1 - lat * lat));
          const path = [];
          for (let k = 0; k <= 40; k += 1) {
            const a = (k / 40) * Math.PI * 2;
            path.push([Math.cos(a) * r, lat, Math.sin(a) * r]);
          }
          line(pts, path, 80, true);
        });
        for (let m = 0; m < 8; m += 1) {
          const yaw = (m / 8) * Math.PI;
          const path = [];
          for (let k = 0; k <= 32; k += 1) {
            const a = (k / 32) * Math.PI * 2;
            path.push([Math.sin(a) * Math.cos(yaw), Math.cos(a), Math.sin(a) * Math.sin(yaw)]);
          }
          line(pts, path, 64, true);
        }
        return fit(pts);
      },
      puzzle: () => {
        const pts = [];
        const piece = [
          [-0.62, -0.36], [-0.16, -0.36],
          [-0.08, -0.56], [0.12, -0.7], [0.3, -0.5], [0.22, -0.36],
          [0.62, -0.36], [0.62, 0.02],
          [0.82, 0.1], [0.9, 0.32], [0.66, 0.44], [0.62, 0.26],
          [0.62, 0.62], [-0.1, 0.62],
          [-0.2, 0.42], [-0.42, 0.34], [-0.52, 0.56], [-0.2, 0.62],
          [-0.62, 0.62], [-0.62, 0.16],
          [-0.4, 0.06], [-0.32, -0.16], [-0.58, -0.24], [-0.62, -0.02]
        ];
        fill(pts, piece, 28, 18, 0);
        ribbon(pts, piece.map((p) => [p[0], p[1], 0]), 220, true);
        return fit(pts);
      },
      blocks: () => {
        const pts = [];
        cube(pts, -0.42, 0.2, 0.38);
        cube(pts, 0.42, 0.2, 0.38);
        cube(pts, 0, -0.42, 0.38);
        return fit(pts);
      },
      house: () => {
        const pts = [];
        fill(pts, [[-0.7, -0.08], [0.7, -0.08], [0.7, 0.88], [-0.7, 0.88]], 22, 16, 0);
        fill(pts, [[-0.92, -0.08], [0, -0.92], [0.92, -0.08]], 16, 18, 0);
        ribbon(pts, [[-0.92, -0.08, 0], [0, -0.92, 0], [0.92, -0.08, 0]], 90, false);
        ribbon(pts, [[-0.7, -0.08, 0], [-0.7, 0.88, 0], [0.7, 0.88, 0], [0.7, -0.08, 0]], 140, true);
        rect(pts, -0.16, 0.32, 0.32, 0.56, 70);
        rect(pts, -0.5, 0.08, 0.2, 0.2, 40);
        rect(pts, 0.3, 0.08, 0.2, 0.2, 40);
        ribbon(pts, [[0.42, -0.42, 0], [0.42, -0.78, 0], [0.58, -0.78, 0], [0.58, -0.28, 0]], 50, false);
        return fit(pts);
      },
      building: () => {
        const pts = [];
        fill(pts, [[-0.48, -0.82], [0.48, -0.82], [0.48, 0.86], [-0.48, 0.86]], 28, 14, 0);
        ribbon(pts, [[-0.48, -0.82, 0], [0.48, -0.82, 0], [0.48, 0.86, 0], [-0.48, 0.86, 0]], 140, true);
        ribbon(pts, [[-0.56, -0.82, 0], [0, -1.06, 0], [0.56, -0.82, 0]], 70, false);
        rect(pts, -0.12, 0.48, 0.24, 0.38, 50);
        for (let r = 0; r < 4; r += 1) {
          for (let c = 0; c < 3; c += 1) {
            rect(pts, -0.34 + c * 0.24, -0.68 + r * 0.24, 0.14, 0.12, 22);
          }
        }
        return fit(pts);
      },
      shop: () => {
        const pts = [];
        fill(pts, [[-0.74, -0.08], [0.74, -0.08], [0.74, 0.86], [-0.74, 0.86]], 20, 16, 0);
        ribbon(pts, [[-0.74, -0.08, 0], [0.74, -0.08, 0], [0.74, 0.86, 0], [-0.74, 0.86, 0]], 130, true);
        const awn = [[-0.84, -0.42, 0]];
        for (let i = 0; i <= 8; i += 1) awn.push([-0.84 + i * 0.21, i % 2 ? -0.08 : 0.06, 0]);
        awn.push([0.84, -0.42, 0], [-0.84, -0.42, 0]);
        ribbon(pts, awn, 160, true);
        rect(pts, -0.28, -0.66, 0.56, 0.16, 50);
        rect(pts, -0.4, 0.28, 0.26, 0.58, 55);
        rect(pts, 0.08, 0.08, 0.46, 0.3, 55);
        return fit(pts);
      },
      cart: () => {
        const pts = [];
        ribbon(pts, [[-0.62, -0.48, 0], [-0.18, -0.22, 0], [-0.02, 0.26, 0], [0.74, 0.26, 0], [0.84, -0.22, 0], [-0.12, -0.22, 0]], 180, false);
        ribbon(pts, [[-0.18, -0.22, 0], [0.84, -0.22, 0]], 40, false);
        ribbon(pts, [[-0.02, 0.26, 0], [0.74, 0.26, 0]], 40, false);
        oval(pts, -0.02, 0.56, 0.16, 0.16, 70);
        oval(pts, 0.58, 0.56, 0.16, 0.16, 70);
        oval(pts, -0.02, 0.56, 0.05, 0.05, 24);
        oval(pts, 0.58, 0.56, 0.05, 0.05, 24);
        return fit(pts);
      },
      chain: () => {
        const pts = [];
        oval(pts, -0.32, 0.02, 0.44, 0.26, 140, 0.04);
        oval(pts, -0.32, 0.02, 0.28, 0.12, 90, 0.04);
        oval(pts, 0.32, -0.02, 0.44, 0.26, 140, -0.04);
        oval(pts, 0.32, -0.02, 0.28, 0.12, 90, -0.04);
        return fit(pts);
      },
      web: () => {
        const pts = [];
        for (let r = 1; r <= 5; r += 1) oval(pts, 0, 0, r * 0.18, r * 0.18, 70 + r * 8);
        for (let s = 0; s < 8; s += 1) {
          const a = (s / 8) * Math.PI * 2 - Math.PI / 2;
          line(pts, [[0, 0, 0], [Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0]], 36, false);
        }
        return fit(pts);
      },
      bolt: () => {
        const pts = [];
        const shape = [
          [-0.1, -0.95], [0.4, -0.95], [0.06, -0.08], [0.5, -0.08],
          [-0.24, 0.98], [0.04, 0.1], [-0.5, 0.1]
        ];
        fill(pts, shape, 36, 12, 0);
        fill(pts, shape, 36, 8, 0.05);
        fill(pts, shape, 36, 8, -0.05);
        ribbon(pts, shape.map((p) => [p[0], p[1], 0]), 160, true);
        for (let i = 0; i < 5; i += 1) {
          const y = -0.7 + i * 0.32;
          line(pts, [[0.58, y, 0], [0.92, y - 0.08, 0]], 16, false);
        }
        return fit(pts);
      }
    };

    const shapes = slides.map((s) => makers[s.id]());
    const dots = shapes[0].map((p) => ({ x: p.x, y: p.y, z: p.z }));
    let from = 0;
    let to = 0;
    let morph = 1;
    let hold = 0;
    let rotY = 0.18;
    let rotX = 0.1;
    let targetY = 0.18;
    let targetX = 0.1;
    const palettes = {
      dark: { r: 110, g: 220, b: 255 },
      light: { r: 21, g: 88, b: 224 }
    };
    const themeKey = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
    let color = { ...palettes[themeKey()] };
    let colorTo = { ...color };
    window.addEventListener("webzuno-theme", (e) => {
      colorTo = { ...palettes[e.detail === "light" ? "light" : "dark"] };
    });

    const stage = canvas.parentElement;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      targetY = 0.16 + ((e.clientX - r.left) / r.width - 0.5) * 0.32;
      targetX = 0.08 + ((e.clientY - r.top) / r.height - 0.5) * 0.18;
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const fade = 1 - Math.exp(-dt / 0.16);
      color.r += (colorTo.r - color.r) * fade;
      color.g += (colorTo.g - color.g) * fade;
      color.b += (colorTo.b - color.b) * fade;
      if (morph < 1) {
        morph = Math.min(1, morph + dt / 1.15);
        if (morph >= 0.55) setCopy(to);
        if (morph >= 1) from = to;
      } else {
        hold += dt;
        if (hold >= 5) {
          hold = 0;
          morph = 0;
          to = (from + 1) % shapes.length;
        }
      }
      const t = morph * morph * (3 - 2 * morph);
      const a = shapes[from];
      const b = shapes[to];
      for (let i = 0; i < n; i += 1) {
        dots[i].x = a[i].x + (b[i].x - a[i].x) * t;
        dots[i].y = a[i].y + (b[i].y - a[i].y) * t;
        dots[i].z = a[i].z + (b[i].z - a[i].z) * t;
      }

      const active = slides[morph < 0.5 ? from : to].id;
      const isGlobe = active === "globe";
      const spin = isGlobe ? 0.007 : 0.0006;
      rotY += (targetY - rotY) * 0.05 + spin;
      rotX += (targetX - rotX) * 0.05;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const radius = Math.min(w, h) * 0.42;
      const cx = w * 0.5;
      const cy = h * 0.44;
      const tiltY = isGlobe ? rotY : rotY * 0.22;
      const tiltX = isGlobe ? rotX * 0.85 : rotX * 0.12;
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cr = Math.round(color.r);
      const cg = Math.round(color.g);
      const cb = Math.round(color.b);
      for (let i = 0; i < n; i += 1) {
        const p = dots[i];
        let x = p.x * cosY - p.z * sinY;
        let z = p.z * cosY + p.x * sinY;
        const y = p.y * cosX - z * sinX;
        z = z * cosX + p.y * sinX;
        const depth = (z + 1.35) / 2.3;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.22 + depth * 0.78})`;
        ctx.beginPath();
        ctx.arc(cx + x * radius, cy + y * radius, 1.25 + depth * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
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
    if (!bunches.length) return;
    if (reduce) {
      bunches.forEach((b) => b.classList.add("is-on"));
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
        }
      });
    });
    mm.add("(max-width: 768px)", () => {
      bunches[0]?.classList.add("is-on");
      bunches.slice(1).forEach((bunch) => {
        ScrollTrigger.create({
          trigger: bunch,
          start: "top 82%",
          onEnter: () => bunch.classList.add("is-on")
        });
      });
    });
  }

  function initOrbit() {
    const cards = gsap.utils.toArray(".svc-card");
    const stage = document.getElementById("orbit-stage");
    if (!cards.length || !stage) return;
    if (reduce || mobile()) return;
    const pairs = 3;
    const radius = 168;
    const place = (progress) => {
      cards.forEach((card, i) => {
        const col = i % 2;
        const ring = Math.floor(i / 2);
        const theta = (ring / pairs) * Math.PI * 2 - progress * Math.PI * 2;
        const y = Math.sin(theta) * radius;
        const z = Math.cos(theta) * radius;
        const x = col === 0 ? -120 : 120;
        const depth = (z + radius) / (2 * radius);
        const front = depth > 0.62;
        gsap.set(card, {
          x,
          y,
          z,
          xPercent: -50,
          yPercent: -50,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 0.78 + depth * 0.28,
          opacity: front ? 1 : gsap.utils.clamp(0.1, 0.38, depth * 0.7),
          zIndex: Math.round(z + 400),
          filter: front ? "none" : `blur(${((1 - depth) * 3).toFixed(2)}px)`,
          force3D: true
        });
      });
    };
    place(0);
    ScrollTrigger.create({
      trigger: ".orbit-wrap",
      start: "top 12%",
      end: "+=240%",
      pin: true,
      scrub: 0.75,
      invalidateOnRefresh: true,
      onUpdate: (self) => place(self.progress)
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
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".transform",
        start: "top top",
        end: "+=160%",
        pin: true,
        scrub: 0.8
      }
    });
    tl.to(".screen-a", { opacity: 0, filter: "blur(8px)", duration: 0.45 }, 0)
      .to(".screen-b", { opacity: 1, duration: 0.45 }, 0.08)
      .to(".tablet", { opacity: 1, y: 0, duration: 0.5 }, 0.42)
      .to(".phone", { opacity: 1, y: 0, duration: 0.5 }, 0.55);
  }

  function initSpiral() {
    const cards = gsap.utils.toArray(".sample");
    const stage = document.querySelector(".sample-pin");
    if (!cards.length || !stage) return;
    if (reduce || mobile()) {
      cards.forEach((card) => gsap.set(card, { opacity: 1, xPercent: -50, yPercent: -50, rotation: 0 }));
      return;
    }
    const layout = () => {
      const w = stage.clientWidth / 2;
      const h = stage.clientHeight / 2;
      const origins = [
        { x: -w - 180, y: -h - 120 },
        { x: w + 180, y: -h - 120 },
        { x: -w - 180, y: h + 120 },
        { x: w + 180, y: h + 120 },
        { x: 0, y: -h - 160 },
        { x: 0, y: h + 160 },
        { x: -w - 200, y: 0 },
        { x: w + 200, y: 0 }
      ];
      const cardW = cards[0].offsetWidth || 340;
      const cardH = cards[0].offsetHeight || 280;
      const gapX = Math.max(cardW + 36, Math.min(w * 0.7, w - cardW * 0.55));
      const gapY = Math.max(cardH * 0.58, Math.min(h * 0.46, h - cardH * 0.55));
      return { origins, gapX, gapY };
    };
    const { origins, gapX, gapY } = layout();
    const dest = [
      { x: -gapX, y: -gapY },
      { x: 0, y: -gapY },
      { x: gapX, y: -gapY },
      { x: -gapX, y: gapY },
      { x: 0, y: gapY },
      { x: gapX, y: gapY }
    ];
    const shown = 2;
    const preview = [
      { x: -gapX * 0.62, y: 0 },
      { x: gapX * 0.62, y: 0 }
    ];
    cards.forEach((card, i) => {
      if (i < shown) {
        gsap.set(card, {
          x: preview[i].x,
          y: preview[i].y,
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          rotation: 0,
          rotateX: 0,
          rotateY: 0
        });
        return;
      }
      const from = origins[i];
      gsap.set(card, {
        x: from.x,
        y: from.y,
        xPercent: -50,
        yPercent: -50,
        scale: 0.42,
        opacity: 0,
        rotation: 0,
        rotateX: 0,
        rotateY: 0
      });
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".sample-pin",
        start: "top 14%",
        end: "+=130%",
        pin: true,
        scrub: 0.65,
        invalidateOnRefresh: true
      }
    });
    cards.slice(0, shown).forEach((card, i) => {
      tl.to(card, {
        x: dest[i].x,
        y: dest[i].y,
        duration: 0.5,
        ease: "power3.out"
      }, 0);
    });
    cards.slice(shown).forEach((card, i) => {
      const to = dest[i + shown];
      tl.to(card, {
        x: to.x,
        y: to.y,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.55,
        ease: "power3.out"
      }, i * 0.14);
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
    document.querySelectorAll(".count").forEach((node) => {
      const end = Number(node.dataset.count || 0);
      if (reduce) {
        node.textContent = String(end);
        return;
      }
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
    gsap.from(".finale h2, .finale-sub, .finale-actions", {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".finale h2", start: "top 80%" }
    });
  }

  function initSkyBanner() {
    const tow = document.querySelector(".sky-tow");
    const banner = document.querySelector(".sky-banner");
    const track = document.querySelector(".sky-track");
    if (!tow || !banner || typeof gsap === "undefined") return;

    const fromX = () => -Math.ceil(tow.getBoundingClientRect().width) - 24;
    const toX = () => Math.ceil((track && track.clientWidth) || window.innerWidth) + 24;

    gsap.set(tow, { yPercent: -50, x: fromX() });
    if (reduce) {
      gsap.set(tow, { x: Math.max(48, window.innerWidth * 0.22) });
      return;
    }

    const fly = gsap.fromTo(tow, { x: fromX }, {
      x: toX,
      duration: 1.15,
      ease: "power2.in",
      paused: true,
      immediateRender: false
    });

    let loopCall;
    const playPass = () => {
      fly.invalidate();
      gsap.set(tow, { x: fromX() });
      fly.restart();
    };
    const stopLoop = () => {
      if (loopCall) loopCall.kill();
      fly.pause(0);
      gsap.set(tow, { x: fromX() });
    };
    const startLoop = () => {
      stopLoop();
      playPass();
      loopCall = gsap.delayedCall(2, function repeat() {
        playPass();
        loopCall = gsap.delayedCall(2, repeat);
      });
    };

    const st = ScrollTrigger.create({
      trigger: banner,
      start: "top top",
      end: "+=160%",
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle(self) {
        if (self.isActive) startLoop();
        else stopLoop();
      }
    });
    if (st.isActive) startLoop();
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
        legalOverlay.hidden = false;
        lock(true);
      });
    });
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
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const body = encodeURIComponent(
        `Name: ${data.get("name")}\nBusiness: ${data.get("business")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\nPlan: ${data.get("plan")}\n\n${data.get("message") || ""}`
      );
      window.location.href = `mailto:hello@webzuno.com?subject=${encodeURIComponent("New Webzuno project — " + data.get("business"))}&body=${body}`;
      form.hidden = true;
      formSuccess.hidden = false;
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
    initOrbit();
    initTransform();
    initSpiral();
    initProcess();
    initBenefits();
    initCounters();
    initFinale();
    initSkyBanner();
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      window.addEventListener("resize", () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
