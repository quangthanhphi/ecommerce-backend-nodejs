'use strict'

const redis = require('redis')
const {promisify} = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.pexpire).bind(redisClient) //chuyen doi 1 ham thanh promise
const setnxAsync = promisify(redisClient.setnx).bind(redisClient) 

const aquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2024_${productId}`
    const retryTime = 10;
    const expireTime = 3000; //3 seconds tam lock

    for(let index = 0; index < array.length; index++){
        //tao mot key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log(`result::`,result) //1 neu nam giu key, 0
        if(result === 1){
            //thao tac voi inventory
            const isReservation = await reservationInventory({
                productId, quantity, cartId
            })
            if(isReservation.modifiedCount) {
                await pexpire(key, expireTime)
                return key
            }
            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    aquireLock,
    releaseLock
}