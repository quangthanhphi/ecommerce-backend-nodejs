'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { cart } = require("../models/cart.model")
const { getProductById } = require("../models/repositories/product.repo")
/*
- add product to cart [user]
- reduce quantity by one [user]
- get cart [user]
- delete cart [user]
- delete cart item [user]
*/

class cartService {
    //START REPO CART
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        },
            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity
                }
            }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateSet, options)
    }

    static async addToCart({ userId, product = {} }) {
        //check cart ton tai hay khong
        const userCart = await cart.findOne({ cart_userId: userId })
        if (!userCart) {
            // create cart for User

            return await cartService.createUserCart({ userId, product })
        }

        //neu co gio hang nhugn chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }

        //gio hang ton tai
        return await cartService.updateUserCartQuantity({ userId, product })
    }

    //update cart
    /*
    shop_order_ids: [
        {
            shopId,
            item_products: [{
                quantity, price, shopId, old_quantity, productId
            }]
            version
        }

    ],
    */
    static async addToCartV2({ userId, shop_order_ids}) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
        // console.log(`PRODUCT ID: ` + productId)
        //check product
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError('Product not exists')
        //compare
        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError('Product doest not belong to the shop')
        }

        if (quantity === 0) {
            //deleted

        }
        return await cartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    }

    static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state : 'active'},
        updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query, updateSet)  //thay vi xoa thi move vao kho khac
        return deleteCart
    }

    static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}

module.exports = cartService