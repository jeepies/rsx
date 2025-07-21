module.exports = {
  apps: [
    {
      name: "rsx",
      script: "node",
      args: 'build/server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
    },
  ],
};
