const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/voice',
    createProxyMiddleware({
      target: process.env.VOICE_SERVICE_URL || 'http://voice:8081',
      changeOrigin: true,
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_URL || 'http://backend:8080',
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
};
