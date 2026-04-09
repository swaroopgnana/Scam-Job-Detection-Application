import { useState } from "react";
import Layout from "../components/Layout";
import { subscriptionHighlights, subscriptionPlans } from "../data";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Subscription = () => {
  const { user, login } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handlePlanSelection = async (plan) => {
    if (plan.planId === "Free") {
      setFeedback({
        type: "info",
        message: "Starter is your free plan. Choose Pro or Team to open Razorpay Checkout."
      });
      return;
    }

    setLoadingPlanId(plan.planId);
    setFeedback({ type: "", message: "" });

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay Checkout could not be loaded.");
      }

      const { data } = await API.post("/payments/create-order", { planId: plan.planId });

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "JobLens",
        description: data.plan.description,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verification = await API.post("/payments/verify", {
              planId: plan.planId,
              ...response
            });

            login(verification.data);
            setFeedback({
              type: "success",
              message: verification.data.message
            });
          } catch (error) {
            setFeedback({
              type: "error",
              message: error.response?.data?.message || "Payment was completed but verification failed."
            });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#1f7aec"
        },
        modal: {
          ondismiss: () => {
            setFeedback({
              type: "info",
              message: "Payment was cancelled before completion."
            });
          }
        }
      });

      razorpay.on("payment.failed", (response) => {
        setFeedback({
          type: "error",
          message: response.error?.description || "Payment failed. Please try again."
        });
      });

      razorpay.open();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || error.message || "Unable to start payment."
      });
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">SaaS Subscription</p>
        <h1 className="main-title">Choose a plan that fits how often you review job listings.</h1>
        <p className="page-lead">
          From occasional checks to organization-wide review workflows, JobLens can be positioned as a simple SaaS
          product with clear value: faster screening, clearer explanations, and safer applications.
        </p>
        <p className="subscription-current-plan">Current plan: {user?.plan === "Enterprise" ? "Team" : user?.plan || "Free"}</p>
      </section>

      {feedback.message ? (
        <section className={`content-card subscription-alert subscription-alert-${feedback.type || "info"}`}>
          <p>{feedback.message}</p>
        </section>
      ) : null}

      <section className="pricing-grid">
        {subscriptionPlans.map((plan) => (
          <article className="content-card pricing-card" key={plan.name}>
            <p className="plan-badge">{plan.badge}</p>
            <h2>{plan.name}</h2>
            <div className="plan-price">{plan.price}</div>
            <p className="plan-audience">{plan.audience}</p>
            <ul className="reason-list plan-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button
              className="gradient-btn"
              type="button"
              onClick={() => handlePlanSelection(plan)}
              disabled={loadingPlanId === plan.planId || user?.plan === plan.planId}
            >
              {user?.plan === plan.planId
                ? `${plan.name} Active`
                : loadingPlanId === plan.planId
                  ? "Opening Razorpay..."
                  : `Choose ${plan.name}`}
            </button>
          </article>
        ))}
      </section>

      <section className="info-grid">
        {subscriptionHighlights.map((item) => (
          <article className="content-card info-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
};

export default Subscription;
