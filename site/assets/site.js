/* ============================================================
   Güvenli Bağlanma Merkezi — interactions
   ============================================================ */

/* ---- 1. CONFIGURE CONTACT HERE -------------------------------
   WhatsApp number: digits only, country code first, no +, no
   spaces. Everything on the page updates automatically.        */
const CONTACT = {
  whatsapp: "905545340114",                        // +90 554 534 01 14
  whatsappText: "Merhaba, danışmanlık hakkında bilgi almak istiyorum.",
  instagram: "https://www.instagram.com/aile.danismani.16/",
  instagramHandle: "@aile.danismani.16",
};
/* ------------------------------------------------------------- */

(function wireContact() {
  const waHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappText)}`;
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.setAttribute("href", waHref);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });
  document.querySelectorAll("[data-ig]").forEach((a) => {
    a.setAttribute("href", CONTACT.instagram);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });
})();

/* ---- Nav: shadow on scroll ---- */
(function navScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Scroll reveal (position-based; robust without IntersectionObserver) ---- */
(function reveal() {
  const root = document.documentElement;
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  // If the document renders while hidden (background tab), CSS transitions
  // are paused — reveal instantly so content is never stuck invisible.
  const goInstant = () => root.classList.add("reveal-instant");
  if (document.hidden) goInstant();
  document.addEventListener("visibilitychange", () => { if (document.hidden) goInstant(); });

  const check = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (let i = els.length - 1; i >= 0; i--) {
      const el = els[i];
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        el.classList.add("in");
        els.splice(i, 1);
      }
    }
    if (!els.length) {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }
  };

  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  // initial passes (cover late layout/font shifts)
  check();
  requestAnimationFrame(check);
  setTimeout(check, 250);
  // absolute failsafe: never leave content hidden
  setTimeout(() => els.slice().forEach((e) => e.classList.add("in")), 2500);
})();

/* ---- Thread draw: set dash length then trigger on view ---- */
(function threadDraw() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // measure each drawable path's length so dasharray matches exactly
  document.querySelectorAll(".draw").forEach((path) => {
    try {
      const len = path.getTotalLength();
      path.style.setProperty("--len", len.toFixed(0));
    } catch (e) {}
  });

  const hosts = Array.from(document.querySelectorAll("[data-thread]"));
  if (reduce) {
    hosts.forEach((h) => h.classList.add("drawn"));
    return;
  }
  const check = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (let i = hosts.length - 1; i >= 0; i--) {
      const r = hosts[i].getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) {
        hosts[i].classList.add("drawn");
        hosts.splice(i, 1);
      }
    }
    if (!hosts.length) {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }
  };
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  check();
  requestAnimationFrame(check);
  setTimeout(check, 250);
})();

/* ---- Mobile nav toggle (simple anchor reveal) ---- */
(function mobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const sheet = document.querySelector(".mobile-sheet");
  if (!toggle || !sheet) return;
  const close = () => { sheet.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = sheet.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  sheet.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
