import Layout from "../components/Layout";
import { featureCards } from "../data";

const Features = () => {
  return (
    <Layout>
      <section className="center-heading">
        <h1>Platform Features</h1>
        <p>Designed to provide accurate detection, transparency, and user trust</p>
      </section>

      <div className="feature-grid">
        {featureCards.map((item, index) => (
          <div className="feature-card" key={index}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="footer-note">
        Our platform continuously evolves with improved models and data insights, ensuring reliable and scalable detection for modern job platforms.
      </div>
    </Layout>
  );
};

export default Features;