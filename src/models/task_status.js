const mongoose = require('mongoose');
const {Messages} = require('../constants/messages');


const taskStatusSchema = new mongoose.Schema(
    {
        therapy_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Therapy',
            required: true,
        },
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        started_at: {
            type: Date,
            default: Date.now,
        },
        completed_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },

);

taskStatusSchema.index({ therapy_id: 1, task_id: 1, user_id: 1 }, { unique: true });

taskStatusSchema.methods.markAsCompleted = async function () {
    if (this.completed_at) {
        throw new Error(Messages.TaskIsAlreadyCompleted);
    }

    this.completed_at = new Date(); // Set the completion date to the current time
    await this.save(); // Save the updated document
    return this;
};


const TaskStatus = mongoose.model('task_status', taskStatusSchema);

module.exports = TaskStatus;
