const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    therapy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'therapy',
        required: true,
    },
    task_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'task_category',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    video_url: {
        type: String, // URL of the video stored in Firebase
        required: true,
    },
    is_free: {
        type: Boolean, 
        required: true,
    },
    segments: [
        {
            heading: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
        },
    ],

});

const Task = mongoose.model('task', taskSchema);

module.exports = Task;
