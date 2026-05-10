require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const user = new User({
            name: 'Recruiter Test',
            email: 'rectest' + Date.now() + '@example.com',
            password: 'password123',
            role: 'recruiter',
            university: '',
            course: '',
            isVerified: true,
            recruiterProfile: { companyName: 'TestCompany', savedCandidates: [] }
        });

        await user.save();
        console.log("Saved successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Mongoose validation error:", e);
        process.exit(1);
    }
}
test();
