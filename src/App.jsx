import React, { useState, useEffect } from "react";
import "./App.css";

const ProductDisplay = () => (
  <section>
    <form action="/create-checkout-session" method="POST">
      <div className="description">
        <h3>Llama Plus</h3>
        <h5>Premium travel planning</h5>
      </div>
      <div className="plans">
        <label>
          <input
            type="radio"
            name="plan"
            value="monthly"
            defaultChecked
          />
          Monthly, $8.00 per month
        </label>
        <label>
          <input type="radio" name="plan" value="yearly" />
          Yearly, $80.00 per year, 7-day free trial
        </label>
      </div>
      <button type="submit">Checkout</button>
    </form>
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
