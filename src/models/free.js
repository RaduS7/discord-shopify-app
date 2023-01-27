const mongoose = require('mongoose')

const Free = mongoose.model('Free', {
    shopID: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = Free