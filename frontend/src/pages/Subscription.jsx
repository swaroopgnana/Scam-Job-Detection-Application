import Layout from "../components/Layout";
import { subscriptionHighlights, subscriptionPlans } from "../data";

const Subscription = () => {
  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">SaaS Subscription</p>
        <h1 className="main-title">Choose a plan that fits how often you review job listings.</h1>
        <p className="page-lead">
          From occasional checks to organization-wide review workflows, JobLens can be positioned as a simple SaaS
          product with clear value: faster screening, clearer explanations, and safer applications.
        </p>
      </section>

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
            <button className="gradient-btn">Choose {plan.name}</button>
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
