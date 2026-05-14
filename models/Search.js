const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Search", searchSchema);
