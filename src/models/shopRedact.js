const mongoose = require('mongoose')

const ShopRedact = mongoose.model('ShopRedact', {
    shop_id: {
        type: Number,
        required: true,
        trim: true
    },
    shop_domain: {
        type: String,
        required: true,
        trim: true
    },
})

module.exports = ShopRedact