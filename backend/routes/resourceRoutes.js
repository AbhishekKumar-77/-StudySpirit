const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/resources';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ================= Standard Group Resources =================
// router.get('/group/:groupId', resourceController.getGroupResources);

// ================= Folder Management =================
router.post('/folders', resourceController.createFolder);
router.get('/folders', resourceController.getFolders);
router.delete('/folders/:folderId', resourceController.deleteFolder);

// ================= Personal Resources & AI content =================
router.post('/save', resourceController.savePersonalResource);
router.get('/my', resourceController.getMyResources);
router.post('/upload', upload.single('file'), resourceController.uploadFile);
router.delete('/:resourceId', resourceController.deleteResource);

// ================= AI Features =================
router.post('/generate-notes', resourceController.generateNotes);
router.post('/explain', resourceController.explainConcept);
router.post('/search-youtube', resourceController.searchYoutube);
router.post('/generate-flashcards', resourceController.generateFlashcards);

module.exports = router;
