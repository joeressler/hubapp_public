const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://voice:8081';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.google.com', 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        frameSrc: ['https://www.google.com', 'https://www.gstatic.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: IS_PRODUCTION
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
  })
);

app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
  })
);

app.use(
  '/voice',
  createProxyMiddleware({
    target: VOICE_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/digi-api',
  createProxyMiddleware({
    target: 'https://digi-api.com',
    changeOrigin: true,
    pathRewrite: { '^/digi-api': '' },
  })
);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Frontend server listening on http://${HOST}:${PORT}`);
});
