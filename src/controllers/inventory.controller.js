'use strict'

const InventoryService = require("../services/inventory.service")
const {SuccessResponse} = require('../core/success.response')

class InventoryController {

    addStockToInvetory = async (req, res, next) => {
        new SuccessResponse({
            message: 'addStockToInvetory success',
            metadata: await InventoryService.addStockToInvetory(req.body)
        }).send(res)
    }

    
}

module.exports = new InventoryController()