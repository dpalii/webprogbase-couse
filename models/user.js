const fs = require('fs');
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    login: { type: String, required: true },
    passHash: { type: String, required: true, select: false },
    role: { type: String, required: true, default: 'standart' },
    fullname: { type: String, required: true },
    registeredAt: { type: String, required: true },
    avaUrl: { type: String, required: true },
    isDeactivated: { type: Boolean, required: true },
    bio: { type: String },
    tgTag: { type: String },
    chatId: { type: String }
});
const userModel = mongoose.model('User', userSchema, 'users');

class User {
    static getById(id) {
        return userModel.findById(id);
    }
    static getByTag(tag) {
        return userModel.findOne({ tgTag: tag });
    }
    static getByChatId(id) {
        return userModel.findOne({ chatId: id });
    }
    static getAll(limit, offset, searchword) {
        return userModel.find({ login: { $regex: searchword, $options: 'i' } }).skip(offset).limit(limit);
    }
    static count(searchword) {
        return userModel.countDocuments({ login: { $regex: searchword, $options: 'i' } });
    }
    static getAuth(login, passHash) {
        return userModel.findOne({login: login, passHash: passHash});
    }
    static getByLogin(login)
    {
        return userModel.findOne({login: login});
    }
    static create(login, passHash) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        today = mm + '-' + dd + '-' + yyyy;
        let newuser = {
            login: login,
            passHash: passHash,
            role: 'standart',
            fullname: 'no name',
            avaUrl: '/images/avatar.jpeg',
            isDeactivated: false,
            registeredAt: today
        }
        return userModel.create(newuser);
    }
    static update(x) {
        return userModel.findByIdAndUpdate(x._id, x, {new: true});
    }
    static delete(id) {
        return userModel.findByIdAndRemove(id);
    }
};
module.exports = User;