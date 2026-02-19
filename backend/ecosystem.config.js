module.exports = {
    apps: [
        {
            name: 'StudySpirit-API',
            script: 'index.js',

            // Single instance — required for Socket.io (chat, groups, DMs) to work correctly
            // To scale beyond 500 users, add Redis adapter and switch back to cluster mode
            instances: 1,
            exec_mode: 'fork',

            // Environment
            env: {
                NODE_ENV: 'development',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },

            // Auto-restart if it crashes
            autorestart: true,
            watch: false,

            // Restart if memory exceeds 500MB (prevents memory leak crashes)
            max_memory_restart: '500M',

            // Graceful shutdown — finish in-flight requests before dying
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Logs
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,
        }
    ]
};
