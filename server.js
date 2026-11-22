require('dotenv').config();
const https = require('https');
const path = require('path');
const querystring = require('querystring');
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
const express = require('express');
const app = express();
const buildDir = path.join(__dirname, 'build');

const idOf = (value) => {
  if (!value) return 'none';
  if (typeof value === 'string') return value;
  return value.id || 'none';
};

const firstItem = (subscription) => {
  const items = subscription.items;
  if (!items || !items.data || !items.data[0]) {
    return null;
  }
  return items.data[0];
};

const priceInterval = (subscription) => {
  const item = firstItem(subscription);
  const recurring =
    item &&
    item.price &&
    item.price.recurring;
  if (recurring && recurring.interval) {
    return recurring.interval;
  }
  if (item && item.plan && item.plan.interval) {
    return item.plan.interval;
  }
  if (
    subscription.plan &&
    subscription.plan.interval
  ) {
    return subscription.plan.interval;
  }
  return 'none';
};

const dateOf = (unix) => {
  if (!unix) return 'unknown';
  return new Date(unix * 1000)
    .toISOString()
    .slice(0, 10);
};

const endingAt = (subscription) => {
  if (subscription.cancel_at) {
    return subscription.cancel_at;
  }
  const item = firstItem(subscription);
  if (item && item.current_period_end) {
    return item.current_period_end;
  }
  return subscription.current_period_end;
};

const premiumDecision = (type, subscription) => {
  const status = subscription.status;
  const ending =
    subscription.cancel_at_period_end === true ||
    Boolean(subscription.cancel_at);

  if (type === 'customer.subscription.deleted') {
    return 'PREMIUM OFF';
  }
  if (
    type === 'customer.subscription.trial_will_end'
  ) {
    return (
      'TRIAL ENDS SOON ' +
      dateOf(subscription.trial_end)
    );
  }
  if (
    status === 'canceled' ||
    status === 'unpaid' ||
    status === 'paused' ||
    status === 'incomplete_expired'
  ) {
    return 'PREMIUM OFF';
  }
  if (ending) {
    return (
      'PREMIUM ON, ENDING ' +
      dateOf(endingAt(subscription))
    );
  }
  if (status === 'past_due') {
    return 'PREMIUM ON, PAYMENT RETRY';
  }
  if (status === 'trialing' || status === 'active') {
    return 'PREMIUM ON';
  }
  return null;
};

const handledEventIds = new Set();

// This demo prints decisions instead of updating a user database.
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

    if (handledEventIds.has(event.id)) {
      console.log('Duplicate event skipped');
      return res.sendStatus(200);
    }
    handledEventIds.add(event.id);

    const watched = [
      'checkout.session.completed',
      'invoice.paid',
      'invoice.payment_failed',
    ];

    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.paused',
      'customer.subscription.resumed',
      'customer.subscription.trial_will_end',
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
    } else if (
      event.type ===
      'entitlements.active_entitlement_summary.updated'
    ) {
      const summary = event.data.object;
      const rows =
        (summary.entitlements &&
          summary.entitlements.data) ||
        [];
      const keys = rows.map(
        (item) => item.lookup_key
      );
      console.log(
        'ENTITLEMENTS ' +
          idOf(summary.customer) +
          ' ' +
          keys.join(' ')
      );
    } else if (
      subscriptionEvents.includes(event.type)
    ) {
      const object = event.data.object;
      console.log(
        event.type +
          ' customer=' + idOf(object.customer) +
          ' subscription=' + idOf(object) +
          ' status=' + (object.status || 'none') +
          ' interval=' + priceInterval(object) +
          ' cancel_at_period_end=' +
          (object.cancel_at_period_end
            ? 'true'
            : 'false')
      );
      const decision = premiumDecision(
        event.type,
        object
      );
      if (decision) console.log(decision);
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
        automatic_tax: {
          enabled: true,
        },
        allow_promotion_codes: true,
        managed_payments: {
          enabled: false,
        },
        branding_settings: {
          icon: {
            type: 'url',
            url: YOUR_DOMAIN +
              '/checkout/' +
              'llama-icon.png',
          },
        },
        success_url:
          `${YOUR_DOMAIN}` +
          '/checkout?success=true' +
          '&session_id={CHECKOUT_SESSION_ID}',
        cancel_url:
          `${YOUR_DOMAIN}` +
          '/checkout#pricing',
      };

      const currencyFor = {
        IN: 'inr',
        NL: 'eur',
        BR: 'brl',
      };
      const currency = currencyFor[req.body.country];
      if (currency) {
        sessionParams.currency = currency;
      }

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

const stripeRequest = (method, requestPath) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.stripe.com',
        path: requestPath,
        method,
        headers: {
          Authorization:
            'Bearer ' +
            process.env.STRIPE_SECRET_KEY,
        },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode >= 400) {
            reject(new Error(body));
            return;
          }
          resolve(JSON.parse(body));
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

const sessionIdPattern =
  /^cs_(test|live)_[A-Za-z0-9]+$/;

app.get('/session-status', async (req, res) => {
  const sessionId = req.query.session_id;
  if (
    typeof sessionId !== 'string' ||
    !sessionIdPattern.test(sessionId)
  ) {
    res.status(400).end();
    return;
  }

  try {
    const session = await
      stripe.checkout.sessions.retrieve(sessionId);
    const customer = idOf(session.customer);
    const names = [];
    if (customer !== 'none') {
      const listed = await stripeRequest(
        'GET',
        '/v1/entitlements/active_entitlements?' +
          querystring.stringify({
            customer,
            limit: 100,
          })
      );
      const keys = (listed.data || [])
        .map((item) => item.lookup_key)
        .filter(Boolean);
      for (const lookupKey of keys) {
        const features = await stripeRequest(
          'GET',
          '/v1/entitlements/features?' +
            querystring.stringify({
              lookup_key: lookupKey,
              limit: 1,
            })
        );
        const feature =
          features.data && features.data[0];
        if (feature && feature.name) {
          names.push(feature.name);
        }
      }
    }
    res.json({
      status: session.status,
      features: names,
    });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

const sendCheckoutPage = (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
};

app.get('/', (req, res) => {
  res.redirect('/checkout');
});

app.get('/checkout', sendCheckoutPage);
app.get('/checkout/', sendCheckoutPage);
app.use('/checkout', express.static(buildDir));

const port = process.env.PORT || 4242;

app.listen(port, () =>
  console.log(
    'Running on port ' + port
  )
);