const mongoose = require("mongoose")


const scheduleSchema = new mongoose.Schema(
    {
        message: String,
        scheduleDate: Date,
        success: Boolean,
        user: {

            type: mongoose.Schema.ObjectId,
            ref: "User"

        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);