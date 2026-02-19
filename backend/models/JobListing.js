const mongoose = require('mongoose');

const JobListingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['job', 'internship', 'hackathon'], required: true },
    title: { type: String, required: true },
    company: { type: String, required: true }, // or Organizer for hackathons
    location: { type: String },
    salary: { type: String }, // or Stipend or Prizes
    source: { type: String, default: 'StudySpirit' },
    posted: { type: String },
    logo: { type: String },
    tags: [{ type: String }],
    link: { type: String }, // Apply link
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobListing', JobListingSchema);
