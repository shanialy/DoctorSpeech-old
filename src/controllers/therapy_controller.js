const Therapy = require('../models/therapy');
const Task = require('../models/task');
const TaskStatus = require('../models/task_status');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');
const TaskCategory = require('../models/task_category');

exports.getAllTherapies = async (req, res) => {
    try {
        const therapies = await Therapy.find();

        if (!therapies || therapies.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson({}, Messages.NoTherapiesToShow));
        }

        const token = req.user;
        const user_id = token.user_id;

        const therapyWithTasks = await Promise.all(
            therapies.map(async (therapy) => {
                const tasks = await Task.find({ therapy_id: therapy._id }); // Fetch tasks for this therapy

                let completedTasksCount = 0;
                if (tasks && tasks.length > 0) {
                    const taskIds = tasks.map(task => task._id);

                    const taskStatuses = await TaskStatus.find({
                        user_id: user_id,
                        task_id: { $in: taskIds },
                    });

                    if (taskStatuses && taskStatuses.length > 0) {
                        completedTasksCount = taskStatuses.filter(status => status.completed_at !== null).length;
                    }
                }
                return {
                    ...therapy.toObject(), // Convert therapy document to plain JS object
                    total_tasks: tasks.length, // Attach the tasks array to the therapy
                    completed_tasks: completedTasksCount,
                };
            })
        );

        return res.status(STATUS_CODES.SUCCESS).json(successJson(therapyWithTasks, Messages.TherapiesFetched));
    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}
exports.getTherapyById = async (req, res) => {
    try {
        const { id } = req.params;
        const therapy = await Therapy.findById(id);

        if (!therapy) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.TherapyNotFound));
        }

        const tasks = await Task.find({ therapy_id: therapy._id });

        let completedTasksCount = 0;
        if (tasks && tasks.length > 0) {
            const taskIds = tasks.map(task => task._id);

            const taskStatuses = await TaskStatus.find({
                user_id: user_id,
                task_id: { $in: taskIds },
            });

            if (taskStatuses && taskStatuses.length > 0) {
                completedTasksCount = taskStatuses.filter(status => status.completed_at !== null).length;
            }
        }

        const therapyResponse = {
            ...therapy.toObject(),
            total_tasks: tasks.length,
            completed_tasks: completedTasksCount,
        };

        return res.status(STATUS_CODES.SUCCESS).json(successJson(therapyResponse, Messages.TherapiesFetched),);


    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(Messages.SERVER_ERROR));
    }
}

exports.createTherapy = async (req, res) => {
    try {
        const { name, description } = req.body;

        const createTherapy = new Therapy({ name, description });

        // Save to the database
        const savedTherapy = await createTherapy.save();
        return res.status(STATUS_CODES.CREATED).json(successJson(savedTherapy, Messages.TherapyCreatedSuccessfully));

    } catch (e) {
        if (e.code === 11000) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TherapyWithThisNameAlreadyExists));
        }
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.udpateTherapy = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const therapy = await Therapy.findByIdAndUpdate(
            id,
            { name: name, description: description, updatedAt: Date.now(), }, // Fields to update
            { new: true, runValidators: true },
        );

        if (!therapy) {
            // If no therapy found with the given ID, return a 404 error
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json(errorJson(Messages.TherapyNotFound));
        }


        return res
            .status(STATUS_CODES.SUCCESS)
            .json(successJson(therapy, Messages.TherapyUpdatedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.deleteTherapy = async (req, res) => {
    try {
        const { id } = req.params;

        const therapy = await Therapy.findByIdAndDelete(id);

        if (!therapy) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyNotFound));
        }
        
        await Task.deleteMany({ therapy_id: id });
        await TaskCategory.deleteMany({ therapy_id: id });
        await TaskStatus.deleteMany({ therapy_id: id });
        

        return res.status(STATUS_CODES.SUCCESS).json(successJson(therapy, Messages.TherapyDeletedSuccessfully));
    
    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}