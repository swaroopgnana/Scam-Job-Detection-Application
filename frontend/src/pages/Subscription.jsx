import Layout from "../components/Layout";

const Subscription = () => {
  return (
    <Layout>
      <section className="center-heading">
        <h1>Choose Your Plan</h1>
        <p>Simple, transparent pricing designed for individuals and teams</p>
      </section>

      <div className="pricing-grid">
        <div className="pricing-card">
          <h2>Free</h2>
          <h1>₹0</h1>
          <p>Basic access for individuals</p>
          <ul>
            <li>Limited job analysis</li>
            <li>Basic scam detection</li>
            <li>Standard dashboard access</li>
          </ul>
          <button className="light-btn">Get Started</button>
        </div>

        <div className="pricing-card popular">
          <span className="popular-tag">Most Popular</span>
          <h2>Pro</h2>
          <h1>₹199/mo</h1>
          <p>Advanced features for serious users</p>
          <ul>
            <li>Unlimited job analysis</li>
            <li>Advanced AI detection</li>
            <li>Detailed risk scoring</li>
            <li>History & tracking</li>
            <li>Priority processing</li>
          </ul>
          <button className="dark-btn">Upgrade to Pro</button>
        </div>

        <div className="pricing-card">
          <h2>Enterprise</h2>
          <h1>Custom</h1>
          <p>For organizations and teams</p>
          <ul>
            <li>Team access</li>
            <li>Custom AI model tuning</li>
            <li>API Integration</li>
            <li>Dedicated support</li>
          </ul>
          <button className="light-btn">Get Started</button>
        </div>
      </div>

      <div className="footer-note">No hidden fees. Cancel anytime.</div>
    </Layout>
  );
};

export default Subscription;