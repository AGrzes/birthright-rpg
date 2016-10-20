var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ConnectRoles = require('connect-roles');
var _ = require('lodash');
var userRegistry = {
    users: {
        system: {
            password: "dCNL3O9ysSvjdv7iT5tvFBkdtgqmrvI7K8RatMUG1qYZFFF5FKGWn4xU9znRtbUR",
            data: {
                name: 'system',
                role: 'system'
            }
        },
        player: {
            password: "vYosZh4DS73hpNrYB6HY8cmQbF5CVbqecPTA4tRHkq8zuoMNqIlXFQNzLObMU8pp",
            data: {
                name: 'player',
                role: 'player'
            }
        },
        dm: {
            password: "zl8Nw9AvQEy5DDCapMcEjnSUEVtjUbdXI7GE7o5jVF9xdRp4FFHsCoWXMwIOoKD6",
            data: {
                name: 'dm',
                role: 'dm'
            }
        }
    },

    lookup: function (username, password) {
        var user = userRegistry.users[username];
        if (user && user.password === password) {
            return user.data;
        } else {
            return null;
        }
    },
    inRole: function(user,role){
        switch (role){
            case "user": return _.includes(['player','dm'], user.role);
            case "system": return _.includes(['system'], user.role);
            default: return false;
        }
    }
}

module.exports = function (app, clientID, clientSecret, callbackURL, lookup, serviceUser, servicePassword) {

    passport.use(new BasicStrategy(
        function (userid, password, done) {
            done(null, userRegistry.lookup(userid, password));
        }
    ));

    var user = new ConnectRoles({
        failureHandler: function (req, res, action) {
            res.sendStatus(401);
        }
    });

    user.use(function (req, role) {
        if (!req.isAuthenticated()) {
            return role === 'guest';
        } else {
            return userRegistry.inRole(req.user,role);
        }
    })


    return {
        protected: () => passport.authenticate('basic', {
            session: false
        }),
        user: user
    }
}
