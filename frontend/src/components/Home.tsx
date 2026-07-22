import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import josephImage from '../assets/joseph.jpg';

const skills = [
  'React & TypeScript',
  'Python Flask + FastAPI',
  'C# .NET Microservices',
  'Applied AI Development',
  'AI Agent Development',
  'Docker Compose & Containerization',
  'AWS EC2 Deployment',
  'Relational Database Design (MySQL)',
  'RESTful API Development',
  'User Authentication & Security',
  'Vector Databases (LlamaIndex)',
  'OpenAI Integration',
  'Nginx Reverse Proxy',
  'CI/CD Pipelines (Jenkins + Github Actions)',
  'Cloud Infrastructure',
];

const features = [
  {
    index: '01',
    title: 'Digimon Dex',
    description: 'Interactive 3D evolution chamber with search, lineage, and digivice-style loading.',
    to: '/digimon-dex',
  },
  {
    index: '02',
    title: 'Game Help Bot',
    description: 'RAG chat over WoWS, WoW, and LoL FAQ corpora with optional voice I/O.',
    to: '/chat',
  },
  {
    index: '03',
    title: 'Game Ratings',
    description: 'Shared game list with scores, full-clear tracking, and authenticated ratings.',
    to: '/games',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="home-hero" aria-label="Introduction">
        <div className="home-hero-media" aria-hidden="true">
          <img src={josephImage} alt="" />
        </div>

        <div className="home-hero-rings" aria-hidden="true">
          <span className="home-hero-ring home-hero-ring-outer" />
          <span className="home-hero-ring home-hero-ring-mid" />
          <span className="home-hero-ring home-hero-ring-inner" />
        </div>

        <div className="home-hero-content">
          <motion.p
            className="home-brand"
            {...fadeUp}
            transition={{ duration: 0.45 }}
          >
            Joseph <em>Ressler</em>
          </motion.p>

          <motion.h1
            className="home-headline"
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            Full-stack systems for games, AI, and interactive worlds.
          </motion.h1>

          <motion.p
            className="home-lede"
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            A Digimon-inspired portfolio app with RAG chatbots, voice pipelines, and a 3D evolution dex.
          </motion.p>

          <motion.div
            className="home-cta"
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <Link className="btn btn-primary" to="/digimon-dex">
              Open Digimon Dex
            </Link>
            <Link className="btn btn-ghost" to="/chat">
              Try Game Help Bot
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="featured-heading">
        <div className="home-section-header">
          <h2 id="featured-heading">Featured builds</h2>
          <p>Live surfaces in this app — each one demonstrates a different slice of the stack.</p>
        </div>

        <div className="feature-list">
          {features.map((feature, index) => (
            <motion.div
              key={feature.to}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link className="feature-link" to={feature.to}>
                <span className="feature-index">{feature.index}</span>
                <div className="feature-copy">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <span className="feature-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="skills-heading">
        <div className="home-section-header">
          <h2 id="skills-heading">Technical focus</h2>
          <p>Tools and patterns used to ship the containerized stack behind this site.</p>
        </div>
        <div className="skill-cloud">
          {skills.map((skill) => (
            <span className="skill-chip" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="deploy-heading">
        <div className="home-section-header">
          <h2 id="deploy-heading">Deployments</h2>
          <p>Same product surface, different cloud targets.</p>
        </div>
        <div className="deploy-links">
          <a href="https://aws.josepharessler.com" target="_blank" rel="noopener noreferrer">
            AWS deployment
            <span>aws.josepharessler.com</span>
          </a>
          <a href="https://gcr.josepharessler.com" target="_blank" rel="noopener noreferrer">
            Google Cloud Run
            <span>gcr.josepharessler.com</span>
          </a>
        </div>
      </section>

      <section className="home-section" aria-labelledby="steam-heading">
        <div className="home-section-header">
          <h2 id="steam-heading">Wishlist Zenatria on Steam</h2>
          <p>A separate game project — wishlist if you want to follow along.</p>
        </div>
        <div className="steam-embed">
          <iframe
            title="Steam store widget for Zenatria"
            src="https://store.steampowered.com/widget/2928010/"
            width="646"
            height="190"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
