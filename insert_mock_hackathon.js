require('dotenv').config();
const mongoose = require('mongoose');
const JobListing = require('./backend/models/JobListing');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyspirit';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    const hackathon = {
        id: 'hack_' + Date.now(),
        type: 'hackathon',
        title: 'Google Cloud StudyJam Hackathon',
        company: 'Google / StudySpirit',
        location: 'Remote',
        salary: '$5000 Prize Pool',
        source: 'StudySpirit Internal',
        posted: 'Just now',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
        tags: ['React', 'Node.js', 'Cloud'],
        description: 'Compete in our exclusive internal hackathon. Build a scalable cloud application. Click Start Hackathon to enter the Secure Exam Browser and prove your skills!',
        isInternalHackathon: true,
        hackathonQuizCode: 'SP_MOCK_HACK',
        requiredSkills: [
            { skillName: 'React', minimumScore: 70 },
            { skillName: 'Node.js', minimumScore: 60 }
        ]
    };

    await JobListing.create(hackathon);
    console.log('Mock Hackathon inserted successfully!');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
