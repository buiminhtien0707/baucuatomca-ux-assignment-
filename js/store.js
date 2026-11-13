/* store.js — persistence on localStorage (namespaced, versioned)
   CHANGED for accounts: the key is no longer fixed. Guests keep the old key
   "bc_state_v1"; a signed-in user gets "bc_state_v1__<userId>", so every
   account has its own balance, badges, stats and history.
   Nothing else in the game needs to change: everyone still calls BCStore.load(). */
window.BCStore = (function () {
  "use strict";
  var BASE = "bc_state_v1";

  function key() {
    return window.BCAuth ? BCAuth.stateKey(BASE) : BASE;
  }

  var DEFAULTS = {
    v: 1, lang: "en", muted: false,
    balance: 1000, lastLiXi: "", lastVisit: "",
    rounds: [],            // [{dice:[i,i,i], net:int}] — last 10
    stats: { played: 0, won: 0, lost: 0, streak: 0, bestStreak: 0, peak: 1000 },
    badges: [], bestQuiz: 0, seenAnimals: [],
    coachDone: false, letters: []
  };

  var state = null;
  var loadedKey = null;

  function fresh() { return JSON.parse(JSON.stringify(DEFAULTS)); }

  function readKey(k) {
    var s = null;
    try {
      var raw = localStorage.getItem(k);
      s = raw ? JSON.parse(raw) : null;
    } catch (e) { s = null; }
    if (!s || s.v !== DEFAULTS.v) s = fresh();
    // merge missing keys (schema evolution)
    Object.keys(DEFAULTS).forEach(function (p) {
      if (s[p] === undefined) s[p] = JSON.parse(JSON.stringify(DEFAULTS[p]));
    });
    return s;
  }

  function load() {
    var k = key();
    if (state && loadedKey === k) return state;
    loadedKey = k;
    state = readKey(k);
    // Default to English unless user has explicitly chosen another language
    var userChosen = false;
    try { userChosen = localStorage.getItem("bc_lang_user_chosen") === "true"; } catch (e) {}
    if (!userChosen) {
      state.lang = "en";
    }
    return state;
  }

  function save() {
    if (!state) load();
    try { localStorage.setItem(key(), JSON.stringify(state)); }
    catch (e) { /* private mode: keep playing in-memory */ }
  }

  function reload() {
    state = null;
    loadedKey = null;
    return load();
  }

  function reset() {
    try { localStorage.removeItem(key()); } catch (e) {}
    state = null;
    loadedKey = null;
    load();
  }

  /* Called by account-ui.js right after a new account is created.
     carry = true  : move the guest wallet into the new account, guest restarts at 1,000 xu
     carry = false : the new account starts fresh (keeps current language + sound setting) */
  function setupNewAccount(userId, carry) {
    var guest = readKey(BASE);
    var mine;
    if (carry) {
      mine = guest;
      try { localStorage.removeItem(BASE); } catch (e) {}
    } else {
      mine = fresh();
      mine.lang = guest.lang;
      mine.muted = guest.muted;
      mine.coachDone = guest.coachDone;   // don't show the tutorial twice on one device
    }
    try { localStorage.setItem(BASE + "__" + userId, JSON.stringify(mine)); } catch (e) {}
    state = null;
    loadedKey = null;
  }

  /* Does the guest wallet have any progress worth carrying over? */
  function guestHasProgress() {
    var g = readKey(BASE);
    return g.stats.played > 0 || g.balance !== DEFAULTS.balance || g.badges.length > 0;
  }
  function guestSummary() {
    var g = readKey(BASE);
    return { balance: g.balance, badges: g.badges.length };
  }

  /* Read any user's wallet summary (for account picker & local leaderboard) */
  function peekUser(userId) {
    var s = readKey(userId ? BASE + "__" + userId : BASE);
    return {
      balance: s.balance,
      badges: s.badges.length,
      played: s.stats.played,
      peak: s.stats.peak
    };
  }

  return {
    BASE: BASE, load: load, save: save, reload: reload, reset: reset,
    setupNewAccount: setupNewAccount, guestHasProgress: guestHasProgress,
    guestSummary: guestSummary, peekUser: peekUser
  };
})();
