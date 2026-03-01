const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { adminAuth } = require('../utils/middleware');

router.get('/events', eventController.getEvents);
router.post('/admin/scrape', eventController.triggerScrape);
router.post('/tickets/interest', eventController.registerInterest);
router.post('/events/:id/import', adminAuth, eventController.importEvent);
router.delete('/admin/clear', adminAuth, eventController.clearDatabase);

module.exports = router;
