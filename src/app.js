const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()


// init middlewares
// morgan("combined") - Khi nào sử dụng product // morgan("common") giống combined// morgan("short") ngắn // morgan("tiny") ngắn hơn
app.use(morgan("dev"))
app.use(helmet()) //Bảo vệ riêng tư công nghệ sử dụng
app.use(compression()) //nén các phản hồi HTTP, giảm dung lượng

//init db

//init routes
app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: "Welcome"
    })
})
//handling error 

module.exports = app