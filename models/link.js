const fs = require('fs');
const mongoose = require('mongoose');
const linkSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true  },
});
const linkModel = mongoose.model('Link', linkSchema, 'links');
class Link {
 
    // static functions to access storage

    static getAll(limit, offset, userId, productId) {
        if (limit !== null && offset !== null && userId) return linkModel.find({ userId: userId }).skip(offset).limit(limit).populate('productId');
        if (userId) return linkModel.find({ userId: userId });
        if (productId) return linkModel.find({ productId: productId });
        return undefined;
    }
    static count(userId) {
        return linkModel.countDocuments({ userId: userId });
    }
    static create(x)
    {
        return linkModel.create(x);
    }
    static delete(id)
    {
        return linkModel.findByIdAndRemove(id);
    }
 };
 
 module.exports = Link;