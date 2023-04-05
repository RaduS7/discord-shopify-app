const mongoose = require('mongoose')

const Widget = mongoose.model('Widget', {
    desktopPosition: {
        yAxis: {
            type: String,
            required: true,
            trim: true
        },
        xAxis: {
            type: String,
            required: true,
            trim: true
        },
    },
    mobilePosition: {
        yAxis: {
            type: String,
            required: true,
            trim: true
        },
        xAxis: {
            type: String,
            required: true,
            trim: true
        },
    },
    notificationText: {
        type: String,
        required: true,
        trim: true
    },
    notificationTimeout: {
        type: String,
        required: true,
        trim: true
    },
    notificationAvatar: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: Boolean,
        required: true,
        trim: true
    },
    desktop: {
        type: Boolean,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    shopID: {
        type: String,
        require: true,
        trim: true
    },
    widgetEnabled: {
        type: Boolean,
        required: true,
        trim: true
    },
})

module.exports = Widget