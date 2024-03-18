
require('dotenv').config()
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
app.use(
    express.urlencoded({ extended: true })
);
    
app.use(express.json());
//init db
require('./dbs/init.mongodb')
//init routes
app.use('/',require('./routes'))

//handling error 
app.use( (req,res,next)=> {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use( (error,req,res,next)=> {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        code: statusCode,
        status: 'error',
        message: error.message || 'Internal Server Error'
    })
})
module.exports = app