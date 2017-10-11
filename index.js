var express = require('express');
var browserify = require('browserify-middleware');
var _ = require('lodash');
var app = express();

app.use('/angular', express.static(__dirname + '/node_modules/angular'));
app.use('/angular-ui-router', express.static(__dirname + '/node_modules/angular-ui-router/release'));
app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
app.get('/health', function (req, res) {
  res.sendStatus(200);
});
var pouchdb = require('./pouchdb');
var db = new pouchdb('birthright')

var overlay = (role) => (object) => {
  if (_.isArray(object)) {
    return _(object).map(overlay(role)).filter(_.identity);
  } else if (_.isObject(object)) {
    object = _.mapValues(object, overlay(role));
    var $overlay = _.get(object, '$overlay');
    if ($overlay) {
      _.unset(object, '$overlay');
      if (_.has($overlay, role)) {
        var role$overlay = _.get($overlay, role);
        if (role$overlay) {
          return _.assign(object, role$overlay);
        } else {
          return null;
        }
      }
    }
    return object;
  } else {
    return object;
  }
}

app.get('/data/entity/:id', function (req, res, next) {
  db.get(req.params.id).then(overlay('player')).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.get('/data/children/:parentId', function (req, res, next) {
  db.query('parent/parent', {
    key: req.params.parentId
  }).then(_.property('rows')).then(_.partial(_.map, _, _.property('value'))).then(overlay('player')).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.get('/data/byLocation/:location/:type', function (req, res, next) {
  db.query('byLocation', {
    key: [req.params.location, req.params.type],
    include_docs: true
  }).then(_.property('rows')).then(_.partial(_.map, _, _.property('doc'))).then(overlay('player')).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});

app.get('/data/byType/:type', function (req, res, next) {
  db.query('type', {
    key: req.params.type,
    include_docs: true
  }).then(_.property('rows')).then(_.partial(_.map, _, _.property('doc'))).then(overlay('player')).then((doc) => res.send(doc)).catch((err) => res.status(500).send(err));
});


app.get('/js/app.js', browserify('src/app.js'));
app.use('/', express.static('www'));

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP, function () {
  console.log('Example app listening on port 8080!');
});
