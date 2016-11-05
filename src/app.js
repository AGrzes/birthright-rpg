var _ = require('lodash');
var marked = require('marked');
require('angular-ui-bootstrap');
angular.module('birthright', ['ui.router', 'ui.bootstrap'])

.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/setting');

    $stateProvider.state('sample', {
        url: '/sample',
        templateUrl: 'fragments/sample.html'
    });

    $stateProvider.state('setting', {
        url: '/setting',
        component: 'refTree',
        resolve: {
            toc: ['$data', function ($data) {
                return $data.entity("reference-toc");
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
            item: ['$data', '$stateParams', function ($data, $stateParams) {
                return $data.entity($stateParams.page);
            }]
        }
    });

    $stateProvider.state('personByLocation', {
        url: '/personByLocation',
        component: 'refTree',
        resolve: {
            toc: ['$data', function ($data) {
                return $data.entity("geo-toc");
            }],
            path: [() => '#/personByLocation/']
        }
    });
    $stateProvider.state('personByLocation.location', {
        url: '/:location',
        component: 'personByLocationList',
        resolve: {
            list: ['$data', '$stateParams', function ($data, $stateParams) {
                return $data.byLocation($stateParams.location, 'person').then((list) => {
                    console.log(list)
                    return _.map(list, require('../person').listItem)
                });
            }],
            location: ['$stateParams', function ($stateParams) {
                return _.startCase(_.replace($stateParams.location, /.*:/, ''))
            }]
        }


    });
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
        path: '@'
    },
    template: `
        <ul class="list" ng-if="$ctrl.show" >
            <li ng-repeat="item in $ctrl.list"><a href="{{$ctrl.path}}{{item.node}}">{{item.name}}</a>
            <span ng-if="$ctrl.hasChildren(item)">
            <a  ng-show="!$ctrl.collapse[$index]"><i class="glyphicon glyphicon-triangle-top" ng-click="$ctrl.collapse[$index]=true"></i></a>
            <a  ng-show="$ctrl.collapse[$index]"><i class="glyphicon glyphicon-triangle-bottom" ng-click="$ctrl.collapse[$index]=false"></i></a>
            </span>
                <toc list="item[$ctrl.children]" children="{{$ctrl.children}}" path="{{$ctrl.path}}" uib-collapse="$ctrl.collapse[$index]"/>
            </li>
        </ul>
    `,
    controller: function () {
        this.children = this.children || 'children';
        this.show = !!this.list && !!this.list.length;
        this.hasChildren = (item) => !!item[this.children] && !!item[this.children].length;
        this.collapse = [];
    }

})

.controller('RefCtrl', ['item', function (item) {
    this.item = item
}])

.controller('ListCtrl', ['item', '$data', '$scope', 'path', function (item, $data, $scope, path) {
    this.item = item;
    $data.children(item._id).then((list) => {
        this.list = list;
        //$scope.$apply()
    });
    this.path = path;
}])

.factory('$data', ['$http', function ($http) {
    return {
        children: (parentId) => $http.get('/data/children/' + parentId).then((res) => res.data),
        entity: (id) => $http.get('/data/entity/' + id).then((res) => res.data),
        byLocation: (location, type) => $http.get('/data/byLocation/' + location + '/' + type).then((res) => res.data)
    }
}])

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
        },
        list: {
            default: {
                templateUrl: "fragments/list.html",
                controller: "ListCtrl"
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
