const express = require('express');
const adminController = require('../controllers/adminController.js');
const { verifyAdmin } = require('../middleware/authMiddleware.js'); 

const router = express.Router();

router.get('/admin/login', adminController.login_page);
router.post('/admin/login', adminController.process_login); 
router.get('/admin/dashboard', verifyAdmin, adminController.dashboard_page);

// Students management routes
router.get('/admin/students', verifyAdmin, adminController.list_students);
router.get('/admin/students/new', verifyAdmin, adminController.new_student_page);
router.post('/admin/students', verifyAdmin, adminController.create_student);
router.get('/admin/students/:id/edit', verifyAdmin, adminController.edit_student_page);
router.post('/admin/students/:id', verifyAdmin, adminController.update_student);
router.post('/admin/students/:id/delete', verifyAdmin, adminController.delete_student);

// Opportunities management routes
router.get('/admin/opportunities', verifyAdmin, adminController.list_opportunities);
router.get('/admin/opportunities/new', verifyAdmin, adminController.new_opportunity_page);
router.post('/admin/opportunities/create', verifyAdmin, adminController.create_opportunity);
router.get('/admin/opportunities/:id/edit', verifyAdmin, adminController.edit_opportunity_page);
router.post('/admin/opportunities/:id/update', verifyAdmin, adminController.update_opportunity);
router.post('/admin/opportunities/:id/delete', verifyAdmin, adminController.delete_opportunity);

// Mentors management routes
router.get('/admin/mentors', verifyAdmin, adminController.list_mentors);
router.get('/admin/mentors/new', verifyAdmin, adminController.new_mentor_page);
router.post('/admin/mentors/create', verifyAdmin, adminController.create_mentor);
router.get('/admin/mentors/:id/edit', verifyAdmin, adminController.edit_mentor_page);
router.post('/admin/mentors/:id/update', verifyAdmin, adminController.update_mentor);
router.post('/admin/mentors/:id/delete', verifyAdmin, adminController.delete_mentor);

module.exports = router;

