const TaskCategory = require('../models/task_category');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');
const Therapy = require('../models/therapy');
const Task = require('../models/task');
const TaskStatus = require('../models/task_status');

exports.getAllTaskCategories = async (req, res) => {
    try {
        const taskCategories = await TaskCategory.find();
        if(!taskCategories || taskCategories.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.CategoriesFetchSuccessfully));
        }
        return res.status(STATUS_CODES.SUCCESS).json(successJson(taskCategories, Messages.CategoriesFetchSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.createTaskCategory = async (req, res) => {
    try {

        const { therapy_id, name, description } = req.body;

        const therapy = await Therapy.findById(therapy_id);

        if (!therapy) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyNotFound));
        }

        const taskCategory = new TaskCategory({
            therapy_id: therapy_id,
            title: name,
            description: description,
        })

        const savedCategory = await taskCategory.save();

        return res.status(STATUS_CODES.CREATED).json(successJson(savedCategory, Messages.CategoryCreatedSuccessfully));


    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }

}
exports.updateTaskCategory = async (req, res) => {
    try {
        const { therapy_id, name, description } = req.body;
        const { id } = req.params;

        const category = await TaskCategory.findByIdAndUpdate(
            id,
            { therapy_id: therapy_id, title: name, description: description },
            { new: true, runValidators: true },
        )

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.CategoryNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(category, Messages.CategoryUpdatedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}
exports.deleteTaskCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const category = await TaskCategory.findByIdAndDelete(id);

        if (!category) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.CategoryNotFound));
        }

        // Deleting the tasks statuses of the tasks of the category
        const tasks = await Task.find({ task_category_id: id });
        const taskIds = tasks.map(task => task._id);
        await TaskStatus.deleteMany({ task_id: { $in: taskIds } });

        // Delete the tasks themselves
        await Task.deleteMany({ _id: { $in: taskIds } });

        return res.status(STATUS_CODES.SUCCESS).json(successJson(task, Messages.CategoryDeletedSuccessfully));

    } catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}