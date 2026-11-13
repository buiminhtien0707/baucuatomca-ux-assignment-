/* auth.js — local accounts without a backend.
   Accounts live in localStorage on this device only. The PIN is never stored
   as plain text: it is salted and hashed (PBKDF2 when available).
   This is a SIMULATION of login for a prototype, not real security.

   Load order: BEFORE store.js (store.js asks BCAuth which wallet key to use). */
window.BCAuth = (function () {
  "use strict";

  var ACC_KEY = "bc_accounts_v1";   // { v:1, users:[...] }
  var SES_KEY = "bc_session_v1";    // { userId: "u_xxxx" }
  var MAX_FAILS = 5;
  var LOCK_MS = 30 * 1000;
  var AVATARS = ["bau", "cua", "tom", "ca", "ga", "huou"];

  /* ---------- storage helpers ---------- */
  function storageOk() {
    try {
      localStorage.setItem("bc_probe", "1");
      localStorage.removeItem("bc_probe");
      return true;
    } catch (e) { return false; }
  }
  function readJSON(store, key, fallback) {
    try {
      var raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(store, key, val) {
    try { store.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function db() {
    var d = readJSON(localStorage, ACC_KEY, null);
    if (!d || d.v !== 1 || !Array.isArray(d.users)) d = { v: 1, users: [] };
    return d;
  }
  function saveDb(d) { writeJSON(localStorage, ACC_KEY, d); }

  function users() {
    return db().users.map(function (u) {
      return { id: u.id, name: u.name, avatar: u.avatar }; // never expose hash/salt
    });
  }
  function findUser(d, id) {
    return d.users.filter(function (u) { return u.id === id; })[0] || null;
  }

  /* ---------- session ---------- */
  // "remember me" -> localStorage (survives closing the browser)
  // otherwise     -> sessionStorage (cleared when the tab closes)
  function currentId() {
    var s = readJSON(sessionStorage, SES_KEY, null) || readJSON(localStorage, SES_KEY, null);
    if (!s || !s.userId) return null;
    return findUser(db(), s.userId) ? s.userId : null; // account may have been deleted
  }
  function current() {
    var id = currentId();
    if (!id) return null;
    var u = findUser(db(), id);
    return { id: u.id, name: u.name, avatar: u.avatar };
  }
  function setSession(id, remember) {
    try { sessionStorage.removeItem(SES_KEY); localStorage.removeItem(SES_KEY); } catch (e) {}
    if (!id) return;
    writeJSON(remember ? localStorage : sessionStorage, SES_KEY, { userId: id });
  }

  /* the wallet key store.js should use right now */
  function stateKey(base) {
    var id = currentId();
    return id ? base + "__" + id : base;
  }

  /* ---------- hashing ---------- */
  function randomHex(bytes) {
    var a = new Uint8Array(bytes);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < bytes; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  // Fallback when crypto.subtle is missing (some browsers on file://).
  // Not cryptographically strong, but the PIN is still never stored in clear.
  function weakHash(text) {
    var h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var r = 0; r < 2000; r++) {
      for (var i = 0; i < text.length; i++) {
        h1 = Math.imul(h1 ^ text.charCodeAt(i), 16777619) >>> 0;
        h2 = Math.imul(h2 ^ (h1 & 0xff), 2246822519) >>> 0;
      }
    }
    return ("0000000" + h1.toString(16)).slice(-8) + ("0000000" + h2.toString(16)).slice(-8);
  }

  function hashPin(pin, salt) {
    var subtle = window.crypto && crypto.subtle;
    if (!subtle || !window.TextEncoder) {
      return Promise.resolve({ algo: "weak", hash: weakHash(salt + ":" + pin) });
    }
    var enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"])
      .then(function (key) {
        return subtle.deriveBits(
          { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
          key, 256);
      })
      .then(function (bits) {
        var hex = Array.prototype.map.call(new Uint8Array(bits), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
        return { algo: "pbkdf2", hash: hex };
      })
      .catch(function () {
        return { algo: "weak", hash: weakHash(salt + ":" + pin) };
      });
  }
  function verifyPin(u, pin) {
    if (u.algo === "weak") return Promise.resolve(weakHash(u.salt + ":" + pin) === u.pinHash);
    return hashPin(pin, u.salt).then(function (r) {
      return r.algo === "pbkdf2" ? r.hash === u.pinHash : false;
    });
  }

  /* ---------- validation (shared with the UI for inline errors) ---------- */
  // returns an i18n error key, or "" when valid
  function validateNew(name, avatar, pin, pin2) {
    name = (name || "").trim();
    if (name.length < 2 || name.length > 16) return "acc.err.nameLen";
    var taken = db().users.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); });
    if (taken) return "acc.err.nameTaken";
    if (AVATARS.indexOf(avatar) === -1) return "acc.err.avatar";
    if (!/^\d{4,6}$/.test(pin || "")) return "acc.err.pinFormat";
    if (pin !== pin2) return "acc.err.pinMatch";
    return "";
  }

  /* ---------- actions (all return Promises) ---------- */
  function register(opts) {
    // opts: { name, avatar, pin, pin2, remember }
    var err = validateNew(opts.name, opts.avatar, opts.pin, opts.pin2);
    if (err) return Promise.resolve({ ok: false, error: err });
    var salt = randomHex(16);
    return hashPin(opts.pin, salt).then(function (h) {
      var d = db();
      var u = {
        id: "u_" + randomHex(4),
        name: opts.name.trim(),
        avatar: opts.avatar,
        salt: salt, algo: h.algo, pinHash: h.hash,
        fails: 0, lockUntil: 0,
        createdAt: new Date().toISOString()
      };
      d.users.push(u);
      saveDb(d);
      setSession(u.id, opts.remember !== false);
      return { ok: true, user: { id: u.id, name: u.name, avatar: u.avatar } };
    });
  }

  function lockLeft(id) {
    var u = findUser(db(), id);
    if (!u || !u.lockUntil) return 0;
    return Math.max(0, u.lockUntil - Date.now());
  }

  function login(id, pin, remember) {
    var d = db();
    var u = findUser(d, id);
    if (!u) return Promise.resolve({ ok: false, error: "acc.err.noUser" });
    if (u.lockUntil && u.lockUntil > Date.now()) {
      return Promise.resolve({ ok: false, error: "acc.err.locked", lockMs: u.lockUntil - Date.now() });
    }
    return verifyPin(u, pin).then(function (good) {
      var d2 = db();
      var u2 = findUser(d2, id);
      if (good) {
        u2.fails = 0; u2.lockUntil = 0;
        saveDb(d2);
        setSession(id, remember !== false);
        return { ok: true, user: { id: u2.id, name: u2.name, avatar: u2.avatar } };
      }
      u2.fails = (u2.fails || 0) + 1;
      var res = { ok: false, error: "acc.err.pinWrong", left: MAX_FAILS - u2.fails };
      if (u2.fails >= MAX_FAILS) {
        u2.fails = 0;
        u2.lockUntil = Date.now() + LOCK_MS;
        res = { ok: false, error: "acc.err.locked", lockMs: LOCK_MS };
      }
      saveDb(d2);
      return res;
    });
  }

  function logout() { setSession(null); }

  // delete needs the PIN again (error prevention for a destructive action)
  function remove(id, pin, stateBase) {
    var u = findUser(db(), id);
    if (!u) return Promise.resolve({ ok: false, error: "acc.err.noUser" });
    return verifyPin(u, pin).then(function (good) {
      if (!good) return { ok: false, error: "acc.err.pinWrong" };
      var wasCurrent = currentId() === id;
      var d = db();
      d.users = d.users.filter(function (x) { return x.id !== id; });
      saveDb(d);
      try { localStorage.removeItem(stateBase + "__" + id); } catch (e) {}
      if (wasCurrent) setSession(null);
      return { ok: true };
    });
  }

  /* ---------- P4: export / import account bundle (.json) ---------- */
  function exportCurrent(stateBase) {
    var id = currentId();
    if (!id) return null;
    var u = findUser(db(), id);
    if (!u) return null;
    var wallet = readJSON(localStorage, stateBase + "__" + id, null);
    return JSON.stringify({
      type: "bau_cua_vui_account_v1",
      exportedAt: new Date().toISOString(),
      user: u,
      wallet: wallet
    }, null, 2);
  }

  function importBundle(rawJson, stateBase) {
    var data = null;
    try { data = JSON.parse(rawJson); } catch (e) { return { ok: false, error: "acc.err.importBad" }; }
    if (!data || data.type !== "bau_cua_vui_account_v1" || !data.user || !data.user.id || !data.user.name || !data.user.pinHash) {
      return { ok: false, error: "acc.err.importBad" };
    }
    var u = data.user;
    if (AVATARS.indexOf(u.avatar) === -1) u.avatar = "cua";
    var d = db();
    var existing = findUser(d, u.id);
    if (!existing) {
      // avoid duplicate display name collision with a different id
      var sameName = d.users.filter(function (x) { return x.name.toLowerCase() === String(u.name).toLowerCase(); })[0];
      if (sameName) u.id = sameName.id;
    }
    d.users = d.users.filter(function (x) { return x.id !== u.id; });
    u.fails = 0; u.lockUntil = 0;
    d.users.push(u);
    saveDb(d);
    if (data.wallet && typeof data.wallet === "object") {
      writeJSON(localStorage, stateBase + "__" + u.id, data.wallet);
    }
    setSession(u.id, true);
    return { ok: true, user: { id: u.id, name: u.name, avatar: u.avatar } };
  }

  return {
    AVATARS: AVATARS, MAX_FAILS: MAX_FAILS,
    storageOk: storageOk, users: users, current: current, currentId: currentId,
    stateKey: stateKey, validateNew: validateNew,
    register: register, login: login, logout: logout, remove: remove, lockLeft: lockLeft,
    exportCurrent: exportCurrent, importBundle: importBundle
  };
})();
