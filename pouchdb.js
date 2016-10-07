var PouchDB = require('pouchdb-core');
var express = require('express');

PouchDB.plugin(require('pouchdb-adapter-fs'))
    .plugin(require('pouchdb-mapreduce'));

PouchDB.defaults({
    prefix: '/path/to/my/db/'
});

var router = express.Router();
router.use(require('pouchdb-express-router')(PouchDB.defaults({
    prefix: process.env.OPENSHIFT_DATA_DIR || 'data/',
    adapter: 'fs'
})));


module.exports = router;
