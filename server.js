require('dotenv').config();
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN =
  process.env.DOMAIN ||
  'http://localhost:3000';

app.post(
  '/create-checkout-session',
  async (req, res) => {
    try {
      const session = await
        stripe.checkout.sessions
          .create({
            line_items: [
              {
                price:
                  process.env
                    .PRICE_MONTHLY,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            managed_payments: {
              enabled: false,
            },
            success_url:
              `${YOUR_DOMAIN}` +
              '/checkout?success=true',
            cancel_url:
              `${YOUR_DOMAIN}` +
              '/checkout?canceled=true',
          });

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