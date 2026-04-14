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

    // Stripe: Public Key dal DOM
    const pk = document.documentElement.innerHTML.match(/\b(pk_(?:live|test)_[A-Za-z0-9]{24,})\b/);
    if (pk) {
      chrome.runtime.sendMessage({ type: "STRIPE_DATA", payload: { pk: pk[1] } });
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
    if (e.data && e.data.__fsh) {
      const data = e.data.data;
      if (!data) return;

      // Response STRIPE
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

      // Response AMAZON PAY (JSON intercettato)
      if (data.amazonPayMerchantId) {
        chrome.runtime.sendMessage({
          type: "AMAZON_DATA",
          payload: { merchantId: data.amazonPayMerchantId }
        });
      }
    }
  });

  scan();
  setInterval(scan, 2000);
})();