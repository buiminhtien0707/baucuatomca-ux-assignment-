/* page-learn.js — tabs + gallery + detail modal */
window.BCPageLearn = (function () {
  "use strict";

  var tab = "rules";

  function getInitialTab() {
    var hash = (location.hash || "").replace("#", "").toLowerCase();
    var search = new URLSearchParams(location.search).get("tab");
    var valid = ["rules", "animal", "history", "tet"];
    if (valid.indexOf(hash) !== -1) return hash;
    if (valid.indexOf(search) !== -1) return search;
    return "rules";
  }

  function setTab(t) {
    tab = t;
    document.querySelectorAll(".tab").forEach(function (x) {
      x.classList.toggle("active", x.dataset.tab === tab);
    });
    render();
  }

  function boot() {
    if (!document.querySelector("#learn-root")) return;

    tab = getInitialTab();

    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () {
        setTab(b.dataset.tab);
      });
    });

    window.addEventListener("hashchange", function () {
      var h = (location.hash || "").replace("#", "").toLowerCase();
      if (["rules", "animal", "history", "tet"].indexOf(h) !== -1) {
        setTab(h);
      }
    });

    setTab(tab);
    BCi18n.onLangChange(render);
  }

  function render() {
    var zone = document.querySelector("#learn-zone");
    if (!zone) return;
    zone.innerHTML = "";
    if (tab === "animal") {
      zone.className = "learn-grid";
      return renderAnimals(zone);
    }
    zone.className = "learn-full";
    if (tab === "history") return renderStatic(zone, "history");
    if (tab === "rules") return renderRules(zone);
    if (tab === "tet") return renderStatic(zone, "tet");
  }

  function renderAnimals(zone) {
    BC_DATA.ANIMALS.forEach(function (a) {
      var card = document.createElement("button");
      card.className = "animal-card story-card";
      card.innerHTML =
        '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '">' +
        '<div class="pad"><h3>' + BCi18n.L(a.name) + '</h3>' +
        '<span class="en">' + BCi18n.L(a.line) + "</span></div>";
      card.addEventListener("click", function () { openAnimal(a.id); });
      zone.appendChild(card);
    });
  }

  function renderRules(zone) {
    var box = document.createElement("div");
    box.className = "card-bc learn-rules-box";
    box.innerHTML =
      '<div class="rules-header">' +
        '<h2>' + BCi18n.t("tab.rules") + '</h2>' +
        '<p class="lead" style="font-size:16px;color:var(--mut-ink);margin:6px 0 0">' + BCi18n.t("learn.rulesIntro") + '</p>' +
      '</div>' +
      '<div class="rules-steps-grid">' +
        '<div class="rules-step-card">' +
          '<div class="step-num">01</div>' +
          '<h4>' + BCi18n.t("how.1t") + '</h4>' +
          '<p>' + BCi18n.t("learn.ruleStep1Desc") + '</p>' +
        '</div>' +
        '<div class="rules-step-card">' +
          '<div class="step-num">02</div>' +
          '<h4>' + BCi18n.t("how.2t") + '</h4>' +
          '<p>' + BCi18n.t("learn.ruleStep2Desc") + '</p>' +
        '</div>' +
        '<div class="rules-step-card">' +
          '<div class="step-num">03</div>' +
          '<h4>' + BCi18n.t("how.3t") + '</h4>' +
          '<p>' + BCi18n.t("learn.ruleStep3Desc") + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="payout-table-card">' +
        '<h3>' + BCi18n.t("learn.payoutTitle") + '</h3>' +
        '<div class="payout-rows">' +
          '<div class="payout-row lose">' +
            '<span class="badge-tag">' + BCi18n.t("learn.payoutRow0") + '</span>' +
            '<span class="calc">' + BCi18n.t("learn.payoutRow0Desc") + '</span>' +
            '<span class="res">' + BCi18n.t("learn.payoutRow0Res") + '</span>' +
          '</div>' +
          '<div class="payout-row win1">' +
            '<span class="badge-tag">' + BCi18n.t("learn.payoutRow1") + '</span>' +
            '<span class="calc">' + BCi18n.t("learn.payoutRow1Desc") + '</span>' +
            '<span class="res">' + BCi18n.t("learn.payoutRow1Res") + '</span>' +
          '</div>' +
          '<div class="payout-row win2">' +
            '<span class="badge-tag">' + BCi18n.t("learn.payoutRow2") + '</span>' +
            '<span class="calc">' + BCi18n.t("learn.payoutRow2Desc") + '</span>' +
            '<span class="res">' + BCi18n.t("learn.payoutRow2Res") + '</span>' +
          '</div>' +
          '<div class="payout-row win3">' +
            '<span class="badge-tag">' + BCi18n.t("learn.payoutRow3") + '</span>' +
            '<span class="calc">' + BCi18n.t("learn.payoutRow3Desc") + '</span>' +
            '<span class="res">' + BCi18n.t("learn.payoutRow3Res") + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="example-box">' +
          '<strong>' + BCi18n.t("learn.exampleLabel") + ': </strong>' +
          '<span>' + BCi18n.t("learn.rulesNote") + '</span>' +
        '</div>' +
        '<div class="example-box" style="margin-top:8px;border-left-color:var(--gold);">' +
          '<span>' + BCi18n.t("learn.rulesMultiDesc") + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="rules-cta-bar">' +
        '<a href="play.html" class="btn-bc btn-red">' + BCi18n.t("learn.playNowBtn") + ' ➜</a>' +
        '<a href="index.html#how-to-play" class="btn-bc btn-ghost">' + BCi18n.t("learn.quickGuideBtn") + '</a>' +
      '</div>';
    zone.appendChild(box);
  }

  function renderStatic(zone, kind) {
    var box = document.createElement("div");
    box.className = "card-bc learn-static-box";
    if (kind === "history") {
      box.innerHTML = "<h3 style='margin-bottom:12px'>" + BCi18n.t("tab.history") + "</h3><p style='font-size:16px;line-height:1.7'>" + BCi18n.t("learn.historyBody") + "</p>";
    } else {
      box.innerHTML =
        "<h3 style='margin-bottom:12px'>" + BCi18n.t("tab.tet") + "</h3><p style='font-size:16px;line-height:1.7'>" +
        BCi18n.t("learn.tetBody") + "</p>" +
        "<p class=\"mut\" style=\"font-size:14px;margin-top:12px\">" + BCi18n.t("learn.tetNote") + "</p>";
    }
    zone.appendChild(box);
  }

  function openAnimal(id) {
    var a = BC_DATA.ANIMALS.filter(function (x) { return x.id === id; })[0];
    var st = BCStore.load();
    if (st.seenAnimals.indexOf(id) === -1) {
      st.seenAnimals.push(id);
      BCStore.save();
      BCBadges.check("animal_viewed");
    }
    var modal = document.querySelector("#modal-animal");
    var lang = (BCStore.load && BCStore.load().lang) || "vn";
    var altNames = [];
    if (lang !== "vn") altNames.push(a.name.vn);
    if (lang !== "en") altNames.push(a.name.en);
    if (lang !== "zh") altNames.push(a.name.zh);
    var altStr = altNames.length ? ' <span class="mono mut">(' + altNames.join(" · ") + ")</span>" : "";

    modal.querySelector(".box").innerHTML =
      '<div class="close-row"><button class="icon-btn" data-act="modal-close" aria-label="Close">✕</button></div>' +
      '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '" style="width:100%;border:3px solid var(--ink);border-radius:12px;display:block;">'
      + "<h3 style=\"margin:14px 0 6px\">" + BCi18n.L(a.name) + altStr + "</h3>"
      + "<p><strong>" + BCi18n.L(a.line) + "</strong></p>"
      + "<p style=\"margin:0\">" + BCi18n.L(a.fact) + "</p>";
    modal.classList.add("show");
    modal.onclick = function (e) {
      if (e.target === modal) modal.classList.remove("show");
    };
    modal.querySelector("[data-act=modal-close]").addEventListener("click", function () {
      modal.classList.remove("show");
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
  return { boot: boot };
})();
