'use strict';

const keytokenModel = require('../models/keytoken.model');

class KeyTokenService {
    static async createKeyToken({ userId, publicKey, privateKey }) {
        try {
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })
            return tokens ? tokens.publicKey : null
        } catch (error) {
            console.error('Key token creation error:', error)
            return null; // or return a specific error code/message
        }
    }
}

module.exports = KeyTokenService
