module.exports = {
  apps: [
    {
      name: "lawncare",
      script: "node_modules/.bin/tsx",
      args: "server/index.ts",
      cwd: "/var/www/lawncare",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: "/var/www/lawncare/.env",
      error_file: "/var/log/pm2/lawncare-error.log",
      out_file: "/var/log/pm2/lawncare-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
