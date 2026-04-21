(function () {
  if (window.__fshInjected) return;
  window.__fshInjected = true;

  function parsePaypalBody(str) {
    try {
      const parsed = JSON.parse(str);
      if (!parsed || !Array.isArray(parsed.tracking)) return;
      const t = parsed.tracking.find(e => e.seller_id || e.client_id);
      if (!t) return;
      window.postMessage({ __fsh: 1, paypalLogger: {
        seller_id: t.seller_id,
        client_id: t.client_id,
        merchant_domain: t.merchant_domain
      }}, "*");
    } catch (e) {}
  }

  function extractPaypalLogger(body) {
    if (!body) return;
    if (typeof body === "string") {
      parsePaypalBody(body);
    } else if (body instanceof Blob) {
      body.text().then(parsePaypalBody).catch(() => {});
    }
  }

  // Intercetta fetch
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

    if (/xoplatform\/logger\/api\/logger/i.test(url)) {
      extractPaypalLogger(init && init.body);
    }

    return p;
  };

  // Intercetta XHR
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__fshUrl = (typeof url === "string") ? url : "";
    return _open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (/xoplatform\/logger\/api\/logger/i.test(this.__fshUrl || "")) {
      extractPaypalLogger(body);
    }
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

  // Intercetta sendBeacon (usato da PayPal logger)
  const _sendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function (url, data) {
    if (/xoplatform\/logger\/api\/logger/i.test(url)) {
      extractPaypalLogger(data);
    }
    return _sendBeacon(url, data);
  };
})();
