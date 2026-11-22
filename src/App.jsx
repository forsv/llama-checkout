import React from "react";
import "./App.css";

const PORTAL_URL =
  "https://billing.stripe.com/p/login/test_5kQbJ24Sifts4zG90m6g800";

function PortalLink() {
  return (
    <a
      className="portal-link"
      href={PORTAL_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Manage or cancel your subscription
    </a>
  );
}

function LlamaMark() {
  return (
    <svg
      className="mark"
      viewBox="0 0 48 48"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <path
        d="M14 30.5c-2.4.7-4.2 2.8-3.5 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        fill="currentColor"
        d="M16.2 37.2h3.1c.7 0 1.2.6 1.1 1.3l-.7 6.2c-.1.8-.8 1.4-1.6 1.4h-1.5c-.9 0-1.6-.7-1.6-1.6v-6.1c0-.7.5-1.2 1.2-1.2zm9.4.4h3.1c.7 0 1.2.6 1.1 1.3l-.5 5.8c-.1.8-.8 1.4-1.6 1.4h-1.5c-.9 0-1.6-.8-1.5-1.6l.4-5.7c.1-.7.6-1.2 1.3-1.2zm9.2-.2h3c.8 0 1.4.7 1.3 1.5l-.8 6.1c-.1.8-.8 1.4-1.6 1.4h-1.4c-.9 0-1.6-.7-1.6-1.6v-6.2c0-.7.5-1.2 1.1-1.2z"
      />
      <ellipse cx="24" cy="33" rx="13" ry="8.4" fill="currentColor" />
      <path
        fill="currentColor"
        d="M31 28.5c1.2-6.4 4.2-12.6 9.4-16.2 1.6 5.2 1.2 10.4-.6 15.2-2.4 1.2-5.6 1.6-8.8 1z"
      />
      <ellipse cx="39.2" cy="13.2" rx="7.2" ry="4.6" fill="currentColor" />
      <path
        fill="currentColor"
        d="M33.2 10.4c-.2-4.6 2.2-7.2 4.6-5.6 1.4 1 1.2 3.4.2 5.2-1.6.4-3.4.6-4.8.4z"
      />
      <circle cx="42" cy="12.6" r="0.95" fill="#f6f1e8" />
    </svg>
  );
}

function Banner() {
  return (
    <div className="banner" role="note">
      <p>
        Demo site in Stripe test mode. Use card{" "}
        <span className="nowrap">4242 4242 4242 4242</span>, any future date,
        any CVC.
      </p>
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/checkout">
        <LlamaMark />
        <span className="wordmark">Llama</span>
      </a>
    </header>
  );
}

function CheckoutButton({ plan }) {
  return (
    <form action="/create-checkout-session" method="POST">
      <input type="hidden" name="plan" value={plan} />
      <button type="submit" className="btn btn-block">
        Checkout
      </button>
    </form>
  );
}

function Landing() {
  return (
    <main>
      <section className="hero">
        <h1>Plan the trip with an AI assistant.</h1>
        <p>
          Tell Llama where you are headed. It builds the day-by-day plan,
          watches the fare, and keeps a copy you can open on the road.
        </p>
        <a className="btn" href="#pricing">
          See pricing
        </a>
      </section>

      <section className="benefits" aria-labelledby="plus-heading">
        <h2 id="plus-heading">Llama Plus</h2>
        <div className="card-grid three">
          <article className="card">
            <h3>Unlimited itineraries</h3>
            <p>Build a plan for every trip, from a short weekend to a long route.</p>
          </article>
          <article className="card">
            <h3>Price alerts</h3>
            <p>Llama watches fares and lets you know when a route drops.</p>
          </article>
          <article className="card">
            <h3>Offline trip plans</h3>
            <p>Open the day-by-day plan on your phone when you have no signal.</p>
          </article>
        </div>
      </section>

      <section className="pricing" id="pricing" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading">Pricing</h2>
        <div className="card-grid two">
          <article className="card plan">
            <h3>Monthly</h3>
            <p className="price">
              $8.00 <span>per month</span>
            </p>
            <CheckoutButton plan="monthly" />
          </article>
          <article className="card plan recommended">
            <p className="recommend">Recommended</p>
            <p className="badge">7-day free trial</p>
            <h3>Yearly</h3>
            <p className="price">
              $80.00 <span>per year</span>
            </p>
            <p className="save">Save $16 a year</p>
            <CheckoutButton plan="yearly" />
          </article>
        </div>
        <p className="launch">
          Launch code LAUNCH20 gives 20% off the first payment.
        </p>
        <PortalLink />
      </section>
    </main>
  );
}

function Success() {
  return (
    <main className="status">
      <h1>Welcome to Llama Plus</h1>
      <p>The yearly plan starts with a 7-day free trial.</p>
      <PortalLink />
    </main>
  );
}

function Canceled() {
  return (
    <main className="status">
      <p className="status-line">
        No charge was made. Your plans are still here when you want them.
      </p>
      <a className="btn" href="/checkout#pricing">
        Back to pricing
      </a>
    </main>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  let view = <Landing />;

  if (params.get("success")) {
    view = <Success />;
  } else if (params.get("canceled")) {
    view = <Canceled />;
  }

  return (
    <div className="page">
      <Banner />
      <Header />
      {view}
    </div>
  );
}
