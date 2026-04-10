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