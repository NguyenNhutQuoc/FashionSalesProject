const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const PORT = process.env.PORT || 3000
dotenv.config()
const app = express()
    // Config routes
const categoryRouter = require('./routes/category')
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
const billRouter = require('./routes/bill')
const billDetailRouter = require('./routes/billDetail')
    // const colorRouter = require('./routes/color')
    // const sizeRouter = require('./routes/sizes')
const commentsRouter = require('./routes/comment')
    // const couponRouter = require('./routes/coupon')
mongoose.connect(process.env.MONGODB_URL, (err) => {
    if (err) {
        console.log("Can't connect to database")
    } else {
        console.log('Connected to mongodb')
    }
})

console.log(process.env.MONGODB_URL)

app.use(bodyParser.json({
    limit: '50mb'
}))
app.use(cors())
app.use(morgan("common"))

app.use('/api/category', categoryRouter)

app.use('/api/product', productRouter)

app.use('/api/user', userRouter)

app.use('/api/bill', billRouter)

app.use('/api/bill-detail', billDetailRouter)
    //
    // app.use('/api/color', colorRouter)
    //
    // app.use('/api/size', sizeRouter)

app.use('/api/comment', commentsRouter)
    //
    // app.use('/api/coupon', couponRouter)

app.listen(
    PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    }
)