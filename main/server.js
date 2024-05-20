require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const { getUserByEmail, getUserById, addUser } = require('./models');
const initializePassport = require('./passport-config');

const app = express();

// Initialize Passport
initializePassport(
    passport,
    async email => await getUserByEmail(email),
    async id => await getUserById(id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    })
    .catch(err => console.error('Could not connect to MongoDB', err)); // Add error handling here

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.redirect('/home');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const existingUser = await getUserByEmail(req.body.email);
        if (existingUser) {
            req.flash('error', 'You already have an account. Please login.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        };
        await addUser(user);
        res.redirect('/login');
    } catch (e) {
        console.error(e);
        res.redirect('/register');
    }
});

app.get('/profile', checkAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/profile.html');
});

app.delete('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
