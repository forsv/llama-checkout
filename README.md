# Llama Plus checkout

Llama Inc sells Llama Plus, an AI assistant for planning a trip. It builds the days, watches fares, and keeps the plan available offline.

Live demo: https://llama-checkout-jb8q.onrender.com/checkout

The plan is $8 a month, or $80 a year with a 7-day free trial on the yearly plan.

## Run it locally

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in the values. The server reads `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DOMAIN`, `PRICE_MONTHLY`, `PRICE_YEARLY`, and `PORT`.

3. Start the app.

```bash
npm start
```

4. Open http://localhost:3000/checkout

To serve the built page the way the live demo does, run `npm run build`, then `node server.js`, and open http://localhost:4242/checkout. If `PORT` is set, use that port instead.

## Test cards

Use these Stripe test cards. Any future expiry and any CVC work.

- `4242 4242 4242 4242` — the payment succeeds
- `4000 0000 0000 0341` — the card can be saved, and the charge fails

Built with Cursor and Claude.
