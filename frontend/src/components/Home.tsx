import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="profile-container fade-in">
          <img 
            src="/static/joseph.jpg"
            alt="Joseph A. Ressler"
            className="profile-image"
          />
          <h1 className="slide-up">Hi, I'm Joseph Ressler</h1>
          <h2 className="slide-up-delay">Full Stack Developer & Game Programming Enthusiast</h2>
          
          <div className="social-links slide-up-delay-2">
            <a href="https://github.com/joeressler?tab=repositories" target="_blank" rel="noopener noreferrer" className="social-link">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/joseph-ressler/" target="_blank" rel="noopener noreferrer" className="social-link">
              LinkedIn
            </a>
            <a href="/static/Ressler_Joseph_Resume.pdf" className="social-link">
              Resume
            </a>
          </div>
        </div>
      </section>

      <section className="skills-section">
        <h2 className="section-title">Technical Skills</h2>
        <div className="skills-grid">
          {[
            "Full Stack Development",
            "Python Flask Apps",
            "React & TypeScript",
            "Docker & Containerization",
            "AWS Lightsail Deployment",
            "MySQL Database Design",
            "RESTful API Development",
            "User Authentication",
            "Vector Databases",
            "OpenAI Integration",
            "CI/CD Pipelines",
            "Cloud Infrastructure"
          ].map((skill, index) => (
            <div 
              key={skill} 
              className="skill-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {skill}
            </div>
          ))}
        </div>
      </section>

      <section className="projects-section">
        <h2 className="section-title">Try My Deployments</h2>
        <div className="projects-grid">
          <a 
            href="https://aws.josepharessler.com" 
            className="project-card"
          >
            <h3>AWS Deployment</h3>
            <p>aws. and www. subdomains</p>
          </a>
          
          <a 
            href="https://gcr.josepharessler.com" 
            className="project-card"
          >
            <h3>Google Cloud Run</h3>
            <p>gcr. subdomain</p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home; 