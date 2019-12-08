const fs = require('fs');
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true },
    product : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required : true },
    content : { type : String, required : true }
});
const commentModel = mongoose.model('Comment', commentSchema, 'commets');
class Comment {
 
    // static functions to access storage

    static getAll(limit, offset, userId, productId) {
        if (limit !== null && offset !== null && productId) return commentModel.find({product: productId}).skip(offset).limit(limit).populate('author');
        if (userId) return commentModel.find({ author: userId });
        if (productId) return commentModel.find({ product: productId });
        return undefined;
    }
    static count(productId) {
        return commentModel.countDocuments({product: productId});
    }
    static create(x)
    {
        return commentModel.create(x);
    }
    static delete(id)
    {
        return commentModel.findByIdAndRemove(id);
    }
 };
 
 module.exports = Comment;