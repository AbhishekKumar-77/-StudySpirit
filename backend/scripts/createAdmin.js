require('dotenv').config(); // Loads .env from CWD (backend/) by default
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ Error: MONGODB_URI not found. Make sure you are in the "backend" folder and .env exists.');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const email = process.argv[2];
        const password = process.argv[3] || 'admin123';

        if (!email) {
            console.error('❌ Please provide an email address.');
            console.log('Usage: node scripts/createAdmin.js <email> [password]');
            process.exit(1);
        }

        let user = await User.findOne({ email });

        if (user) {
            console.log(`🔍 User found: ${user.name} (${user.email})`);
            user.isAdmin = true;
            user.role = 'teacher';
            user.password = password; // Set/Reset password so you can login without Google
            if (user.isBlocked) {
                user.isBlocked = false;
                console.log('🔓 Unblocking user...');
            }
            await user.save();
            console.log('👑 Successfully promoted user to ADMIN.');
            console.log(`🔑 Password set to: ${password}`);
            console.log('👉 You can now login with Email/Password if Google Auth fails.');
        } else {
            console.log('🆕 Creating new admin user...');
            user = new User({
                name: 'Admin User',
                email: email,
                password: password, // In production this should be hashed
                role: 'teacher',
                isAdmin: true,
                isVerified: true
            });
            await user.save();
            console.log(`✅ Created new admin user: ${email} / ${password}`);
        }

        console.log('👋 Done. Press Ctrl+C to exit if it doesn\'t close automatically.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();
