const Task = require('../models/task');
const TaskStatus = require('../models/task_status');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');
const Therapy = require('../models/therapy');
const TaskCategory = require('../models/task_category');
const User = require('../models/user');


exports.getTasksByTherapy = async (req, res) => {
    try {
        const { therapyId } = req.params;

        // Fetch therapy
        const therapy = await Therapy.findById(therapyId);
        if (!therapy) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyNotFound));
        }

        // Fetch categories and tasks
        const categories = await TaskCategory.find({ therapy_id: therapyId });
        const tasks = await Task.find({ therapy_id: therapyId });

        if (!tasks || tasks.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson({}, Messages.NoTasksToShow));
        }

        // Fetch user ID
        const user_id = req.user.user_id;

        // Fetch task statuses
        const taskIds = tasks.map(task => task._id);
        const tasksStatus = await TaskStatus.find({
            user_id: user_id,
            task_id: { $in: taskIds },
        });

        // Create a map of task statuses for lookup
        const taskStatusMap = tasksStatus.reduce((map, status) => {
            map[status.task_id.toString()] = status.status; // Assuming `status` is a field in TaskStatus
            return map;
        }, {});

        // Group tasks by categories and attach statuses
        const groupedTasks = categories.map(category => {
            // Filter tasks belonging to the current category
            const categoryTasks = tasks.filter(
                task => task.task_category_id.toString() === category._id.toString()
            );

            // Map tasks with their statuses
            const tasksWithStatus = categoryTasks.map(task => ({
                _id: task._id,
                name: task.name,
                is_free: task.is_free,
                age: task.age,
                
                // ...task.toObject(),
                status: taskStatusMap[task._id.toString()] || null,
            }));

            return {
                category_id: category._id,
                category_name: category.title,
                category_description: category.description,
                tasks_data: tasksWithStatus,
            };
        });

        // Construct the final response object
        const response = {
            therapy: {
                id: therapy._id,
                name: therapy.name,
                description: therapy.description,
                tasks: groupedTasks,
            },
        };

        return res.status(STATUS_CODES.SUCCESS).json(successJson(response, Messages.TaskStatusUpdated));
    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TaskNotFound));
        }

        // Selected User Id
        const token = req.user;
        const user_id = token.user_id;

        const user = await User.findById(user_id);

        if (user.is_premium == false && task.is_free == false) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OnlyPremiumUserCanViewThisTask));
        }

        await task.populate('task_category_id');
        await task.populate('therapy_id');

        // Fetching task statuses
        const tasksStatus = await TaskStatus.findOne({
            user_id: user_id,
            task_id: id, // Match any task_id in the list
        });

        // Combine tasks with their corresponding statuses

        const taskObject = task.toObject();
        const category = taskObject.task_category_id;
        const therapy = taskObject.therapy_id;
        delete taskObject.task_category_id;
        delete taskObject.therapy_id;
        const tasksWithStatus = {
            category: category,
            therapy: therapy,
            ...taskObject,
            status: tasksStatus || null,
        };


        return res.status(STATUS_CODES.SUCCESS).json(successJson(tasksWithStatus, Messages.TaskStatusUpdated));
    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.startTask = async (req, res) => {
    try {

        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TaskNotFound));
        }

        const task_id = id;
        const therapy_id = task.therapy_id;
        const user_id = req.user.user_id;

        const user = await User.findById(user_id);

        if (user.is_premium == false && task.is_free == false) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OnlyPremiumUserCanViewThisTask));
        }

        const tStatus = await TaskStatus.findOne({ task_id: task_id, user_id: user_id });

        if (tStatus) {
            if (tStatus.completed_at) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TaskIsAlreadyCompleted));
            }
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TaskIsAlreadyStarted));
        }

        const status = new TaskStatus({
            task_id,
            therapy_id,
            user_id,
        })

        const newStatus = await status.save();

        const response = {
            ...task.toObject(),
            status: newStatus.toObject(),
        }


        return res.status(STATUS_CODES.SUCCESS).json(successJson(response, Messages.TaskStartedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.completeTask = async (req, res) => {
    try {

        const { id } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TaskNotFound));
        }

        const task_id = id;
        const user_id = req.user.user_id;

        const user = await User.findById(user_id);

        if (user.is_premium == false && task.is_free == false) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OnlyPremiumUserCanViewThisTask));
        }

        const tStatus = await TaskStatus.findOne({ task_id: task_id, user_id: user_id });

        if (!tStatus) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TaskHasNotBeenStartedYet));
        } else if (tStatus.completed_at) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TaskIsAlreadyCompleted));
        }

        // Update the completed date of this task status and mark it as done. and update db
        tStatus.completed_at = new Date();
        await tStatus.save();

        const response = {
            ...task.toObject(),
            status: tStatus.toObject(),
        }


        return res.status(STATUS_CODES.SUCCESS).json(successJson(response, Messages.TaskCompletedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.createTask = async (req, res) => {
    try {

        const { task_category_id, name, video_url, segments, is_free, age } = req.body;

        const category = await TaskCategory.findById(task_category_id);

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.CategoryNotFound));
        }

        const therapy_id = category.therapy_id;

        const therapy = await Therapy.findById(therapy_id);

        if (!therapy) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyNotFound));
        }

        const task = new Task({
            therapy_id,
            task_category_id,
            name,
            age,
            video_url,
            segments,
            is_free,
        })

        const savedTask = await task.save();

        return res.status(STATUS_CODES.CREATED).json(successJson(savedTask, Messages.TaskCreatedSuccessfully));


    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }

}

exports.udpateTask = async (req, res) => {
    try {
        const { name, video_url, segments, is_free, age } = req.body;
        const { id } = req.params;

        const task = await Task.findByIdAndUpdate(
            id,
            {
                name: name,
                video_url: video_url,
                age: age,
                segments: segments,
                is_free: is_free,
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true },
        )

        if (!task) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TaskNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(task, Messages.TaskUpdatedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.deleteTask = async (req, res) => {
    try {

        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TaskNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(task, Messages.TaskDeletedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}