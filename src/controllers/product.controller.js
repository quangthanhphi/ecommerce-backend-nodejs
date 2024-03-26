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

    //update
    updateProduct = async(req,res,next) => {
        new SuccessResponse({
            message: 'update new product success',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async(req, res, next) =>{
        new SuccessResponse({
            message: 'publishProductByShop success',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublishProductByShop = async(req, res, next) =>{
        new SuccessResponse({
            message: 'unPublishProductByShop success',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    /**
     * @desc Get all drafts for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON}
     */
    //QUERY
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list draft success',
            metadata: await ProductServiceV2.findAllDraftsForShop( {
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'getAllPublishForShop success',
            metadata: await ProductServiceV2.findAllPublishForShop( {
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'getListSearchProduct success',
            metadata: await ProductServiceV2.searchProducts( req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'findAllProducts success',
            metadata: await ProductServiceV2.findAllProducts( req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'find Product success',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }

    //END QUERY

    
}

module.exports = new ProductController()