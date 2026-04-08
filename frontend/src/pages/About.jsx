import Layout from "../components/Layout";
import { aboutCards } from "../data";

const About = () => {
  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">About JobLens</p>
        <h1 className="main-title">A safer way to review job posts before you apply.</h1>
        <p className="page-lead">
          JobLens is a scam-detection platform focused on helping people understand risk, not just see a number.
          It reviews a job post, scores the level of concern, and highlights the exact signs that deserve a second look.
        </p>
      </section>

      <section className="info-grid">
        {aboutCards.map((card) => (
          <article className="content-card info-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.desc}</p>
          </article>
        ))}
      </section>

      <section className="content-card page-section">
        <h2>How the platform helps</h2>
        <div className="two-column-copy">
          <p>
            Fake hiring posts often look believable at first glance. The risk is usually hidden in rushed language,
            vague employer details, unrealistic promises, or requests that move the conversation away from standard recruiting steps.
          </p>
          <p>
            JobLens turns those signals into a readable review so job seekers, students, and support teams can make
            better decisions with more confidence and less guesswork.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
