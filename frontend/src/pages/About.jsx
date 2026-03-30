import Layout from "../components/Layout";
import { aboutCards } from "../data";

const About = () => {
  return (
    <Layout>
      <section className="content-card large-card">
        <h2>About This Project</h2>
        <p>
          The AI Scam Job Detector is designed to help job seekers identify potentially fraudulent job postings.
          With the increasing number of online opportunities, distinguishing between legitimate and deceptive listings has become challenging.
        </p>
        <p>
          This platform leverages machine learning to analyze job data, recruiter patterns, and compensation signals.
          It provides structured insights and risk indicators, enabling users to make informed decisions.
        </p>

        <h3 className="section-subtitle">Our Objective</h3>
        <p>
          The objective is to build a reliable system that enhances trust in digital hiring platforms by reducing exposure
          to fraudulent job listings through intelligent data analysis.
        </p>

        <div className="info-grid two-col">
          {aboutCards.map((item, index) => (
            <div className="dark-mini-card" key={index}>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bottom-note">
          This system is continuously improving with better models and data to ensure more accurate and reliable results over time.
        </div>
      </section>
    </Layout>
  );
};

export default About;