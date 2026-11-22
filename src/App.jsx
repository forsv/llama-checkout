import React, { useState, useEffect } from "react";
import "./App.css";

const plans = [
  {
    name: "Monthly",
    price: "$8.00 per month",
    plan: "monthly",
  },
  {
    name: "Yearly",
    price: "$80.00 per year, 7-day free trial",
    plan: "yearly",
  },
];

const ProductDisplay = () => (
  <section>
    {plans.map(({ name, price, plan }) => (
      <form
        key={plan}
        action="/create-checkout-session"
        method="POST"
      >
        <div className="product">
          <img
            src="https://i.imgur.com/EHyR2nP.png"
            alt={`Llama Plus ${name}`}
          />
          <div className="description">
            <h3>{name}</h3>
            <h5>{price}</h5>
          </div>
        </div>
        <input type="hidden" name="plan" value={plan} />
        <button type="submit">Checkout</button>
      </form>
    ))}
  </section>
);

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  return message ? (
    <Message message={message} />
  ) : (
    <ProductDisplay />
  );
}