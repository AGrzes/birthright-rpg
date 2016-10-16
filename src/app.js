var _ = require('lodash');
var marked = require('marked');
require('angular-ui-bootstrap');
angular.module('birthright', ['ui.router','ui.bootstrap'])

.config(function ($stateProvider, $urlRouterProvider, pouchdbProvider) {
    $urlRouterProvider.otherwise('/sample');

    $stateProvider.state('sample', {
        url: '/sample',
        templateUrl: 'fragments/sample.html'
    });

    $stateProvider.state('setting', {
        url: '/setting',
        component: 'refTree',
        resolve: {
            toc: ['pouchdb', function (pouchdb) {
                return pouchdb.get("reference-toc").then((toc) => {
                    var traverse = function (document) {
                        return [pouchdb.get(document.node).then((d) => document.name = d.name).catch(() => document.name = document.node),
                            _.map(document.children, traverse)
                        ]
                    }
                    return Promise.all(_.flattenDeep(traverse(toc))).then(() => toc);
                });
            }],
            path: [() => '#/setting/']
        }
    });

    $stateProvider.state('setting.page', {
        url: '/:page',
        componentProvider: function () {
            console.log(arguments);
            return 'ref';
        },
        templateProvider: ['templateResolver', 'item', '$templateFactory', function (templateResolver, item, $templateFactory) {
            return $templateFactory.fromUrl(templateResolver(item).templateUrl);
        }],
        controllerProvider: ['templateResolver', 'item', function (templateResolver, item) {
            return templateResolver(item).controller;
        }],
        controllerAs: '$ctrl',
        resolve: {
            item: ['pouchdb', '$stateParams', function (pouchdb, $stateParams) {
                return pouchdb.get($stateParams.page);
            }]
        }
    });

    $stateProvider.state('personByLocation', {
        url: '/personByLocation',
        component: 'refTree',
        resolve: {
            toc: ['pouchdb', function (pouchdb) {
                return pouchdb.get("geo-toc").then((toc) => {
                    var traverse = function (document) {
                        return [pouchdb.get(document.node).then((d) => document.name = d.name).catch(() => document.name = document.node),
                            _.map(document.children, traverse)
                        ]
                    }
                    return Promise.all(_.flattenDeep(traverse(toc))).then(() => toc);
                });
            }],
            path: [() => '#/personByLocation/']
        }
    });
    $stateProvider.state('personByLocation.location', {
        url: '/:location',
        component: 'personByLocationList',
        resolve: {
            list: ['pouchdb', '$stateParams', function (pouchdb, $stateParams) {
                return pouchdb.query('person/byLocation', {
                    key: $stateParams.location
                }).then(_.property('rows')).then(_.partial(_.map, _, _.property('value')));
            }],
            location: ['pouchdb', '$stateParams', function (pouchdb, $stateParams) {
                return pouchdb.get($stateParams.location).catch(() => {
                    return {
                        name: _.startCase(_.replace($stateParams.location, /.*:/, ''))
                    }
                });
            }]
        }


    });
    pouchdbProvider.name = window.location.protocol + "//" + window.location.host + "/db/birthright"
})

.component('personByLocationList', {
    bindings: {
        list: '<',
        location: '<'
    },
    templateUrl: "fragments/personByLocationList.html"
})

.component('refTree', {
    bindings: {
        toc: '<',
        path: '@'
    },
    templateUrl: "fragments/refTree.html"
})

.component('ref', {
    bindings: {
        page: '<'
    },
    templateUrl: "fragments/ref.html"
})

.component('toc', {
    bindings: {
        list: '<',
        children: '@',
        level: '@',
        path: '@'
    },
    template: `
        <ul class="nav nav-stacked" ng-if="$ctrl.show" >
            <li role="presentation" ng-repeat="item in $ctrl.list"><a style="padding-left:{{$ctrl.indent}}px" href="{{$ctrl.path}}{{item.node}}">{{item.name}}</a>
            <!--a><i class="glyphicon glyphicon-triangle-bottom" ng-click="$ctrl.colapse=!$ctrl.colapse"></i></a-->
                <toc list="item[$ctrl.children]" children="{{$ctrl.children}}" level="{{$ctrl.nextLevel}}" path="{{$ctrl.path}}" uib-collapse="$ctrl."/>
            </li>
        </ul>
    `,
    controller: function () {
        this.children = this.children || 'children';
        this.nextLevel = 1 * (this.level || 0) + 1;
        this.indent = 16 * (this.level || 0) + 15;
        this.show = !!this.list && !!this.list.length;
    }

})

.controller('RefCtrl', ['item', function (item) {
    this.item = item
}])


.provider('pouchdb', function () {
    var config = this;
    var pouchdb = require('pouchdb-browser');
    this.$get = [function () {
        return new pouchdb(config.name, config.options);
    }]

})

.factory('templateResolver', function () {
    var map = {
        default: {
            default: {
                templateUrl: "fragments/ref.html",
                controller: "RefCtrl"
            }
        },
        god: {
            default: {
                templateUrl: "fragments/god.html",
                controller: "RefCtrl"
            }
        }

    }
    return function (object, mode) {
        if (mode) {
            if (map[object.$type]) {
                if (map[object.$type][mode]) {
                    return map[object.$type][mode];
                } else if (map[object.$type]['default']) {
                    return map[object.$type]['default'];
                }
            }
            if (map['default'][mode]) {
                return map['default'][mode];
            } else {
                return map['default']['default'];
            }
        } else {
            if (map[object.$type] && map[object.$type]['default']) {
                return map[object.$type]['default'];
            } else {
                return map['default']['default'];
            }
        }
    }
})

.filter('markdown', ['$sce', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(marked(input));
    };
}]);;
