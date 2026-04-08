import Layout from "../components/Layout";
import { featureCards } from "../data";

const Features = () => {
  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">Platform Features</p>
        <h1 className="main-title">Everything needed to turn a suspicious job post into a clear decision.</h1>
        <p className="page-lead">
          The platform is built for explainability, speed, and day-to-day use across individual job seekers and teams
          that want a simple workflow for reviewing risky listings.
        </p>
      </section>

      <section className="feature-grid">
        {featureCards.map((feature) => (
          <article className="content-card feature-card" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.desc}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
};

export default Features;
