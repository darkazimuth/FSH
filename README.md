# FakeShop Hunter — Chrome Extension

Payment gateway & proxy detector for fakeshop OSINT investigations.
No Burp needed.

## What it detects

### Payment Gateways (+ Merchant IDs)
- Stripe — pk_live_, pk_test_, acct_, cs_, pi_ tokens
- PayPal — merchant_id, client-id, business params
- Shopify Payments — shop_id, myshopify domain
- Klarna, Adyen, Braintree, Square, Checkout.com
- Worldpay, Nuvei/SafeCharge, Payoneer, Wise, 2C2P

### Proxy / Routing Indicators
- External checkout form actions
- Embedded checkout iframes
- JS redirects to payment proxies
- WooCommerce REST API / gateway proxy plugins
- Cloudflare tunnels, ngrok
- High-risk TLDs (.tk .ml .ga .cf .gq)

## Installation

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`fakeshop-hunter/`)

## Usage

1. Navigate to a suspected fakeshop
2. Open the extension popup
3. Detection runs automatically as the page loads
4. Click "↺ Rescan" to re-run DOM analysis
5. Click any merchant ID or URL to copy it
6. Export as:
   - **IOC Report** — plain-text OSINT card
   - **JSON dump** — full structured data
   - **CSV (IDs)** — merchant IDs for spreadsheet import

## Icons

The extension currently has no icons — Chrome will use a default icon.
To add icons, place 16x16, 48x48, 128x128 PNG files in the `icons/` folder.

## Notes

- The extension intercepts *all* network requests on visited pages
- Merchant IDs marked `LIVE` (pk_live_) indicate active production accounts
- Multiple gateways on one page = high suspicion signal
- The Risk score (0–100) weighs: gateway count, live keys, merchant account tokens, proxy indicators
