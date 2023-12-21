const express = require('express');
const publicController = require('../controllers/publicController.js');
const router = express.Router();

router.get('/', publicController.home_page);
router.get('/about', publicController.about_page);

module.exports = router;
