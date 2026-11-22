import React, { useEffect, useState } from "react";
import "./App.css";

const PORTAL_URL =
  "https://billing.stripe.com/p/login/test_5kQbJ24Sifts4zG90m6g800";

const HOLD_MS = 6000;
const PHOTOS = [
  ["amalfi.jpg", "Amalfi Coast, Italy"],
  ["santorini.jpg", "Santorini, Greece"],
  ["etretat.jpg", "Étretat, France"],
  ["algarve.jpg", "Algarve, Portugal"],
  ["formentor.jpg", "Cap de Formentor, Spain"],
  ["normandy.jpg", "Normandy coast, France"],
  ["kyoto.jpg", "Fushimi Inari, Japan"],
  ["bali.jpg", "Tegallalang, Bali"],
].map(([file, place]) => ({
  src: `${process.env.PUBLIC_URL}/images/${file}`,
  place,
}));

const PERKS = [
  "Unlimited itineraries",
  "Price alerts",
  "Offline trip plans",
  "Day-by-day routes",
];

function preload(src) {
  const img = new Image();
  img.src = src;
  if (img.decode) {
    return img.decode().catch(() => {});
  }
  return new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function Slideshow() {
  const reduced = useReducedMotion();
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(0);
  const [top, setTop] = useState("a");
  const [caption, setCaption] = useState(0);
  const slots = React.useRef({ a: 0, b: 0, top: "a" });

  useEffect(() => {
    slots.current = { a: slotA, b: slotB, top };
  }, [slotA, slotB, top]);

  useEffect(() => {
    PHOTOS.forEach((photo) => {
      preload(photo.src);
    });
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    let cancel = false;
    const timer = window.setTimeout(() => {
      const currentTop = slots.current.top;
      const current =
        currentTop === "a" ? slots.current.a : slots.current.b;
      const next = (current + 1) % PHOTOS.length;
      preload(PHOTOS[(next + 1) % PHOTOS.length].src);
      preload(PHOTOS[next].src).then(() => {
        if (cancel) return;
        if (currentTop === "a") setSlotB(next);
        else setSlotA(next);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!cancel) setTop(currentTop === "a" ? "b" : "a");
          });
        });
      });
    }, HOLD_MS);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [top, reduced]);

  function onFadeEnd(event) {
    if (event.propertyName !== "opacity") return;
    if (!event.currentTarget.classList.contains("on")) return;
    setCaption(Number(event.currentTarget.dataset.index));
  }

  const showA = reduced || top === "a";
  const showB = !reduced && top === "b";

  return (
    <>
      <div className="slideshow" aria-hidden="true">
        <img
          className={showA ? "layer on" : "layer"}
          src={PHOTOS[reduced ? 0 : slotA].src}
          data-index={reduced ? 0 : slotA}
          alt=""
          onTransitionEnd={onFadeEnd}
        />
        {!reduced && (
          <img
            className={showB ? "layer on" : "layer"}
            src={PHOTOS[slotB].src}
            data-index={slotB}
            alt=""
            onTransitionEnd={onFadeEnd}
          />
        )}
      </div>
      <div className="veil" aria-hidden="true" />
      <p className="caption">{PHOTOS[reduced ? 0 : caption].place}</p>
    </>
  );
}

function LlamaMark() {
  return (
    <svg
      className="mark"
      viewBox="0 0 48 48"
      width="32"
      height="32"
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
      <circle cx="42" cy="12.6" r="0.95" className="mark-eye" />
    </svg>
  );
}

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

function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="/checkout">
        <LlamaMark />
        <span className="wordmark">Llama</span>
      </a>
      <nav className="nav-links" aria-label="Page">
        <a href="#pricing">Pricing</a>
        <a className="nav-trial" href="#yearly">
          Start free trial
        </a>
      </nav>
    </header>
  );
}

function PerkList() {
  return (
    <ul className="perks">
      {PERKS.map((perk) => (
        <li key={perk}>
          <span className="check" aria-hidden="true" />
          {perk}
        </li>
      ))}
    </ul>
  );
}

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "IN", label: "India" },
  { code: "NL", label: "Netherlands" },
  { code: "BR", label: "Brazil" },
];

const MONEY = {
  US: {
    monthly: "$8.00",
    yearly: "$80.00",
    save: "Save $16",
    trial: "7-day free trial, then $80.00 per year",
  },
  IN: {
    monthly: "₹699.00",
    yearly: "₹6,999.00",
    save: "Save ₹1,389",
    trial: "7-day free trial, then ₹6,999.00 per year",
  },
  NL: {
    monthly: "€8.00",
    yearly: "€80.00",
    save: "Save €16",
    trial: "7-day free trial, then €80.00 per year",
  },
  BR: {
    monthly: "R$45.00",
    yearly: "R$450.00",
    save: "Save R$90",
    trial: "7-day free trial, then R$450.00 per year",
  },
};

const PLANS = {
  yearly: {
    period: "per year",
    button: "Start 7-day free trial",
  },
  monthly: {
    period: "per month",
    billing: "Billed every month. Cancel anytime.",
    button: "Subscribe monthly",
  },
};

function PlanPicker() {
  const [plan, setPlan] = useState("yearly");
  const [country, setCountry] = useState("US");
  const current = PLANS[plan];
  const money = MONEY[country];

  return (
    <div className="plan-picker" id="yearly">
      <div className="paying-from">
        <label htmlFor="paying-from">Paying from</label>
        <select
          id="paying-from"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="billing-switch" role="group" aria-label="Billing period">
        <button
          type="button"
          aria-pressed={plan === "monthly"}
          onClick={() => setPlan("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={plan === "yearly"}
          onClick={() => setPlan("yearly")}
        >
          Yearly
          <span className="save-badge">{money.save}</span>
        </button>
      </div>
      <article className="plan">
        <p className="price">
          <span className="amount">
            {plan === "yearly" ? money.yearly : money.monthly}
          </span>
          <span className="period">{current.period}</span>
        </p>
        <p className="billing">
          {plan === "yearly" ? money.trial : current.billing}
        </p>
        <PerkList />
        <form action="/create-checkout-session" method="POST">
          <input type="hidden" name="plan" value={plan} />
          <input type="hidden" name="country" value={country} />
          <button type="submit">{current.button}</button>
        </form>
      </article>
    </div>
  );
}

function LaunchNote() {
  const reduced = useReducedMotion();
  const ref = React.useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (reduced) return undefined;
    const node = ref.current;
    if (!node) return undefined;
    const section = node.closest("#pricing");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (section && !section.contains(entry.target)) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.8 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <p className="note" ref={ref}>
      Launch code{" "}
      <span className={drawn ? "launch-code is-drawn" : "launch-code"}>
        <svg
          className="launch-mark"
          viewBox="0 0 320 40"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id="launch-pencil"
              x="-8%"
              y="-28%"
              width="116%"
              height="156%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.7"
                numOctaves="2"
                seed="5"
                result="grain"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="grain"
                scale="3.2"
                xChannelSelector="R"
                yChannelSelector="G"
                result="rough"
              />
              <feColorMatrix
                in="grain"
                type="matrix"
                result="shade"
                values="0 0 0 0 0.78  0 0 0 0 0.62  0 0 0 0 0.12  0 0 0 1 0"
              />
              <feBlend in="rough" in2="shade" mode="multiply" />
            </filter>
          </defs>
          <g filter="url(#launch-pencil)">
            <path
              fill="#FFE14D"
              d="M0 6C36 2 58 8 96 5 134 2 156 7 198 4 236 2 268 7 320 5L318 34C276 38 244 32 206 36 166 39 132 33 94 36 54 39 28 33 2 35Z"
            />
            <path
              fill="#FFE14D"
              transform="translate(6 1.5)"
              d="M0 6C36 2 58 8 96 5 134 2 156 7 198 4 236 2 268 7 320 5L318 34C276 38 244 32 206 36 166 39 132 33 94 36 54 39 28 33 2 35Z"
            />
            <path
              fill="#FFE14D"
              transform="translate(-4 0.5)"
              d="M8 7C40 4 64 9 104 6 142 4 168 8 208 5 246 3 274 7 312 6L310 33C272 36 240 31 202 34 164 37 134 32 96 35 58 37 32 32 10 34Z"
            />
          </g>
        </svg>
        <span className="launch-word">LAUNCH20</span>
      </span>{" "}
      gives 20% off the first payment.
    </p>
  );
}

function Landing() {
  return (
    <main>
      <section className="hero">
        <h1>Plan your next trip with an AI assistant.</h1>
        <p>
          Tell Llama where you are going. It builds the days, watches the
          fare, and keeps the plan with you when you are offline.
        </p>
        <a className="btn" href="#pricing">
          See pricing
        </a>
      </section>

      <section className="plus" id="pricing" aria-labelledby="plus-heading">
        <h2 id="plus-heading">Llama Plus</h2>
        <p className="plus-line">
          A planner for the whole trip, billed monthly or once a year.
        </p>
        <PlanPicker />
        <LaunchNote />
        <p className="note">Secure payment by Stripe</p>
        <PortalLink />
      </section>

      <section className="features" aria-label="Llama Plus features">
        <article>
          <h3>Unlimited itineraries</h3>
          <p>Build a plan for every trip, from a weekend to a long route.</p>
        </article>
        <article>
          <h3>Price alerts</h3>
          <p>Llama watches fares and lets you know when a route drops.</p>
        </article>
        <article>
          <h3>Offline trip plans</h3>
          <p>Open the day-by-day plan when you have no signal.</p>
        </article>
      </section>
    </main>
  );
}

function Success() {
  return (
    <main className="status-wrap">
      <section className="status-card">
        <h1>Welcome to Llama Plus</h1>
        <PortalLink />
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>Llama Inc is a fictional company for a demo</p>
      <p>Photos from Unsplash and Pexels</p>
      <PortalLink />
    </footer>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  let view = <Landing />;
  if (params.get("success")) view = <Success />;

  return (
    <div className="page">
      <Slideshow />
      <div className="content">
        <Banner />
        <Nav />
        {view}
        <Footer />
      </div>
    </div>
  );
}
