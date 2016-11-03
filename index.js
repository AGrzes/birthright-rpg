var express = require('express');
var passport = require('passport');
var browserify = require('browserify-middleware');
var _ = require('lodash');
var app = express();

var security = require('./security')(app, '655064932863-ipv5fbsc0hkua3sfqm22igimqhn5efj6.apps.googleusercontent.com', '2fH06-I9AKfSBg9ku3E78bvR', 'http://birthright.agrzes.pl/auth/google/callback', (profile) => {
    return {
        id: profile
    };
}, 'user', 'password')

app.use(security.user.middleware());

app.use('/angular', express.static(__dirname + '/node_modules/angular'));
app.use('/angular-ui-router', express.static(__dirname + '/node_modules/angular-ui-router/release'));
app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
app.get('/health', function (req, res) {
    res.sendStatus(200);
});
var pouchdb = require('./pouchdb');
var db = new pouchdb.pouch('birthright')
app.use('/db', security.protected(), security.user.is('system'), pouchdb);

app.get('/data/entity/:id', function (req, res, next) {
    db.get(req.params.id).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.get('/data/children/:parentId', function (req, res, next) {
    db.query('parent/parent', {
        key: req.params.parentId
    }).then(_.property('rows')).then(_.partial(_.map, _, _.property('value'))).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.get('/data/byLocation/:location/:type', function (req, res, next) {
    db.query('person/byLocation', {
        key: req.params.location
    }).then(_.property('rows')).then(_.partial(_.map, _, _.property('value'))).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.use('/data', security.protected(), security.user.is('user'), pouchdb);



app.get('/js/app.js', browserify('src/app.js'));
app.use('/', security.protected(), security.user.is('user'), express.static('www'));

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP, function () {
    console.log('Example app listening on port 8080!');
});
