const express = require('express');
const { validateUser, validateAdmin } = require('../services/jwt/jwt_service')
const { getTaskById, getTasksByTherapy, startTask, completeTask, createTask, udpateTask, deleteTask, } = require('../controllers/task_controller');
const { createTaskCategory, updateTaskCategory, deleteTaskCategory, getAllTaskCategories } = require('../controllers/task_category_controller');

const router = express.Router();

router.post('/task/category', validateUser, validateAdmin, createTaskCategory);
router.put('/task/category/:id', validateUser, validateAdmin, updateTaskCategory);
router.delete('/task/category/:id', validateUser, validateAdmin, deleteTaskCategory);
router.get('/task/categories', validateUser, validateAdmin, getAllTaskCategories);

router.get('/tasks/therapy/:therapyId', validateUser, getTasksByTherapy);
router.put('/task/:id/started', validateUser, startTask);
router.put('/task/:id/completed', validateUser, completeTask);
router.get('/task/:id', validateUser, getTaskById);
router.post('/task', validateUser, validateAdmin, createTask);
router.post('/task', validateUser, validateAdmin, createTask);
router.put('/task/:id', validateUser, validateAdmin, udpateTask);
router.delete('/task/:id', validateUser, validateAdmin, deleteTask);

module.exports = router;