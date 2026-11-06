/* i18n.js — language switching (en default, vn, zh) */
window.BCi18n = (function () {
  "use strict";
  var DICTS = {
    vn: window.BC_I18N_VN, en: window.BC_I18N_EN, zh: window.BC_I18N_ZH
  };
  var listeners = [];

  function lang() { return (window.BCStore && BCStore.load().lang) || "en"; }

  function t(key, vars) {
    var d = DICTS[lang()] || DICTS.en || DICTS.vn;
    var s = d[key] !== undefined ? d[key] : (DICTS.en && DICTS.en[key] !== undefined ? DICTS.en[key] : (DICTS.vn && DICTS.vn[key] !== undefined ? DICTS.vn[key] : key));
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return s;
  }

  function L(obj) { /* pick field from a {vn,en,zh} object */
    if (obj == null) return "";
    return obj[lang()] !== undefined ? obj[lang()] : (obj.en || obj.vn || "");
  }

  function apply() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : (lang() === "vn" ? "vi" : "en");
    var page = document.body.dataset.page;
    if (page) document.title = t("brand.full") + ": " + t("nav." + page);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll(".lang-group button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang());
    });
    listeners.forEach(function (fn) { fn(lang()); });
  }

  function setLang(l) {
    var s = BCStore.load();
    s.lang = l;
    try { localStorage.setItem("bc_lang_user_chosen", "true"); } catch (e) {}
    BCStore.save();
    apply();
  }

  function onLangChange(fn) { listeners.push(fn); }

  return { t: t, L: L, apply: apply, setLang: setLang, onLangChange: onLangChange, lang: lang };
})();
