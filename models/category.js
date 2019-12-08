const fs = require('fs');
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name : { type : String, required : true }
});
const categoryModel = mongoose.model('Category', categorySchema, 'categories');
class Category {

    // static functions to access storage
 
    static getById(id) {
        return categoryModel.findById(id);
    }
 
    static getAll(limit, offset, searchword) {
        return categoryModel.find({ name: { $regex: searchword, $options: 'i' } }).skip(offset).limit(limit);
    }
    static count(searchword) {
        return categoryModel.countDocuments({ name: { $regex: searchword, $options: 'i' } });
    }
    static create(x)
    {
        return categoryModel.create(x);
    }
    static update(x)
    {
        return categoryModel.findByIdAndUpdate(x._id, x.modification, {new: true});
    }
    static delete(id)
    {
        return categoryModel.findByIdAndRemove(id);
    }
 };
 
 module.exports = Category;