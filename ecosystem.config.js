module.exports = {
  apps: [
    {
      name: 'rsx',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 80,
      },
    },
  ],
};
