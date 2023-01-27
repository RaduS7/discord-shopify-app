const mongoose = require('mongoose')

const DiscordID = mongoose.model('DiscordID', {
    serverID: {
        type: String,
        required: true,
        trim: true
    },
    channelID: {
        type: String,
        required: true,
        trim: true
    },
    shopID: {
        type: String,
        require: true,
        trim: true
    }
})

module.exports = DiscordID