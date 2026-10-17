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
  const cursor = document.querySelector(".cursor");
  const glow = document.querySelector(".page-glow");
  const progress = document.querySelector(".scroll-progress span");
  const contactOverlay = document.getElementById("contact-overlay");
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

  function initCursor() {
    if (touch || reduce || !cursor) return;
    cursor.classList.add("is-on");
    document.body.classList.add("has-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    window.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
    }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button, input, select").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-grow"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-grow"));
    });
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
    const n = mobile() ? 360 : 720;

    const sample = (segs) => {
      const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], (b[2] || 0) - (a[2] || 0)));
      const total = lens.reduce((s, v) => s + v, 0) || 1;
      const pts = [];
      for (let i = 0; i < n; i += 1) {
        let d = (i / n) * total;
        for (let s = 0; s < segs.length; s += 1) {
          if (d <= lens[s] || s === segs.length - 1) {
            const t = lens[s] ? d / lens[s] : 0;
            const [a, b] = segs[s];
            pts.push({
              x: a[0] + (b[0] - a[0]) * t,
              y: a[1] + (b[1] - a[1]) * t,
              z: (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * t
            });
            break;
          }
          d -= lens[s];
        }
      }
      return pts;
    };
    const loop = (pts, closed = true) => {
      const segs = [];
      for (let i = 0; i < pts.length - 1; i += 1) segs.push([pts[i], pts[i + 1]]);
      if (closed && pts.length > 2) segs.push([pts[pts.length - 1], pts[0]]);
      return segs;
    };
    const oval = (cx, cy, rx, ry, count, rot = 0) => {
      const segs = [];
      for (let i = 0; i < count; i += 1) {
        const a0 = (i / count) * Math.PI * 2 + rot;
        const a1 = ((i + 1) / count) * Math.PI * 2 + rot;
        segs.push([
          [cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry, 0],
          [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry, 0]
        ]);
      }
      return segs;
    };
    const rect = (x, y, w, h) => loop([
      [x, y, 0], [x + w, y, 0], [x + w, y + h, 0], [x, y + h, 0]
    ]);

    const makers = {
      globe: () => {
        const segs = [];
        const lats = [-0.72, -0.4, 0, 0.4, 0.72];
        lats.forEach((y) => {
          const r = Math.sqrt(Math.max(0.04, 1 - y * y));
          for (let i = 0; i < 48; i += 1) {
            const a0 = (i / 48) * Math.PI * 2;
            const a1 = ((i + 1) / 48) * Math.PI * 2;
            segs.push([
              [Math.cos(a0) * r, y, Math.sin(a0) * r],
              [Math.cos(a1) * r, y, Math.sin(a1) * r]
            ]);
          }
        });
        for (let m = 0; m < 8; m += 1) {
          const yaw = (m / 8) * Math.PI;
          for (let i = 0; i < 40; i += 1) {
            const a0 = (i / 40) * Math.PI * 2;
            const a1 = ((i + 1) / 40) * Math.PI * 2;
            segs.push([
              [Math.sin(a0) * Math.cos(yaw), Math.cos(a0), Math.sin(a0) * Math.sin(yaw)],
              [Math.sin(a1) * Math.cos(yaw), Math.cos(a1), Math.sin(a1) * Math.sin(yaw)]
            ]);
          }
        }
        return sample(segs);
      },
      puzzle: () => sample(loop([
        [-0.55, 0.18], [-0.55, -0.12],
        [-0.42, -0.12], [-0.38, -0.28], [-0.22, -0.34], [-0.08, -0.22], [-0.08, -0.42],
        [-0.22, -0.55], [0.08, -0.62], [0.32, -0.48], [0.32, -0.22],
        [0.48, -0.28], [0.62, -0.12], [0.55, 0.12], [0.38, 0.22],
        [0.38, 0.38], [0.18, 0.55], [-0.12, 0.52], [-0.22, 0.32], [-0.22, 0.18]
      ])),
      blocks: () => {
        const cube = (cx, cy, s) => {
          const top = [[cx, cy - s * 0.58], [cx + s, cy - s * 0.28], [cx, cy + 0.02], [cx - s, cy - s * 0.28]];
          const left = [[cx - s, cy - s * 0.28], [cx, cy + 0.02], [cx, cy + s * 0.72], [cx - s, cy + s * 0.42]];
          const right = [[cx + s, cy - s * 0.28], [cx, cy + 0.02], [cx, cy + s * 0.72], [cx + s, cy + s * 0.42]];
          return [...loop(top), ...loop(left), ...loop(right)];
        };
        return sample([
          ...cube(-0.42, 0.18, 0.38),
          ...cube(0.42, 0.18, 0.38),
          ...cube(0, -0.42, 0.38)
        ]);
      },
      house: () => sample([
        ...loop([[-0.92, -0.02], [0, -0.88], [0.92, -0.02]], false),
        ...loop([[-0.7, -0.02], [-0.7, 0.88], [0.7, 0.88], [0.7, -0.02]]),
        ...rect(-0.18, 0.32, 0.36, 0.56),
        ...rect(-0.52, 0.08, 0.22, 0.22),
        ...rect(0.3, 0.08, 0.22, 0.22),
        ...loop([[0.4, -0.42], [0.4, -0.78], [0.58, -0.78], [0.58, -0.28]], false)
      ]),
      building: () => {
        const segs = [
          ...rect(-0.48, -0.82, 0.96, 1.64),
          ...loop([[-0.56, -0.82], [0, -1.02], [0.56, -0.82]], false),
          ...rect(-0.14, 0.42, 0.28, 0.4)
        ];
        for (let r = 0; r < 4; r += 1) {
          for (let c = 0; c < 3; c += 1) {
            segs.push(...rect(-0.36 + c * 0.26, -0.66 + r * 0.24, 0.16, 0.14));
          }
        }
        return sample(segs);
      },
      shop: () => {
        const segs = [
          ...rect(-0.72, -0.08, 1.44, 0.96),
          ...rect(-0.38, 0.28, 0.28, 0.6),
          ...rect(0.08, 0.08, 0.48, 0.32)
        ];
        const awn = [];
        for (let i = 0; i <= 8; i += 1) {
          const x = -0.82 + i * 0.205;
          awn.push([x, i % 2 === 0 ? -0.08 : 0.08]);
        }
        segs.push(...loop([[-0.82, -0.28], ...awn, [0.82, -0.28], [0.82, -0.42], [-0.82, -0.42]]));
        segs.push(...rect(-0.28, -0.62, 0.56, 0.16));
        return sample(segs);
      },
      cart: () => sample([
        ...loop([[-0.62, -0.42], [-0.18, -0.22], [-0.02, 0.28], [0.72, 0.28], [0.82, -0.22], [-0.12, -0.22]], false),
        ...loop([[-0.18, -0.22], [0.82, -0.22]], false),
        ...loop([[-0.02, 0.28], [0.72, 0.28]], false),
        ...oval(-0.02, 0.58, 0.16, 0.16, 28),
        ...oval(0.58, 0.58, 0.16, 0.16, 28)
      ]),
      chain: () => sample([
        ...oval(-0.32, 0.02, 0.42, 0.26, 40, 0.35),
        ...oval(-0.32, 0.02, 0.28, 0.14, 32, 0.35),
        ...oval(0.32, -0.02, 0.42, 0.26, 40, -0.35),
        ...oval(0.32, -0.02, 0.28, 0.14, 32, -0.35)
      ]),
      web: () => {
        const segs = [];
        for (let r = 1; r <= 4; r += 1) segs.push(...oval(0, 0, r * 0.22, r * 0.22, 8 + r * 4));
        for (let s = 0; s < 8; s += 1) {
          const a = (s / 8) * Math.PI * 2 - Math.PI / 2;
          segs.push([[0, 0, 0], [Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0]]);
        }
        return sample(segs);
      },
      bolt: () => sample(loop([
        [-0.08, -0.95], [0.42, -0.95], [0.08, -0.08], [0.52, -0.08],
        [-0.18, 0.95], [0.08, 0.08], [-0.48, 0.08]
      ]))
    };

    const shapes = slides.map((s) => makers[s.id]());
    const dots = shapes[0].map((p) => ({ x: p.x, y: p.y, z: p.z }));
    let from = 0;
    let to = 1;
    let morph = 1;
    let hold = 0;
    let rotY = 0.15;
    let rotX = 0.08;
    let targetY = 0.15;
    let targetX = 0.08;
    const stage = canvas.parentElement;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      targetY = 0.12 + ((e.clientX - r.left) / r.width - 0.5) * 0.28;
      targetX = 0.06 + ((e.clientY - r.top) / r.height - 0.5) * 0.16;
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
      if (morph < 1) {
        morph = Math.min(1, morph + dt / 1.15);
        if (morph >= 1) {
          from = to;
          setCopy(from);
        }
      } else {
        hold += dt;
        if (hold >= 5) {
          hold = 0;
          morph = 0;
          to = (from + 1) % shapes.length;
          setCopy(to);
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

      const isGlobe = slides[morph < 0.5 ? from : to].id === "globe";
      rotY += (targetY - rotY) * 0.05 + (isGlobe ? 0.004 : 0.0008);
      rotX += (targetX - rotX) * 0.05;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const radius = Math.min(w, h) * 0.4;
      const cx = w * 0.5;
      const cy = h * 0.44;
      const light = document.documentElement.dataset.theme === "light";
      const tiltY = isGlobe ? rotY : rotY * 0.18;
      const tiltX = isGlobe ? rotX : rotX * 0.12;
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      for (let i = 0; i < n; i += 1) {
        const p = dots[i];
        let x = p.x * cosY - p.z * sinY;
        let z = p.z * cosY + p.x * sinY;
        const y = p.y * cosX - z * sinX;
        z = z * cosX + p.y * sinX;
        const depth = (z + 1.35) / 2.3;
        ctx.fillStyle = light
          ? `rgba(21, 88, 224, ${0.35 + depth * 0.65})`
          : `rgba(110, 220, 255, ${0.28 + depth * 0.72})`;
        ctx.beginPath();
        ctx.arc(cx + x * radius, cy + y * radius, 1.15 + depth * 1.35, 0, Math.PI * 2);
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
        start: "top top",
        end: "+=160%",
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          bunches.forEach((bunch, i) => {
            bunch.classList.toggle("is-on", self.progress > (i + 0.08) / bunches.length);
          });
        }
      });
    });
    mm.add("(max-width: 768px)", () => {
      bunches.forEach((bunch) => {
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
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".transform",
        start: "top top",
        end: "+=220%",
        pin: true,
        scrub: 0.8
      }
    });
    tl.to(".browser", { scale: 1, duration: 1, ease: "power2.out" }, 0)
      .to(".screen-a", { opacity: 0, filter: "blur(8px)", duration: 0.45 }, 0.45)
      .to(".screen-b", { opacity: 1, duration: 0.45 }, 0.5)
      .to(".tablet", { opacity: 1, y: 0, duration: 0.5 }, 0.7)
      .to(".phone", { opacity: 1, y: 0, duration: 0.5 }, 0.82);
  }

  function initSpiral() {
    const cards = gsap.utils.toArray(".kpi-card");
    const stage = document.querySelector(".spiral-pin");
    if (!cards.length || !stage) return;
    if (reduce || mobile()) {
      cards.forEach((card) => gsap.set(card, { opacity: 1, xPercent: -50, yPercent: -50, rotation: 0 }));
      return;
    }
    const layout = () => {
      const w = stage.clientWidth / 2;
      const h = stage.clientHeight / 2;
      const origins = [
        { x: -w, y: -h },
        { x: w, y: -h },
        { x: -w, y: h },
        { x: w, y: h },
        { x: 0, y: -h },
        { x: 0, y: h },
        { x: -w, y: 0 },
        { x: w, y: 0 }
      ];
      const gapX = Math.min(220, w * 0.48);
      const gapY = Math.min(92, h * 0.38);
      return { origins, gapX, gapY };
    };
    const { origins, gapX, gapY } = layout();
    const dest = [
      { x: -gapX * 1.5, y: -gapY },
      { x: -gapX * 0.5, y: -gapY },
      { x: gapX * 0.5, y: -gapY },
      { x: gapX * 1.5, y: -gapY },
      { x: -gapX * 1.5, y: gapY },
      { x: -gapX * 0.5, y: gapY },
      { x: gapX * 0.5, y: gapY },
      { x: gapX * 1.5, y: gapY }
    ];
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".spiral-pin",
        start: "top 14%",
        end: "+=170%",
        pin: true,
        scrub: 0.65,
        invalidateOnRefresh: true
      }
    });
    cards.forEach((card, i) => {
      const from = origins[i];
      const to = dest[i];
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

  function openContact(plan) {
    closeMenu();
    contactOverlay.hidden = false;
    if (plan && planSelect) planSelect.value = plan;
    lock(true);
    contactOverlay.querySelector("input")?.focus();
  }

  function closeOverlays() {
    contactOverlay.hidden = true;
    lock(false);
  }

  function initOverlays() {
    document.querySelectorAll("[data-open-contact]").forEach((btn) => {
      btn.addEventListener("click", () => openContact(btn.dataset.plan || ""));
    });
    document.querySelectorAll("[data-close-overlay]").forEach((btn) => {
      btn.addEventListener("click", closeOverlays);
    });
    contactOverlay.addEventListener("click", (e) => {
      if (e.target === contactOverlay) closeOverlays();
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
    initCursor();
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
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
      window.addEventListener("resize", () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
