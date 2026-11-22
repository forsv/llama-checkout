require('dotenv').config();
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const express = require('express');
const app = express();
app.use(express.static('public'));

const idOf = (value) => {
  if (!value) return 'none';
  if (typeof value === 'string') return value;
  return value.id || 'none';
};

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(
        'Webhook signature check failed'
      );
      return res.status(400).send(
        'Webhook signature check failed'
      );
    }

    const watched = [
      'checkout.session.completed',
      'invoice.paid',
      'invoice.payment_failed',
    ];

    if (watched.includes(event.type)) {
      const object = event.data.object;
      const customer = idOf(object.customer);
      const subscription = idOf(
        object.subscription ||
          (object.parent &&
            object.parent.subscription_details &&
            object.parent.subscription_details
              .subscription)
      );
      console.log(
        event.type +
          ' customer=' + customer +
          ' subscription=' + subscription
      );
    } else {
      console.log('Other event ' + event.type);
    }

    res.sendStatus(200);
  }
);

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