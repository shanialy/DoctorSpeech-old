const mongoose = require('mongoose');
const { Messages } = require('../constants/messages');


const taskCategory = new mongoose.Schema(
    {
        therapy_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Therapy',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, Messages.TaskCategoryDescriptionMaxlenError],
        },

    },
    {
        timestamps: true,
    },

);

const TaskCategory = mongoose.model('task_category', taskCategory);

module.exports = TaskCategory;
