/* ui.js — global chrome: nav, drawer, toasts, lang, sound, coin pill, stats */
window.BCUI = (function () {
  "use strict";

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- toast ---------- */
  function toast(msg, cls) {
    var zone = document.querySelector(".toast-zone");
    if (!zone) return;
    var el = document.createElement("div");
    el.className = "toast-bc" + (cls ? " " + cls : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    zone.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  /* ---------- drawer ---------- */
  function drawerEls() {
    return {
      backdrop: document.querySelector(".drawer-backdrop"),
      drawer: document.querySelector(".drawer")
    };
  }
  function openDrawer() {
    var d = drawerEls();
    d.backdrop.classList.add("show");
    d.drawer.classList.add("show");
    renderDrawer();
    BCAudio.pop();
  }
  function closeDrawer() {
    var d = drawerEls();
    d.backdrop.classList.remove("show");
    d.drawer.classList.remove("show");
  }

  function renderDrawer() {
    var st = BCStore.load();
    var lixiBtn = document.querySelector("[data-act=lixi]");
    if (lixiBtn) {
      var can = BCWallet.canClaimLiXi();
      lixiBtn.disabled = !can;
      lixiBtn.textContent = BCi18n.t("drawer.lixi");
    }
    var list = document.querySelector("#badge-grid");
    if (list) {
      list.innerHTML = "";
      BC_DATA.BADGES.forEach(function (b) {
        var unlocked = st.badges.indexOf(b.id) !== -1;
        var div = document.createElement("div");
        div.className = "badge-cell " + (unlocked ? "unlocked" : "locked");
        div.textContent = BCi18n.L(b.name);
        var ic = document.createElement("span");
        ic.className = "ic"; ic.textContent = b.icon;
        div.prepend(ic);
        div.title = BCi18n.L(b.desc);
        list.appendChild(div);
      });
    }
    var stats = document.querySelector("#drawer-stats");
    if (stats) {
      stats.innerHTML =
        stat("drawer.played", st.stats.played) +
        stat("drawer.streak", st.stats.streak) +
        stat("drawer.best", st.stats.bestStreak) +
        stat("drawer.peak", st.stats.peak);
    }
  }
  function stat(k, v) {
    return "<div><span class=\"mut\">" + BCi18n.t(k) + ":</span> <strong>" + v + "</strong></div>";
  }

  /* ---------- coin pill ---------- */
  var ICON_COIN = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#B8860B" stroke="#141414" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#141414" stroke-width="1.6"/></svg>';
  function renderCoins() {
    var pill = document.querySelector(".coin-pill");
    if (pill) pill.innerHTML = ICON_COIN + "<span>" + BCWallet.balance().toLocaleString("vi-VN") + " " + BCi18n.t("unit.xu") + "</span>";
  }

  /* ---------- lang + sound ---------- */
  function wireLang() {
    document.querySelectorAll(".lang-group button").forEach(function (b) {
      b.addEventListener("click", function () {
        BCi18n.setLang(b.dataset.lang);
        BCAudio.pop();
      });
    });
  }
  function wireSound() {
    var btns = document.querySelectorAll("[data-act=sound]");
    if (!btns.length) return;
    function paint() {
      var muted = BCStore.load().muted;
      btns.forEach(function (btn) { btn.classList.toggle("muted", muted); });
    }
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var s = BCStore.load();
        s.muted = !s.muted;
        BCStore.save();
        paint();
        BCAudio.pop();
      });
    });
    paint();
  }

  /* ---------- boot (every page) ---------- */
  function boot() {
    BCWallet.touchVisit();
    BCBadges.check("return_visit");

    // inject mobile menu tools if not present
    var links = document.querySelector(".bc-links");
    if (links && !links.querySelector(".mobile-menu-tools")) {
      var mobileTools = document.createElement("div");
      mobileTools.className = "mobile-menu-tools";
      mobileTools.innerHTML =
        '<div class="lang-group" role="group" aria-label="Language">' +
        '<button data-lang="vn">VN</button>' +
        '<button data-lang="en">EN</button>' +
        '<button data-lang="zh">ZH</button>' +
        '</div>' +
        '<button class="icon-btn" data-act="sound" aria-label="Sound">' +
        '<svg class="ic-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>' +
        '<svg class="ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 9l5 6M21 9l-5 6"/></svg>' +
        '</button>';
      links.appendChild(mobileTools);
    }

    BCi18n.apply();
    wireLang();
    wireSound();
    renderCoins();

    document.querySelector("[data-act=drawer-open]").addEventListener("click", openDrawer);
    document.querySelector("[data-act=drawer-close]").addEventListener("click", closeDrawer);
    document.querySelector(".drawer-backdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    var lixiBtn = document.querySelector("[data-act=lixi]");
    if (lixiBtn) {
      lixiBtn.addEventListener("click", function () {
        if (BCWallet.claimLiXi()) {
          BCBadges.check("lixi");
          BCAudio.drum();
          BCUI.toast(BCi18n.t("drawer.lixiGot"), "win");
          renderDrawer();
        } else {
          BCUI.toast(BCi18n.t("drawer.lixiDone"));
        }
      });
    }

    // active nav link
    var page = document.body.dataset.page;
    document.querySelectorAll(".bc-links a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.page === page);
    });
    // mobile menu
    var tg = document.querySelector(".nav-toggle");
    var links = document.querySelector(".bc-links");
    var HAMBURGER_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.6"/></svg>';
    var CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2.6"/></svg>';

    function closeNav() {
      if (!links || !links.classList.contains("open")) return;
      links.classList.remove("open");
      if (tg) {
        tg.setAttribute("aria-expanded", "false");
        tg.innerHTML = HAMBURGER_SVG;
      }
    }

    if (tg && links) {
      tg.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = links.classList.toggle("open");
        tg.setAttribute("aria-expanded", String(isOpen));
        tg.innerHTML = isOpen ? CLOSE_SVG : HAMBURGER_SVG;
      });

      document.addEventListener("click", function (e) {
        if (!tg.contains(e.target) && !links.contains(e.target)) {
          closeNav();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeNav();
      });

      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
    }

    BCWallet.onChange(function () { renderCoins(); renderDrawer(); });
    BCi18n.onLangChange(function () { renderDrawer(); });
    renderDrawer();
  }

  return {
    boot: boot, toast: toast, openDrawer: openDrawer, closeDrawer: closeDrawer,
    renderCoins: renderCoins, renderDrawer: renderDrawer, reducedMotion: reducedMotion
  };
})();
