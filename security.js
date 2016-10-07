var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;

module.exports = function (app, clientID, clientSecret, callbackURL, lookup,serviceUser,servicePassword) {
    passport.use(new GoogleStrategy({
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: callbackURL
        },
        function (accessToken, refreshToken, profile, cb) {
            cb(null, lookup(profile.emails[0].value));
        }
    ));

    passport.use(new BasicStrategy(
        function (userid, password, done) {
            if (userid==serviceUser&& password==servicePassword){
                return done(null, {});
            } else {
                return done(null, false);
            }
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        done(null, lookup(id));
    });

    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({
        extended: true
    }));
    app.use(require('express-session')({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['email']
        }));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/login'
        }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            // req.user is available for use here
            return next();
        }

        // denied. redirect to login
        res.redirect('/auth/google')
    }

    return {
        secure: ensureAuthenticated
    }
}
