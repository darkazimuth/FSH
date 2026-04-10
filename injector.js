(function () {
  if (window.__fshInjected) return;
  window.__fshInjected = true;

  const _fetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const p = _fetch.apply(this, arguments);

    if (/api\.stripe\.com|amazonpayMerchantId/i.test(url)) {
      p.then(resp => {
        resp.clone().json().then(data => {
          window.postMessage({ __fsh: 1, url: url, data: data }, "*");
        }).catch(() => {});
      }).catch(() => {});
    }
    return p;
  };

  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__fshUrl = (typeof url === "string") ? url : "";
    return _open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", function () {
      const url = this.__fshUrl || "";
      if (/api\.stripe\.com|amazonpayMerchantId/i.test(url)) {
        try {
          const data = JSON.parse(this.responseText);
          window.postMessage({ __fsh: 1, url: url, data: data }, "*");
        } catch (e) {}
      }
    });
    return _send.apply(this, arguments);
  };
})();