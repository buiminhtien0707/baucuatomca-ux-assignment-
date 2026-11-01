/* fx.js — game juice: confetti, screen shake, number count-up.
   All effects collapse to no-ops under prefers-reduced-motion. */
window.BCFx = (function () {
  "use strict";

  function reduced() { return BCUI.reducedMotion(); }

  /* ---------- confetti burst (brand palette, canvas, self-cleaning) ---------- */
  var COLORS = ["#E8442E", "#FFC93C", "#2F4BD8", "#0E7A4A", "#FFFBF2"];

  function confetti(big) {
    if (reduced()) return;
    var c = document.createElement("canvas");
    c.className = "confetti-canvas";
    c.setAttribute("aria-hidden", "true");
    var dpr = window.devicePixelRatio || 1;
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    document.body.appendChild(c);
    var g = c.getContext("2d");
    g.scale(dpr, dpr);

    var W = window.innerWidth, H = window.innerHeight;
    var originY = H * 0.42;
    var count = big ? 90 : 45;
    var parts = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI - Math.PI;      /* upward fan */
      var speed = (big ? 9 : 6) + Math.random() * (big ? 7 : 4);
      parts.push({
        x: W / 2, y: originY,
        vx: Math.cos(angle) * speed * 2.2,
        vy: Math.sin(angle) * speed,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length]
      });
    }

    var t0 = null, LIFE = 1500;
    function frame(ts) {
      if (!t0) t0 = ts;
      var t = ts - t0;
      g.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.vy += 0.32;                     /* gravity */
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.985;
        p.rot += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.globalAlpha = Math.max(0, 1 - t / LIFE);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      }
      if (t < LIFE) requestAnimationFrame(frame);
      else c.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- short shake on an element ---------- */
  function shake(el, cls) {
    if (reduced() || !el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 450);
  }

  /* ---------- tween a number inside an element ---------- */
  function countUp(el, from, to, ms, suffix) {
    if (!el) return;
    if (reduced() || from === to) {
      el.textContent = to.toLocaleString("vi-VN") + " " + suffix;
      return;
    }
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / ms);
      var eased = 1 - Math.pow(1 - k, 3);
      var v = Math.round(from + (to - from) * eased);
      el.textContent = v.toLocaleString("vi-VN") + " " + suffix;
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return { confetti: confetti, shake: shake, countUp: countUp };
})();
