const dotenv = require('dotenv').config();
const express = require('express');
const mustache = require('mustache-express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const dbUrl = process.env.MONGODB_URI;
const serverPort = process.env.PORT;
const connectOptions = { useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false }
const viewsDir = path.join(__dirname, 'views');
const app = express();
const methodOverride = require('method-override');
const morgan = require('morgan');
const restful = require('node-restful');
const mongoose = restful.mongoose;
const fileOptions = { root: path.join(__dirname, './views')};
const accessCheck = require('./modules/passport');
const apiRoutes = require('./routes/api');
const devRoutes = require('./routes/developer');

app.use(passport.initialize());
app.engine("mst", mustache(path.join(viewsDir, "partials")));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mst');
app.set('views', viewsDir);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(express.static('public'));
app.use('/developer/v1', devRoutes);
app.use('/api/v1', apiRoutes);
app.use(express.static(path.join(__dirname, './public')));

mongoose.connect(dbUrl, connectOptions)
    .then(() => console.log(`database connected`))
    .then(() => app.listen(serverPort, function() { console.log(`Server started`); }))
    .catch(err => console.log(`start error: ${err.toString()}`));

// app.get("/", (req, res) => {
//     res.render('index');
// });
// app.get("/products/:id", (req, res) => {
//     res.render('product');
// });
// app.get("/products", (req, res) => {
//     res.render('products');
// });
// app.get("/users/:id", (req, res) => {
//     res.render('user');
// });
// app.get("/users", (req, res) => {
//     res.render('users');
// });
// app.get("/categories/:id", (req, res) => {
//     res.render('category');
// });
// app.get("/categories", (req, res) => {
//     res.render('categories');
// });
// app.get("/me", (req, res) => {
//     res.render('profile');
// });
// app.get("/about", (req, res) => {
//     res.render('about');
// });
// app.get("*", (req, res) => {
//     res.render('notfound');
// });
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/index.html'));
})
app.get('*', function(req, res) {
    res.redirect('/');
});