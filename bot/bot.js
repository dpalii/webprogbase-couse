const dotenv = require('dotenv').config();
const user = require('../models/user.js');
const link = require('../models/link.js');
const subscribtion = require('../models/subscribtion.js')
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const tgBot = {};
tgBot.createSubscribtion = function (chatId, productId) {
    subscribtion.create({ chatId, productId })
        .catch(err => console.log(err));
}
tgBot.deleteSubscribtion = function (chatId, productId) {
    subscribtion.delete({ chatId: chatId, productId: productId })
        .catch(err => console.log(err));
}
tgBot.sendToSubscribers = function (msg, prodId) {
    subscribtion.getAll(prodId, null)
        .then(data => {
            for (sub of data) {
                bot.sendMessage(sub.chatId, msg, {
                    parse_mode: 'html',
                    disable_web_page_preview: false
                });
            }
        })
        .catch(err => console.log(err));
}
bot.onText(/\/cart/, (msg, match) => {
    const chatId = msg.chat.id;
    user.getByChatId(chatId)
        .then(data => {
            if (data) return link.getAll(null, null, data._id);
            else return Promise.reject('chat not found');
        })
        .then(data => {
            if (data) {
                let cart = 'пусто';
                let arr = data.map(x => `\n - <a href="http://127.0.0.1:5000/#!/product/${x.productId._id}">${x.productId.prodname}</a>`);
                if (arr.length > 0) cart = arr.reduce((accumulator, currVal) => accumulator + currVal);
                bot.sendMessage(chatId, 'Корзина: ' + cart, {
                    parse_mode: 'html',
                    disable_web_page_preview: false
                });
            }
            else return Promise.reject('update error');
        })
        .catch(err => {
            console.log(err);
            bot.sendMessage(chatId, 'Not started');
        });
});
bot.onText(/\/start/, (msg, match) => {
    const senderTag = msg.from.username;
    const chatId = msg.chat.id;
    user.getByTag(senderTag)
        .then(data => {
            if (data) return user.update({ _id: data._id, chatId: chatId });
            else return Promise.reject('tag not found');
        })
        .then(data => {
            if (data) bot.sendMessage(chatId, 'Welcome!');
            else return Promise.reject('update error');
        })
        .catch(err => {
            console.log(err);
            bot.sendMessage(chatId, 'Not started');
        });
});
bot.onText(/\/subscriptions/, (msg, match) => {
    const chatId = msg.chat.id;
    subscribtion.getAll(null, chatId)
        .then(data => {
            if (data) {
                let subs = 'нет подписок';
                let arr = data.map(x => `\n - <a href="http://127.0.0.1:5000/#!/product/${x.productId._id}">${x.productId.prodname}</a>`);
                if (arr.length > 0) subs = arr.reduce((accumulator, currVal) => accumulator + currVal);
                bot.sendMessage(chatId, 'Подписки: ' + subs, {
                    parse_mode: 'html',
                    disable_web_page_preview: false
                });
            }
            else return Promise.reject('no subscribtions');
        })
        .catch(err => {
            console.log(err);
            bot.sendMessage(chatId, 'Not started');
        });
});
bot.onText(/\/stop/, (msg, match) => {
    const chatId = msg.chat.id;
    user.getByChatId(chatId)
        .then((data) => {
            if (data) {
                subscribtion.getAll(null, chatId)
                    .then(data => {
                        let promises = [];
                        if (data) {
                            for (sub of data) {
                                promises.push(subscribtion.delete(sub.chatId, sub.productId._id));
                            }
                            return Promise.all(promises);
                        }
                        else return Promise.reject('chat not found');
                    })
                return user.update({ _id: data._id, chatId: null });
            }
            else return Promise.reject('chat not found');
        })
        .then(data => {
            if (data) bot.sendMessage(chatId, 'Bye!');
            else Promise.reject('update error');
        })
        .catch(err => {
            console.log(err);
            bot.sendMessage(chatId, 'Not stopped');
        });
});
module.exports = tgBot;