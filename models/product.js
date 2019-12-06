const fs = require('fs');
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    prodname: { type: String, required: true },
    price: { type: Number, required: true },
    uplDate: { type: Date, required: true },
    prodpic: { type: String, required: true },
    inStock: { type: Boolean },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    desc: { type: String }
});
const productModel = mongoose.model('Product', productSchema, 'products');

class Product {
    constructor(id = -1, prodname = "not specified", prodpic = "", price = 0, inStock = false, uplDate = Date.now.toString) {
        this.id = id;
        this.prodname = prodname;
        this.prodpic = prodpic;
        this.price = price;
        this.inStock = inStock;
        this.uplDate = uplDate;
    }

    // static functions to access storage

    static getById(id) {
        let item = productModel.findOne({_id: id});
        if (item) return item.populate('category');
        else return undefined;
    }
    static getAll(limit, offset, searchword) {
        return productModel.find({ prodname: { $regex: searchword, $options: 'i' } }).skip(offset).limit(limit);
    }
    static count(searchword) {
        return productModel.countDocuments({ prodname: { $regex: searchword, $options: 'i' } });
    }
    static create(x) {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); 
        let yyyy = today.getFullYear();
        today = mm + '-' + dd + '-' + yyyy;
        x.uplDate = today;
        return productModel.create(x);
    }
    static update(x) {
        return productModel.findByIdAndUpdate(x._id, x, {new: true});
    }
    static delete(id) {
        return productModel.findByIdAndDelete(id);
    }
};


module.exports = Product;