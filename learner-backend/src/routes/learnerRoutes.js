const express = require('express');
const router = express.Router();
const learnerController = require('../controllers/learnerController');
const auth = require('../middleware/auth');

router.post('/register', learnerController.createLearner);
router.post('/login', learnerController.learnerLogin);

router.get('/profile', auth.authenticate, learnerController.viewLearnerProfile);
router.put('/profile', auth.authenticate, learnerController.updateLearnerProfile);

router.put('/:learnerId', learnerController.updateLearnerByAdmin);

router.get('/all-courses', auth.authenticate, learnerController.getAllCourses);
router.get('/all-learners', learnerController.getAllLearners);
router.delete('/:learnerId', learnerController.deleteLearner);

module.exports = router;
