const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/goodsExchange', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Product = mongoose.model('Product', productSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', checkAuth, async (req, res) => {
    const products = await Product.find({}).populate('owner');
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/product-detail/:id', checkAuth, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('owner');
    res.sendFile(path.join(__dirname, 'public', 'product-detail.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/add-product', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-product.html'));
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('User registered:', { username, email });
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        console.log('User logged in:', user);
        res.redirect('/');
    } else {
        console.log('Login failed for user:', username);
        res.redirect('/login');
    }
});

app.post('/add-product', checkAuth, async (req, res) => {
    const { name, description } = req.body;
    const product = new Product({ name, description, owner: req.session.userId });
    await product.save();
    console.log('Product added:', { name, description });
    res.redirect('/products');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
app.get('/api/products', checkAuth, async (req, res) => {
    const products = await Product.find({}).populate('owner');
    res.json(products);
});
