'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { order } = require("../models/order.model")
const { findCartById } = require("../models/repositories/cart.repo")
const { checkProductByServer } = require("../models/repositories/product.repo")
const { getDiscountAmount } = require("./discount.service")
const { aquireLock, releaseLock } = require("./redis.service")

class CheckoutService{
    //login and without login
    /*
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [],
                item_products:[
                    {
                        price,
                        quantity,
                        productId

                    }
                ]
            },
            {
                shopId,
                shop_discount: [{
                    "shopId",
                    "discountId",
                    "codeId":
                }],
                item_products:[
                    {
                        price,
                        quantity,
                        productId

                    }
                ]
            }
        ]
    }
    */
    static async checkoutReview({
        cartId, userId, shop_order_ids = []
    }) {
        //check cartId co ton tai khong
        const foundCart = await findCartById(cartId)
        if(!foundCart) throw new BadRequestError('Cart does not exist')

        const checkout_order = {
            totalPrice: 0, //tong tien hang
            feeShip: 0, //phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckOut: 0 //tong thanh toan
        }, shop_order_ids_new = []

        //tinh tong tien bill
        for(let i = 0; i < shop_order_ids.length; i++) {
            const {shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductServer::`, checkProductServer)
            if(!checkProductServer[0]) throw new BadRequestError('order wrong!!')

            //tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            //tong tien truoc khi xu ly
            checkout_order.totalPrice =+ checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            //neu shop_discounts ton tai > 0, check xem co hop le khong
            if(shop_discounts.length > 0) {
                //gia su chi co mot discount
                //get amount discount
                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // console.log(`DISCOUNT::`, discount)
                //tong cong discount giam gia
                checkout_order.totalDiscount += discount

                //neu tien giam gia lon hon 0 
                if(discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            //tong thanh toan cuoi cung
            checkout_order.totalCheckOut += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)

        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
    //order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }){
        const {shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })
        //check lai xem mot lan nua co vuot ton kho khong
        //get new array Products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]::`, products)
        const acquireProduct = []
        for(let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const keyLock = await aquireLock(productId, quantity, cartId) 
            acquireProduct.push(keyLock ? true : false)
            if(keyLock) {
                await releaseLock(keyLock)
            }
        }

        //check if co mot san pham het hang trong kho
        if(acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang...')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        //truong hop: neu insert thanh cong, thi remove product co torng cart
        if(newOrder) {
            //remove product in cart
        }
        return newOrder
    }

    //Query Orders [users]
    static async getOrdersByUser() {

    }

    //Query Order using id [users]
    static async getOneOrderByUser() {
        
    }

    //cancel Order [users]
    static async cancelOrderByUser() {
        
    }

    //update Order status [shop | admin]
    static async updateOrderStatusbyShop() {
        
    }
}

module.exports = CheckoutService