/* account-ui.js — UI controller for local accounts (nav chip, login/register
   modal, account switcher menu, delete confirmation, drawer profile card,
   first-badge guest nudge, save export/import, and local leaderboard). */
window.BCAccountUI = (function () {
  "use strict";

  var selectedLoginId = null;
  var selectedAvatar = "cua";
  var lockTimer = null;
  var nudgeShown = false;

  var USER_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="8.5" r="4" fill="#FFC93C" stroke="#141414" stroke-width="2"/><path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" fill="#FAF3E7" stroke="#141414" stroke-width="2" stroke-linecap="round"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function avatarImg(av, size) {
    var s = size || 22;
    var safe = BCAuth.AVATARS.indexOf(av) !== -1 ? av : "cua";
    return '<img class="acct-av-img" src="assets/img/animals/' + safe + '.svg" width="' + s + '" height="' + s + '" alt="">';
  }

  /* ---------- inject DOM chrome once per page ---------- */
  function injectChrome() {
    var tools = document.querySelector(".nav-tools");
    if (tools && !tools.querySelector("[data-act=acct-btn]")) {
      var wrap = document.createElement("div");
      wrap.className = "acct-wrap";
      wrap.innerHTML =
        '<button type="button" class="acct-chip" data-act="acct-btn" aria-haspopup="dialog"></button>' +
        '<div class="acct-menu card-bc" id="acct-menu" role="menu" hidden></div>';
      tools.appendChild(wrap);
    }

    var drawer = document.querySelector(".drawer");
    if (drawer && !drawer.querySelector("#drawer-acct-card")) {
      var closeRow = drawer.querySelector(".close-row");
      var card = document.createElement("div");
      card.id = "drawer-acct-card";
      card.className = "drawer-acct-card";
      if (closeRow && closeRow.nextSibling) {
        drawer.insertBefore(card, closeRow.nextSibling);
      } else {
        drawer.prepend(card);
      }
    }

    if (!document.querySelector("#modal-account")) {
      var m = document.createElement("div");
      m.className = "modal-bc";
      m.id = "modal-account";
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      m.setAttribute("aria-labelledby", "acc-modal-title");
      m.innerHTML =
        '<div class="box acct-modal-box">' +
          '<div class="acct-modal-head">' +
            '<div class="acct-tabs" role="tablist">' +
              '<button type="button" class="acct-tab active" data-acc-tab="login" role="tab" id="acc-modal-title"></button>' +
              '<button type="button" class="acct-tab" data-acc-tab="register" role="tab"></button>' +
            '</div>' +
            '<button type="button" class="icon-btn" data-act="acc-close" aria-label="Close">✕</button>' +
          '</div>' +

          /* TAB 1: SIGN IN */
          '<section id="acc-pane-login" class="acct-pane">' +
            '<p class="acct-label" data-i18n="acc.whoPlaying"></p>' +
            '<div class="acct-picker" id="acc-user-list"></div>' +
            '<div id="acc-empty-msg" class="acct-empty" hidden>' +
              '<p data-i18n="acc.noAccounts"></p>' +
              '<button type="button" class="btn-bc btn-gold btn-sm" data-acc-go="register" data-i18n="acc.createFirst"></button>' +
            '</div>' +
            '<form id="acc-login-form" class="acct-form" hidden autocomplete="off">' +
              '<label class="acct-label" for="acc-login-pin" id="acc-pin-label"></label>' +
              '<input id="acc-login-pin" class="acct-input acct-pin-input" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autocomplete="off">' +
              '<div class="acct-err" id="acc-login-err" role="alert"></div>' +
              '<label class="acct-check"><input type="checkbox" id="acc-login-rem" checked> <span data-i18n="acc.remember"></span></label>' +
              '<button type="submit" class="btn-bc btn-red" id="acc-login-submit" style="width:100%" data-i18n="acc.enterBtn"></button>' +
            '</form>' +
            '<div class="acct-import-row">' +
              '<button type="button" class="acct-link-btn" data-act="acc-import" data-i18n="acc.importBtn"></button>' +
            '</div>' +
          '</section>' +

          /* TAB 2: CREATE ACCOUNT */
          '<section id="acc-pane-register" class="acct-pane" hidden>' +
            '<form id="acc-reg-form" class="acct-form" autocomplete="off">' +
              '<div>' +
                '<label class="acct-label" for="acc-reg-name" data-i18n="acc.nameLabel"></label>' +
                '<input id="acc-reg-name" class="acct-input" type="text" maxlength="16" data-i18n-ph="acc.namePh" autocomplete="off">' +
              '</div>' +
              '<div>' +
                '<span class="acct-label" data-i18n="acc.avatarLabel"></span>' +
                '<div class="acct-av-grid" id="acc-av-grid"></div>' +
              '</div>' +
              '<div class="acct-pin-row">' +
                '<div>' +
                  '<label class="acct-label" for="acc-reg-pin" data-i18n="acc.pinLabel"></label>' +
                  '<input id="acc-reg-pin" class="acct-input acct-pin-input" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autocomplete="off">' +
                '</div>' +
                '<div>' +
                  '<label class="acct-label" for="acc-reg-pin2" data-i18n="acc.pinConfirm"></label>' +
                  '<input id="acc-reg-pin2" class="acct-input acct-pin-input" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autocomplete="off">' +
                '</div>' +
              '</div>' +
              '<label class="acct-carry" id="acc-carry-wrap" hidden>' +
                '<input type="checkbox" id="acc-reg-carry" checked>' +
                '<span id="acc-carry-text"></span>' +
              '</label>' +
              '<label class="acct-check"><input type="checkbox" id="acc-reg-rem" checked> <span data-i18n="acc.remember"></span></label>' +
              '<div class="acct-err" id="acc-reg-err" role="alert"></div>' +
              '<button type="submit" class="btn-bc btn-red" style="width:100%" data-i18n="acc.createBtn"></button>' +
              '<p class="acct-note mono" data-i18n="acc.deviceNote"></p>' +
            '</form>' +
          '</section>' +
        '</div>';
      document.body.appendChild(m);
    }

    if (!document.querySelector("#modal-acct-del")) {
      var del = document.createElement("div");
      del.className = "modal-bc";
      del.id = "modal-acct-del";
      del.setAttribute("role", "dialog");
      del.setAttribute("aria-modal", "true");
      del.innerHTML =
        '<div class="box acct-del-box">' +
          '<div class="close-row"><button type="button" class="icon-btn" data-act="acc-del-close" aria-label="Close">✕</button></div>' +
          '<h3 id="acc-del-title"></h3>' +
          '<p id="acc-del-desc" data-i18n="acc.delBody"></p>' +
          '<input id="acc-del-pin" class="acct-input acct-pin-input" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autocomplete="off">' +
          '<div class="acct-err" id="acc-del-err" role="alert"></div>' +
          '<div class="acct-del-actions">' +
            '<button type="button" class="btn-bc btn-sm" data-act="acc-del-close" data-i18n="acc.cancel"></button>' +
            '<button type="button" class="btn-bc btn-red btn-sm" id="acc-del-confirm" data-i18n="acc.delConfirm"></button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(del);
    }

    if (!document.querySelector("#acc-import-file")) {
      var inp = document.createElement("input");
      inp.type = "file";
      inp.id = "acc-import-file";
      inp.accept = ".json,application/json";
      inp.style.display = "none";
      document.body.appendChild(inp);
    }
  }

  /* ---------- render nav button & drawer profile card ---------- */
  function renderNavChip() {
    var btn = document.querySelector("[data-act=acct-btn]");
    if (!btn) return;
    if (!BCAuth.storageOk()) {
      btn.style.display = "none";
      return;
    }
    var u = BCAuth.current();
    if (u) {
      btn.classList.add("is-signed");
      btn.innerHTML =
        '<span class="acct-av">' + avatarImg(u.avatar, 20) + "</span>" +
        '<span class="acct-name">' + esc(u.name) + "</span>" +
        '<span class="acct-caret" aria-hidden="true">▾</span>';
      btn.setAttribute("aria-label", u.name);
    } else {
      btn.classList.remove("is-signed");
      btn.innerHTML =
        '<span class="acct-av">' + USER_SVG + "</span>" +
        '<span class="acct-name">' + esc(BCi18n.t("acc.signIn")) + "</span>";
      btn.setAttribute("aria-label", BCi18n.t("acc.signIn"));
    }
  }

  function renderDrawerCard() {
    var card = document.querySelector("#drawer-acct-card");
    if (!card) return;
    var u = BCAuth.current();
    var st = BCStore.load();
    if (u) {
      card.innerHTML =
        '<div class="drawer-acct-row">' +
          '<span class="acct-av acct-av-lg">' + avatarImg(u.avatar, 34) + "</span>" +
          '<div class="drawer-acct-meta">' +
            '<strong>' + esc(u.name) + "</strong>" +
            '<span class="mono mut">' + esc(BCi18n.t("acc.savedLocal")) + "</span>" +
          "</div>" +
          '<button type="button" class="btn-bc btn-xs" data-act="drawer-switch">' + esc(BCi18n.t("acc.switchShort")) + "</button>" +
        "</div>";
      card.querySelector("[data-act=drawer-switch]").addEventListener("click", function () {
        BCUI.closeDrawer();
        openModal(BCAuth.users().length > 1 ? "login" : "register");
      });
    } else {
      card.innerHTML =
        '<div class="drawer-acct-row">' +
          '<span class="acct-av acct-av-lg">' + USER_SVG + "</span>" +
          '<div class="drawer-acct-meta">' +
            '<strong>' + esc(BCi18n.t("acc.guest")) + "</strong>" +
            '<span class="mono mut">' + esc(BCi18n.t("acc.guestSub", { n: st.balance.toLocaleString("vi-VN") })) + "</span>" +
          "</div>" +
          '<button type="button" class="btn-bc btn-xs btn-gold" data-act="drawer-signin">' + esc(BCi18n.t("acc.signIn")) + "</button>" +
        "</div>";
      card.querySelector("[data-act=drawer-signin]").addEventListener("click", function () {
        BCUI.closeDrawer();
        openModal(BCAuth.users().length ? "login" : "register");
      });
    }
  }

  /* ---------- account popover menu (when signed in) ---------- */
  function toggleMenu() {
    var menu = document.querySelector("#acct-menu");
    if (!menu) return;
    if (!menu.hidden) { menu.hidden = true; return; }
    var u = BCAuth.current();
    if (!u) {
      openModal(BCAuth.users().length ? "login" : "register");
      return;
    }
    var summary = BCStore.peekUser(u.id);
    var others = BCAuth.users().filter(function (x) { return x.id !== u.id; });
    var othersHtml = "";
    if (others.length) {
      othersHtml =
        '<div class="acct-menu-sec">' + esc(BCi18n.t("acc.switch")) + "</div>" +
        others.map(function (o) {
          var p = BCStore.peekUser(o.id);
          return '<button type="button" class="acct-menu-user" data-switch-id="' + esc(o.id) + '">' +
            '<span class="acct-av">' + avatarImg(o.avatar, 22) + "</span>" +
            '<span class="acct-menu-uname">' + esc(o.name) + "</span>" +
            '<span class="mono mut">' + p.balance.toLocaleString("vi-VN") + " " + esc(BCi18n.t("unit.xu")) + "</span>" +
          "</button>";
        }).join("");
    }
    menu.innerHTML =
      '<div class="acct-menu-head">' +
        '<span class="acct-av acct-av-lg">' + avatarImg(u.avatar, 32) + "</span>" +
        '<div>' +
          '<strong>' + esc(u.name) + "</strong>" +
          '<div class="mono mut" style="font-size:12px">' +
            summary.balance.toLocaleString("vi-VN") + " " + esc(BCi18n.t("unit.xu")) + " · " +
            summary.badges + " " + esc(BCi18n.t("drawer.badges")) +
          "</div>" +
        "</div>" +
      "</div>" +
      othersHtml +
      '<div class="acct-menu-actions">' +
        '<button type="button" class="btn-bc btn-sm" data-menu-act="add">' + esc(BCi18n.t("acc.addPlayer")) + "</button>" +
        '<div class="acct-menu-row2">' +
          '<button type="button" class="btn-bc btn-xs" data-menu-act="export">' + esc(BCi18n.t("acc.exportBtn")) + "</button>" +
          '<button type="button" class="btn-bc btn-xs" data-menu-act="import">' + esc(BCi18n.t("acc.importShort")) + "</button>" +
        "</div>" +
        '<button type="button" class="btn-bc btn-gold btn-sm" data-menu-act="logout">' + esc(BCi18n.t("acc.signOut")) + "</button>" +
        '<button type="button" class="acct-del-link" data-menu-act="delete">' + esc(BCi18n.t("acc.deleteBtn")) + "</button>" +
      "</div>";
    menu.hidden = false;

    menu.querySelectorAll("[data-switch-id]").forEach(function (b) {
      b.addEventListener("click", function () {
        menu.hidden = true;
        openModal("login", b.getAttribute("data-switch-id"));
      });
    });
    menu.querySelector("[data-menu-act=add]").addEventListener("click", function () {
      menu.hidden = true;
      openModal("register");
    });
    menu.querySelector("[data-menu-act=export]").addEventListener("click", function () {
      menu.hidden = true;
      exportAccount();
    });
    menu.querySelector("[data-menu-act=import]").addEventListener("click", function () {
      menu.hidden = true;
      triggerImport();
    });
    menu.querySelector("[data-menu-act=logout]").addEventListener("click", function () {
      menu.hidden = true;
      BCAuth.logout();
      onAccountSwitched(BCi18n.t("acc.signedOut"));
    });
    menu.querySelector("[data-menu-act=delete]").addEventListener("click", function () {
      menu.hidden = true;
      openDeleteModal();
    });
  }

  function closeMenu() {
    var menu = document.querySelector("#acct-menu");
    if (menu) menu.hidden = true;
  }

  /* ---------- modal: login & register ---------- */
  function openModal(tab, preselectUserId) {
    closeMenu();
    var m = document.querySelector("#modal-account");
    if (!m) return;
    updateModalLabels();
    var targetTab = tab || (BCAuth.users().length ? "login" : "register");
    setTab(targetTab, preselectUserId);
    m.classList.add("show");
    BCAudio.pop();
  }

  function closeModal() {
    clearInterval(lockTimer);
    var m = document.querySelector("#modal-account");
    if (m) m.classList.remove("show");
  }

  function setTab(tab, preselectUserId) {
    clearInterval(lockTimer);
    document.querySelectorAll("[data-acc-tab]").forEach(function (b) {
      var active = b.getAttribute("data-acc-tab") === tab;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    document.querySelector("#acc-pane-login").hidden = tab !== "login";
    document.querySelector("#acc-pane-register").hidden = tab !== "register";
    if (tab === "login") renderLoginTab(preselectUserId);
    else renderRegisterTab();
  }

  function renderLoginTab(preselectUserId) {
    var list = BCAuth.users();
    var zone = document.querySelector("#acc-user-list");
    var empty = document.querySelector("#acc-empty-msg");
    var form = document.querySelector("#acc-login-form");
    var errEl = document.querySelector("#acc-login-err");
    if (errEl) errEl.textContent = "";

    if (!list.length) {
      zone.innerHTML = "";
      empty.hidden = false;
      form.hidden = true;
      selectedLoginId = null;
      return;
    }
    empty.hidden = true;
    if (preselectUserId) selectedLoginId = preselectUserId;
    else if (!selectedLoginId || !list.some(function (u) { return u.id === selectedLoginId; })) {
      selectedLoginId = list[0].id;
    }

    zone.innerHTML = list.map(function (u) {
      var p = BCStore.peekUser(u.id);
      var sel = u.id === selectedLoginId;
      return '<button type="button" class="acct-user-card' + (sel ? " selected" : "") + '" data-pick-id="' + esc(u.id) + '">' +
        '<span class="acct-av acct-av-lg">' + avatarImg(u.avatar, 38) + "</span>" +
        '<span class="acct-user-name">' + esc(u.name) + "</span>" +
        '<span class="mono mut" style="font-size:11px">' + p.balance.toLocaleString("vi-VN") + " " + esc(BCi18n.t("unit.xu")) + "</span>" +
      "</button>";
    }).join("");

    zone.querySelectorAll("[data-pick-id]").forEach(function (b) {
      b.addEventListener("click", function () {
        selectLoginUser(b.getAttribute("data-pick-id"));
      });
    });

    selectLoginUser(selectedLoginId);
  }

  function selectLoginUser(id) {
    selectedLoginId = id;
    document.querySelectorAll("[data-pick-id]").forEach(function (b) {
      b.classList.toggle("selected", b.getAttribute("data-pick-id") === id);
    });
    var u = BCAuth.users().filter(function (x) { return x.id === id; })[0];
    var form = document.querySelector("#acc-login-form");
    if (!u) { form.hidden = true; return; }
    form.hidden = false;
    document.querySelector("#acc-pin-label").textContent = BCi18n.t("acc.pinFor", { name: u.name });
    var pinInput = document.querySelector("#acc-login-pin");
    pinInput.value = "";
    pinInput.classList.remove("invalid");
    document.querySelector("#acc-login-err").textContent = "";
    watchLockout(id);
    setTimeout(function () { if (!pinInput.disabled) pinInput.focus(); }, 40);
  }

  function watchLockout(id) {
    clearInterval(lockTimer);
    var pinInput = document.querySelector("#acc-login-pin");
    var submitBtn = document.querySelector("#acc-login-submit");
    var errEl = document.querySelector("#acc-login-err");
    function tick() {
      var leftMs = BCAuth.lockLeft(id);
      if (leftMs > 0) {
        var secs = Math.ceil(leftMs / 1000);
        pinInput.disabled = true;
        submitBtn.disabled = true;
        errEl.textContent = BCi18n.t("acc.err.locked", { s: secs });
      } else {
        clearInterval(lockTimer);
        pinInput.disabled = false;
        submitBtn.disabled = false;
      }
    }
    tick();
    if (BCAuth.lockLeft(id) > 0) lockTimer = setInterval(tick, 500);
  }

  function renderRegisterTab() {
    var grid = document.querySelector("#acc-av-grid");
    grid.innerHTML = BC_DATA.ANIMALS.map(function (a) {
      var sel = a.id === selectedAvatar;
      return '<button type="button" class="acct-av-pick' + (sel ? " selected" : "") + '" data-av="' + a.id + '" title="' + esc(BCi18n.L(a.name)) + '">' +
        '<img src="' + a.img + '" width="36" height="36" alt="' + esc(BCi18n.L(a.name)) + '">' +
        '<span>' + esc(BCi18n.L(a.name)) + "</span>" +
      "</button>";
    }).join("");
    grid.querySelectorAll("[data-av]").forEach(function (b) {
      b.addEventListener("click", function () {
        selectedAvatar = b.getAttribute("data-av");
        renderRegisterTab();
      });
    });

    var carryWrap = document.querySelector("#acc-carry-wrap");
    var showCarry = !BCAuth.current() && BCStore.guestHasProgress();
    carryWrap.hidden = !showCarry;
    if (showCarry) {
      var g = BCStore.guestSummary();
      document.querySelector("#acc-carry-text").textContent =
        BCi18n.t("acc.carryGuest", { xu: g.balance.toLocaleString("vi-VN"), b: g.badges });
    }
    document.querySelector("#acc-reg-err").textContent = "";
  }

  function updateModalLabels() {
    var tLogin = document.querySelector("[data-acc-tab=login]");
    var tReg = document.querySelector("[data-acc-tab=register]");
    if (tLogin) tLogin.textContent = BCi18n.t("acc.tabLogin");
    if (tReg) tReg.textContent = BCi18n.t("acc.tabRegister");
  }

  /* ---------- delete account modal ---------- */
  function openDeleteModal() {
    var u = BCAuth.current();
    if (!u) return;
    var m = document.querySelector("#modal-acct-del");
    document.querySelector("#acc-del-title").textContent = BCi18n.t("acc.delTitle", { name: u.name });
    var pin = document.querySelector("#acc-del-pin");
    pin.value = "";
    pin.classList.remove("invalid");
    document.querySelector("#acc-del-err").textContent = "";
    m.classList.add("show");
    setTimeout(function () { pin.focus(); }, 40);
  }

  /* ---------- P4: export / import ---------- */
  function exportAccount() {
    var u = BCAuth.current();
    var json = BCAuth.exportCurrent(BCStore.BASE);
    if (!u || !json) return;
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var safeName = u.name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "player";
    a.href = url;
    a.download = "bau-cua-" + safeName + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    BCUI.toast(BCi18n.t("acc.exported", { name: u.name }), "win");
  }

  function triggerImport() {
    var inp = document.querySelector("#acc-import-file");
    if (!inp) return;
    inp.value = "";
    inp.click();
  }

  /* ---------- P4: local + sample leaderboard on play.html ---------- */
  function renderLeaderboard() {
    var tbody = document.querySelector("#lb-body");
    if (!tbody || !window.BC_DATA) return;
    var curId = BCAuth.currentId();
    var localRows = BCAuth.users().map(function (u) {
      var st = BCStore.peekUser(u.id);
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        xu: st.balance,
        isLocal: true,
        isMe: u.id === curId
      };
    });
    var sampleRows = (BC_DATA.LEADER_SAMPLE || []).map(function (s) {
      return { id: null, name: s.name, avatar: null, xu: s.xu, isLocal: false, isMe: false };
    });
    var combined = localRows.concat(sampleRows).sort(function (a, b) {
      return b.xu - a.xu;
    }).slice(0, 7);

    // update podium top 3 if present
    var p1 = document.querySelector(".podium .p1");
    var p2 = document.querySelector(".podium .p2");
    var p3 = document.querySelector(".podium .p3");
    if (p1 && combined[0]) p1.innerHTML = "<strong>1</strong><br>" + esc(combined[0].name);
    if (p2 && combined[1]) p2.innerHTML = "<strong>2</strong><br>" + esc(combined[1].name);
    if (p3 && combined[2]) p3.innerHTML = "<strong>3</strong><br>" + esc(combined[2].name);

    tbody.innerHTML = combined.map(function (r, idx) {
      var badge = r.isMe
        ? ' <span class="acct-you-tag">' + esc(BCi18n.t("acc.you")) + "</span>"
        : (r.isLocal ? ' <span class="acct-local-tag">★</span>' : "");
      var av = r.avatar ? avatarImg(r.avatar, 18) + " " : "";
      return '<tr class="' + (r.isMe ? "lb-row-me" : "") + '">' +
        "<td>" + (idx + 1) + "</td>" +
        "<td>" + av + esc(r.name) + badge + "</td>" +
        '<td class="mono">' + r.xu.toLocaleString("vi-VN") + "</td>" +
      "</tr>";
    }).join("");
  }

  /* ---------- state refresh after login / logout / switch ---------- */
  function onAccountSwitched(toastMsg) {
    BCStore.reload();
    BCi18n.apply();
    BCUI.renderCoins();
    BCUI.renderDrawer();
    renderNavChip();
    renderDrawerCard();
    renderLeaderboard();
    // If on play page, refresh holds/chips/history
    if (window.BCWallet) BCWallet.clearHolds();
    if (toastMsg) BCUI.toast(toastMsg, "gold");
    setTimeout(function () { location.reload(); }, 450);
  }

  /* ---------- P3: gentle nudge when Guest unlocks their first badge ---------- */
  function onBadgeUnlocked() {
    if (BCAuth.current() || nudgeShown || !BCAuth.storageOk()) return;
    nudgeShown = true;
    var zone = document.querySelector(".toast-zone");
    if (!zone) return;
    var el = document.createElement("div");
    el.className = "toast-bc acct-nudge-toast";
    el.innerHTML =
      '<span>' + esc(BCi18n.t("acc.nudge")) + "</span> " +
      '<button type="button" class="btn-bc btn-xs btn-gold" data-act="nudge-reg">' +
        esc(BCi18n.t("acc.tabRegister")) +
      "</button>";
    zone.appendChild(el);
    el.querySelector("[data-act=nudge-reg]").addEventListener("click", function () {
      el.remove();
      openModal("register");
    });
    setTimeout(function () {
      if (el.parentNode) {
        el.style.opacity = "0";
        setTimeout(function () { el.remove(); }, 250);
      }
    }, 6500);
  }

  /* ---------- wire events ---------- */
  function wireEvents() {
    var navBtn = document.querySelector("[data-act=acct-btn]");
    if (navBtn) {
      navBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (BCAuth.current()) toggleMenu();
        else openModal(BCAuth.users().length ? "login" : "register");
      });
    }

    document.addEventListener("click", function (e) {
      var wrap = document.querySelector(".acct-wrap");
      if (wrap && !wrap.contains(e.target)) closeMenu();
    });

    document.querySelectorAll("[data-acc-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        setTab(b.getAttribute("data-acc-tab"));
      });
    });

    var goReg = document.querySelector("[data-acc-go=register]");
    if (goReg) goReg.addEventListener("click", function () { setTab("register"); });

    var closeBtn = document.querySelector("[data-act=acc-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // strip non-digits from PIN inputs
    ["#acc-login-pin", "#acc-reg-pin", "#acc-reg-pin2", "#acc-del-pin"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) {
        el.addEventListener("input", function () {
          this.value = this.value.replace(/\D/g, "");
          this.classList.remove("invalid");
        });
      }
    });

    // submit login
    var loginForm = document.querySelector("#acc-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!selectedLoginId) return;
        var pinEl = document.querySelector("#acc-login-pin");
        var rem = document.querySelector("#acc-login-rem").checked;
        var errEl = document.querySelector("#acc-login-err");
        BCAuth.login(selectedLoginId, pinEl.value, rem).then(function (res) {
          if (res.ok) {
            closeModal();
            onAccountSwitched(BCi18n.t("acc.welcomeBack", { name: res.user.name }));
            return;
          }
          BCAudio.lose();
          pinEl.value = "";
          pinEl.classList.add("invalid");
          if (res.error === "acc.err.locked") {
            watchLockout(selectedLoginId);
          } else {
            errEl.textContent = BCi18n.t(res.error, { left: res.left || 0 });
          }
        });
      });
    }

    // submit register
    var regForm = document.querySelector("#acc-reg-form");
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var nameEl = document.querySelector("#acc-reg-name");
        var pinEl = document.querySelector("#acc-reg-pin");
        var pin2El = document.querySelector("#acc-reg-pin2");
        var rem = document.querySelector("#acc-reg-rem").checked;
        var carryWrap = document.querySelector("#acc-carry-wrap");
        var carry = !carryWrap.hidden && document.querySelector("#acc-reg-carry").checked;
        var errEl = document.querySelector("#acc-reg-err");
        [nameEl, pinEl, pin2El].forEach(function (x) { x.classList.remove("invalid"); });

        BCAuth.register({
          name: nameEl.value,
          avatar: selectedAvatar,
          pin: pinEl.value,
          pin2: pin2El.value,
          remember: rem
        }).then(function (res) {
          if (!res.ok) {
            BCAudio.lose();
            errEl.textContent = BCi18n.t(res.error);
            if (res.error.indexOf("name") !== -1) nameEl.classList.add("invalid");
            else if (res.error === "acc.err.pinMatch") pin2El.classList.add("invalid");
            else pinEl.classList.add("invalid");
            return;
          }
          BCStore.setupNewAccount(res.user.id, carry);
          nameEl.value = ""; pinEl.value = ""; pin2El.value = "";
          closeModal();
          onAccountSwitched(BCi18n.t(carry ? "acc.createdCarry" : "acc.createdFresh", { name: res.user.name }));
        });
      });
    }

    // delete confirmation modal
    document.querySelectorAll("[data-act=acc-del-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelector("#modal-acct-del").classList.remove("show");
      });
    });
    var delConfirm = document.querySelector("#acc-del-confirm");
    if (delConfirm) {
      delConfirm.addEventListener("click", function () {
        var u = BCAuth.current();
        if (!u) return;
        var pinEl = document.querySelector("#acc-del-pin");
        var errEl = document.querySelector("#acc-del-err");
        BCAuth.remove(u.id, pinEl.value, BCStore.BASE).then(function (res) {
          if (!res.ok) {
            BCAudio.lose();
            pinEl.classList.add("invalid");
            errEl.textContent = BCi18n.t(res.error, { left: "" });
            return;
          }
          document.querySelector("#modal-acct-del").classList.remove("show");
          onAccountSwitched(BCi18n.t("acc.deleted", { name: u.name }));
        });
      });
    }

    // import file handler
    var importBtn = document.querySelector("[data-act=acc-import]");
    if (importBtn) importBtn.addEventListener("click", triggerImport);
    var fileInp = document.querySelector("#acc-import-file");
    if (fileInp) {
      fileInp.addEventListener("change", function () {
        var f = fileInp.files && fileInp.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          var res = BCAuth.importBundle(String(reader.result || ""), BCStore.BASE);
          if (!res.ok) {
            BCUI.toast(BCi18n.t(res.error), "lose");
            return;
          }
          closeModal();
          onAccountSwitched(BCi18n.t("acc.imported", { name: res.user.name }));
        };
        reader.readAsText(f);
      });
    }
  }

  function boot() {
    injectChrome();
    BCi18n.apply();
    updateModalLabels();
    renderNavChip();
    renderDrawerCard();
    renderLeaderboard();
    wireEvents();

    if (window.BCWallet) {
      BCWallet.onChange(function () {
        renderDrawerCard();
        renderLeaderboard();
      });
    }
    BCi18n.onLangChange(function () {
      updateModalLabels();
      renderNavChip();
      renderDrawerCard();
      renderLeaderboard();
    });
  }

  return {
    boot: boot, openModal: openModal, onBadgeUnlocked: onBadgeUnlocked,
    renderLeaderboard: renderLeaderboard
  };
})();
