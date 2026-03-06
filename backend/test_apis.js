const https = require('https');
const http = require('http');

function get(url, maxRedirects) {
    if (!maxRedirects) maxRedirects = 5;
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let loc = res.headers.location;
                if (loc.startsWith('/')) {
                    const u = new URL(url);
                    loc = u.protocol + '//' + u.host + loc;
                }
                return get(loc, maxRedirects - 1).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function main() {
    console.log('=== CodeChef HTML dump for regex testing ===');
    const r = await get('https://www.codechef.com/users/tourist');
    const h = r.data;

    // Find the rating section
    const ratingMatch = h.match(/class="rating-number">(\d+)/);
    console.log('Rating:', ratingMatch ? ratingMatch[1] : 'NOT FOUND');

    // Find around rating-number for context
    const idx = h.indexOf('rating-number');
    if (idx > -1) {
        console.log('\n--- Context around rating-number ---');
        console.log(h.substring(idx - 100, idx + 200).replace(/\s+/g, ' '));
    }

    // Find star rating
    const starIdx = h.indexOf('rating-star');
    if (starIdx > -1) {
        console.log('\n--- Context around rating-star ---');
        console.log(h.substring(starIdx - 100, starIdx + 200).replace(/\s+/g, ' '));
    }

    // Find problems-solved
    const solvedIdx = h.indexOf('problems-solved');
    if (solvedIdx > -1) {
        console.log('\n--- Context around problems-solved ---');
        console.log(h.substring(solvedIdx, solvedIdx + 300).replace(/\s+/g, ' '));
    }

    // Find highest rating
    const highIdx = h.indexOf('Highest Rating');
    if (highIdx === -1) {
        const highIdx2 = h.indexOf('highest');
        if (highIdx2 > -1) {
            console.log('\n--- Context around highest ---');
            console.log(h.substring(highIdx2, highIdx2 + 200).replace(/\s+/g, ' '));
        }
    } else {
        console.log('\n--- Context around Highest Rating ---');
        console.log(h.substring(highIdx, highIdx + 200).replace(/\s+/g, ' '));
    }

    // Find user-details section (stars are usually here)
    const userDetailsIdx = h.indexOf('user-details');
    if (userDetailsIdx > -1) {
        console.log('\n--- Context around user-details ---');
        console.log(h.substring(userDetailsIdx, userDetailsIdx + 500).replace(/\s+/g, ' '));
    }

    // Find any stars unicode
    const allStars = h.match(/.{0,30}\u2605.{0,30}/g);
    if (allStars) {
        console.log('\n--- All star unicode matches ---');
        allStars.forEach((m, i) => console.log(i + ':', m.replace(/\s+/g, ' ')));
    }
}

main().catch(console.error);
