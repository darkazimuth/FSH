function copy(t) { navigator.clipboard.writeText(t); }

function fld(label, val) {
  if (!val) return "";
  return `<div class="field-row"><div class="field-label">${label}</div><div class="field-value" title="${val}">${val}</div></div>`;
}

function render() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    document.getElementById("scan-url").textContent = tab.url;

    chrome.runtime.sendMessage({ type: "GET_DATA", tabId: tab.id }, (resp) => {
      if (!resp || !resp.data) return;

      const data = resp.data;
      const s = data.stripe;
      const a = data.amazon;
      const p = data.paypal || {};
      let hasData = false;

      // 1. Shell Company
      let shellHtml = fld("Company", s.shell_company) +
                      fld("Proxy Site", s.business_url || p.proxySite) +
                      fld("Country", s.country) +
                      fld("Registered Office", s.merchant_of_record_country) +
                      fld("Support Email", s.support_email) +
                      fld("Support Phone", s.support_phone);
      document.getElementById("fields-shell").innerHTML = shellHtml;
      document.getElementById("sec-shell").style.display = "block";
      if (shellHtml) hasData = true;

      // 2. Stripe
      let stripeHtml = fld("Account ID", s.acct);
      if (stripeHtml) {
        document.getElementById("fields-stripe").innerHTML = stripeHtml;
        document.getElementById("sec-stripe").style.display = "block";
        hasData = true;
      }

      // 3. Amazon Pay
      let amazonHtml = fld("Partner ID (URL)", a.partnerId) +
                       fld("Merchant ID (JSON)", a.merchantId);
      if (amazonHtml) {
        document.getElementById("fields-amazon").innerHTML = amazonHtml;
        document.getElementById("sec-amazon").style.display = "block";
        hasData = true;
      }

      // 4. PayPal
      let paypalHtml = fld("Merchant ID", p.merchantID) +
                       fld("Seller ID", p.sellerID) +
                       fld("Target Cancel URL", p.targetCancelUrl) +
                       fld("Payment Token", p.paymentToken);
      if (paypalHtml) {
        document.getElementById("fields-paypal").innerHTML = paypalHtml;
        document.getElementById("sec-paypal").style.display = "block";
        hasData = true;
      }

      if (hasData) {
        document.getElementById("waiting").style.display = "none";
        document.getElementById("status-dot").classList.add("active");
        
        document.querySelectorAll(".field-value").forEach(el => {
          el.onclick = () => {
            copy(el.getAttribute("title"));
            const old = el.innerText;
            el.innerText = "COPIED!";
            setTimeout(() => { el.innerText = old; }, 800);
          };
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  setInterval(render, 1000); 
});