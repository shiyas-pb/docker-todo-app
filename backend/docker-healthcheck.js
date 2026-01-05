#!/usr/bin/env node
// Docker health check script for the backend

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET',
    timeout: 3000
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (res.statusCode === 200 && result.status === 'healthy') {
                console.log('Health check passed');
                process.exit(0);
            } else {
                console.log('Health check failed:', result);
                process.exit(1);
            }
        } catch (error) {
            console.error('Failed to parse health check response:', error);
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error('Health check request failed:', error.message);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('Health check timeout');
    req.destroy();
    process.exit(1);
});

req.end();
