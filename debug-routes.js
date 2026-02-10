
import app from './index.js';

function printRoutes(stack, prefix = '') {
    stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            const newPrefix = prefix + (layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/').replace('\\/?$', '') || '');
            printRoutes(layer.handle.stack, newPrefix);
        }
    });
}

try {
    // Wait for app to be ready if async
    setTimeout(() => {
        console.log('--- REGISTERED ROUTES ---');
        if (app._router && app._router.stack) {
            printRoutes(app._router.stack);
        } else {
            console.log('App router stack not found or empty.');
        }
        console.log('-------------------------');
        process.exit(0);
    }, 1000);
} catch (error) {
    console.error('Error listing routes:', error);
}
