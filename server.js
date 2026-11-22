require('dotenv').config();
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

const YOUR_DOMAIN =
  process.env.DOMAIN ||
  'http://localhost:3000';

app.post(
  '/create-checkout-session',
  async (req, res) => {
    try {
      const plan = req.body.plan;
      const price =
        plan === 'yearly'
          ? process.env.PRICE_YEARLY
          : process.env.PRICE_MONTHLY;
      const sessionParams = {
        line_items: [
          {
            price,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        managed_payments: {
          enabled: false,
        },
        success_url:
          `${YOUR_DOMAIN}` +
          '/checkout?success=true',
        cancel_url:
          `${YOUR_DOMAIN}` +
          '/checkout?canceled=true',
      };

      if (plan === 'yearly') {
        sessionParams.subscription_data = {
          trial_period_days: 7,
        };
      }

      const session = await
        stripe.checkout.sessions
          .create(sessionParams);

      res.redirect(303, session.url);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }
);

app.listen(4242, () =>
  console.log(
    'Running on port 4242'
  )
);