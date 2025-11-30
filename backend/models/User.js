const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    name: String,
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", UserSchema);
