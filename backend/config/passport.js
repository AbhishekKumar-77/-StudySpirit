
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(id)) {
            const user = await User.findById(id);
            if (user) return done(null, user);
        }

        // Fallback: try to find by googleId or githubId if id is a string
        let user = await User.findOne({ googleId: id });
        if (!user) user = await User.findOne({ githubId: id });

        if (user) return done(null, user);

        // If explicitly a mock session ID (from when DB was down) returns 'mockUser'
        // We can reconstruct a minimal user object to keep the session alive or just log them out
        // Returning null logs them out effectively
        done(null, null);
    } catch (err) {
        console.error("Deserialize Error:", err);
        done(null, null); // Don't crash, just log out
    }
});

// Google Strategy
// NOTE: You must provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file
const googleClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim().replace(/"/g, '') : "PLACEHOLDER";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim().replace(/"/g, '') : "PLACEHOLDER";

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const mongoose = require('mongoose');

            // Check if MongoDB is connected
            if (mongoose.connection.readyState !== 1) {
                console.log("⚠️ MongoDB not connected, creating mock user for session");
                // Create a mock user object that works without database
                const mockUser = {
                    _id: profile.id,
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    avatar: profile.photos[0].value,
                    role: 'student',
                    stats: { streak: 1, level: 1, xp: 100 }
                };
                return done(null, mockUser);
            }

            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            // Check if user exists with same email to link account
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            // Create new user
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0].value,
                role: 'student', // Default role
                stats: { streak: 1, level: 1, xp: 100 }
            });
            await user.save();
            done(null, user);
        } catch (err) {
            console.error("Google Auth Error:", err);
            // Even if there's an error, create a temporary user to avoid crash
            const tempUser = {
                _id: profile.id,
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0].value,
                role: 'student',
                stats: { streak: 1, level: 1, xp: 100 }
            };
            done(null, tempUser);
        }
    }));

// GitHub Strategy
// NOTE: You must provide GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "PLACEHOLDER_ID",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "PLACEHOLDER_SECRET",
    callbackURL: "http://localhost:3000/api/auth/github/callback",
    scope: ['user:email', 'read:user']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // GitHub emails can be private/multiple, handle carefully
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;

            // Fetch additional GitHub data
            const https = require('https');

            const fetchGitHubData = (url) => {
                return new Promise((resolve, reject) => {
                    https.get(url, {
                        headers: {
                            'User-Agent': 'StudySpirit-App',
                            'Authorization': `token ${accessToken}`
                        }
                    }, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                resolve(null);
                            }
                        });
                    }).on('error', reject);
                });
            };

            // Fetch user details and repositories
            const [userDetails, repos] = await Promise.all([
                fetchGitHubData(`https://api.github.com/user`),
                fetchGitHubData(`https://api.github.com/users/${profile.username}/repos?sort=updated&per_page=10`)
            ]);

            const githubProfileData = {
                username: profile.username,
                publicRepos: userDetails?.public_repos || 0,
                followers: userDetails?.followers || 0,
                following: userDetails?.following || 0,
                bio: userDetails?.bio || '',
                location: userDetails?.location || '',
                company: userDetails?.company || '',
                blog: userDetails?.blog || '',
                avatarUrl: profile.photos?.[0]?.value || '',
                profileUrl: profile.profileUrl || `https://github.com/${profile.username}`,
                repositories: Array.isArray(repos) ? repos.slice(0, 10).map(repo => ({
                    name: repo.name,
                    description: repo.description || '',
                    language: repo.language || 'Unknown',
                    stars: repo.stargazers_count || 0,
                    forks: repo.forks_count || 0,
                    url: repo.html_url
                })) : []
            };

            let user = await User.findOne({ githubId: profile.id });
            if (user) {
                // Update existing user's GitHub profile data
                user.githubProfile = githubProfileData;
                await user.save();
                return done(null, user);
            }

            user = await User.findOne({ email: email });
            if (user) {
                user.githubId = profile.id;
                user.githubProfile = githubProfileData;
                await user.save();
                return done(null, user);
            }

            user = new User({
                name: profile.displayName || profile.username,
                email: email,
                githubId: profile.id,
                githubProfile: githubProfileData,
                avatar: profile.photos?.[0]?.value || '👨‍💻',
                role: 'student',
                stats: { streak: 1, level: 1, xp: 100 }
            });
            await user.save();
            done(null, user);
        } catch (err) {
            console.error("GitHub Auth Error:", err);
            done(err, null);
        }
    }));

module.exports = passport;
