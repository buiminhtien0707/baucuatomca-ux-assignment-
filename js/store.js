/* store.js — persistence on localStorage (namespaced, versioned) */
window.BCStore = (function () {
  "use strict";
  var KEY = "bc_state_v1";

  var DEFAULTS = {
    v: 1, lang: "en", muted: false,
    balance: 1000, lastLiXi: "", lastVisit: "",
    rounds: [],            // [{dice:[i,i,i], net:int}] — last 10
    stats: { played: 0, won: 0, lost: 0, streak: 0, bestStreak: 0, peak: 1000 },
    badges: [], bestQuiz: 0, seenAnimals: [],
    coachDone: false, letters: []
  };

  var state = null;

  function load() {
    if (state) return state;
    try {
      var raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : null;
    } catch (e) { state = null; }
    if (!state || state.v !== DEFAULTS.v) {
      state = JSON.parse(JSON.stringify(DEFAULTS));
    }
    // merge missing keys (schema evolution)
    Object.keys(DEFAULTS).forEach(function (k) {
      if (state[k] === undefined) state[k] = JSON.parse(JSON.stringify(DEFAULTS[k]));
    });
    // Default to English unless user has explicitly chosen another language
    var userChosen = false;
    try { userChosen = localStorage.getItem("bc_lang_user_chosen") === "true"; } catch (e) {}
    if (!userChosen) {
      state.lang = "en";
    }
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* private mode: keep playing in-memory */ }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = null;
    load();
  }

  return { load: load, save: save, reset: reset };
})();
