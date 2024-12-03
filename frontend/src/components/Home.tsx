import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Container, Typography, Grid, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { GitHub, LinkedIn, Description, KeyboardArrowDown } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import Tilt from 'react-parallax-tilt';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP plugins
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Tilt
        tiltReverse
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.3}
        scale={1.02}
      >
        <Box
          sx={{
            p: 3,
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(100, 255, 218, 0.1)',
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography variant="h6" color="white">
            {skill}
          </Typography>
        </Box>
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <Tilt
        tiltReverse
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.3}
        scale={1.02}
      >
        <Box
          component="a"
          href={href}
          sx={{
            display: 'block',
            p: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(100, 255, 218, 0.1)',
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography variant="h5" color="#64ffda" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle1" color="rgba(255, 255, 255, 0.8)">
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
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    // GSAP animations
    gsap.from('.hero-content', {
      duration: 1,
      y: 100,
      opacity: 0,
      ease: 'power4.out',
      stagger: 0.2,
    });

    gsap.to('.scroll-indicator', {
      y: 20,
      repeat: -1,
      duration: 1.5,
      ease: 'power1.inOut',
      yoyo: true,
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
      <Box sx={{ bgcolor: '#0a192f', minHeight: '100vh', overflow: 'hidden' }}>
        <motion.div style={{ opacity, scale }}>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            {/* Hero Section */}
            <Box
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <Parallax translateY={[-20, 20]}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="hero-content"
                >
                  <Box
                    component="img"
                    src="/static/joseph.jpg"
                    alt="Joseph A. Ressler"
                    sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      mb: 4,
                      border: '4px solid rgba(100, 255, 218, 0.3)',
                      boxShadow: '0 8px 32px rgba(100, 255, 218, 0.2)',
                    }}
                  />
                </motion.div>
              </Parallax>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="hero-content"
              >
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #64ffda 30%, #00bcd4 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  Hi, I'm Joseph Ressler
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="hero-content"
              >
                <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
                  Full Stack Developer & Game Programming Enthusiast
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="hero-content"
              >
                <Box sx={{ mt: 2 }}>
                  <IconButton
                    component="a"
                    href="https://github.com/joeressler?tab=repositories"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#64ffda',
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        color: '#00bcd4',
                      },
                    }}
                  >
                    <GitHub fontSize="large" />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://www.linkedin.com/in/joseph-ressler/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#64ffda',
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        color: '#00bcd4',
                      },
                    }}
                  >
                    <LinkedIn fontSize="large" />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="/static/Ressler_Joseph_Resume.pdf"
                    sx={{
                      color: '#64ffda',
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        color: '#00bcd4',
                      },
                    }}
                  >
                    <Description fontSize="large" />
                  </IconButton>
                </Box>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="scroll-indicator"
                style={{ position: 'absolute', bottom: 40 }}
              >
                <KeyboardArrowDown sx={{ color: '#64ffda', fontSize: 40 }} />
              </motion.div>
            </Box>

            {/* Skills Section */}
            <Box sx={{ py: 10 }}>
              <Parallax translateY={[-20, 20]}>
                <Typography
                  variant="h3"
                  align="center"
                  sx={{
                    mb: 6,
                    color: '#64ffda',
                    fontWeight: 'bold',
                  }}
                >
                  Technical Skills
                </Typography>
              </Parallax>

              <Grid container spacing={3}>
                {skills.map((skill, index) => (
                  <Grid item xs={12} sm={6} md={4} key={skill}>
                    <SkillCard skill={skill} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Projects Section */}
            <Box sx={{ py: 10 }}>
              <Parallax translateY={[-20, 20]}>
                <Typography
                  variant="h3"
                  align="center"
                  sx={{
                    mb: 6,
                    color: '#64ffda',
                    fontWeight: 'bold',
                  }}
                >
                  Try My Deployments
                </Typography>
              </Parallax>

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
        </motion.div>
      </Box>
    </ParallaxProvider>
  );
};

export default Home; 