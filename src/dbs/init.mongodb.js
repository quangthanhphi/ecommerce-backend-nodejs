'use strict'

const mongoose = require('mongoose')
const {db: {host,name,port}} = require('../configs/config.mongodb')
const {countConnect} = require('../helpers/check.connect')
const connectString = `mongodb://${host}:${port}/${name}`

console.log(connectString)

class Database {
    constructor() {
        this.connect()
    }

    //connect
    connect(type = 'mongodb') {
        //dev
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectString, {
            maxPoolSize: 50 //điều chỉnh kích thước pool, nếu vượt quá thì xếp hàng đợi free 
        }).then(_ => {
            console.log(`Connected Mongodb Success PRO`,countConnect())
        })
            .catch(err => console.log("Error connect !", err))

    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb