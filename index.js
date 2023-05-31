'use strict';
require('dotenv')
const express = require('express');
const app = express();
const port = process.env.port || 5001;
const expressHandleBars = require('express-handlebars');
const {createStarList} = require('./controllers/handlebarsHelper');
const {createPagination} = require('express-handlebars-paginate');
const redisStore = require('connect-redis').default;
const {createClient} = require('redis');
const session = require('express-session');
const redisClient = createClient({
    url: 'rediss://red-chpjj4ndvk4goette6rg:DfJQMBcRVo4JaJn8Rz2kfKAS8IjJGtUg@oregon-redis.render.com:6379'
});

redisClient.connect().catch(console.error);
//cau hinh public static 
app.use(express.static(__dirname + '/public'));


//cau hinh su dung express handle bar
app.engine('hbs', expressHandleBars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        createStarList,
        createPagination
    }
}));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cau hinh su dung session
app.use(session({
    secret: 'S3cret',
    store: new redisStore({ client: redisClient}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000 // 20 mins
    }
}));

//midleware khoi tao gio hang
app.use((req, res, next) => {
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;
    next();
})

//cau hinh route
app.use('/', require('./routes/indexRoute'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/usersRouter'))

//khoi dong web server
app.listen(port, () => {
    console.log(`server is running on ${port}`)
});