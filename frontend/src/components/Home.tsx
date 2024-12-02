import React from 'react';

const Home: React.FC = () => {
  return (
    <div id="portFlexBox">
      <div id="pic" className="div-portfolio">
        <h1>Hi, I'm Joseph Ressler. I love programming, and I love game programming.</h1>
        <p>Please enjoy this app, I built it to get more experience with Full Stack development.</p>
        <img 
          src="/static/joseph.jpg"
          alt="A picture of Joseph A. Ressler"
        />
      </div>
      <div id="intro" className="div-portfolio">
        <h2>Here are some of the skills I've worked on to build this app.</h2>
        <h3>
          Try the <a href="https://aws.josepharessler.com">AWS (aws. and www. subdomains)</a> and{' '}
          <a href="https://gcr.josepharessler.com">Google Cloud Run (gcr. subdomain)</a> hosted versions of the site!
        </h3>
        {/* Add your skills list here - similar to your current portfolio.html */}
      </div>
    </div>
  );
};

export default Home; 