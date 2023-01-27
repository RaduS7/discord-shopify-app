const mongoose = require('mongoose')

const Usage = mongoose.model('Usage', {
    counter: {
        type: Number,
        required: true,
        trim: true
    },
    shopID: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = Usage