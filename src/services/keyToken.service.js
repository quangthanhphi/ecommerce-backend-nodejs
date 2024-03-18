'use strict';

const keytokenModel = require('../models/keytoken.model');
const  {Types: {ObjectId} } = require('mongoose')
class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            //level 0 
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? tokens.publicKey : null

            //level xx
            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = {upsert: true, new: true}

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null

        } catch (error) {
            console.error('Key token creation error:', error)
            return null; // or return a specific error code/message
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: new ObjectId(userId) }).lean();
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: id });
    }
}

module.exports = KeyTokenService
