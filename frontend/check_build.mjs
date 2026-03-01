import { build } from 'vite';

try {
    await build();
} catch (e) {
    // Print the full error
    if (e.errors) {
        for (const err of e.errors) {
            console.error('BUILD ERROR:', JSON.stringify(err, null, 2));
        }
    }
    console.error('MESSAGE:', e.message);
}
