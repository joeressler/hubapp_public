import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Container, Typography, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { GitHub, LinkedIn, Description, KeyboardArrowDown } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import { ParallaxProvider } from 'react-scroll-parallax';
import Tilt from 'react-parallax-tilt';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import josephImage from '../assets/joseph.jpg';

gsap.registerPlugin(ScrollTrigger);

const SkillCard: React.FC<{ skill: string; index: number }> = ({ skill, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Tilt
        tiltMaxAngleX={15}
        tiltMaxAngleY={15}
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.15}
        scale={1.02}
        gyroscope={true}
      >
        <div className="crystal-card">
          <Typography 
            variant="h6" 
            className="gradient-text"
            sx={{ 
              fontWeight: 500,
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}
          >
            {skill}
          </Typography>
        </div>
      </Tilt>
    </motion.div>
  );
};

const ProjectCard: React.FC<{ title: string; subtitle: string; href: string }> = ({ title, subtitle, href }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
    >
      <Tilt
        tiltMaxAngleX={15}
        tiltMaxAngleY={15}
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.15}
        scale={1.02}
        gyroscope={true}
      >
        <Box
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="crystal-card"
          sx={{
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <Typography 
            variant="h5" 
            className="gradient-text"
            sx={{ 
              fontWeight: 600,
              mb: 2,
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(226, 232, 240, 0.9)',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Tilt>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Neon grid animation
    const gridElements = document.querySelectorAll('.neon-grid');
    gridElements.forEach((elem, index) => {
      gsap.to(elem, {
        opacity: 0.5 + Math.random() * 0.5,
        duration: 1 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    });
    /* archived
    // Floating animation for hero content
    gsap.to('.hero-content', {
      y: -20,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
    */

    // Neon flicker effect
    const neonElements = document.querySelectorAll('.neon-text');
    neonElements.forEach((elem) => {
      gsap.to(elem, {
        opacity: 0.8 + (Math.random() * 0.2),
        duration: 0.05 + (Math.random() * 0.5),
        repeat: -1,
        yoyo: true,
        ease: "power1.InOut"
      });
    });
  }, []);

  const skills = [
    "React & TypeScript",
    "Python Flask",
    "Golang Microservices",
    "Full Stack Development",
    "Docker Compose & Containerization",
    "AWS EC2 Deployment",
    "Relational Database Design (MySQL)",
    "RESTful API Development",
    "User Authentication & Security",
    "Vector Databases (LlamaIndex)",
    "OpenAI Integration",
    "Speech-to-Text (Vosk)",
    "Text-to-Speech",
    "Audio Processing & Playback",
    "Nginx Reverse Proxy",
    "CI/CD Pipelines (Jenkins)",
    "Cloud Infrastructure"
  ];

  return (
    <ParallaxProvider>
      <Box sx={{ overflow: 'hidden' }}>
        {/* Neon Grid Background */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        >
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              className="neon-grid"
              sx={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(56, 189, 248, ${0.3 + Math.random() * 0.7}) 50%,
                  transparent 100%
                )`,
                top: `${i * 5}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.3
              }}
            />
          ))}
        </Box>

        {/* Main Content */}
        <Container 
          maxWidth="lg"
          sx={{ 
            position: 'relative',
            zIndex: 2,
            pt: { xs: 1, md: 2 }
          }}
        >
          {/* Hero Section */}
          <Box 
            ref={heroRef}
            className="hero-section"
            sx={{
              maxHeight: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0.1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="hero-content"
            >
              <Box
                component="img"
                src={josephImage}
                alt="Joseph A. Ressler"
                className="profile-image"
                sx={{
                  width: 'auto',
                  height: '30vh',
                  mb: 1,
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px'
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hero-content"
            >
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                className="gradient-text neon-text"
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                Hi, I'm Joseph Ressler
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hero-content"
            >
              <Typography 
                variant="h4" 
                className="neon-text"
                sx={{ 
                  color: 'rgba(226, 232, 240, 0.9)',
                  mb: 4,
                  fontWeight: 500,
                  textShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
                }}
              >
                Full Stack Developer & Programming Enthusiast
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Box sx={{ mt: 2 }}>
                {[
                  { icon: GitHub, href: "https://github.com/joeressler?tab=repositories" },
                  { icon: LinkedIn, href: "https://www.linkedin.com/in/joseph-ressler/" },
                  { icon: Description, href: "/Ressler_Joseph_Resume.pdf" }
                ].map(({ icon: Icon, href }, index) => (
                  <IconButton
                    key={href}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neon-button"
                    sx={{
                      mx: 1.5,
                      fontSize: '2rem'
                    }}
                  >
                    <Icon fontSize="inherit" />
                  </IconButton>
                ))}
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                position: 'absolute',
                bottom: 40,
                animation: 'float 2s ease-in-out infinite'
              }}
            >
              <KeyboardArrowDown 
                sx={{ 
                  color: '#38bdf8',
                  fontSize: 40,
                  filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))'
                }} 
              />
            </motion.div>
          </Box>

          {/* Skills Section */}
          <Box sx={{ py: { xs: 8, md: 12 } }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                align="center"
                className="gradient-text neon-text"
                sx={{
                  mb: { xs: 6, md: 8 },
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                Technical Skills
              </Typography>
            </motion.div>

            <Grid container spacing={3}>
              {skills.map((skill, index) => (
                <Grid item xs={12} sm={6} md={4} key={skill}>
                  <SkillCard skill={skill} index={index} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Projects Section */}
          <Box sx={{ py: { xs: 8, md: 12 } }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                align="center"
                className="gradient-text neon-text"
                sx={{
                  mb: { xs: 6, md: 8 },
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                Try My Deployments
              </Typography>
            </motion.div>

            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <ProjectCard
                  title="AWS Deployment"
                  subtitle="aws. and www. subdomains"
                  href="https://aws.josepharessler.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProjectCard
                  title="Google Cloud Run"
                  subtitle="gcr. subdomain (legacy single-container deployment)"
                  href="https://gcr.josepharessler.com"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Steam Wishlist Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                align="center"
                className="gradient-text neon-text"
                sx={{
                  mb: { xs: 6, md: 8 },
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                Wishlist Zenatria, now on Steam!
              </Typography>
            </motion.div>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(10, 15, 28, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                boxShadow: '0 4px 30px rgba(14, 165, 233, 0.1)',
                padding: '1rem',
                maxWidth: '700px',
                margin: '0 auto'
              }}
            >
              <iframe
                src="https://store.steampowered.com/widget/2928010/"
                frameBorder="0"
                width="646"
                height="190"
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: 'none'
                }}
              ></iframe>
            </Box>
          </Box>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default Home; 