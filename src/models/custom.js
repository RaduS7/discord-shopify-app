const mongoose = require('mongoose')

const Custom = mongoose.model('Custom', {
    trial: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    shopID: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = Custom