'use strict'

const AccessService = require("../services/access.service")

class AccessController {
    signUp = async( req, res, next) => {
        
        return res.status(201).json(await AccessService.signUp(req.body))//200:OK 201:CREATED
       
    }
}

module.exports = new AccessController()