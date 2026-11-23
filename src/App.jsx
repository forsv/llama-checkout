import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
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
  { code: "US", label: "United States", currency: "USD", method: "Cards" },
  { code: "IN", label: "India", currency: "INR", method: "UPI" },
  { code: "NL", label: "Netherlands", currency: "EUR", method: "SEPA Direct Debit" },
  { code: "BR", label: "Brazil", currency: "BRL", method: "Pix" },
];

function Flag({ code, title }) {
  return (
    <svg
      className="flag"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`flag-${title}`}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-${title})`}>
        {code === "US" && <UsFlag />}
        {code === "IN" && <IndiaFlag />}
        {code === "NL" && <NetherlandsFlag />}
        {code === "BR" && <BrazilFlag />}
      </g>
    </svg>
  );
}

function UsFlag() {
  const band = 24 / 13;
  return (
    <>
      {Array.from({ length: 13 }, (_, index) => (
        <rect
          key={index}
          y={band * index}
          width="24"
          height={band + 0.15}
          fill={index % 2 === 0 ? "#B22234" : "#FFFFFF"}
        />
      ))}
      <rect width="10.4" height={band * 7} fill="#3C3B6E" />
      {[
        [2.3, 1.7],
        [5.1, 1.7],
        [7.9, 1.7],
        [3.7, 3.4],
        [6.5, 3.4],
        [2.3, 5.1],
        [5.1, 5.1],
        [7.9, 5.1],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.42" fill="#FFFFFF" />
      ))}
    </>
  );
}

function IndiaFlag() {
  return (
    <>
      <rect width="24" height="8" fill="#FF9933" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
      <rect y="16" width="24" height="8" fill="#138808" />
      <circle cx="12" cy="12" r="2.35" fill="none" stroke="#000080" strokeWidth="0.45" />
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="9.8"
          x2="12"
          y2="14.2"
          stroke="#000080"
          strokeWidth="0.35"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </>
  );
}

function NetherlandsFlag() {
  return (
    <>
      <rect width="24" height="8" fill="#AE1C28" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
      <rect y="16" width="24" height="8" fill="#21468B" />
    </>
  );
}

function BrazilFlag() {
  return (
    <>
      <rect width="24" height="24" fill="#009C3B" />
      <polygon points="12,2.6 21.4,12 12,21.4 2.6,12" fill="#FFDF00" />
      <circle cx="12" cy="12" r="4.05" fill="#002776" />
      <path
        d="M8.1 13.3c1.15-1.7 2.5-2.35 3.9-2.35s2.75.65 3.9 2.35"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.55"
      />
    </>
  );
}

function Chevron() {
  return (
    <svg className="paying-chevron" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d="M2.2 4.3 L6 8 L9.8 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tick({ on }) {
  return (
    <svg
      className={on ? "paying-tick" : "paying-tick is-empty"}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.2 8.3 L6.4 11.3 L12.8 4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PayingFrom({ country, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const selected = COUNTRIES.findIndex((item) => item.code === country);
  const current = COUNTRIES[selected];

  useEffect(() => {
    if (!open) return undefined;
    listRef.current.focus();
    function onPointer(event) {
      if (!rootRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  function choose(index) {
    onChange(COUNTRIES[index].code);
    setOpen(false);
    buttonRef.current.focus();
  }

  function onKeyDown(event) {
    if (event.key === "Tab" && open) {
      setOpen(false);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      buttonRef.current.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActive(selected);
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + COUNTRIES.length) % COUNTRIES.length);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(active);
    }
  }

  return (
    <div className="paying-from" ref={rootRef} onKeyDown={onKeyDown}>
      <label id="paying-from-label" className="paying-label" htmlFor="paying-from-button">
        Select your country
      </label>
      <button
        ref={buttonRef}
        id="paying-from-button"
        type="button"
        className="paying-pill"
        aria-labelledby="paying-from-label paying-from-value"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="paying-from-menu"
        onClick={() => {
          setActive(selected);
          setOpen((value) => !value);
        }}
      >
        <Flag code={current.code} title={`pill-${current.code}`} />
        <span id="paying-from-value">
          {current.label}
          <span className="paying-dot" aria-hidden="true"> · </span>
          {current.currency}
        </span>
        <Chevron />
      </button>
      {open && (
        <ul
          ref={listRef}
          id="paying-from-menu"
          className="paying-menu"
          role="listbox"
          tabIndex={-1}
          aria-label="Paying from"
          aria-activedescendant={`paying-option-${COUNTRIES[active].code}`}
        >
          {COUNTRIES.map((item, index) => (
            <li key={item.code} role="presentation">
              <button
                type="button"
                role="option"
                id={`paying-option-${item.code}`}
                tabIndex={-1}
                aria-selected={item.code === country}
                className={index === active ? "paying-option is-active" : "paying-option"}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
              >
                <Tick on={item.code === country} />
                <Flag code={item.code} title={`menu-${item.code}`} />
                <span className="name">{item.label}</span>
                <span className="paying-meta">
                  {item.currency} · {item.method}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
      <PayingFrom country={country} onChange={setCountry} />
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

const FEATURE_LABELS = {
  "unlimited-itineraries": "Unlimited itineraries",
  "price-alerts": "Price alerts",
  "offline-trip-plans": "Offline trip plans",
  "day-by-day-routes": "Day-by-day routes",
};

const FEATURE_ORDER = [
  "unlimited-itineraries",
  "price-alerts",
  "offline-trip-plans",
  "day-by-day-routes",
];

const CONFETTI_COLORS = ["#2F6BF0", "#FFE14D", "#ffffff", "#7DCFC4"];

function labeledFeatures(keys) {
  const known = FEATURE_ORDER.filter((key) => keys.includes(key)).map(
    (key) => ({ key, label: FEATURE_LABELS[key] })
  );
  const unknown = keys
    .filter((key) => !FEATURE_LABELS[key])
    .map((key) => ({ key, label: key }));
  return [...known, ...unknown];
}

function Confetti() {
  const reduced = useReducedMotion();
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (played.current) return undefined;
    played.current = true;
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");
    if (!canvas || !context) return undefined;

    let frame = 0;
    let width = 0;
    let height = 0;

    const fit = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    fit();

    const flakes = Array.from({ length: 170 }, (_, index) => ({
      x: Math.random() * width,
      y: -8 - Math.random() * 70,
      vx: (Math.random() - 0.5) * 150,
      vy: 180 + Math.random() * 720,
      spin: (Math.random() - 0.5) * 7,
      angle: Math.random() * Math.PI * 2,
      sway: Math.random() * Math.PI * 2,
      w: 7 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    }));

    const started = performance.now();
    let previous = started;
    let stopped = false;

    const draw = (now) => {
      if (stopped) return;
      const elapsed = now - started;
      const dt = Math.min(0.034, (now - previous) / 1000);
      previous = now;
      context.clearRect(0, 0, width, height);
      flakes.forEach((flake) => {
        flake.vy += 80 * dt;
        flake.x += flake.vx * dt;
        flake.y += flake.vy * dt;
        flake.angle += flake.spin * dt;
        flake.sway += dt * 5;
        context.save();
        context.translate(flake.x + Math.sin(flake.sway) * 16, flake.y);
        context.rotate(flake.angle);
        context.fillStyle = flake.color;
        context.fillRect(-flake.w / 2, -flake.h / 2, flake.w, flake.h);
        context.restore();
      });
      if (elapsed < 4000) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const stop = () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
    };

    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", fit);
    const end = window.setTimeout(() => {
      stop();
      setDone(true);
    }, 4000);
    return () => {
      window.clearTimeout(end);
      stop();
    };
  }, [reduced]);

  if (reduced || done) return null;

  return ReactDOM.createPortal(
    <canvas ref={canvasRef} className="confetti" aria-hidden="true" />,
    document.body
  );
}

function Success() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (!sessionId) return undefined;
    let cancelled = false;
    let timer;

    const load = (attempt) => {
      fetch(
        "/session-status?session_id=" +
          encodeURIComponent(sessionId)
      )
        .then((response) => {
          if (!response.ok) throw new Error("status");
          return response.json();
        })
        .then((data) => {
          if (cancelled) return;
          const names = Array.isArray(data.features)
            ? data.features.filter((name) => name)
            : [];
          if (names.length > 0) {
            setFeatures(names);
            return;
          }
          if (attempt < 8) {
            timer = setTimeout(() => load(attempt + 1), 1000);
          }
        })
        .catch(() => {
          if (!cancelled) setFeatures([]);
        });
    };

    load(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  const unlocked = labeledFeatures(features);

  return (
    <>
      <Confetti />
      <main className="status-wrap">
        <section className="status-card">
          <h1>Welcome to Llama Plus</h1>
          {unlocked.length > 0 && (
            <>
              <p>Unlocked on your account</p>
              <ul className="unlocked">
                {unlocked.map((item, index) => (
                  <li key={item.key + "-" + index}>
                    <span className="check" aria-hidden="true" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </>
          )}
          <PortalLink />
        </section>
      </main>
    </>
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
