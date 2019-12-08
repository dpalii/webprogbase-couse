const fs = require('fs');
const mongoose = require('mongoose');
const subscribtionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    chatId: { type: String, required: true  }

});
const subscribtionModel = mongoose.model('Subscribtion', subscribtionSchema, 'subscribtions');
class Subscribtion {

    // static functions to access storage
 
    static get(chatId, productId) {
        return subscribtionModel.findOne({chatId: chatId, productId: productId});
    }
    static getAll(productId, chatId) {
        if (chatId) return subscribtionModel.find({ chatId: chatId }).populate('productId');
        return subscribtionModel.find({ productId: productId });
    }
    static create(x)
    {
        return subscribtionModel.create(x);
    }
    static update(x)
    {
        return subscribtionModel.findByIdAndUpdate(x._id, x, {new: true});
    }
    static delete(chatId, productId)
    {
        return subscribtionModel.findOneAndRemove({chatId: chatId, productId: productId});
    }
 };
 
 module.exports = Subscribtion;