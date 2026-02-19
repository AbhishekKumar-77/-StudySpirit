/**
 * PM2 Ecosystem Configuration
 * Run with: pm2 start ecosystem.config.js
 * 
 * This enables:
 * - Cluster mode (uses all CPU cores)
 * - Auto-restart on crash
 * - Memory limit monitoring
 * - Log management
 */
module.exports = {
    apps: [
        {
            name: 'studyspirit-backend',
            script: './backend/index.js',
            cwd: __dirname,

            // Cluster mode — use all available CPU cores
            instances: 'max',
            exec_mode: 'cluster',

            // Auto-restart settings
            autorestart: true,
            watch: false, // Don't watch in production
            max_memory_restart: '500M', // Restart if memory exceeds 500MB

            // Environment variables
            env: {
                NODE_ENV: 'development',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/error.log',
            out_file: './logs/output.log',
            merge_logs: true,

            // Graceful shutdown
            kill_timeout: 5000,
            listen_timeout: 10000,

            // Restart delay
            restart_delay: 1000,

            // Max restarts before stopping
            max_restarts: 10,
            min_uptime: '10s'
        }
    ]
};
