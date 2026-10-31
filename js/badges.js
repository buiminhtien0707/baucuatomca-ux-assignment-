/* badges.js — 8 achievements, unlock + toast */
window.BCBadges = (function () {
  "use strict";

  function has(id) { return BCStore.load().badges.indexOf(id) !== -1; }

  function unlock(id) {
    var st = BCStore.load();
    if (st.badges.indexOf(id) !== -1) return false;
    st.badges.push(id);
    BCStore.save();
    var def = BC_DATA.BADGES.filter(function (b) { return b.id === id; })[0];
    if (def) {
      BCUI.toast("🏅 " + BCi18n.t("badge.toast", { x: BCi18n.L(def.name) }), "gold");
      BCAudio.win();
    }
    return true;
  }

  /* event hooks — called by game/quiz/lab/wallet flows */
  function check(ev) {
    var st = BCStore.load();
    switch (ev) {
      case "lixi": return unlock("khai_xuan");
      case "first_round": if (st.stats.played === 1) return unlock("lac_lu"); break;
      case "first_loss": if (st.stats.lost === 1) return unlock("thua_vui"); break;
      case "streak3": if (st.stats.streak >= 3) return unlock("het_y"); break;
      case "quiz_perfect": return unlock("hoc_ba");
      case "animal_viewed":
        if (st.seenAnimals.length >= 6) return unlock("sau_mat");
        break;
      case "lab_run": return unlock("nha_toan");
      case "return_visit":
        if (st.stats._prevVisit) return unlock("khach_quen");
        break;
    }
    return false;
  }

  return { check: check, has: has, unlock: unlock };
})();
