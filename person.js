var _ = require('lodash');
module.exports = {
    listItem: (person) => {
        var result = {};
        var identity = [];
        if (person.name) {
            identity.push(person.name);
        }
        if (person.label) {
            identity.push(person.label);
        }
        if (person.title && person.title.length) {
            identity = _.concat(identity, person.title);
        }
        if (identity.length > 0) {
            result.label = identity[0]
        }
        if (identity.length > 1) {
            result.subLabel = _.join(_.slice(identity, 1),', ');
        }
        result.description = person.description
        return result;
    }
}
