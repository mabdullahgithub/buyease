# BuyEase Merchant - BFS Readiness

This runbook captures the high-priority controls required for Built for Shopify (BFS) eligibility.

## 1) Install and authentication path

- Manual shop-domain entry is disabled.
- Install must start from Shopify Admin and continue through Shopify OAuth only.
- Public install endpoint expects Shopify shop context (`shop`) and rejects contextless requests.

## 2) Billing policy

- The app is currently **fully free**.
- No external billing pages, payment links, or off-platform charging flows are used.
- If paid plans are introduced later, migrate to Shopify Billing API before enabling upgrades.

## 3) Partner Dashboard Distribution prerequisites

Validate in Shopify Partner Dashboard before BFS submission:

- Install/adoption baseline is met for your app category.
- Review count and average rating meet BFS expectations.
- Partner account/app standing is in good status (no policy blocks).

Operational note: review this before every release train that targets BFS eligibility.

## 4) Performance confirmation and ongoing monitoring

Maintain and monitor these thresholds:

- LCP < 1.2s
- CLS < 0.05
- INP < 100ms

Recommended cadence:

1. Run Lighthouse CI for key merchant app pages on each pull request.
2. Monitor real-user metrics in production (RUM) weekly.
3. Hold release if thresholds regress for two consecutive reporting windows.
