/*
 * Ocean Ads — config interceptor. MUST run before the SDK's init.js.
 *
 * The SDK ships its config with the website keyed by full URL
 * ("https://thesquirrels.in/"), but matches it against window.location.hostname
 * ("thesquirrels.in"). Without normalizing, domain detection fails and the
 * domain-locked SDK serves no ads. This patches window.__OCEAN_CONFIG__ so the
 * website keys are reduced to bare hostnames as the SDK assigns them.
 * (Provided by Ocean as the required embed interceptor.)
 */
(function () {
  var _cfg;
  Object.defineProperty(window, "__OCEAN_CONFIG__", {
    configurable: true,
    get: function () {
      return _cfg;
    },
    set: function (v) {
      if (v && v.websites && typeof v.websites === "object") {
        var normalized = {};
        Object.keys(v.websites).forEach(function (key) {
          var host = key
            .replace(/^https?:\/\//i, "")
            .replace(/\/.*$/, "")
            .replace(/:\d+$/, "");
          normalized[host] = v.websites[key];
        });
        v.websites = normalized;
      }
      _cfg = v;
    },
  });
})();
