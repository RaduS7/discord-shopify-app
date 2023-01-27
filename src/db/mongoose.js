const mongoose = require('mongoose')

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then((result) => {
    //console.log(result)
}).catch((error) => {
    //console.log("Ne-am luat error")
    //console.log(error)
})