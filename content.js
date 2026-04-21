(function () {
  function scan() {
    const href = window.location.href;

    // Amazon: estrae externalPartnerId dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('externalPartnerId');
    if (partnerId) {
      chrome.runtime.sendMessage({
        type: "AMAZON_DATA",
        payload: { partnerId: partnerId }
      });
    }

    // PayPal: estrae merchantID e targetCancelUrl dal DOM (incontextData)
    if (/paypal\.com\/webapps\/hermes/i.test(href)) {
      const html = document.documentElement.innerHTML;
      const merchantMatch = html.match(/"merchantID"\s*:\s*"([^"]+)"/);
      const cancelMatch = html.match(/"targetCancelUrl"\s*:\s*"([^"]+)"/);
      const tokenMatch = html.match(/"paymentToken"\s*:\s*"([^"]+)"/);
      if (merchantMatch || cancelMatch) {
        let proxyDomain = "";
        if (cancelMatch) {
          try { proxyDomain = new URL(cancelMatch[1]).hostname; } catch (e) {}
        }
        chrome.runtime.sendMessage({
          type: "PAYPAL_DATA",
          payload: {
            merchantID: merchantMatch ? merchantMatch[1] : undefined,
            targetCancelUrl: cancelMatch ? cancelMatch[1] : undefined,
            proxySite: proxyDomain || undefined,
            paymentToken: tokenMatch ? tokenMatch[1] : undefined
          }
        });
      }
    }
  }

  window.addEventListener("message", (e) => {
    if (!e.data) return;

    // Response STRIPE / AMAZON
    if (e.data.__fsh && e.data.data) {
      const data = e.data.data;

      if (data.account_settings) {
        const s = data.account_settings;
        chrome.runtime.sendMessage({
          type: "STRIPE_DATA",
          payload: {
            shell_company: s.display_name,
            business_url: s.business_url,
            country: s.country,
            merchant_of_record_country: s.merchant_of_record_country,
            support_email: s.support_email,
            support_phone: s.support_phone,
            acct: s.account_id || data.account
          }
        });
      }

      if (data.amazonPayMerchantId) {
        chrome.runtime.sendMessage({
          type: "AMAZON_DATA",
          payload: { merchantId: data.amazonPayMerchantId }
        });
      }
    }

    // PayPal Logger SDK
    if (e.data.__fsh && e.data.paypalLogger) {
      const pl = e.data.paypalLogger;
      let proxyDomain = "";
      if (pl.merchant_domain) {
        try { proxyDomain = new URL(pl.merchant_domain).hostname; } catch (ex) {}
      }
      chrome.runtime.sendMessage({
        type: "PAYPAL_DATA",
        payload: {
          sellerID: pl.seller_id || undefined,
          clientID: pl.client_id || undefined,
          proxySite: proxyDomain || pl.merchant_domain || undefined
        }
      });
    }
  });

  scan();
  setInterval(scan, 2000);
})();
