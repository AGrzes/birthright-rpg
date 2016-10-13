var _ = require('lodash');
angular.module('birthright', ['ui.router'])

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
                        return [pouchdb.get(document.node).then((d) => document.name = d.name).catch(() => document.name=document.node),
                            _.map(document.children, traverse)
                        ]
                    }
                    return Promise.all(_.flattenDeep(traverse(toc))).then(()=>toc);
                });
            }],
            path: [() => '#/setting/']
        }
    });
    pouchdbProvider.name = window.location.protocol + "//" + window.location.host + "/db/birthright"
})

.component('refTree', {
    bindings: {
        toc: '<',
        path: '@'
    },
    templateUrl: "fragments/refTree.html"
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
                <toc list="item[$ctrl.children]" children="{{$ctrl.children}}" level="{{$ctrl.nextLevel}}" path="{{$ctrl.path}}"/>
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


.provider('pouchdb', function () {
    var config = this;
    var pouchdb = require('pouchdb-browser');
    this.$get = [function () {
        return new pouchdb(config.name, config.options);
    }]

});
