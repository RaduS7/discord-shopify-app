const mongoose = require('mongoose')

const Billing = mongoose.model('Billing', {
    first_install_date: {
        date: {
            type: Number,
            required: true,
            trim: true
        },
        month: {
            type: Number,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true,
            trim: true
        },
    },
    email: {
        type: String,
        require: true,
        trim: true
    },
    gid: {
        type: String,
        require: true,
        trim: true
    },
    shopID: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = Billing