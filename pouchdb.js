var PouchDB = require('pouchdb-core');
var express = require('express');
var fs = require('fs');

PouchDB.plugin(require('pouchdb-adapter-memory'))
    .plugin(require('pouchdb-mapreduce'));

var pouch = PouchDB.defaults({
    adapter: 'memory'
})

new pouch('birthright').bulkDocs(JSON.parse(fs.readFileSync('data.json'))).then(console.log).catch(console.error)

module.exports = pouch;
