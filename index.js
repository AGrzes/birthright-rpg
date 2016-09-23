var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/health', function (req, res) {
    res.sendStatus(200);
});


app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || 'localhost', function () {
    console.log('Example app listening on port 3000!');
});
