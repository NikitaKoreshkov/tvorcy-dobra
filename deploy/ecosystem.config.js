// PM2 конфигурация для управления процессами
module.exports = {
  apps: [
    {
      name: 'charityfond-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/charityfond',
      instances: 2, // Запускать 2 инстанса для балансировки нагрузки
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/charityfond-backend-error.log',
      out_file: '/var/log/pm2/charityfond-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    },
    {
      name: 'charityfond-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/charityfond/frontend',
      instances: 2, // Запускать 2 инстанса для балансировки нагрузки
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/charityfond-frontend-error.log',
      out_file: '/var/log/pm2/charityfond-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', '.next'],
    },
  ],
};

