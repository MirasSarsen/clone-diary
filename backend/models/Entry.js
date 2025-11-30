const mongoose = require("mongoose");
const EntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    original: String,
    clone: String,
    category: String,
    persona: String,
    moodScore: Number, // для анализа
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
});
module.exports = mongoose.model("Entry", EntrySchema);
