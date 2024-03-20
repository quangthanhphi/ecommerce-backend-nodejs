'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto =  require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair,verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    //check token is used?
    static handlerRefreshToken = async (refreshToken) => {
        //check token đã duoc su dụng chưa
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        //nếu có
        if(foundToken) {
            //decode xem là gì
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({userId, email})
            //xóa tất cả token trong keystore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong! Pls relogin')
        }

        //nếu chưa
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken) throw new AuthFailureError('Shop not registered 1')

        //verify token
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('--[2]--',{userId, email})

        //check userId
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered 2')

        //create 1 cặp mới
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken 
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // đã được sử dụng để lấy token mới
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }

    /*
    1 - check email in dbs
    2 - match password
    3 - create AT vs RT and save
    4 - generate tokens
    5 - get data return login
    */

    static login = async ({email, password, refreshToken = null}) => {
        //1.
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered')

        //2.
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')

        //3.
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        //4.
        const {_id : userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey,userId

        })

        return {
            shop: getInfoData({fileds: ['_id','name', 'email'] , object: foundShop}),
            tokens
        }
    }

    static signUp = async ({name, email, password}) => {
        // try {
            //step1: check email exists?
            const holderShop = await shopModel.findOne({email}).lean() // lean giúp query nhanh, return 1 object js thuần
            if(holderShop) {
                throw new BadRequestError('Error: Shop already registerd!')
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })
            if(newShop) {
                // created privateKey để sign token, publicKey để verify token
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1', //public key cryptography standard,
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1', //public key cryptography standard,
                //         format: 'pem'
                //     }
                // })

                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')
                      

                console.log ({privateKey, publicKey}) //save collection keyStore

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'keyStore error',
                    }
                }
               
                //created token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens)
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fileds: ['_id','name', 'email'] , object: newShop}),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata:null
            }
        // } catch (error) {
        //     console.error(error)
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService