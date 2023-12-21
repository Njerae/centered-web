const express = require('express');
const mentorController = require('../controllers/mentorController.js');
const { verifyMentor } = require('../middleware/authMiddleware.js'); 

const router = express.Router();

router.post('/mentor/login', mentorController.process_login); 
// router.get('/mentor/dashboard', verifyMentor, adminController.dashboard_page);

// // Students management routes
// router.get('/mentor/students', verifyMentor, adminController.list_students);

// // Opportunities management routes
// router.get('/mentor/opportunities', verifyMentor, adminController.list_opportunities);
// router.get('/mentor/opportunities/:id/edit', verifyMentor, adminController.edit_opportunity_page);

// // Mentors management routes
// router.get('/mentor/mentors', verifyMentor, adminController.list_mentors);
// router.get('/mentor/mentors/:id/edit', verifyMentor, adminController.edit_mentor_page);

module.exports = router;

