const mongoose = require('mongoose');

const dueSchema = mongoose.Schema({
    id: String,
    amount: Number,
    date: String,
    owner: Number
})

module.exports = mongoose.model("dues", dueSchema);