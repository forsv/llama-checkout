require('dotenv').config();
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN =
  'http://localhost:3000';

app.post(
  '/create-checkout-session',
  async (req, res) => {
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
          success_url:
            `${YOUR_DOMAIN}` +
            '/checkout?success=true',
        });

    res.redirect(303, session.url);
  }
);

app.listen(4242, () =>
  console.log(
    'Running on port 4242'
  )
);