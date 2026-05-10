const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Recruiter Test',
                email: 'rectest@example.com',
                password: 'password123',
                role: 'recruiter',
                companyName: 'TestCompany',
                university: '',
                course: ''
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
test();
