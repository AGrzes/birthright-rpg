var express = require('express');
var app = express();

var security = require('./security')(app, '655064932863-ipv5fbsc0hkua3sfqm22igimqhn5efj6.apps.googleusercontent.com', '2fH06-I9AKfSBg9ku3E78bvR', 'http://birthright.agrzes.pl/auth/google/callback', (profile) => {
    return {id:profile};
})

app.get('/', security.secure, function (req, res) {
    res.send('Hello World!' + JSON.stringify(req.user));
});

app.get('/health', function (req, res) {
    res.sendStatus(200);
});


app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || 'localhost', function () {
    console.log('Example app listening on port 3000!');
});
