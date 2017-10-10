var PouchDB = require('pouchdb-core');
var express = require('express');
var fs = require('fs');

PouchDB.plugin(require('pouchdb-adapter-memory'))
    .plugin(require('pouchdb-mapreduce'));

var router = express.Router();
router.pouch = PouchDB.defaults({
    adapter: 'memory'
})

new router.pouch('birthright').bulkDocs(JSON.parse(fs.readFileSync('data.json'))).then(console.log).catch(console.error)

router.use(require('pouchdb-express-router')(router.pouch));


module.exports = router;
