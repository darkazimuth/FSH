# FakeShop Hunter — Chrome Extension

Payment gateway & proxy detector for fakeshop OSINT investigations - by Francesco Sercia

<img width="397" height="432" alt="image" src="https://github.com/user-attachments/assets/2ab976c1-d38c-47e4-a412-e8a61b0cbc6b" />

## What it detects

### Payment Gateways (+ Merchant IDs)
- Stripe — pk_live_, pk_test_, acct_, cs_, pi_ tokens
- Amazon Pay — merchant_id, partner_id

### TA Infrastructure
- Shell Company and related infos
- Proxy Site where orders are redirected

## Installation

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`FSH/`)

## Usage

1. Navigate to a suspected fakeshop
2. Simulate a purchase
3. Open the plugin
4. Check the data and copy if needed
