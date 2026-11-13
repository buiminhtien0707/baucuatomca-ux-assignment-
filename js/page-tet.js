/* page-tet.js — timeline + feedback form with validation */
window.BCPageTet = (function () {
  "use strict";

  function boot() {
    if (!document.querySelector("#tet-root")) return;
    var vid = window.BC_DATA && window.BC_DATA.VIDEO_ID;
    var slot = document.querySelector("#video-slot");
    if (vid && slot) {
      document.querySelector("#tet-video").src = "https://www.youtube.com/embed/" + vid;
      slot.style.display = "block";
    }
    renderTimeline();
    wireForm();
    BCi18n.onLangChange(renderTimeline);
  }
  document.addEventListener("DOMContentLoaded", boot);

  function updateCounter() {
    var msg = document.querySelector("#fb-msg");
    var counter = document.querySelector("#fb-count");
    if (msg && counter) {
      counter.textContent = BCi18n.t("tet.counter", { n: msg.value.length });
    }
  }

  function renderTimeline() {
    var zone = document.querySelector("#tet-timeline");
    zone.innerHTML = "";
    BC_CONTENT.TIMELINE.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "tl-item";
      div.innerHTML = "<h4>" + BCi18n.L(item.t) + "</h4><p>" + BCi18n.L(item.d) + "</p>";
      zone.appendChild(div);
    });
    updateCounter();
  }

  function wireForm() {
    var form = document.querySelector("#fb-form");
    var msg = document.querySelector("#fb-msg");
    var counter = document.querySelector("#fb-count");

    msg.addEventListener("input", function () {
      counter.textContent = BCi18n.t("tet.counter", { n: msg.value.length });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var email = form.email.value.trim();
      var body = msg.value.trim();

      var emailField = form.email.closest(".field");
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRe.test(email)) {
        emailField.classList.add("invalid");
        ok = false;
      } else {
        emailField.classList.remove("invalid");
      }

      var msgField = msg.closest(".field");
      if (body.length < 10) {
        msgField.classList.add("invalid");
        ok = false;
      } else {
        msgField.classList.remove("invalid");
      }

      if (!ok) { BCAudio.lose(); return; }

      var st = BCStore.load();
      st.letters.push({ email: email, body: body, when: new Date().toISOString() });
      BCStore.save();
      BCUI.toast(BCi18n.t("tet.ok"), "win");
      BCAudio.win();
      form.reset();
      counter.textContent = BCi18n.t("tet.counter", { n: 0 });
    });
  }

  return { boot: boot };
})();
