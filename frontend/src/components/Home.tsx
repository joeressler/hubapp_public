import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Container, Typography, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { GitHub, LinkedIn, Description, KeyboardArrowDown } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import Tilt from 'react-parallax-tilt';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.1}
        scale={1.02}
      >
        <div className="crystal-card">
          <Typography 
            variant="h6" 
            className="gradient-text"
            sx={{ fontWeight: 500 }}
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
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.1}
        scale={1.02}
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
            sx={{ fontWeight: 600, mb: 2 }}
          >
            {title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(226, 232, 240, 0.8)' }}>
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
    // Parallax effect for background elements
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach((elem, index) => {
      gsap.to(elem, {
        y: (index + 1) * 100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // Floating animation for hero content
    gsap.to('.hero-content', {
      y: 20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }, []);

  const skills = [
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
  ];

  return (
    <ParallaxProvider>
      <Box sx={{ overflow: 'hidden' }}>
        {/* Background Elements */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              className="parallax"
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at ${50 + (i * 10)}% ${30 + (i * 15)}%, 
                  rgba(56, 189, 248, 0.${1 + i}) 0%, 
                  transparent ${40 + (i * 10)}%)`
              }}
            />
          ))}
        </Box>

        {/* Main Content */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            pt: { xs: 8, md: 12 }
          }}
        >
          {/* Hero Section */}
          <Box 
            ref={heroRef}
            className="hero-section"
            sx={{
              minHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="hero-content"
            >
              <Box
                component="img"
                src="/static/joseph.jpg"
                alt="Joseph A. Ressler"
                className="profile-image"
                sx={{
                  width: { xs: 200, md: 250 },
                  height: { xs: 200, md: 250 },
                  mb: 4,
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
                className="gradient-text"
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  letterSpacing: '-0.02em'
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
                sx={{ 
                  color: 'rgba(226, 232, 240, 0.9)',
                  mb: 4,
                  fontWeight: 500
                }}
              >
                Full Stack Developer & Game Programming Enthusiast
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
                  { icon: Description, href: "/static/Ressler_Joseph_Resume.pdf" }
                ].map(({ icon: Icon, href }, index) => (
                  <IconButton
                    key={href}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#38bdf8',
                      mx: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        color: '#0ea5e9',
                      },
                    }}
                  >
                    <Icon fontSize="large" />
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
              <KeyboardArrowDown sx={{ color: '#38bdf8', fontSize: 40 }} />
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
                className="gradient-text"
                sx={{
                  mb: { xs: 6, md: 8 },
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
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
                className="gradient-text"
                sx={{
                  mb: { xs: 6, md: 8 },
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
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
                  subtitle="gcr. subdomain"
                  href="https://gcr.josepharessler.com"
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default Home; 