var PouchDB = require('pouchdb-core');
var express = require('express');

PouchDB.plugin(require('pouchdb-adapter-fs'))
    .plugin(require('pouchdb-mapreduce'));

PouchDB.defaults({
    prefix: '/path/to/my/db/'
});

var router = express.Router();
router.pouch = PouchDB.defaults({
    prefix: process.env.OPENSHIFT_DATA_DIR || 'data/',
    adapter: 'fs'
})
router.use(require('pouchdb-express-router')(router.pouch));


module.exports = router;
