'use strict'

const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.xxx")
const {SuccessResponse} = require('../core/success.response')

class ProductController {

    createProduct = async(req,res,next) => {
        // new SuccessResponse({
        //     message: 'create new product success',
        //     metadata: await ProductService.createProduct( req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)
       try {
        new SuccessResponse({
            message: 'create new product success',
            metadata: await ProductServiceV2.createProduct( req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
       } catch (error) {
            next(error)
       }
    }

    
}

module.exports = new ProductController()