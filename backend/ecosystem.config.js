module.exports = {
  apps: [
    {
      name: "GeMServerProd",
      script: "./index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      increment_var: "PORT",
      env: {
        PORT: 5008,
        NODE_ENV: "production",
      },
    },
  ],
};
