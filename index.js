var express = require('express');
var passport = require('passport');
var app = express();

var security = require('./security')(app, '655064932863-ipv5fbsc0hkua3sfqm22igimqhn5efj6.apps.googleusercontent.com', '2fH06-I9AKfSBg9ku3E78bvR', 'http://birthright.agrzes.pl/auth/google/callback', (profile) => {
    return {
        id: profile
    };
}, 'user', 'password')


app.use('/', express.static('www'));
app.use('/angular', express.static(__dirname + '/node_modules/angular'));
app.use('/angular-ui-router', express.static(__dirname + '/node_modules/angular-ui-router/release'));
app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
app.get('/health', function (req, res) {
    res.sendStatus(200);
});
app.use('/db', passport.authenticate('basic', {
    session: false
}), require('./pouchdb'));


app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || 'localhost', function () {
    console.log('Example app listening on port 8080!');
});
