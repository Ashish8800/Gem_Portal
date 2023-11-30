module.exports = {
  apps : [
      {
        name: "GeMWebProd",
        script: "npm",
        args: "start",
        instances: 1,
        exec_mode: "fork",
        watch: false,
        increment_var : 'PORT',
        env: {
            "PORT": 3008,
            "NODE_ENV": "production"
        }
      }
  ]
}
